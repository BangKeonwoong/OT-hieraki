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

type TranslationTooltipState = {
  visible: boolean;
  x: number;
  y: number;
  text: string;
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
  const [translationTooltip, setTranslationTooltip] =
    useState<TranslationTooltipState>({
      visible: false,
      x: 0,
      y: 0,
      text: "",
    });

  const tooltipTimer = useRef<number | null>(null);
  const translationTimer = useRef<number | null>(null);

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
      if (translationTimer.current) {
        window.clearTimeout(translationTimer.current);
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
        if (translationTooltip.visible) {
          return;
        }
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
      onTextHoverStart: (event: MouseEvent, text: string | null | undefined) => {
        if (tooltipTimer.current) {
          window.clearTimeout(tooltipTimer.current);
        }
        setTooltip({ visible: false, x: 0, y: 0, data: null });
        if (translationTimer.current) {
          window.clearTimeout(translationTimer.current);
        }
        const message = text && text.trim() ? text : "직역 정보 없음";
        const { clientX, clientY } = event;
        translationTimer.current = window.setTimeout(() => {
          setTranslationTooltip({
            visible: true,
            x: clientX,
            y: clientY,
            text: message,
          });
        }, 140);
      },
      onTextHoverMove: (event: MouseEvent) => {
        if (!translationTooltip.visible) return;
        setTranslationTooltip((prev) => ({
          ...prev,
          x: event.clientX,
          y: event.clientY,
        }));
      },
      onTextHoverEnd: () => {
        if (translationTimer.current) {
          window.clearTimeout(translationTimer.current);
        }
        setTranslationTooltip({ visible: false, x: 0, y: 0, text: "" });
      },
    };
  }, [
    atoms,
    selectedId,
    selectedMotherId,
    candidatesById,
    book,
    tooltip.visible,
    translationTooltip.visible,
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
                  {b}
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
          </div>

          <div className="hint">
            <p>
              행을 클릭해 딸 절을 지정하세요. 하이라이트된 후보에 마우스를
              올리면 점수 근거를 확인할 수 있습니다. "어미절 선택"을 누르면
              저장됩니다.
            </p>
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
      {translationTooltip.visible && (
        <div
          className="tooltip translation-tooltip"
          style={{ left: translationTooltip.x + 16, top: translationTooltip.y + 16 }}
        >
          <div className="tooltip-header">
            <div>
              <span className="tooltip-score">한글 직역</span>
            </div>
          </div>
          <div className="tooltip-body">
            <div className="translation-text">{translationTooltip.text}</div>
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
  onTextHoverStart: (event: MouseEvent, text: string | null | undefined) => void;
  onTextHoverMove: (event: MouseEvent) => void;
  onTextHoverEnd: () => void;
};

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  const atom = data.atoms[index];
  const candidate = data.candidatesById.get(atom.id);
  const isCandidate = Boolean(candidate);
  const isDaughter = data.selectedId === atom.id;
  const isChosen = data.selectedMotherId === atom.id;
  const koreanLiteral = atom.koreanLiteral;

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
        <div
          className="row-text"
          dir="rtl"
          lang="he"
          onMouseEnter={(event) => data.onTextHoverStart(event, koreanLiteral)}
          onMouseMove={(event) => data.onTextHoverMove(event)}
          onMouseLeave={() => data.onTextHoverEnd()}
        >
          {atom.hebrew}
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
