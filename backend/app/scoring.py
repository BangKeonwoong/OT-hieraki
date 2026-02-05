from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

from .models import CandidateResult, EvidenceItem


@dataclass(frozen=True)
class ClauseAtomInternal:
    id: int
    index: int
    book: str
    chapter: int
    verse: int
    hebrew: str
    typ: Optional[str]
    kind: Optional[str]
    txt: Optional[str]
    pargr: Optional[str]
    tab: Optional[int]
    number: Optional[int]
    first_slot: Optional[int]
    last_slot: Optional[int]
    sentence: Optional[int]
    lexemes: Tuple[str, ...]


def sigmoid(x: float) -> float:
    if x >= 0:
        z = math.exp(-x)
        return 1 / (1 + z)
    z = math.exp(x)
    return z / (1 + z)


def jaccard(a: Iterable[str], b: Iterable[str]) -> float:
    set_a = set(a)
    set_b = set(b)
    if not set_a and not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def distance_bucket(distance: int) -> str:
    if distance <= 3:
        return "1-3"
    if distance <= 10:
        return "4-10"
    if distance <= 30:
        return "11-30"
    return ">30"


def score_candidates(
    daughter: ClauseAtomInternal,
    candidates: List[ClauseAtomInternal],
    prior_counts: Dict[str, int],
    prior_max: int,
    weights: Dict[str, float],
) -> List[CandidateResult]:
    results: List[CandidateResult] = []
    for cand in candidates:
        distance = daughter.index - cand.index
        same_sentence = (
            daughter.sentence is not None
            and cand.sentence is not None
            and daughter.sentence == cand.sentence
        )
        typ_match = bool(daughter.typ and cand.typ and daughter.typ == cand.typ)
        txt_match = bool(daughter.txt and cand.txt and daughter.txt == cand.txt)
        lex_overlap = jaccard(daughter.lexemes, cand.lexemes)

        sig = "::".join(
            [
                cand.typ or "?",
                daughter.typ or "?",
                distance_bucket(distance),
                f"{cand.txt or '?'}->{daughter.txt or '?'}",
            ]
        )
        prior_count = prior_counts.get(sig, 0)
        prior_norm = (prior_count / prior_max) if prior_max else 0.0

        contribs: List[EvidenceItem] = []

        dist_contrib = -weights["distance"] * math.log1p(max(distance, 0))
        contribs.append(
            EvidenceItem(
                feature="distance_clause_atoms",
                value=distance,
                weight=-weights["distance"],
                contrib=dist_contrib,
                note="가까울수록 유리",
            )
        )

        sentence_contrib = weights["same_sentence"] * (1.0 if same_sentence else 0.0)
        contribs.append(
            EvidenceItem(
                feature="same_sentence",
                value=same_sentence,
                weight=weights["same_sentence"],
                contrib=sentence_contrib,
                note="같은 문장 보너스",
            )
        )

        typ_contrib = weights["typ_match"] * (1.0 if typ_match else 0.0)
        contribs.append(
            EvidenceItem(
                feature="typ_match",
                value=typ_match,
                weight=weights["typ_match"],
                contrib=typ_contrib,
                note="같은 절 유형",
            )
        )

        txt_contrib = weights["txt_match"] * (1.0 if txt_match else 0.0)
        contribs.append(
            EvidenceItem(
                feature="txt_match",
                value=txt_match,
                weight=weights["txt_match"],
                contrib=txt_contrib,
                note="같은 텍스트 도메인",
            )
        )

        lex_contrib = weights["lex_overlap"] * lex_overlap
        contribs.append(
            EvidenceItem(
                feature="lex_overlap_jaccard",
                value=round(lex_overlap, 3),
                weight=weights["lex_overlap"],
                contrib=lex_contrib,
                note="어휘 겹침",
            )
        )

        prior_contrib = weights["prior"] * prior_norm
        contribs.append(
            EvidenceItem(
                feature="prior_frequency",
                value=prior_count,
                weight=weights["prior"],
                contrib=prior_contrib,
                note="유사 연결 빈도",
            )
        )

        raw_score = sum(item.contrib for item in contribs)
        score = sigmoid(raw_score)

        results.append(
            CandidateResult(
                candidateId=cand.id,
                score=score,
                rank=0,
                evidence=contribs,
            )
        )

    results.sort(key=lambda item: item.score, reverse=True)
    for idx, item in enumerate(results, start=1):
        item.rank = idx

    return results
