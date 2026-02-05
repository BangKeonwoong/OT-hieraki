import React, { CSSProperties } from "react";
import { ClauseAtom, CandidateResult } from "../scoring";

interface ClauseRowProps {
    index: number;
    style: CSSProperties;
    data: {
        atoms: ClauseAtom[];
        selectedId: number | null;
        selectedMotherId: number | null;
        candidatesById: Map<number, CandidateResult>;
        selectionMap: Map<number, number>;
        jumpTargetId: number | null;
        onSelectDaughter: (id: number) => void;
        onSelectMother: (candidate: CandidateResult, daughterId: number) => void;
        onHoverStart: (event: React.MouseEvent, candidate: CandidateResult) => void;
        onHoverMove: (event: React.MouseEvent) => void;
        onHoverEnd: () => void;
        getBookLabel: (book: string) => string;
    };
}

export function ClauseRow({ index, style, data }: ClauseRowProps) {
    const atom = data.atoms[index];
    if (!atom) return <div style={style} />;

    const isDaughter = atom.id === data.selectedId;
    const candidate = data.candidatesById.get(atom.id);
    const isCandidate = !!candidate;
    const isChosen = atom.id === data.selectedMotherId;
    const isCompleted = data.selectionMap.has(atom.id);
    const isJumpTarget = atom.id === data.jumpTargetId;
    const isRootSelected = data.selectionMap.get(atom.id) === 0;

    // Dynamic classes based on state
    let rowClass = "group relative transition-all duration-200 border-b border-slate-100 hover:bg-slate-50/80";
    let barClass = "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300";
    let contentClass = "flex flex-col md:flex-row gap-4 px-4 py-3";

    // State-specific styling
    if (isDaughter) {
        rowClass += " bg-accent/5 border-accent/20 z-10 shadow-sm";
        barClass += " bg-accent w-1.5";
    } else if (isChosen) {
        rowClass += " bg-slate-900/5 border-slate-900/10";
        barClass += " bg-slate-900 w-1.5";
    } else if (candidate) {
        const opacity = 0.05 + (candidate.score * 0.15); // max 0.2
        style = { ...style, background: `rgba(20, 184, 166, ${opacity})` };
        barClass += " bg-teal-400/50 w-1";
    } else if (isCompleted) {
        rowClass += " bg-emerald-50/50 border-emerald-100";
        barClass += " bg-emerald-400/40 w-1";
    } else {
        barClass += " bg-transparent group-hover:bg-slate-200";
    }

    if (isJumpTarget) {
        rowClass += " ring-2 ring-accent ring-inset";
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (isCandidate && candidate) {
            data.onHoverStart(e, candidate);
        }
    };

    return (
        <div
            style={style}
            className={rowClass}
            onClick={() => data.onSelectDaughter(atom.id)}
            onMouseEnter={handleMouseEnter}
            onMouseMove={data.onHoverMove}
            onMouseLeave={data.onHoverEnd}
        >
            <div className={barClass} />

            <div className={contentClass}>
                {/* Main Text Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Metadata Header */}
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-tight text-slate-400">
                        <span className="font-bold text-slate-500">
                            {data.getBookLabel(atom.ref.book)} {atom.ref.chapter}:{atom.ref.verse}
                        </span>
                        <span>#{atom.id}</span>
                        {atom.typ && (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                {atom.typ}
                            </span>
                        )}
                        {isCompleted && (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                                ✓ 완료
                            </span>
                        )}
                        {isDaughter && isRootSelected && (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                                ROOT
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Korean Text */}
                        <div className="text-sm text-slate-600 leading-relaxed font-sans mt-1 md:mt-0">
                            <span className="block text-slate-800 font-medium">
                                {atom.koreanLiteral && atom.koreanLiteral.trim()
                                    ? atom.koreanLiteral
                                    : "직역 정보 없음"}
                            </span>
                            {atom.txt && (
                                <span className="opacity-50 text-xs text-slate-400 block mt-1">
                                    txt: {atom.txt}
                                </span>
                            )}
                        </div>

                        {/* Hebrew Text */}
                        <div
                            className={`font-serif text-lg md:text-xl leading-relaxed text-right ${isDaughter ? "text-accent-900 font-medium" : "text-slate-700"}`}
                            dir="rtl"
                            lang="he"
                        >
                            {atom.hebrew}
                        </div>
                    </div>
                </div>

                {/* Action / Score Side */}
                <div className="w-full md:w-24 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pl-4 md:border-l border-slate-100/50">

                    {/* Candidate Score Display */}
                    {isCandidate && candidate && (
                        <div className="text-right">
                            <div className="font-display text-2xl text-accent-600 leading-none">
                                {candidate.score.toFixed(2)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                순위 {candidate.rank}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    {isCandidate && candidate && (
                        <button
                            className="md:w-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full hover:bg-black transition-colors shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onSelectMother(candidate, data.selectedId!);
                            }}
                        >
                            선택
                        </button>
                    )}

                    {isDaughter && (
                        <div className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded-full">
                            선택됨
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
