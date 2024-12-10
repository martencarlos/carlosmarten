// components/TaskItem.tsx

"use client";
import React from "react";
import { Button } from "@components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency, calculateTaskCost, getTaskPosition } from "@lib/utils";

export const TaskItem = ({ task, role, dateRange, totalDays, onRemove }) => {
  return (
    <div className="flex items-center mb-4">
      <div className="w-2/5 flex items-center gap-2 pr-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(task.id)}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <div className="flex flex-col min-w-0">
          <span className="truncate">{task.name}</span>
          <span className="text-xs text-gray-500 truncate">
            {role.name} - {formatCurrency(calculateTaskCost(task, role.rate))}
          </span>
        </div>
      </div>
      <div className="w-3/5 relative h-6">
        <div
          className="absolute h-full rounded-full bg-blue-600"
          style={getTaskPosition(task, dateRange, totalDays)}
        >
          <div
            className="h-full rounded-full bg-blue-400"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
