// components/AddTaskForm.tsx
"use client";
import React from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Plus } from "lucide-react";
import { formatCurrency } from "@lib/utils";

export const AddTaskForm = ({ newTask, roles, onTaskChange, onAddTask }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Input
        placeholder="Task name"
        value={newTask.name}
        onChange={(e) => onTaskChange({ ...newTask, name: e.target.value })}
        className="flex-1 h-10"
      />
      <Input
        type="date"
        value={newTask.start}
        onChange={(e) => onTaskChange({ ...newTask, start: e.target.value })}
        className="w-full md:w-40 h-10"
      />
      <Input
        type="number"
        placeholder="Duration (days)"
        value={newTask.duration}
        onChange={(e) => onTaskChange({ ...newTask, duration: e.target.value })}
        className="w-full md:w-32 h-10"
      />
      <Select
        value={newTask.role}
        onValueChange={(value) => onTaskChange({ ...newTask, role: value })}
      >
        <SelectTrigger className="w-full md:w-40 h-10">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roles).map(([key, role]) => (
            <SelectItem key={key} value={key}>
              {role.name} ({formatCurrency(role.rate)}/hr)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        placeholder="Hours/day"
        value={newTask.hoursPerDay}
        onChange={(e) =>
          onTaskChange({ ...newTask, hoursPerDay: parseInt(e.target.value) })
        }
        className="w-full md:w-32 h-10"
      />
      <Button onClick={onAddTask} className="flex items-center gap-2 h-10">
        <Plus className="w-4 h-4" />
        Add Task
      </Button>
    </div>
  );
};
