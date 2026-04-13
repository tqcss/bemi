# Bemi Development Setup

This guide walks you through local setup and running the project in development mode.

## Prerequisites

- Python 3.10+ installed
- Bun installed
- Jupyter support (for running the setup notebook)

## 1) Backend Python Dependencies

From the project root, install backend dependencies:

```powershell
pip install -r requirements.txt
```

## 2) Run the Setup Notebook

Open and run all cells in:

- notebooks/setup.ipynb

This prepares local resources required by the project.

## 3) Frontend Install

Install frontend dependencies:

```powershell
cd frontend
bun install
```

## 4) Start Development Servers

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

