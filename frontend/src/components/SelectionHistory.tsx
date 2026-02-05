import { useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
import { ClauseAtom } from "../scoring";

interface SelectionRecord {
    daughterId: number;
    motherId: number;
    score: number;
    timestamp: string;
}

interface SelectionHistoryProps {
    history: SelectionRecord[];
    atomById: Map<number, ClauseAtom>;
    filter: string;
    onFilterChange: (value: string) => void;
    onExport: (format: "jsonl" | "csv", ko: boolean) => void;
    onJump: (id: number) => void;
    getBookLabel: (book: string) => string;
}

export function SelectionHistory({
    history,
    atomById,
    filter,
    onFilterChange,
    onExport,
    onJump,
    getBookLabel,
}: SelectionHistoryProps) {

    const filteredHistory = useMemo(() => {
        const keyword = filter.trim().toLowerCase();
        if (!keyword) return history;

        return history.filter((record) => {
            const daughter = atomById.get(record.daughterId);
            const mother = atomById.get(record.motherId);

            // Basic search text construction
            const texts = [
                String(record.daughterId),
                String(record.motherId),
                daughter ? `${getBookLabel(daughter.ref.book)} ${daughter.ref.chapter}:${daughter.ref.verse}` : "",
                record.motherId === 0 ? "root 루트 ROOT" : (mother ? `${getBookLabel(mother.ref.book)} ${mother.ref.chapter}:${mother.ref.verse}` : "")
            ];

            return texts.some(t => t.toLowerCase().includes(keyword));
        });
    }, [history, filter, atomById, getBookLabel]);

    return (
        <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-display text-lg">선택 기록</h3>
                <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                    {history.length}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onExport("csv", false)} className="btn-ghost text-xs py-1.5 h-auto border border-slate-200">
                    CSV 다운로드
                </button>
                <button onClick={() => onExport("jsonl", false)} className="btn-ghost text-xs py-1.5 h-auto border border-slate-200">
                    JSONL 다운로드
                </button>
                <button onClick={() => onExport("csv", true)} className="btn-ghost text-xs py-1.5 h-auto border border-slate-200 text-slate-800 bg-slate-50">
                    CSV(한글)
                </button>
                <button onClick={() => onExport("jsonl", true)} className="btn-ghost text-xs py-1.5 h-auto border border-slate-200 text-slate-800 bg-slate-50">
                    JSONL(한글)
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder="책/장:절/ID 검색"
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="input-field pl-9"
                />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        저장된 선택이 없습니다.
                    </div>
                ) : (
                    filteredHistory.slice(0, 20).map((record) => {
                        const daughter = atomById.get(record.daughterId);
                        const mother = atomById.get(record.motherId);

                        return (
                            <div
                                key={record.daughterId}
                                className="group flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-accent/40 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => onJump(record.daughterId)}
                            >
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-accent-600 uppercase tracking-wider">딸</span>
                                        <span className="text-xs font-medium truncate text-slate-700">
                                            {daughter ? `${getBookLabel(daughter.ref.book)} ${daughter.ref.chapter}:${daughter.ref.verse}` : `#${record.daughterId}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">어미</span>
                                        <span className="text-xs text-slate-500 truncate">
                                            {record.motherId === 0 ? "ROOT" : (mother ? `${getBookLabel(mother.ref.book)} ${mother.ref.chapter}:${mother.ref.verse}` : `#${record.motherId}`)}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-accent transition-colors" />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
