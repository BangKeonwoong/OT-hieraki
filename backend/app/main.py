from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from .models import SelectionIn
from .provider import get_provider
from .storage import export_csv, export_jsonl, read_selections, save_selection

app = FastAPI(title="BHSA Mother Clause Selector", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

provider = get_provider()


@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": provider.mode}


@app.get("/api/books")
async def list_books():
    return {"books": provider.get_books(), "mode": provider.mode}


@app.get("/api/book/{book}/clause-atoms")
async def clause_atoms(book: str):
    try:
        atoms = provider.get_clause_atoms_dto(book)
    except KeyError:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"book": book, "atoms": atoms}


@app.get("/api/book/{book}/candidates")
async def candidates(
    book: str,
    daughterId: int = Query(..., alias="daughterId"),
    limit: int = Query(200, ge=0, le=2000),
    scope: str = Query("sentence"),
):
    try:
        results = provider.get_candidates(book, daughterId, limit, scope)
    except KeyError:
        raise HTTPException(status_code=404, detail="Daughter not found")
    return {
        "book": book,
        "daughterId": daughterId,
        "limit": limit,
        "scope": scope,
        "candidates": results,
    }


@app.post("/api/book/{book}/selection")
async def selection(book: str, payload: SelectionIn):
    if payload.book != book:
        raise HTTPException(status_code=400, detail="Book mismatch")
    record = save_selection(payload)
    return {"saved": True, "record": record}


@app.get("/api/book/{book}/export")
async def export(book: str, format: str = Query("jsonl")):
    records = read_selections(book)
    if format == "csv":
        content = export_csv(records)
        return PlainTextResponse(content, media_type="text/csv")
    content = export_jsonl(records)
    return PlainTextResponse(content, media_type="application/jsonl")
