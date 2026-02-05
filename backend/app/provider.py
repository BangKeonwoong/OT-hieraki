from __future__ import annotations

import os
import random
from dataclasses import dataclass
from typing import Dict, List, Optional

from .models import ClauseAtomDTO, Ref
from .scoring import ClauseAtomInternal, distance_bucket, score_candidates


@dataclass
class BookCache:
    atoms: List[ClauseAtomInternal]
    id_to_index: Dict[int, int]
    prior_counts: Dict[str, int]
    prior_max: int


class BaseProvider:
    mode: str

    def get_books(self) -> List[str]:
        raise NotImplementedError

    def get_clause_atoms_dto(self, book: str) -> List[ClauseAtomDTO]:
        raise NotImplementedError

    def get_candidates(
        self, book: str, daughter_id: int, limit: int, scope: str
    ) -> List:
        raise NotImplementedError


class MockProvider(BaseProvider):
    def __init__(self) -> None:
        self.mode = "mock"
        self._book_cache: Dict[str, BookCache] = {}
        self._build_sample()

    def _build_sample(self) -> None:
        random.seed(42)
        book = "Genesis"
        atoms: List[ClauseAtomInternal] = []
        lex_pool = [
            "brk",
            "mlk",
            "qds",
            "ywm",
            "hrt",
            "dbr",
            "nby",
            "shm",
        ]
        for i in range(1, 301):
            chapter = 1 + (i - 1) // 50
            verse = 1 + (i - 1) // 10
            typ = random.choice(["WayX", "NmCl", "PC", "WQt", "Zj"])
            kind = random.choice(["VC", "NC", "PC"])
            txt = random.choice(["N", "D"])
            pargr = str(1 + (i - 1) // 25)
            tab = (i % 5) + 1
            sentence = 1 + (i - 1) // 10
            lexemes = tuple(random.sample(lex_pool, k=2))
            atoms.append(
                ClauseAtomInternal(
                    id=100000 + i,
                    index=i - 1,
                    book=book,
                    chapter=chapter,
                    verse=verse,
                    hebrew=f"Clause {i} — sample text",
                    typ=typ,
                    kind=kind,
                    txt=txt,
                    pargr=pargr,
                    tab=tab,
                    number=i,
                    first_slot=i * 3,
                    last_slot=i * 3 + 2,
                    sentence=sentence,
                    lexemes=lexemes,
                )
            )

        id_to_index = {atom.id: atom.index for atom in atoms}
        prior_counts: Dict[str, int] = {}
        for atom in atoms[1:]:
            mother_index = max(0, atom.index - random.randint(1, 8))
            mother = atoms[mother_index]
            sig = "::".join(
                [
                    mother.typ or "?",
                    atom.typ or "?",
                    distance_bucket(atom.index - mother.index),
                    f"{mother.txt or '?'}->{atom.txt or '?'}",
                ]
            )
            prior_counts[sig] = prior_counts.get(sig, 0) + 1

        prior_max = max(prior_counts.values()) if prior_counts else 0
        self._book_cache[book] = BookCache(
            atoms=atoms,
            id_to_index=id_to_index,
            prior_counts=prior_counts,
            prior_max=prior_max,
        )

    def get_books(self) -> List[str]:
        return sorted(self._book_cache.keys())

    def get_clause_atoms_dto(self, book: str) -> List[ClauseAtomDTO]:
        cache = self._book_cache.get(book)
        if not cache:
            raise KeyError(book)
        return [_to_dto(atom) for atom in cache.atoms]

    def get_candidates(self, book: str, daughter_id: int, limit: int, scope: str) -> List:
        cache = self._book_cache.get(book)
        if not cache:
            raise KeyError(book)
        index = cache.id_to_index.get(daughter_id)
        if index is None:
            raise KeyError(daughter_id)
        daughter = cache.atoms[index]
        candidates = cache.atoms[:index]
        if scope == "sentence":
            candidates = [
                c for c in candidates if c.sentence is not None and c.sentence == daughter.sentence
            ]
        if scope != "all" and limit > 0:
            candidates = candidates[-limit:]
        weights = _default_weights()
        return score_candidates(
            daughter,
            candidates,
            cache.prior_counts,
            cache.prior_max,
            weights,
        )


class TFProvider(BaseProvider):
    def __init__(self, version: str) -> None:
        self.mode = "tf"
        self.version = version
        self._book_cache: Dict[str, BookCache] = {}
        self._load_tf()

    def _load_tf(self) -> None:
        from tf.app import use

        self.app = use("etcbc/bhsa", version=self.version, silent=True)
        api = self.app.TF
        self.F = api.F
        self.E = api.E
        self.L = api.L
        self.N = api.N
        self.T = api.T

    def get_books(self) -> List[str]:
        books = []
        for node in self.F.otype.s("book"):
            books.append(self.F.book.v(node))
        return sorted(set(books))

    def _build_book_cache(self, book: str) -> BookCache:
        book_node = None
        for node in self.F.otype.s("book"):
            if self.F.book.v(node) == book:
                book_node = node
                break
        if book_node is None:
            raise KeyError(book)

        atoms = self.L.d(book_node, otype="clause_atom")
        atoms_sorted = sorted(atoms, key=self.N.sortKey)

        internals: List[ClauseAtomInternal] = []
        id_to_index: Dict[int, int] = {}

        for idx, atom in enumerate(atoms_sorted):
            words = self.L.d(atom, otype="word")
            first_slot = words[0] if words else None
            last_slot = words[-1] if words else None
            hebrew = self.T.text(atom, fmt="text-orig-full")
            typ = getattr(self.F, "typ", None)
            kind = getattr(self.F, "kind", None)
            txt = getattr(self.F, "txt", None)
            pargr = getattr(self.F, "pargr", None)
            tab = getattr(self.F, "tab", None)
            number = getattr(self.F, "number", None)
            typ_v = typ.v(atom) if typ else None
            kind_v = kind.v(atom) if kind else None
            txt_v = txt.v(atom) if txt else None
            pargr_v = pargr.v(atom) if pargr else None
            tab_v = tab.v(atom) if tab else None
            number_v = number.v(atom) if number else None

            section = self.T.sectionFromNode(atom)
            if section is None:
                book_name, chapter, verse = book, 0, 0
            else:
                book_name, chapter, verse = section

            sentence_nodes = self.L.u(atom, otype="sentence")
            sentence_id = sentence_nodes[0] if sentence_nodes else None

            lex_feature = getattr(self.F, "lex", None)
            lexemes = []
            if lex_feature:
                for w in words:
                    val = lex_feature.v(w)
                    if val:
                        lexemes.append(val)

            internals.append(
                ClauseAtomInternal(
                    id=atom,
                    index=idx,
                    book=book_name,
                    chapter=chapter,
                    verse=verse,
                    hebrew=hebrew,
                    typ=typ_v,
                    kind=kind_v,
                    txt=txt_v,
                    pargr=pargr_v,
                    tab=tab_v,
                    number=number_v,
                    first_slot=first_slot,
                    last_slot=last_slot,
                    sentence=sentence_id,
                    lexemes=tuple(lexemes),
                )
            )
            id_to_index[atom] = idx

        prior_counts: Dict[str, int] = {}
        for daughter in internals:
            mothers = self.E.mother.f(daughter.id)
            if not mothers:
                continue
            for mother_id in mothers:
                mother_index = id_to_index.get(mother_id)
                if mother_index is None:
                    continue
                mother = internals[mother_index]
                distance = daughter.index - mother.index
                sig = "::".join(
                    [
                        mother.typ or "?",
                        daughter.typ or "?",
                        distance_bucket(distance),
                        f"{mother.txt or '?'}->{daughter.txt or '?'}",
                    ]
                )
                prior_counts[sig] = prior_counts.get(sig, 0) + 1

        prior_max = max(prior_counts.values()) if prior_counts else 0

        cache = BookCache(
            atoms=internals,
            id_to_index=id_to_index,
            prior_counts=prior_counts,
            prior_max=prior_max,
        )
        self._book_cache[book] = cache
        return cache

    def _get_cache(self, book: str) -> BookCache:
        cache = self._book_cache.get(book)
        if cache:
            return cache
        return self._build_book_cache(book)

    def get_clause_atoms_dto(self, book: str) -> List[ClauseAtomDTO]:
        cache = self._get_cache(book)
        return [_to_dto(atom) for atom in cache.atoms]

    def get_candidates(self, book: str, daughter_id: int, limit: int, scope: str) -> List:
        cache = self._get_cache(book)
        index = cache.id_to_index.get(daughter_id)
        if index is None:
            raise KeyError(daughter_id)
        daughter = cache.atoms[index]
        candidates = cache.atoms[:index]
        if scope == "sentence":
            candidates = [
                c for c in candidates if c.sentence is not None and c.sentence == daughter.sentence
            ]
        if scope != "all" and limit > 0:
            candidates = candidates[-limit:]
        weights = _default_weights()
        return score_candidates(
            daughter,
            candidates,
            cache.prior_counts,
            cache.prior_max,
            weights,
        )


PROVIDER: Optional[BaseProvider] = None


def get_provider() -> BaseProvider:
    global PROVIDER
    if PROVIDER is not None:
        return PROVIDER

    mode = os.getenv("BHSA_MODE", "auto")
    version = os.getenv("BHSA_VERSION", "2021")
    if mode == "mock":
        PROVIDER = MockProvider()
        return PROVIDER

    if mode == "auto":
        try:
            PROVIDER = TFProvider(version=version)
            return PROVIDER
        except Exception:
            PROVIDER = MockProvider()
            return PROVIDER

    if mode == "tf":
        PROVIDER = TFProvider(version=version)
        return PROVIDER

    PROVIDER = MockProvider()
    return PROVIDER


def _default_weights() -> Dict[str, float]:
    return {
        "distance": 0.55,
        "same_sentence": 0.35,
        "typ_match": 0.25,
        "txt_match": 0.15,
        "lex_overlap": 0.65,
        "prior": 0.5,
    }


def _to_dto(atom: ClauseAtomInternal) -> ClauseAtomDTO:
    return ClauseAtomDTO(
        id=atom.id,
        ref=Ref(book=atom.book, chapter=atom.chapter, verse=atom.verse),
        hebrew=atom.hebrew,
        typ=atom.typ,
        kind=atom.kind,
        txt=atom.txt,
        pargr=atom.pargr,
        tab=atom.tab,
        number=atom.number,
        firstSlot=atom.first_slot,
        lastSlot=atom.last_slot,
    )
