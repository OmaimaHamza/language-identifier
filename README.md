<div align="center">

# Language Identifier

**Fine-tuned Wav2Vec2 for Moroccan Speech Classification**

Detect spoken language from voice — classifies between **Darija**, **MSA**, **French**, and **English** with 99.75% accuracy.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Hugging Face](https://img.shields.io/badge/🤗%20Hugging%20Face-Model-FFD21E)](https://huggingface.co/)  
<img width="449" height="420" alt="image" src="https://github.com/user-attachments/assets/d0e8c727-e610-4412-80cc-13e18ecc0ce6" />
</div>

---  
## Overview

**Language Identifier** is a full-stack web application that automatically detects which language a person is speaking from a short audio clip. It targets the four languages most commonly used in Moroccan daily life:

| Language | Native Name | Flag | Description |
|----------|-------------|------|-------------|
| **Darija** | الدارجة المغربية | 🇲🇦 | Moroccan Arabic vernacular |
| **MSA** | العربية الفصحى | 🇸🇦 | Modern Standard Arabic |
| **French** | Français | 🇫🇷 | European Romance language |
| **English** | English | 🇬🇧 | Global lingua franca |

The system uses a **fine-tuned Wav2Vec2 model** to classify 3-second, 16 kHz mono audio snippets, returning a probability distribution over all four languages.

---

## Model Details

### Base Model

- **Architecture:** `facebook/wav2vec2-base`
- **Pre-training:** Self-supervised learning on high-volume unlabeled speech corpora
- **Fine-tuning:** Custom classification head trained on labeled Moroccan speech data
- **Framework:** Hugging Face Transformers + PyTorch

### Why Wav2Vec2?

Fine-tuned pre-trained self-supervised acoustic representations are ideal for **regional language targeting** where labeled data is scarce. Wav2Vec2 learns rich acoustic features from unlabeled audio, then a small classifier head is trained on top — this converges quickly with few epochs and generalizes well across speakers.

### Hyperparameter Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Epochs** | 5 | Fast convergence over pre-trained features; avoids acoustic drift |
| **Learning Rate** | 2e-5 | Low rate keeps pre-trained encoder weights stable |
| **Batch Size** | 8 | Balance between GPU memory and gradient stability |
| **Weight Decay** | 0.01 | Controlled regularization to prevent overfitting |
| **Gradient Clipping** | 1.0 | Clips excessive gradient norms for training stability |

---

## Results

### Training Progression

| Epoch | Training Loss | Validation Loss | Accuracy |
|-------|---------------|-----------------|----------|
| 1 | 0.125819 | 0.130723 | 97.88% |
| 2 | 0.001115 | 0.007868 | 99.88% |
| 3 | 0.000511 | 0.081642 | 98.88% |
| 4 | 0.000315 | **0.005248** | **99.88%** |
| 5 | 0.000188 | 0.018271 | 99.75% |

> **Selected checkpoint:** Epoch 4 — highest generalization potential with minimal validation loss (0.005).

### Test Set Performance

- **Overall accuracy:** 99.75%
- **Test samples:** 800
- **Misclassifications:** 2 (0.25% error rate)
- **Primary confusion:** Arabic ↔ French boundary (2 samples)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Git**


### 1. Clone the repository

```bash
git clone https://github.com/your-username/language-identifier.git
cd language-identifier
```

### 2. Set up the backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

The model (`model_weights.pt`, ~360 MB) is **automatically downloaded from Hugging Face Hub** on first run. It's cached locally and reused on subsequent runs.

#### Run the backend

```bash
python api.py
```

Expected output:
```
Checking model weights...
Downloading model_weights.pt from <username>/language-identifier-model...
Loading model...
Model loaded successfully!
 * Running on http://0.0.0.0:5000
```

The API is now available at `http://localhost:5000`.

### 3. Set up the frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 400 ms
  ➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser.

### 4. Test the app

1. Click the **microphone** button → allow permission → speak for 3-5 seconds
2. Or **drag & drop** a `.wav` / `.mp3` file
3. Click **ANALYZE**
4. View the animated confidence bars for all 4 languages

---

## 📡 API Reference

### `GET /health`

Backend health check used by the frontend to show connection status.

**Response:**
```json
{
  "status": "healthy",
  "languages": ["darija", "msa", "french", "english"]
}
```

### `POST /predict`

Main prediction endpoint.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `audio` field containing the audio file (WAV, MP3, WebM, OGG, M4A)

**Response (200):**
```json
{
  "success": true,
  "language": "darija",
  "confidence": 0.9989,
  "probabilities": {
    "darija": 0.9989,
    "msa": 0.0002,
    "french": 0.0006,
    "english": 0.0003
  }
}
```

---

## Testing with Sample Data

The `backend/testData/` folder contains one sample per language. Test the API directly:

```bash
# From the backend folder with the venv activated
curl -X POST http://localhost:5000/predict -F "audio=@testData/darija_sample.wav"
curl -X POST http://localhost:5000/predict -F "audio=@testData/msa_sample.wav"
curl -X POST http://localhost:5000/predict -F "audio=@testData/french_sample.wav"
curl -X POST http://localhost:5000/predict -F "audio=@testData/english_sample.wav"
```

Each should return the corresponding language with high confidence.

---



---



## Limitations & Future Work

### Current Limitations

- **Arabic ↔ Darija Overlap** — High dialectal similarity causes occasional categorization errors
- **Audio Degradation** — Very poor input audio quality directly impacts performance
- **Background Interference** — Extreme background noise lowers probability confidence


---

## Tech Stack

**Backend:**
- Python 3.11, Flask 3, Flask-CORS
- PyTorch 2.x, Hugging Face Transformers
- librosa, soundfile, numpy
- Hugging Face Hub (model hosting)

**Frontend:**
- React 18, TypeScript, Vite
- Tailwind CSS 3
- Axios, Lucide React
- Web Audio API (recording + WAV encoding)

**Infrastructure:**
- Hugging Face Spaces (backend)
- Vercel (frontend)
- Hugging Face Hub (model weights)
