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
