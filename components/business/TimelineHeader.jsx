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
                <div className="text-xs font-semibold">
                  {date.toLocaleDateString("default", { month: "short" })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex border-b mb-4">
      <div className="w-2/5">Task</div>
      <div className="w-3/5 flex">
        {timelineLabels.map((item, i) => (
          <div
            key={i}
            className={`flex-1 text-center ${
              item.isFirstOfMonth ? "border-l border-gray-200" : ""
            }`}
          >
            {(item.month || item.year) && (
              <div className="border-b border-gray-100 mb-1">
                {item.month && (
                  <div className="text-xs text-gray-500">{item.month}</div>
                )}
                {item.year && (
                  <div className="text-xs text-gray-400">{item.year}</div>
                )}
              </div>
            )}
            <div className="text-xs font-semibold">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
