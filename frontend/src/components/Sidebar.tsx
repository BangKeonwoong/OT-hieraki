import { Book, Target, Sliders, Info } from "lucide-react";
import { SelectionHistory } from "./SelectionHistory";
import { CandidateRanking } from "./CandidateRanking";
import { ClauseAtom, CandidateResult } from "../scoring";

interface SidebarProps {
    books: string[];
    book: string;
    setBook: (b: string) => void;
    scope: string;
    setScope: (s: string) => void;
    limit: number;
    setLimit: (l: number) => void;
    getBookLabel: (b: string) => string;

    // Candidate ranking
    selectedId: number | null;
    candidates: CandidateResult[];
    selectionMap: Map<number, number>;
    jumpTargetId: number | null;
    onSelectMother: (candidate: CandidateResult, daughterId: number) => void;
    onSelectRoot: (daughterId: number) => void;
    onJumpCandidate: (candidateId: number) => void;

    // History props
    history: any[]; // Typed in SelectionHistory
    atomById: Map<number, ClauseAtom>;
    historyFilter: string;
    setHistoryFilter: (s: string) => void;
    exportSelections: (f: "jsonl" | "csv", k: boolean) => void;
    scrollToAtom: (id: number) => void;
}

export function Sidebar({
    books,
    book,
    setBook,
    scope,
    setScope,
    limit,
    setLimit,
    getBookLabel,
    selectedId,
    candidates,
    selectionMap,
    jumpTargetId,
    onSelectMother,
    onSelectRoot,
    onJumpCandidate,
    history,
    atomById,
    historyFilter,
    setHistoryFilter,
    exportSelections,
    scrollToAtom
}: SidebarProps) {
    return (
        <div className="space-y-6">
            <div className="glass-panel p-5 space-y-6">
                <div>
                    <h2 className="font-display text-lg text-slate-800 mb-1">설정</h2>
                    <p className="text-xs text-slate-500">검색 범위를 조정하세요.</p>
                </div>

                {/* Book Selector */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <Book size={12} />
                        책
                    </label>
                    <div className="relative">
                        <select
                            value={book}
                            onChange={(e) => setBook(e.target.value)}
                            className="input-field appearance-none cursor-pointer"
                        >
                            {books.map((b) => (
                                <option key={b} value={b}>
                                    {getBookLabel(b)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            ▼
                        </div>
                    </div>
                </div>

                {/* Candidate Scope */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <Target size={12} />
                        후보 범위
                    </label>
                    <div className="relative">
                        <select
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="input-field appearance-none cursor-pointer"
                        >
                            <option value="sentence">같은 문장</option>
                            <option value="range">범위만</option>
                            <option value="all">이전 전체</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            ▼
                        </div>
                    </div>
                </div>

                {/* Search Range */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Sliders size={12} />
                            검색 범위
                        </label>
                        <span className="text-xs font-mono font-bold text-accent-600 bg-accent/10 px-2 py-0.5 rounded">
                            {limit} 절
                        </span>
                    </div>
                    <input
                        type="range"
                        min={20}
                        max={600}
                        step={10}
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>

                <div className="border-t border-slate-100 my-4" />

                {/* Legend */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900">범례</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-accent/20 border border-accent ring-1 ring-accent/50"></div>
                            <span className="text-xs text-slate-600">딸 절</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-teal-500/20 border border-teal-500"></div>
                            <span className="text-xs text-slate-600">후보 어미절</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-slate-900 border border-slate-700"></div>
                            <span className="text-xs text-slate-600">선택된 어미절</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400"></div>
                            <span className="text-xs text-slate-600">선택 완료</span>
                        </div>
                    </div>
                </div>

                {/* Hint */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3 text-xs text-slate-600 leading-relaxed">
                    <Info className="flex-shrink-0 text-slate-400" size={16} />
                    <p>행을 클릭해 딸 절을 선택하세요. 후보에 마우스를 올리면 근거를 볼 수 있고, 선택 버튼으로 어미절을 저장합니다.</p>
                </div>
            </div>

            <CandidateRanking
                selectedId={selectedId}
                candidates={candidates}
                atomById={atomById}
                getBookLabel={getBookLabel}
                jumpTargetId={jumpTargetId}
                selectionMap={selectionMap}
                onSelectMother={onSelectMother}
                onSelectRoot={onSelectRoot}
                onJump={onJumpCandidate}
            />

            <SelectionHistory
                history={history}
                atomById={atomById}
                filter={historyFilter}
                onFilterChange={setHistoryFilter}
                onExport={exportSelections}
                onJump={scrollToAtom}
                getBookLabel={getBookLabel}
            />
        </div>
    );
}
