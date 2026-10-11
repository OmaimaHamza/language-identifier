# Language Identification Model - Documentation


## Overview


- **Darija** (Moroccan Arabic / الدارجة المغربية)
- **MSA** (Modern Standard Arabic / العربية الفصحى)
- **French** (Français)
- **English**

The model is based on Wav2Vec2 (Facebook) fine-tuned for language classification.

---

## Model Information

| Property | Value |
|----------|-------|
| Architecture | Wav2Vec2ForSequenceClassification |
| Base model | facebook/wav2vec2-base |
| Number of languages | 4 |
| Input duration | 3 seconds |
| Sample rate | 16000 Hz |
| Accuracy | 99.75% on test set |
| Model size | 360 MB |


---

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Step 1: 

Ensure you have the following files in your project directory:
├── model_weights.pt # Model weights file
├── api.py # Flask API server
└── requirements.txt # Python dependencies


### Step 2: Install dependencies

```bash
pip install -r requirements.txt
```
# Usage
Method 1: Run as API Server
Start the Flask API server:

```bash
python api.py
```

The server will start on http://localhost:5000

for a test do this

```bash
curl -X POST -F "audio=@C:chemin_de_audio" http://localhost:5000/predict
```
