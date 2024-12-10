// components/TimelineHeader.tsx
"use client";
import React from "react";

export const TimelineHeader = ({ viewMode, timelineLabels, dateRange }) => {
  if (viewMode === "year") {
    return (
      <div className="flex border-b mb-4">
        <div className="w-2/5">Task</div>
        <div className="w-3/5 flex">
          {Array.from({ length: 12 }).map((_, i) => {
            const date = new Date(dateRange.start.getFullYear(), i, 1);
            return (
              <div
                key={i}
                className="flex-1 text-center border-l border-gray-200"
              >
                <div className="text-xs font-semibold" suppressHydrationWarning>
                  {date.toLocaleDateString("default", { month: "short" })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Group timeline labels by month and year
  const groupedLabels = timelineLabels.reduce((acc, item) => {
    const monthYear = `${item.month}-${item.year}`;
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: item.month,
        year: item.year,
        days: [],
      };
    }
    acc[monthYear].days.push(item);
    return acc;
  }, {});

  return (
    <div className="flex border-b mb-4">
      <div className="w-2/5">Task</div>
      <div className="w-3/5">
        {/* Month and Year Headers */}
        <div className="flex">
          {Object.values(groupedLabels).map((group, index) => (
            <div
              key={`${group.month}-${group.year}`}
              className="border-l border-gray-200"
              style={{
                width: `${(group.days.length / timelineLabels.length) * 100}%`,
              }}
            >
              {group.month && (
                <div className="text-xs text-gray-500 text-center border-b border-gray-100" suppressHydrationWarning>
                  {group.month}
                </div>
              )}
              {group.year && (
                <div className="text-xs text-gray-400 text-center border-b border-gray-100">
                  {group.year}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="flex">
          {timelineLabels.map((item, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="text-xs font-semibold">{item.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
