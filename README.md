# Bemi Development Setup

This guide walks you through local setup and running the project in development mode.

## Prerequisites

- Python 3.10+ installed
- Ollama installed
- Bun installed

## 1) Run Repository Setup

From the project root, open and run the cells in `setup.ipynb` notebook.

## 2) Start Development Servers

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

