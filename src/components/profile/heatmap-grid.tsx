"use client";

import { cn } from "@/lib/utils";

interface HeatmapGridProps {
  activityByDate?: Record<string, number>;
}

export function HeatmapGrid({ activityByDate = {} }: HeatmapGridProps) {
  // Generate last 12 weeks of dates
  const weeks = 12;
  const days = weeks * 7;
  const today = new Date();
  const cells: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    
    // Use actual data from database
    const count = activityByDate[dateStr] || 0;
    cells.push({
      date: dateStr,
      count,
    });
  }

  // Get intensity class based on count
  const getIntensity = (count: number) => {
    if (count === 0) return "bg-surface-dark";
    if (count <= 1) return "bg-primary/20";
    if (count <= 3) return "bg-primary/50";
    if (count <= 5) return "bg-primary/75";
    return "bg-primary";
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-grid grid-flow-col gap-1" style={{ gridTemplateRows: "repeat(7, 1fr)" }}>
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={cn(
              "w-3 h-3 rounded-sm border border-border-dark transition-all hover:ring-1 hover:ring-primary",
              getIntensity(cell.count)
            )}
            title={`${cell.date}: ${cell.count}개 활동`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end space-x-2 text-xs text-text-secondary">
        <span>적음</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-surface-dark border border-border-dark" />
          <div className="w-3 h-3 rounded-sm bg-primary/20 border border-border-dark" />
          <div className="w-3 h-3 rounded-sm bg-primary/50 border border-border-dark" />
          <div className="w-3 h-3 rounded-sm bg-primary/75 border border-border-dark" />
          <div className="w-3 h-3 rounded-sm bg-primary border border-border-dark" />
        </div>
        <span>많음</span>
      </div>
    </div>
  );
}
