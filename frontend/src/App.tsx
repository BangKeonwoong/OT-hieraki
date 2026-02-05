import { useRef, useState, useEffect, useMemo } from "react";
import type { FixedSizeList } from "react-window";
import { CandidateResult, ClauseAtom, computeCandidates, StaticBookData } from "./scoring";

// Components
import { Layout } from "./components/Layout";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ClauseList } from "./components/ClauseList";
import { Tooltip } from "./components/Tooltip";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const DATA_MODE = import.meta.env.VITE_DATA_MODE ?? "api";
const BASE_URL = import.meta.env.BASE_URL ?? "/";

// --- Constants & Helpers ---
const BOOK_ORDER = [
  "Genesis", "Exodus", "Leviticus", "Numeri", "Deuteronomium", "Josua", "Judices", "Ruth",
  "Samuel_I", "Samuel_II", "Reges_I", "Reges_II", "Chronica_I", "Chronica_II", "Esra",
  "Nehemia", "Esther", "Iob", "Psalmi", "Proverbia", "Ecclesiastes", "Canticum", "Jesaia",
  "Jeremia", "Threni", "Ezechiel", "Daniel", "Hosea", "Joel", "Amos", "Obadia", "Jona",
  "Micha", "Nahum", "Habakuk", "Zephania", "Haggai", "Sacharia", "Maleachi",
];

const BOOK_LABELS: Record<string, string> = {
  Genesis: "창세기", Exodus: "출애굽기", Leviticus: "레위기", Numeri: "민수기", Deuteronomium: "신명기",
  Josua: "여호수아", Judices: "사사기", Ruth: "룻기", Samuel_I: "사무엘상", Samuel_II: "사무엘하",
  Reges_I: "열왕기상", Reges_II: "열왕기하", Chronica_I: "역대상", Chronica_II: "역대하", Esra: "에스라",
  Nehemia: "느헤미야", Esther: "에스더", Iob: "욥기", Psalmi: "시편", Proverbia: "잠언", Ecclesiastes: "전도서",
  Canticum: "아가", Jesaia: "이사야", Jeremia: "예레미야", Threni: "예레미야애가", Ezechiel: "에스겔",
  Daniel: "다니엘", Hosea: "호세아", Joel: "요엘", Amos: "아모스", Obadia: "오바댜", Jona: "요나",
  Micha: "미가", Nahum: "나훔", Habakuk: "하박국", Zephania: "스바냐", Haggai: "학개", Sacharia: "스가랴",
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

export default function App() {
  // --- State ---
  const [books, setBooks] = useState<string[]>([]);
  const [mode, setMode] = useState("?");
  const [book, setBook] = useState<string>("");
  const [atoms, setAtoms] = useState<ClauseAtom[]>([]);
  const [staticData, setStaticData] = useState<StaticBookData | null>(null);

  // Selection State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMotherId, setSelectedMotherId] = useState<number | null>(null);
  const [selectionMap, setSelectionMap] = useState<Map<number, number>>(new Map());
  const [selectionRecords, setSelectionRecords] = useState<Array<{ daughterId: number; motherId: number; score: number; timestamp: string }>>([]);

  // Navigation & Search
  const [jumpTargetId, setJumpTargetId] = useState<number | null>(null);
  const [historyFilter, setHistoryFilter] = useState("");
  const [limit, setLimit] = useState(200);
  const [scope, setScope] = useState("sentence");

  // Loading (Commented out until used)
  // const [isLoadingAtoms, setIsLoadingAtoms] = useState(false);
  // const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  // Tooltip
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; data: CandidateResult | null }>({
    visible: false, x: 0, y: 0, data: null,
  });

  const tooltipTimer = useRef<number | null>(null);
  const listRef = useRef<FixedSizeList>(null);

  const [candidates, setCandidates] = useState<CandidateResult[]>([]);

  // --- Effects (Data Fetching) ---

  // 1. Load Books
  useEffect(() => {
    async function loadBooks() {
      try {
        if (DATA_MODE === "static") {
          const res = await fetch(`${BASE_URL}data/books.json`);
          const data = await res.json();
          const sorted = sortBooks(data.books ?? []);
          setBooks(sorted);
          setMode("tf-static");
          if (sorted.length) setBook(sorted[0]);
        } else {
          const res = await fetch(`${API_BASE}/api/books`);
          const data = await res.json();
          const sorted = sortBooks(data.books ?? []);
          setBooks(sorted);
          setMode(data.mode ?? "?");
          if (sorted.length) setBook(sorted[0]);
        }
      } catch (err) {
        setBooks([]);
      }
    }
    loadBooks();
  }, []);

  // 2. Load Book Data (Atoms)
  useEffect(() => {
    if (!book) return;
    // setIsLoadingAtoms(true);
    setSelectedId(null);
    setSelectedMotherId(null);
    setCandidates([]);
    setStaticData(null);
    setSelectionMap(new Map());
    setJumpTargetId(null);

    async function loadAtoms() {
      try {
        if (!book) return; // Add check to avoid loading if no book? logic already has check at start of effect.
        if (DATA_MODE === "static") {
          const slug = book.replace(/\s+/g, "_");
          const res = await fetch(`${BASE_URL}data/books/${slug}.json`);
          const data = await res.json();
          setAtoms(data.atoms ?? []);
          setStaticData(data);
        } else {
          const res = await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/clause-atoms`);
          const data = await res.json();
          setAtoms(data.atoms ?? []);
        }
      } finally {
        // setIsLoadingAtoms(false);
      }
    }
    loadAtoms();
  }, [book]);

  // 3. Load Selections (History)
  useEffect(() => {
    if (!book) return;

    async function loadSelections() {
      try {
        let map = new Map<number, number>();
        let records: typeof selectionRecords = [];

        if (DATA_MODE === "static") {
          const key = `bhsa-selections-${book}`;
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            Object.entries(parsed).forEach(([dId, entry]: [string, any]) => {
              const id = Number(dId);
              const mId = Number(entry.motherId ?? 0);
              map.set(id, mId);
              records.push({
                daughterId: id,
                motherId: mId,
                score: Number(entry.score ?? 0),
                timestamp: String(entry.timestamp ?? ""),
              });
            });
          }
        } else {
          const res = await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/export?format=jsonl`);
          const text = await res.text();
          text.split("\n").map(l => l.trim()).filter(Boolean).forEach(line => {
            const item = JSON.parse(line);
            if (typeof item.daughter_clause_atom === "number") {
              const mId = typeof item.chosen_mother_clause_atom === "number" ? item.chosen_mother_clause_atom : 0;
              map.set(item.daughter_clause_atom, mId);
              records.push({
                daughterId: item.daughter_clause_atom,
                motherId: mId,
                score: Number(item.score_at_choice ?? 0),
                timestamp: String(item.timestamp ?? ""),
              });
            }
          });
        }
        setSelectionMap(map);
        records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setSelectionRecords(records);
      } catch (err) {
        setSelectionMap(new Map());
        setSelectionRecords([]);
      }
    }
    loadSelections();
  }, [book]);

  // 4. Compute/Fetch Candidates
  useEffect(() => {
    if (!book || !selectedId) {
      setCandidates([]);
      return;
    }

    async function fetchCandidates() {
      // setIsLoadingCandidates(true);
      try {
        if (DATA_MODE === "static" && staticData) {
          const results = computeCandidates(staticData.atoms, selectedId!, limit, scope, staticData.priorCounts ?? {}, staticData.priorMax ?? 0);
          setCandidates(results);
        } else {
          const res = await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/candidates?daughterId=${selectedId}&limit=${limit}&scope=${scope}`);
          const data = await res.json();
          setCandidates(data.candidates ?? []);
        }
      } finally {
        // setIsLoadingCandidates(false);
      }
    }
    fetchCandidates();
  }, [book, selectedId, limit, scope, staticData]);

  // Clean up tooltip timer
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) window.clearTimeout(tooltipTimer.current);
    };
  }, []);

  // --- Handlers ---

  const scrollToAtom = (atomId: number) => {
    const index = atoms.findIndex((atom) => atom.id === atomId);
    if (index >= 0) {
      listRef.current?.scrollToItem(index, "center");
    }
  };

  const handleJumpToDaughter = (daughterId: number) => {
    setSelectedId(daughterId);
    const mId = selectionMap.get(daughterId);
    setSelectedMotherId(mId && mId > 0 ? mId : null);
    setJumpTargetId(null);
    scrollToAtom(daughterId);
  };

  const handleJumpToCandidate = (candidateId: number) => {
    setJumpTargetId(candidateId);
    scrollToAtom(candidateId);
  };

  const handleSelectMother = async (candidate: CandidateResult, daughterId: number) => {
    if (!book) return;
    const timestamp = new Date().toISOString();

    // Update local state
    const nextMap = new Map(selectionMap);
    nextMap.set(daughterId, candidate.candidateId);
    setSelectionMap(nextMap);

    setSelectionRecords(prev => {
      const next = prev.filter(item => item.daughterId !== daughterId);
      next.unshift({ daughterId, motherId: candidate.candidateId, score: candidate.score, timestamp });
      return next;
    });

    // Persist
    if (DATA_MODE === "static") {
      const key = `bhsa-selections-${book}`;
      const raw = window.localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : {};
      existing[String(daughterId)] = { motherId: candidate.candidateId, score: candidate.score, timestamp };
      window.localStorage.setItem(key, JSON.stringify(existing));
      setSelectedMotherId(candidate.candidateId);
    } else {
      await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book,
          daughter_clause_atom: daughterId,
          chosen_mother_clause_atom: candidate.candidateId,
          score_at_choice: candidate.score,
        }),
      });
      setSelectedMotherId(candidate.candidateId);
    }
  };

  const handleSelectRoot = async (daughterId: number) => {
    if (!book) return;
    const timestamp = new Date().toISOString();

    const nextMap = new Map(selectionMap);
    nextMap.set(daughterId, 0);
    setSelectionMap(nextMap);
    setJumpTargetId(null);

    setSelectionRecords(prev => {
      const next = prev.filter(item => item.daughterId !== daughterId);
      next.unshift({ daughterId, motherId: 0, score: 0, timestamp });
      return next;
    });

    if (DATA_MODE === "static") {
      const key = `bhsa-selections-${book}`;
      const raw = window.localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : {};
      existing[String(daughterId)] = { motherId: 0, score: 0, timestamp };
      window.localStorage.setItem(key, JSON.stringify(existing));
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

  const escapeCsv = (value: string | number) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
    return text;
  };

  const formatRef = (atom?: ClauseAtom) => atom ? `${getBookLabel(atom.ref.book)} ${atom.ref.chapter}:${atom.ref.verse}` : "";

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSelections = async (format: "jsonl" | "csv", includeKorean = false) => {
    if (!book) return;

    // Logic for partial static/korean export
    if (DATA_MODE === "static" || includeKorean) {
      const rows = selectionRecords.map(r => {
        const daughter = atomById.get(r.daughterId);
        const mother = atomById.get(r.motherId);
        const row: any = {
          book,
          daughter_clause_atom: r.daughterId,
          chosen_mother_clause_atom: r.motherId,
          score_at_choice: r.score,
          timestamp: r.timestamp,
        };
        if (includeKorean) {
          row.book_ko = getBookLabel(book);
          row.daughter_ref_ko = formatRef(daughter);
          row.mother_ref_ko = r.motherId === 0 ? "ROOT" : formatRef(mother);
        }
        return row;
      });

      if (format === "jsonl") {
        const content = rows.map(r => JSON.stringify(r)).join("\n");
        downloadFile(`${book}-selections${includeKorean ? "-ko" : ""}.jsonl`, content, "application/jsonl");
        return;
      }

      // CSV
      const headers = ["book", "daughter_clause_atom", "chosen_mother_clause_atom", "score_at_choice", "timestamp"];
      if (includeKorean) headers.push("book_ko", "daughter_ref_ko", "mother_ref_ko");

      const csvContent = [
        headers.join(","),
        ...rows.map(row => headers.map(h => escapeCsv(row[h])).join(","))
      ].join("\n");

      downloadFile(`${book}-selections${includeKorean ? "-ko" : ""}.csv`, csvContent, "text/csv");
      return;
    }

    // API Export
    const res = await fetch(`${API_BASE}/api/book/${encodeURIComponent(book)}/export?format=${format}`);
    const content = await res.text();
    downloadFile(`${book}-selections.${format}`, content, "text/plain");
  };

  // Memoized Helpers
  const atomById = useMemo(() => {
    const map = new Map<number, ClauseAtom>();
    atoms.forEach(a => map.set(a.id, a));
    return map;
  }, [atoms]);

  const candidatesById = useMemo(() => {
    const map = new Map<number, CandidateResult>();
    candidates.forEach(c => map.set(c.candidateId, c));
    return map;
  }, [candidates]);

  // Data for Virtual List
  const itemData = useMemo(() => ({
    atoms,
    selectedId,
    selectedMotherId,
    candidatesById,
    selectionMap,
    jumpTargetId,
    onSelectDaughter: (id: number) => {
      setSelectedId(id);
      const mId = selectionMap.get(id);
      setSelectedMotherId(mId && mId > 0 ? mId : null);
      setJumpTargetId(null);
    },
    onSelectMother: handleSelectMother,
    onHoverStart: (event: React.MouseEvent, candidate: CandidateResult) => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      const { clientX, clientY } = event;
      tooltipTimer.current = window.setTimeout(() => {
        setTooltip({ visible: true, x: clientX, y: clientY, data: candidate });
      }, 100);
    },
    onHoverMove: (event: React.MouseEvent) => {
      if (!tooltip.visible) return;
      setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
    },
    onHoverEnd: () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      setTooltip({ visible: false, x: 0, y: 0, data: null });
    },
    getBookLabel,
  }), [atoms, selectedId, selectedMotherId, candidatesById, selectionMap, jumpTargetId, tooltip.visible]);

  return (
    <Layout
      header={<Header mode={mode} count={atoms.length} />}
      sidebar={
        <Sidebar
          books={books}
          book={book}
          setBook={setBook}
          scope={scope}
          setScope={setScope}
          limit={limit}
          setLimit={setLimit}
          getBookLabel={getBookLabel}
          selectedId={selectedId}
          candidates={candidates}
          selectionMap={selectionMap}
          jumpTargetId={jumpTargetId}
          onSelectMother={handleSelectMother}
          onSelectRoot={handleSelectRoot}
          onJumpCandidate={handleJumpToCandidate}
          history={selectionRecords}
          atomById={atomById}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          exportSelections={exportSelections}
          scrollToAtom={handleJumpToDaughter}
        />
      }
    >
      <ClauseList
        listRef={listRef}
        itemData={itemData}
      />

      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        data={tooltip.data}
      />
    </Layout>
  );
}
