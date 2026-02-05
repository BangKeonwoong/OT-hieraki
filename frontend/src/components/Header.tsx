import { BookOpen, Database } from "lucide-react";

interface HeaderProps {
    mode: string;
    count: number;
}

export function Header({ mode, count }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg text-white shadow-lg">
                        <BookOpen size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 leading-none">
                            어미절 선택 콘솔
                        </h1>
                        <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                            OT 하이라키
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                        <Database size={14} className="text-slate-500" />
                        <span className="text-xs font-medium text-slate-600">
                            모드: <span className="text-slate-900 font-bold uppercase">{mode}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20">
                        <span className="text-xs font-medium text-accent-700">
                            절 수: <span className="font-bold">{count.toLocaleString()}</span>
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
