from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, List

from app.scoring import distance_bucket


def resolve_tf_location(version: str) -> str | None:
    env = os.getenv("TF_DATA")
    candidates: list[str] = []
    if env:
        candidates.extend(
            [
                env,
                os.path.join(env, "tf", version),
                os.path.join(env, version),
            ]
        )
    home = os.path.expanduser("~")
    candidates.extend(
        [
            os.path.join(home, "text-fabric-data", "github", "ETCBC", "bhsa", "tf", version),
            os.path.join(home, "text-fabric-data", "github", "etcbc", "bhsa", "tf", version),
        ]
    )
    for path in candidates:
        if not path:
            continue
        if os.path.isdir(path) and os.path.exists(os.path.join(path, "otype.tf")):
            return path
    return None


def export_static(output_dir: Path, version: str) -> None:
    from tf.fabric import Fabric

    output_dir.mkdir(parents=True, exist_ok=True)
    books_dir = output_dir / "books"
    books_dir.mkdir(parents=True, exist_ok=True)

    location = resolve_tf_location(version)
    if location:
        TF = Fabric(locations=location, silent=True)
    else:
        TF = Fabric(silent=True)

    api = TF.load("otype oslots book chapter verse typ kind txt pargr tab number lex mother")
    F = api.F
    E = api.E
    L = api.L
    N = api.N
    T = api.T

    book_nodes = list(F.otype.s("book"))
    books = sorted({F.book.v(node) for node in book_nodes})
    with (output_dir / "books.json").open("w", encoding="utf-8") as f:
        json.dump({"books": books}, f, ensure_ascii=False)

    for book in books:
        book_node = None
        for node in book_nodes:
            if F.book.v(node) == book:
                book_node = node
                break
        if book_node is None:
            continue

        atoms = L.d(book_node, otype="clause_atom")
        atoms_sorted = sorted(atoms, key=N.sortKey)

        atoms_payload: List[Dict] = []
        id_to_index: Dict[int, int] = {}

        for idx, atom in enumerate(atoms_sorted):
            words = L.d(atom, otype="word")
            first_slot = words[0] if words else None
            last_slot = words[-1] if words else None
            hebrew = T.text(atom, fmt="text-orig-full")

            section = T.sectionFromNode(atom)
            if section is None:
                book_name, chapter, verse = book, 0, 0
            else:
                book_name, chapter, verse = section

            sentence_nodes = L.u(atom, otype="sentence")
            sentence_id = sentence_nodes[0] if sentence_nodes else None

            lex_feature = getattr(F, "lex", None)
            lexemes = []
            if lex_feature:
                lex_set = set()
                for w in words:
                    val = lex_feature.v(w)
                    if val:
                        lex_set.add(val)
                lexemes = sorted(lex_set)

            payload = {
                "id": atom,
                "ref": {"book": book_name, "chapter": chapter, "verse": verse},
                "hebrew": hebrew,
                "typ": getattr(F, "typ", None).v(atom) if getattr(F, "typ", None) else None,
                "kind": getattr(F, "kind", None).v(atom) if getattr(F, "kind", None) else None,
                "txt": getattr(F, "txt", None).v(atom) if getattr(F, "txt", None) else None,
                "pargr": getattr(F, "pargr", None).v(atom) if getattr(F, "pargr", None) else None,
                "tab": getattr(F, "tab", None).v(atom) if getattr(F, "tab", None) else None,
                "number": getattr(F, "number", None).v(atom) if getattr(F, "number", None) else None,
                "firstSlot": first_slot,
                "lastSlot": last_slot,
                "sentence": sentence_id,
                "lexemes": lexemes,
            }
            atoms_payload.append(payload)
            id_to_index[atom] = idx

        prior_counts: Dict[str, int] = {}
        has_mother = hasattr(E, "mother")
        for daughter in atoms_sorted:
            mothers = E.mother.f(daughter) if has_mother else []
            if not mothers:
                continue
            daughter_index = id_to_index.get(daughter)
            if daughter_index is None:
                continue
            daughter_typ = getattr(F, "typ", None).v(daughter) if getattr(F, "typ", None) else None
            daughter_txt = getattr(F, "txt", None).v(daughter) if getattr(F, "txt", None) else None

            for mother_id in mothers:
                mother_index = id_to_index.get(mother_id)
                if mother_index is None:
                    continue
                mother_typ = getattr(F, "typ", None).v(mother_id) if getattr(F, "typ", None) else None
                mother_txt = getattr(F, "txt", None).v(mother_id) if getattr(F, "txt", None) else None
                distance = daughter_index - mother_index
                sig = "::".join(
                    [
                        mother_typ or "?",
                        daughter_typ or "?",
                        distance_bucket(distance),
                        f"{mother_txt or '?'}->{daughter_txt or '?'}",
                    ]
                )
                prior_counts[sig] = prior_counts.get(sig, 0) + 1

        prior_max = max(prior_counts.values()) if prior_counts else 0

        payload = {
            "book": book,
            "atoms": atoms_payload,
            "priorCounts": prior_counts,
            "priorMax": prior_max,
        }

        slug = book.replace(" ", "_")
        out_path = books_dir / f"{slug}.json"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)


if __name__ == "__main__":
    version = os.getenv("BHSA_VERSION", "2021")
    output_dir = Path(__file__).resolve().parents[2] / "frontend" / "public" / "data"
    export_static(output_dir, version)
