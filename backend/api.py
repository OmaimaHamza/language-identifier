# api.py - API pour interface web
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
import librosa
import io
from huggingface_hub import hf_hub_download
from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification

app = Flask(__name__)
CORS(app)

# --- Configuration ---
MODEL_REPO = "oumaima-hamza/language-identifier-model"   # ← CHANGE THIS
MODEL_FILENAME = "model_weights.pt"

# --- Download model from Hugging Face ---
print("Checking model weights...")
if not os.path.exists(MODEL_FILENAME):
    print(f"Downloading {MODEL_FILENAME} from {MODEL_REPO}...")
    model_path = hf_hub_download(repo_id=MODEL_REPO, filename=MODEL_FILENAME)
else:
    model_path = MODEL_FILENAME
    print(f"Using local model at {model_path}")

# --- Load model ---
print("Loading model...")
checkpoint = torch.load(model_path, map_location='cpu')
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = Wav2Vec2ForSequenceClassification.from_pretrained(
    "facebook/wav2vec2-base",
    num_labels=4,
    ignore_mismatched_sizes=True
)

if 'model_state_dict' in checkpoint:
    model.load_state_dict(checkpoint['model_state_dict'])
else:
    model.load_state_dict(checkpoint)

model = model.to(device)
model.eval()

processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base")
languages = ['darija', 'msa', 'french', 'english']
print("Model loaded successfully!")


@app.route('/')
def root():
    return jsonify({"service": "language-identifier", "status": "running"})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file'}), 400

        audio_file = request.files['audio']
        audio_bytes = audio_file.read()

        audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)

        target = 48000
        if len(audio) < target:
            audio = np.pad(audio, (0, target - len(audio)))
        else:
            audio = audio[:target]

        if audio.max() != 0:
            audio = audio / audio.max()

        inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
        input_values = inputs.input_values.to(device)

        with torch.no_grad():
            outputs = model(input_values)
            probs = torch.softmax(outputs.logits, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0][pred].item()

        return jsonify({
            'success': True,
            'language': languages[pred],
            'confidence': confidence,
            'probabilities': {
                'darija': probs[0][0].item(),
                'msa': probs[0][1].item(),
                'french': probs[0][2].item(),
                'english': probs[0][3].item()
            }
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'languages': languages})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)