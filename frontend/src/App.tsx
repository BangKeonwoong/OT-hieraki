import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import type { FixedSizeList } from "react-window";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { computeCandidates, CandidateResult, ClauseAtom, StaticBookData } from "./scoring";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const DATA_MODE = import.meta.env.VITE_DATA_MODE ?? "api";
const BASE_URL = import.meta.env.BASE_URL ?? "/";

const BOOK_ORDER = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numeri",
  "Deuteronomium",
  "Josua",
  "Judices",
  "Ruth",
  "Samuel_I",
  "Samuel_II",
  "Reges_I",
  "Reges_II",
  "Chronica_I",
  "Chronica_II",
  "Esra",
  "Nehemia",
  "Esther",
  "Iob",
  "Psalmi",
  "Proverbia",
  "Ecclesiastes",
  "Canticum",
  "Jesaia",
  "Jeremia",
  "Threni",
  "Ezechiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadia",
  "Jona",
  "Micha",
  "Nahum",
  "Habakuk",
  "Zephania",
  "Haggai",
  "Sacharia",
  "Maleachi",
];

const BOOK_LABELS: Record<string, string> = {
  Genesis: "창세기",
  Exodus: "출애굽기",
  Leviticus: "레위기",
  Numeri: "민수기",
  Deuteronomium: "신명기",
  Josua: "여호수아",
  Judices: "사사기",
  Ruth: "룻기",
  Samuel_I: "사무엘상",
  Samuel_II: "사무엘하",
  Reges_I: "열왕기상",
  Reges_II: "열왕기하",
  Chronica_I: "역대상",
  Chronica_II: "역대하",
  Esra: "에스라",
  Nehemia: "느헤미야",
  Esther: "에스더",
  Iob: "욥기",
  Psalmi: "시편",
  Proverbia: "잠언",
  Ecclesiastes: "전도서",
  Canticum: "아가",
  Jesaia: "이사야",
  Jeremia: "예레미야",
  Threni: "예레미야애가",
  Ezechiel: "에스겔",
  Daniel: "다니엘",
  Hosea: "호세아",
  Joel: "요엘",
  Amos: "아모스",
  Obadia: "오바댜",
  Jona: "요나",
  Micha: "미가",
  Nahum: "나훔",
  Habakuk: "하박국",
  Zephania: "스바냐",
  Haggai: "학개",
  Sacharia: "스가랴",
  Maleachi: "말라기",
};

const bookIndex = new Map(BOOK_ORDER.map((name, index) => [name, index]));

function sortBooks(list: string[]) {
  return [...list].sort((a, b) => {
    const aIndex = bookIndex.get(a) ?? 999;
    const bIndex = bookIndex.get(b) ?? 999;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.localeCompare(b);
  });
}

function getBookLabel(book: string) {
  return BOOK_LABELS[book] ?? book;
}


type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  data: CandidateResult | null;
};

type RowData = {
  atoms: ClauseAtom[];
  selectedId: number | null;
  selectedMotherId: number | null;
  candidatesById: Map<number, CandidateResult>;
  selectionMap: Map<number, number>;
  jumpTargetId: number | null;
  onSelectDaughter: (id: number) => void;
  onSelectMother: (candidate: CandidateResult, daughterId: number) => void;
  onHoverStart: (event: MouseEvent, candidate: CandidateResult) => void;
  onHoverMove: (event: MouseEvent) => void;
  onHoverEnd: () => void;
};


export default function App() {
  const [books, setBooks] = useState<string[]>([]);
  const [mode, setMode] = useState("?");
  const [book, setBook] = useState<string>("");
  const [atoms, setAtoms] = useState<ClauseAtom[]>([]);
  const [staticData, setStaticData] = useState<StaticBookData | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMotherId, setSelectedMotherId] = useState<number | null>(null);
  const [selectionMap, setSelectionMap] = useState<Map<number, number>>(new Map());
  const [selectionRecords, setSelectionRecords] = useState<
    Array<{ daughterId: number; motherId: number; score: number; timestamp: string }>
  >([]);
  const [jumpTargetId, setJumpTargetId] = useState<number | null>(null);
  const [historyFilter, setHistoryFilter] = useState("");
  const [limit, setLimit] = useState(200);
  const [scope, setScope] = useState("sentence");
  const [isLoadingAtoms, setIsLoadingAtoms] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  const tooltipTimer = useRef<number | null>(null);
  const listRef = useRef<FixedSizeList<RowData>>(null);

  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const candidatesById = useMemo(() => {
    const map = new Map<number, CandidateResult>();
    candidates.forEach((c) => map.set(c.candidateId, c));
    return map;
  }, [candidates]);

  const rankedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      return b.score - a.score;
    });
  }, [candidates]);

  useEffect(() => {
    if (DATA_MODE === "static") {
      fetch(`${BASE_URL}data/books.json`)
        .then((res) => res.json())
        .then((data) => {
          const sorted = sortBooks(data.books ?? []);
          setBooks(sorted);
          setMode("tf-static");
          if (sorted.length) {
            setBook(sorted[0]);
          }
        })
        .catch(() => {
          setBooks([]);
        });
      return;
    }

    fetch(`${API_BASE}/api/books`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = sortBooks(data.books ?? []);
        setBooks(sorted);
        setMode(data.mode ?? "?");
        if (sorted.length) {
          setBook(sorted[0]);
        }
      })
      .catch(() => {
        setBooks([]);
      });
  }, []);

  useEffect(() => {
    if (!book) {
      return;
    }
    setIsLoadingAtoms(true);
    setSelectedId(null);
    setSelectedMotherId(null);
    setCandidates([]);
    setStaticData(null);
    setSelectionMap(new Map());
    setJumpTargetId(null);

    if (DATA_MODE === "static") {
      const slug = book.replace(/\s+/g, "_");
      fetch(`${BASE_URL}data/books/${slug}.json`)
        .then((res) => res.json())
        .then((data: StaticBookData) => {
          setAtoms(data.atoms ?? []);
          setStaticData(data);
        })
        .finally(() => setIsLoadingAtoms(false));
      return;
    }

    fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/clause-atoms`)
      .then((res) => res.json())
      .then((data) => {
        setAtoms(data.atoms ?? []);
      })
      .finally(() => setIsLoadingAtoms(false));
  }, [book]);

  useEffect(() => {
    if (!book) return;
    if (DATA_MODE === "static") {
      const key = `bhsa-selections-${book}`;
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        setSelectionMap(new Map());
        setSelectionRecords([]);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as Record<
          string,
          { motherId: number; score: number; timestamp: string }
        >;
        const map = new Map<number, number>();
        const records: Array<{
          daughterId: number;
          motherId: number;
          score: number;
          timestamp: string;
        }> = [];
        Object.entries(parsed).forEach(([daughterId, entry]) => {
          const id = Number(daughterId);
          const motherId = Number(entry.motherId ?? 0);
          map.set(id, motherId);
          records.push({
            daughterId: id,
            motherId,
            score: Number(entry.score ?? 0),
            timestamp: String(entry.timestamp ?? ""),
          });
        });
        setSelectionMap(map);
        records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setSelectionRecords(records);
      } catch {
        setSelectionMap(new Map());
        setSelectionRecords([]);
      }
      return;
    }

    fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/export?format=jsonl`)
      .then((res) => res.text())
      .then((text) => {
        const map = new Map<number, number>();
        const records: Array<{
          daughterId: number;
          motherId: number;
          score: number;
          timestamp: string;
        }> = [];
        text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .forEach((line) => {
            try {
              const item = JSON.parse(line);
              if (typeof item.daughter_clause_atom === "number") {
                const motherId =
                  typeof item.chosen_mother_clause_atom === "number"
                    ? item.chosen_mother_clause_atom
                    : 0;
                map.set(item.daughter_clause_atom, motherId);
                records.push({
                  daughterId: item.daughter_clause_atom,
                  motherId,
                  score: Number(item.score_at_choice ?? 0),
                  timestamp: String(item.timestamp ?? ""),
                });
              }
            } catch {
              return;
            }
          });
        setSelectionMap(map);
        records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setSelectionRecords(records);
      })
      .catch(() => {
        setSelectionMap(new Map());
        setSelectionRecords([]);
      });
  }, [book]);

  useEffect(() => {
    if (!book || !selectedId) {
      setCandidates([]);
      return;
    }
    if (DATA_MODE === "static") {
      if (!staticData) {
        setCandidates([]);
        return;
      }
      setIsLoadingCandidates(true);
      const results = computeCandidates(
        staticData.atoms,
        selectedId,
        limit,
        scope,
        staticData.priorCounts ?? {},
        staticData.priorMax ?? 0
      );
      setCandidates(results);
      setIsLoadingCandidates(false);
      return;
    }

    setIsLoadingCandidates(true);
    fetch(
      `${API_BASE}/api/book/${encodeURIComponent(
        book
      )}/candidates?daughterId=${selectedId}&limit=${limit}&scope=${scope}`
    )
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data.candidates ?? []);
      })
      .finally(() => setIsLoadingCandidates(false));
  }, [book, selectedId, limit, scope, staticData]);

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) {
        window.clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

  const atomById = useMemo(() => {
    const map = new Map<number, ClauseAtom>();
    atoms.forEach((atom) => map.set(atom.id, atom));
    return map;
  }, [atoms]);

  const filteredHistory = useMemo(() => {
    const keyword = historyFilter.trim();
    if (!keyword) return selectionRecords;
    return selectionRecords.filter((record) => {
      const daughter = atomById.get(record.daughterId);
      const mother = atomById.get(record.motherId);
      const pieces = [
        record.daughterId.toString(),
        record.motherId.toString(),
        daughter ? `${getBookLabel(daughter.ref.book)} ${daughter.ref.chapter}:${daughter.ref.verse}` : "",
        record.motherId === 0
          ? "ROOT root 루트"
          : mother
          ? `${getBookLabel(mother.ref.book)} ${mother.ref.chapter}:${mother.ref.verse}`
          : "",
      ]
        .join(" ")
        .toLowerCase();
      return pieces.includes(keyword.toLowerCase());
    });
  }, [selectionRecords, historyFilter, atomById]);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (value: string | number) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, "\"\"")}"`;
    }
    return text;
  };

  const formatRef = (atom?: ClauseAtom) => {
    if (!atom) return "";
    return `${getBookLabel(atom.ref.book)} ${atom.ref.chapter}:${atom.ref.verse}`;
  };

  const exportSelections = async (format: "jsonl" | "csv", includeKorean = false) => {
    if (!book) return;
    if (DATA_MODE === "static" || includeKorean) {
      const rows = selectionRecords.map((record) => {
        const daughter = atomById.get(record.daughterId);
        const mother = atomById.get(record.motherId);
        const row: Record<string, string | number> = {
          book,
          daughter_clause_atom: record.daughterId,
          chosen_mother_clause_atom: record.motherId,
          score_at_choice: record.score,
          timestamp: record.timestamp,
        };
        if (includeKorean) {
          row.book_ko = getBookLabel(book);
          row.daughter_ref_ko = formatRef(daughter);
          row.mother_ref_ko = record.motherId === 0 ? "ROOT" : formatRef(mother);
        }
        return row;
      });
      if (format === "jsonl") {
        const content = rows.map((row) => JSON.stringify(row)).join("\\n");
        const suffix = includeKorean ? "-ko" : "";
        downloadFile(`${book}-selections${suffix}.jsonl`, content, "application/jsonl");
        return;
      }
      const header = [
        "book",
        "daughter_clause_atom",
        "chosen_mother_clause_atom",
        "score_at_choice",
        "timestamp",
      ];
      if (includeKorean) {
        header.push("book_ko", "daughter_ref_ko", "mother_ref_ko");
      }
      const lines = [header.join(",")];
      rows.forEach((row) => {
        const values = header.map((key) => escapeCsv(row[key] ?? ""));
        lines.push(values.join(","));
      });
      const suffix = includeKorean ? "-ko" : "";
      downloadFile(`${book}-selections${suffix}.csv`, lines.join("\\n"), "text/csv");
      return;
    }

    const res = await fetch(
      `${API_BASE}/api/book/${encodeURIComponent(book)}/export?format=${format}`
    );
    const content = await res.text();
    const ext = format === "csv" ? "csv" : "jsonl";
    downloadFile(`${book}-selections.${ext}`, content, "text/plain");
  };

  const scrollToAtom = (atomId: number) => {
    const index = atoms.findIndex((atom) => atom.id === atomId);
    if (index < 0) return;
    listRef.current?.scrollToItem(index, "center");
  };

  const handleSelectRoot = async (daughterId: number | null) => {
    if (!book || daughterId == null) return;
    const timestamp = new Date().toISOString();
    const nextMap = new Map(selectionMap);
    nextMap.set(daughterId, 0);
    setSelectionMap(nextMap);

    setSelectionRecords((prev) => {
      const next = prev.filter((item) => item.daughterId !== daughterId);
      next.unshift({
        daughterId,
        motherId: 0,
        score: 0,
        timestamp,
      });
      return next;
    });

    const localKey = `bhsa-selections-${book}`;
    const raw = window.localStorage.getItem(localKey);
    const existing = raw ? JSON.parse(raw) : {};
    existing[String(daughterId)] = {
      motherId: 0,
      score: 0,
      timestamp,
    };
    window.localStorage.setItem(localKey, JSON.stringify(existing));

    if (DATA_MODE === "static") {
      setSelectedMotherId(null);
      return;
    }

    await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/selection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book,
        daughter_clause_atom: daughterId,
        chosen_mother_clause_atom: 0,
        score_at_choice: 0,
      }),
    });
    setSelectedMotherId(null);
  };

  const handleSelectMother = async (
    candidate: CandidateResult,
    daughterId: number | null
  ) => {
    if (!book || daughterId == null) return;
    const payload = {
      book,
      daughter_clause_atom: daughterId,
      chosen_mother_clause_atom: candidate.candidateId,
      score_at_choice: candidate.score,
    };
    const timestamp = new Date().toISOString();

    const nextMap = new Map(selectionMap);
    nextMap.set(daughterId, candidate.candidateId);
    setSelectionMap(nextMap);

    setSelectionRecords((prev) => {
      const next = prev.filter((item) => item.daughterId !== daughterId);
      next.unshift({
        daughterId,
        motherId: candidate.candidateId,
        score: candidate.score,
        timestamp,
      });
      return next;
    });

    const localKey = `bhsa-selections-${book}`;
    const raw = window.localStorage.getItem(localKey);
    const existing = raw ? JSON.parse(raw) : {};
    existing[String(daughterId)] = {
      motherId: candidate.candidateId,
      score: candidate.score,
      timestamp,
    };
    window.localStorage.setItem(localKey, JSON.stringify(existing));

    if (DATA_MODE === "static") {
      setSelectedMotherId(candidate.candidateId);
      return;
    }

    await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/selection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSelectedMotherId(candidate.candidateId);
  };

  const listData = useMemo(() => {
    return {
      atoms,
      selectedId,
      selectedMotherId,
      candidatesById,
      selectionMap,
      jumpTargetId,
      onSelectDaughter: (id: number) => {
        setSelectedId(id);
        const motherId = selectionMap.get(id) ?? null;
        setSelectedMotherId(motherId && motherId > 0 ? motherId : null);
        setJumpTargetId(null);
      },
      onSelectMother: (candidate: CandidateResult, daughterId: number) => {
        handleSelectMother(candidate, daughterId);
      },
      onHoverStart: (event: MouseEvent, candidate: CandidateResult) => {
        if (tooltipTimer.current) {
          window.clearTimeout(tooltipTimer.current);
        }
        const { clientX, clientY } = event;
        tooltipTimer.current = window.setTimeout(() => {
          setTooltip({ visible: true, x: clientX, y: clientY, data: candidate });
        }, 180);
      },
      onHoverMove: (event: MouseEvent) => {
        if (!tooltip.visible) return;
        setTooltip((prev) => ({
          ...prev,
          x: event.clientX,
          y: event.clientY,
        }));
      },
      onHoverEnd: () => {
        if (tooltipTimer.current) {
          window.clearTimeout(tooltipTimer.current);
        }
        setTooltip({ visible: false, x: 0, y: 0, data: null });
      },
    };
  }, [
    atoms,
    selectedId,
    selectedMotherId,
    candidatesById,
    book,
    tooltip.visible,
    selectionMap,
    jumpTargetId,
  ]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">BHSA - 어미절</p>
          <h1>어미절 선택 콘솔</h1>
          <p className="subtitle">
            딸 절(clause_atom)을 선택하면 후보 어미절을 점수와 근거로
            제시합니다.
          </p>
        </div>
        <div className="status">
          <div className="pill">모드: {mode}</div>
          <div className="pill">절 수: {atoms.length}</div>
        </div>
      </header>

      <div className="layout">
        <aside className="control-panel">
          <div className="panel-header">
            <h2>책 + 범위</h2>
            <p>검색 범위를 조정하고 딸 절을 선택하세요.</p>
          </div>

          <label className="field">
            <span>책</span>
            <select value={book} onChange={(e) => setBook(e.target.value)}>
              {books.map((b) => (
                <option key={b} value={b}>
                  {getBookLabel(b)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>후보 범위</span>
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="sentence">같은 문장</option>
              <option value="range">범위만</option>
              <option value="all">이전 전체</option>
            </select>
          </label>

          <label className="field">
            <span>검색 범위</span>
            <input
              type="range"
              min={20}
              max={600}
              step={10}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
            <div className="range-value">{limit} 절</div>
          </label>

          <div className="divider" />

          <div className="legend">
            <div className="legend-item">
              <span className="swatch daughter" />
              <div>
                <strong>딸 절</strong>
                <p>선택된 clause_atom</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="swatch candidate" />
              <div>
                <strong>후보 어미절</strong>
                <p>점수화된 어미절 후보</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="swatch chosen" />
              <div>
                <strong>선택된 어미절</strong>
                <p>저장된 선택</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="swatch completed" />
              <div>
                <strong>선택 완료</strong>
                <p>어미절이 저장된 딸 절</p>
              </div>
            </div>
          </div>

          <div className="hint">
            <p>
              행을 클릭해 딸 절을 지정하세요. 하이라이트된 후보에 마우스를
              올리면 점수 근거를 확인할 수 있습니다. "어미절 선택"을 누르면
              저장됩니다.
            </p>
          </div>

          <div className="panel-section">
            <h3>선택 기록</h3>
            <p>저장된 어미절 선택을 필터링하고 내려받을 수 있습니다.</p>
            <div className="history-actions">
              <button className="export-button" onClick={() => exportSelections("csv")}>
                CSV 다운로드
              </button>
              <button className="export-button ghost" onClick={() => exportSelections("jsonl")}>
                JSONL 다운로드
              </button>
              <button
                className="export-button"
                onClick={() => exportSelections("csv", true)}
              >
                CSV(한글)
              </button>
              <button
                className="export-button ghost"
                onClick={() => exportSelections("jsonl", true)}
              >
                JSONL(한글)
              </button>
            </div>
            <input
              className="history-filter"
              placeholder="책/장:절/ID 검색"
              value={historyFilter}
              onChange={(event) => setHistoryFilter(event.target.value)}
            />
            <div className="history-list">
              {filteredHistory.length === 0 ? (
                <div className="history-empty">저장된 선택이 없습니다.</div>
              ) : (
                filteredHistory.slice(0, 12).map((record) => {
                  const daughter = atomById.get(record.daughterId);
                  const mother = atomById.get(record.motherId);
                  return (
                    <div key={record.daughterId} className="history-item">
                      <div className="history-main">
                        <div className="history-title">
                          <span className="history-label">딸</span>
                          <span>
                            {daughter
                              ? `${getBookLabel(daughter.ref.book)} ${daughter.ref.chapter}:${daughter.ref.verse}`
                              : `#${record.daughterId}`}
                          </span>
                        </div>
                        <div className="history-sub">
                          <span className="history-label">어미</span>
                          <span>
                            {record.motherId === 0
                              ? "ROOT"
                              : mother
                              ? `${getBookLabel(mother.ref.book)} ${mother.ref.chapter}:${mother.ref.verse}`
                              : `#${record.motherId}`}
                          </span>
                        </div>
                      </div>
                      <button
                        className="history-jump"
                        onClick={() => {
                          setSelectedId(record.daughterId);
                          const motherId = selectionMap.get(record.daughterId) ?? null;
                          setSelectedMotherId(motherId && motherId > 0 ? motherId : null);
                          setJumpTargetId(null);
                          scrollToAtom(record.daughterId);
                        }}
                      >
                        이동
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="panel-section">
            <h3>후보 랭킹</h3>
            <p>선택된 딸 절의 어미절 후보를 점수 순으로 확인합니다.</p>
            {!selectedId ? (
              <div className="history-empty">딸 절을 먼저 선택하세요.</div>
            ) : (
              <>
                <div className="rank-actions">
                  <button className="root-select" onClick={() => handleSelectRoot(selectedId)}>
                    ROOT로 선택
                  </button>
                  {selectionMap.get(selectedId) === 0 && (
                    <span className="root-selected">현재 ROOT 선택됨</span>
                  )}
                </div>
                {candidates.length === 0 ? (
                  <div className="history-empty">후보가 없습니다.</div>
                ) : (
                  <div className="rank-list">
                    {rankedCandidates.slice(0, 10).map((candidate) => {
                      const atom = atomById.get(candidate.candidateId);
                      const label = atom
                        ? `${getBookLabel(atom.ref.book)} ${atom.ref.chapter}:${atom.ref.verse}`
                        : `#${candidate.candidateId}`;
                      const isJumpTarget = jumpTargetId === candidate.candidateId;
                      return (
                        <div
                          key={candidate.candidateId}
                          className={`rank-item ${isJumpTarget ? "active" : ""}`}
                          onClick={() => {
                            setJumpTargetId(candidate.candidateId);
                            scrollToAtom(candidate.candidateId);
                          }}
                        >
                          <div className="rank-main">
                            <div className="rank-score">{Math.round(candidate.score * 100)}</div>
                            <div className="rank-info">
                              <div className="rank-label">
                                {label}
                                {isJumpTarget && <span className="rank-arrow">-&gt;</span>}
                              </div>
                              <div className="rank-meta">순위 {candidate.rank}</div>
                            </div>
                          </div>
                          <button
                            className="rank-select"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectMother(candidate, selectedId);
                            }}
                          >
                            선택
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        <main className="list-panel" id="list-area">
          {isLoadingAtoms ? (
            <div className="loading">clause_atom 불러오는 중…</div>
          ) : atoms.length === 0 ? (
            <div className="loading">데이터가 없습니다.</div>
          ) : (
            <List
              height={Math.max(420, window.innerHeight - 250)}
              width="100%"
              itemCount={atoms.length}
              itemSize={84}
              itemData={listData}
              ref={listRef}
              className="virtual-list"
            >
              {Row}
            </List>
          )}
          {isLoadingCandidates && (
            <div className="loading-overlay">후보 점수 계산 중…</div>
          )}
        </main>
      </div>

      {tooltip.visible && tooltip.data && (
        <div
          className="tooltip"
          style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}
        >
          <div className="tooltip-header">
            <div>
              <span className="tooltip-score">
                {(tooltip.data.score * 100).toFixed(1)}
              </span>
              <span className="tooltip-rank">순위 #{tooltip.data.rank}</span>
            </div>
          </div>
          <div className="tooltip-body">
            {tooltip.data.evidence.map((item) => (
              <div key={item.feature} className="tooltip-row">
                <span className="feature">{item.feature}</span>
                <span className="value">{String(item.value)}</span>
                <span className="note">{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  const atom = data.atoms[index];
  const candidate = data.candidatesById.get(atom.id);
  const isCandidate = Boolean(candidate);
  const isDaughter = data.selectedId === atom.id;
  const isChosen = data.selectedMotherId === atom.id;
  const isCompleted = data.selectionMap.has(atom.id);
  const isJumpTarget = data.jumpTargetId === atom.id;
  const isRootSelected = data.selectionMap.get(atom.id) === 0;
  const koreanLiteral = atom.koreanLiteral;
  const koreanText = koreanLiteral && koreanLiteral.trim() ? koreanLiteral : "직역 정보 없음";

  const heat = candidate ? Math.min(1, Math.max(0, candidate.score)) : 0;

  return (
    <div
      className={`row ${isCandidate ? "candidate" : ""} ${isDaughter ? "daughter" : ""} ${
        isChosen ? "chosen" : ""
      } ${isCompleted ? "completed" : ""} ${isJumpTarget ? "jump-target" : ""}`}
      style={{ ...style, ["--heat" as string]: heat } as React.CSSProperties}
      onClick={() => data.onSelectDaughter(atom.id)}
      onMouseEnter={(event) =>
        candidate ? data.onHoverStart(event, candidate) : null
      }
      onMouseMove={(event) => (candidate ? data.onHoverMove(event) : null)}
      onMouseLeave={() => (candidate ? data.onHoverEnd() : null)}
    >
      <div className="row-main">
        <div className="row-title">
          <span className="ref">
            {getBookLabel(atom.ref.book)} {atom.ref.chapter}:{atom.ref.verse}
          </span>
          {isJumpTarget && <span className="jump-badge">-&gt;</span>}
          {isDaughter && isRootSelected && <span className="root-badge">ROOT</span>}
          <span className="atom-id">#{atom.id}</span>
        </div>
        <div className="row-text-grid">
          <div className="row-text-ko">{koreanText}</div>
          <div className="row-text-he" dir="rtl" lang="he">
            {atom.hebrew}
          </div>
        </div>
        <div className="row-meta">
          <span>typ {atom.typ ?? "-"}</span>
          <span>kind {atom.kind ?? "-"}</span>
          <span>txt {atom.txt ?? "-"}</span>
          <span>pargr {atom.pargr ?? "-"}</span>
        </div>
      </div>
      <div className="row-side">
        {isCandidate && candidate ? (
          <>
            <div className="score">
              {(candidate.score * 100).toFixed(0)}
              <span>점수</span>
            </div>
            <button
              className="choose"
              onClick={(event) => {
                event.stopPropagation();
                if (data.selectedId) {
                  data.onSelectMother(candidate, data.selectedId);
                }
              }}
            >
              어미절 선택
            </button>
          </>
        ) : (
          <div className="ghost">--</div>
        )}
      </div>
    </div>
  );
}
