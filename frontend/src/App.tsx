import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { computeCandidates, CandidateResult, ClauseAtom, StaticBookData } from "./scoring";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const DATA_MODE = import.meta.env.VITE_DATA_MODE ?? "api";
const BASE_URL = import.meta.env.BASE_URL ?? "/";


type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  data: CandidateResult | null;
};

export default function App() {
  const [books, setBooks] = useState<string[]>([]);
  const [mode, setMode] = useState("?");
  const [book, setBook] = useState<string>("");
  const [atoms, setAtoms] = useState<ClauseAtom[]>([]);
  const [staticData, setStaticData] = useState<StaticBookData | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMotherId, setSelectedMotherId] = useState<number | null>(null);
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

  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const candidatesById = useMemo(() => {
    const map = new Map<number, CandidateResult>();
    candidates.forEach((c) => map.set(c.candidateId, c));
    return map;
  }, [candidates]);

  useEffect(() => {
    if (DATA_MODE === "static") {
      fetch(`${BASE_URL}data/books.json`)
        .then((res) => res.json())
        .then((data) => {
          setBooks(data.books ?? []);
          setMode("tf-static");
          if (data.books?.length) {
            setBook(data.books[0]);
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
        setBooks(data.books ?? []);
        setMode(data.mode ?? "?");
        if (data.books?.length) {
          setBook(data.books[0]);
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

  const listData = useMemo(() => {
    return {
      atoms,
      selectedId,
      selectedMotherId,
      candidatesById,
      onSelectDaughter: (id: number) => {
        setSelectedId(id);
        setSelectedMotherId(null);
      },
      onSelectMother: async (candidate: CandidateResult, daughterId: number) => {
        if (!book) return;
        const payload = {
          book,
          daughter_clause_atom: daughterId,
          chosen_mother_clause_atom: candidate.candidateId,
          score_at_choice: candidate.score,
        };

        if (DATA_MODE === "static") {
          const key = "bhsa-selections";
          const raw = window.localStorage.getItem(key);
          const existing = raw ? JSON.parse(raw) : [];
          existing.push({ ...payload, timestamp: new Date().toISOString() });
          window.localStorage.setItem(key, JSON.stringify(existing));
          setSelectedMotherId(candidate.candidateId);
          return;
        }

        await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/selection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSelectedMotherId(candidate.candidateId);
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
  }, [atoms, selectedId, selectedMotherId, candidatesById, book, tooltip.visible]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">BHSA - Mother Clause</p>
          <h1>Anchoring Console</h1>
          <p className="subtitle">
            Select a daughter clause_atom, then weigh candidate mothers with
            interpretable evidence.
          </p>
        </div>
        <div className="status">
          <div className="pill">Mode: {mode}</div>
          <div className="pill">Clauses: {atoms.length}</div>
        </div>
      </header>

      <div className="layout">
        <aside className="control-panel">
          <div className="panel-header">
            <h2>Book + Scope</h2>
            <p>Focus the search window and pick the daughter clause.</p>
          </div>

          <label className="field">
            <span>Book</span>
            <select value={book} onChange={(e) => setBook(e.target.value)}>
              {books.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Candidate Scope</span>
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="sentence">Same sentence</option>
              <option value="range">Range only</option>
              <option value="all">All previous</option>
            </select>
          </label>

          <label className="field">
            <span>Search Range</span>
            <input
              type="range"
              min={20}
              max={600}
              step={10}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
            <div className="range-value">{limit} clauses</div>
          </label>

          <div className="divider" />

          <div className="legend">
            <div className="legend-item">
              <span className="swatch daughter" />
              <div>
                <strong>Daughter</strong>
                <p>Selected clause_atom</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="swatch candidate" />
              <div>
                <strong>Candidate</strong>
                <p>Scored mother options</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="swatch chosen" />
              <div>
                <strong>Chosen mother</strong>
                <p>Saved selection</p>
              </div>
            </div>
          </div>

          <div className="hint">
            <p>
              Click a row to set the daughter. Hover a highlighted candidate to
              view score evidence. Use "Select mother" to save.
            </p>
          </div>
        </aside>

        <main className="list-panel" id="list-area">
          {isLoadingAtoms ? (
            <div className="loading">Loading clause_atoms…</div>
          ) : atoms.length === 0 ? (
            <div className="loading">No data loaded.</div>
          ) : (
            <List
              height={Math.max(420, window.innerHeight - 250)}
              width="100%"
              itemCount={atoms.length}
              itemSize={84}
              itemData={listData}
              className="virtual-list"
            >
              {Row}
            </List>
          )}
          {isLoadingCandidates && (
            <div className="loading-overlay">Scoring candidates…</div>
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
              <span className="tooltip-rank">Rank #{tooltip.data.rank}</span>
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

type RowData = {
  atoms: ClauseAtom[];
  selectedId: number | null;
  selectedMotherId: number | null;
  candidatesById: Map<number, CandidateResult>;
  onSelectDaughter: (id: number) => void;
  onSelectMother: (candidate: CandidateResult, daughterId: number) => void;
  onHoverStart: (event: MouseEvent, candidate: CandidateResult) => void;
  onHoverMove: (event: MouseEvent) => void;
  onHoverEnd: () => void;
};

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  const atom = data.atoms[index];
  const candidate = data.candidatesById.get(atom.id);
  const isCandidate = Boolean(candidate);
  const isDaughter = data.selectedId === atom.id;
  const isChosen = data.selectedMotherId === atom.id;

  const heat = candidate ? Math.min(1, Math.max(0, candidate.score)) : 0;

  return (
    <div
      className={`row ${isCandidate ? "candidate" : ""} ${isDaughter ? "daughter" : ""} ${
        isChosen ? "chosen" : ""
      }`}
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
            {atom.ref.book} {atom.ref.chapter}:{atom.ref.verse}
          </span>
          <span className="atom-id">#{atom.id}</span>
        </div>
        <div className="row-text">{atom.hebrew}</div>
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
              <span>score</span>
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
              Select mother
            </button>
          </>
        ) : (
          <div className="ghost">--</div>
        )}
      </div>
    </div>
  );
}
