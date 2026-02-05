from __future__ import annotations

import csv
import json
import os
from datetime import datetime
from typing import Iterable, List

from .models import SelectionIn, SelectionRecord

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
JSONL_PATH = os.path.join(DATA_DIR, "selections.jsonl")


def ensure_data_dir() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)


def save_selection(selection: SelectionIn) -> SelectionRecord:
    ensure_data_dir()
    record = SelectionRecord(
        **selection.model_dump(),
        timestamp=datetime.utcnow().isoformat(timespec="seconds") + "Z",
    )
    with open(JSONL_PATH, "a", encoding="utf-8") as f:
        f.write(record.model_dump_json() + "\n")
    return record


def read_selections(book: str | None = None) -> List[SelectionRecord]:
    if not os.path.exists(JSONL_PATH):
        return []
    records: List[SelectionRecord] = []
    with open(JSONL_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            data = json.loads(line)
            if book and data.get("book") != book:
                continue
            records.append(SelectionRecord(**data))
    return records


def export_jsonl(records: Iterable[SelectionRecord]) -> str:
    return "\n".join(record.model_dump_json() for record in records)


def export_csv(records: Iterable[SelectionRecord]) -> str:
    rows = [record.model_dump() for record in records]
    if not rows:
        return ""
    output = []
    fieldnames = list(rows[0].keys())
    from io import StringIO

    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()
