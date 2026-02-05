from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class Ref(BaseModel):
    book: str
    chapter: int
    verse: int


class ClauseAtomDTO(BaseModel):
    id: int
    ref: Ref
    hebrew: str
    typ: Optional[str] = None
    kind: Optional[str] = None
    txt: Optional[str] = None
    pargr: Optional[str] = None
    tab: Optional[int] = None
    number: Optional[int] = None
    firstSlot: Optional[int] = None
    lastSlot: Optional[int] = None


class EvidenceItem(BaseModel):
    feature: str
    value: str | int | float | bool | None
    weight: float
    contrib: float
    note: str


class CandidateResult(BaseModel):
    candidateId: int
    score: float = Field(ge=0.0, le=1.0)
    rank: int
    evidence: List[EvidenceItem]


class SelectionIn(BaseModel):
    book: str
    daughter_clause_atom: int
    chosen_mother_clause_atom: int
    score_at_choice: float
    notes: Optional[str] = None


class SelectionRecord(SelectionIn):
    timestamp: str
