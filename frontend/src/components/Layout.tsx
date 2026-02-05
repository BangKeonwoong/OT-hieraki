import { ReactNode } from "react";

interface LayoutProps {
    header: ReactNode;
    sidebar: ReactNode;
    children: ReactNode;
}

export function Layout({ header, sidebar, children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {header}

            <main className="flex-1 container mx-auto px-4 py-6 md:py-8 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
                    <aside className="lg:sticky lg:top-24 space-y-6">
                        {sidebar}
                    </aside>

                    <section className="min-w-0">
                        {children}
                    </section>
                </div>
            </main>
        </div>
    );
}
