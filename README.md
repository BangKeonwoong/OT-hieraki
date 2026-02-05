# OT Mother Clause Selector

BHSA clause_atom mother-selection tool.

## Structure
- `backend/` FastAPI + Text-Fabric (BHSA)
- `frontend/` React + Vite + react-window

## Quickstart

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Notes
- Backend defaults to mock data if Text-Fabric BHSA is unavailable.
- To force BHSA, set `BHSA_MODE=tf`.
- Selections are saved to `backend/data/selections.jsonl`.

## Static Export (BHSA real data)

Generate static JSON for GitHub Pages (from Text-Fabric):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/export_static.py
```

This writes data to `frontend/public/data`.

## GitHub Pages Build

```bash
cd frontend
VITE_DATA_MODE=static GH_PAGES=true npm run build
```
