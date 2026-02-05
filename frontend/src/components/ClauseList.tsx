import React, { useRef, useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { ClauseRow } from "./ClauseRow";

interface ClauseListProps {
    listRef: React.RefObject<List>;
    itemData: any; // Typed in ClauseRow
    className?: string;
}

export function ClauseList({ listRef, itemData, className }: ClauseListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={`w-full h-[calc(100vh-200px)] lg:h-[calc(100vh-140px)] min-h-[500px] bg-white rounded-2xl shadow-glass border border-white/50 overflow-hidden ${className}`}>
            {size.height > 0 && (
                <List
                    ref={listRef}
                    height={size.height}
                    width={size.width}
                    itemCount={itemData.atoms.length}
                    itemSize={140} // Adjusted for new row height
                    itemData={itemData}
                    className="scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                >
                    {ClauseRow}
                </List>
            )}
        </div>
    );
}
