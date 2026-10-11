# Local Setup & Execution Guide for Language Identifier

This plan details the exact workflow and local configuration needed to download, run, and connect the **Language Identifier** React frontend on your local laptop using Node.js and npm alongside your Flask backend.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following preferences have been confirmed based on your clarifying answers:

- **Package Manager**: npm (Standard Node.js package manager, Node.js v18+ recommended).
- **Delivery Scope**: Step-by-step setup instructions delivered directly in chat (no unnecessary extra files committed to the repository).
- **Backend Connection**: Frontend connects to the Flask API at `http://localhost:5000` by default, or configurable via `.env` / `VITE_API_URL` or the built-in UI connection settings drawer.

---

## 1. Overview & Core Concept

- **What It Does**: Runs the Vite + React Neo-Brutalist single-page application on your local machine (`http://localhost:3000`), allowing you to record voice via your microphone or upload audio files and classify spoken language (Darija, MSA, French, English).
- **Target Environment**: Local development environment running Node.js (v18.0.0 or higher) on macOS, Windows, or Linux.
- **Key Value**: Simple 2-command startup (`npm install` then `npm run dev`) with instant hot-reloading and direct communication with your Python Flask audio model server.

---

## 2. Local Execution Workflow & Step-by-Step Experience

### Prerequisites
1. **Node.js & npm**: Install from [nodejs.org](https://nodejs.org) (v18, v20, or v22 LTS). Verify with:
   ```bash
   node -v
   npm -v
   ```
2. **Audio Model Backend**: Python 3.9+ with Flask and `flask-cors` running on port 5000.

### Step-by-Step Terminal Commands

1. **Extract and Navigate to Project Directory**:
   ```bash
   cd /path/to/downloaded-project
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **(Optional) Configure Environment Variables**:
   Copy `.env.example` to `.env` if you wish to adjust the backend URL:
   ```bash
   cp .env.example .env
   ```
   Ensure it includes:
   ```env
   VITE_API_URL="http://localhost:5000"
   ```

4. **Start the Vite Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Open [http://localhost:3000](http://localhost:3000) in Chrome, Firefox, Safari, or Edge.

---

## 3. Key Product Decisions & Trade-Offs

- **Port Strategy**:
  - *Decision*: Vite dev server runs on port `3000` (`vite --port=3000 --host=0.0.0.0`), leaving port `5000` free for the Python Flask backend.
  - *Rationale*: Eliminates port conflicts between frontend and backend.
- **CORS Handling**:
  - *Decision*: Flask backend must enable `flask-cors` (`CORS(app)`) to allow requests from `http://localhost:3000`.
  - *Fallback*: The frontend UI also features a built-in Demo Simulation toggle so you can test full UI audio analysis flows even if your Flask backend isn't started yet.

---

## 4. Technical Architecture & Communication Flow

```
┌───────────────────────────────────────────────┐
│              Client Browser                   │
│        (http://localhost:3000)                │
│                                               │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  MediaRecorder   │  │  File Dropzone   │   │
│  │   (Microphone)   │  │  (.wav / .mp3)   │   │
│  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │             │
│           └──────────┬──────────┘             │
│                      ▼                        │
│             Staged Audio File                 │
│              (recording.wav)                  │
└──────────────────────┬────────────────────────┘
                       │
                       │ HTTP POST /predict (multipart/form-data)
                       ▼
┌───────────────────────────────────────────────┐
│             Flask Backend                     │
│        (http://localhost:5000)                │
│                                               │
│  1. Receives audio file                       │
│  2. Extracts audio features (MFCC / Mel)      │
│  3. Runs language classification model        │
│  4. Returns JSON:                             │
│     { "success": true,                        │
│       "language": "darija",                   │
│       "confidence": 0.88,                     │
│       "probabilities": { ... } }              │
└───────────────────────────────────────────────┘
```
