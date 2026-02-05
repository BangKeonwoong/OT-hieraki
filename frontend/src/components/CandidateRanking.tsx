import { useMemo } from "react";
import { CandidateResult, ClauseAtom } from "../scoring";

interface CandidateRankingProps {
  selectedId: number | null;
  candidates: CandidateResult[];
  atomById: Map<number, ClauseAtom>;
  getBookLabel: (book: string) => string;
  jumpTargetId: number | null;
  selectionMap: Map<number, number>;
  onSelectMother: (candidate: CandidateResult, daughterId: number) => void;
  onSelectRoot: (daughterId: number) => void;
  onJump: (candidateId: number) => void;
}

export function CandidateRanking({
  selectedId,
  candidates,
  atomById,
  getBookLabel,
  jumpTargetId,
  selectionMap,
  onSelectMother,
  onSelectRoot,
  onJump,
}: CandidateRankingProps) {
  const rankedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.score - a.score;
    });
  }, [candidates]);

  const isRootSelected = selectedId != null && selectionMap.get(selectedId) === 0;

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-slate-900">후보 랭킹</h3>
        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
          {candidates.length}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        선택된 딸 절의 어미절 후보를 점수 순으로 보여줍니다.
      </p>

      {!selectedId ? (
        <div className="text-center py-6 text-slate-400 text-sm">
          딸 절을 먼저 선택하세요.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              className="btn-ghost text-xs py-1.5 h-auto border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100"
              onClick={() => onSelectRoot(selectedId)}
            >
              ROOT로 선택
            </button>
            {isRootSelected && (
              <span className="text-[11px] text-slate-500">현재 ROOT 선택됨</span>
            )}
          </div>

          {rankedCandidates.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              후보가 없습니다.
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {rankedCandidates.slice(0, 10).map((candidate) => {
                const atom = atomById.get(candidate.candidateId);
                const label = atom
                  ? `${getBookLabel(atom.ref.book)} ${atom.ref.chapter}:${atom.ref.verse}`
                  : `#${candidate.candidateId}`;
                const isActive = jumpTargetId === candidate.candidateId;

                return (
                  <div
                    key={candidate.candidateId}
                    className={`group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "border-accent/60 bg-accent/5 shadow-sm"
                        : "border-slate-100 bg-white hover:border-accent/40"
                    }`}
                    onClick={() => onJump(candidate.candidateId)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent-700 font-display grid place-items-center text-sm">
                        {Math.round(candidate.score * 100)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-700 truncate">
                          {label}
                          {isActive && <span className="ml-1 text-accent-600 font-mono">→</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          순위 {candidate.rank}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-ghost text-[10px] py-1.5 px-3 h-auto border border-slate-200"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectMother(candidate, selectedId);
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
  );
}
