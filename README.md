# Bemi Development Setup

This guide walks you through local setup and running the project in development mode.

## Prerequisites

- Python 3.10+ installed
- Bun installed

## 1) Run Repository Setup

From the project root, run the setup script to install dependencies and download models:

```powershell
python setup.py
```

This will:
- Install Python dependencies from requirements.txt
- Download NLTK packages (punkt, stopwords, wordnet, averaged_perceptron_tagger)
- Download spaCy en_core_web_sm model
- Initialize the SQLite database with skills and chunks stores

Optional setup flags:
- `python setup.py --skip-install` — Skip pip dependencies
- `python setup.py --skip-nltk` — Skip NLTK downloads
- `python setup.py --skip-spacy` — Skip spaCy model download
- `python setup.py --skip-db` — Skip database initialization

## 2) Frontend Install

Install frontend dependencies:

```powershell
cd frontend
bun install
```

## 3) Start Development Servers

Use two terminals.

Terminal 1 (backend, from project root):

```powershell
flask --app backend/app.py run --debug
```

Backend default URL:

- http://127.0.0.1:5000

Terminal 2 (frontend):

```powershell
cd frontend
bun run dev
```

Frontend default URL (Vite):

- http://localhost:5173

## Optional: Production Build Preview (Frontend)

```powershell
cd frontend
bun run build
bun run serve
```

