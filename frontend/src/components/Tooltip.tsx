import { CandidateResult } from "../scoring";

interface TooltipProps {
    visible: boolean;
    x: number;
    y: number;
    data: CandidateResult | null;
}

export function Tooltip({ visible, x, y, data }: TooltipProps) {
    if (!visible || !data) return null;

    return (
        <div
            className="fixed z-50 min-w-[280px] bg-slate-900/95 text-slate-50 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 pointer-events-none transition-opacity duration-200"
            style={{ top: y + 16, left: x + 16 }}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="font-display text-2xl font-bold text-accent-400">{data.score.toFixed(3)}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">순위 {data.rank}</span>
            </div>

            <div className="space-y-2 text-xs">
                {data.evidence.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-white/10 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                            <span className="text-slate-400 font-medium capitalize">{item.feature.replace(/_/g, " ")}</span>
                            <span className="text-[9px] text-slate-500">{item.note}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-mono text-accent-100 block">{String(item.value)}</span>
                            <span className="font-mono text-[9px] text-accent-400/70">{item.contrib.toFixed(3)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
