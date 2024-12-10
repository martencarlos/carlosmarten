// ProjectPlanner.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { TimelineHeader } from "@components/business/TimelineHeader";
import { TaskItem } from "@components/business/TaskItem";
import { AddTaskForm } from "@components/business/AddTaskForm";
import { ViewModeSelector } from "@components/business/ViewModeSelector";
import { getDateRange, formatCurrency, calculateTaskCost } from "@lib/utils";

const roles = {
  developer: { name: "Developer", rate: 85 },
  designer: { name: "Designer", rate: 75 },
  researcher: { name: "Researcher", rate: 65 },
  manager: { name: "Project Manager", rate: 95 },
};

export const ProjectPlanner = () => {
  const [viewMode, setViewMode] = useState("overview");
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Research",
      start: "2024-12-10",
      duration: 5,
      progress: 60,
      role: "researcher",
      hoursPerDay: 6,
    },
    {
      id: 2,
      name: "Design",
      start: "2024-12-15",
      duration: 7,
      progress: 30,
      role: "designer",
      hoursPerDay: 8,
    },
  ]);

  const [newTask, setNewTask] = useState({
    name: "",
    start: "",
    duration: "",
    role: "",
    hoursPerDay: 8,
  });

  const dateRange = getDateRange(viewMode, tasks);
  const totalDays =
    Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)) + 1;

  const timelineLabels = useMemo(() => {
    const labels = [];
    const currentDate = new Date(dateRange.start);
    let currentMonth = "";
    let currentYear = "";

    while (currentDate <= dateRange.end) {
      const day = currentDate.getDate();
      const month = currentDate.toLocaleDateString("default", {
        month: "short",
      });
      const year = currentDate.getFullYear();
      const isFirstOfMonth = day === 1;

      let monthLabel = "";
      let yearLabel = "";
      if (month !== currentMonth || year !== currentYear) {
        monthLabel = month;
        yearLabel = year.toString();
        currentMonth = month;
        currentYear = year;
      }

      labels.push({
        date: new Date(currentDate),
        day: day.toString(),
        month: monthLabel,
        year: yearLabel,
        isFirstOfMonth,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return labels;
  }, [dateRange]);

  const totalCost = tasks.reduce((sum, task) => {
    const role = roles[task.role];
    return sum + calculateTaskCost(task, role.rate);
  }, 0);

  const addTask = () => {
    if (newTask.name && newTask.start && newTask.duration && newTask.role) {
      setTasks([
        ...tasks,
        {
          ...newTask,
          id: tasks.length + 1,
          progress: 0,
          duration: parseInt(newTask.duration),
        },
      ]);
      setNewTask({
        name: "",
        start: "",
        duration: "",
        role: "",
        hoursPerDay: 8,
      });
    }
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="p-2 md:p-6 max-w-full mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Project Timeline</CardTitle>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Total Cost: {formatCurrency(totalCost)}
                </span>
              </div>
              <ViewModeSelector
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AddTaskForm
            newTask={newTask}
            roles={roles}
            onTaskChange={setNewTask}
            onAddTask={addTask}
          />

          {/* Gantt Chart */}
          <div className="relative border rounded-lg p-4 overflow-x-auto">
            <div className="min-w-[768px]">
              <TimelineHeader
                viewMode={viewMode}
                timelineLabels={timelineLabels}
                dateRange={dateRange}
              />

              {/* Tasks */}
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  role={roles[task.role]}
                  dateRange={dateRange}
                  totalDays={totalDays}
                  onRemove={removeTask}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPlanner;
