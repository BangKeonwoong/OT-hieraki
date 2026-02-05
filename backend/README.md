# Backend

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Modes

- `BHSA_MODE=auto` (default): tries Text-Fabric BHSA; falls back to mock data.
- `BHSA_MODE=mock`: always uses mock data.
- `BHSA_MODE=tf`: require Text-Fabric BHSA.

Optional:
- `BHSA_VERSION=2021`

## Storage
Selections are appended to `backend/data/selections.jsonl`.
Use `/api/book/{book}/export?format=jsonl|csv` to download.

## Environment

- `BHSA_REQUIRE_TF=true` to fail fast if Text-Fabric is unavailable.
- `BHSA_VERSION=2021` (default).
- `TF_DATA=/path/to/text-fabric-data` (optional cache location).
