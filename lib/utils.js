import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getDateRange = (viewMode, tasks) => {
  const now = new Date();

  switch (viewMode) {
    case "month":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: startOfMonth, end: endOfMonth };

    case "year":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return { start: startOfYear, end: endOfYear };

    default: // overview
      const startDates = tasks.map((task) => new Date(task.start));
      const endDates = tasks.map((task) => {
        const end = new Date(task.start);
        end.setDate(end.getDate() + parseInt(task.duration.toString()));
        return end;
      });

      if (startDates.length === 0) {
        const today = new Date();
        return {
          start: today,
          end: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        };
      }

      const minDate = new Date(
        Math.min(...startDates.map((date) => date.getTime()))
      );
      const maxDate = new Date(
        Math.max(...endDates.map((date) => date.getTime()))
      );
      minDate.setDate(minDate.getDate() - 2);
      maxDate.setDate(maxDate.getDate() + 2);
      return { start: minDate, end: maxDate };
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

export const calculateTaskCost = (task, roleRate) => {
  return roleRate * task.hoursPerDay * task.duration;
};

export const getTaskPosition = (task, dateRange, totalDays) => {
  const start = new Date(task.start);
  const end = new Date(start);
  end.setDate(end.getDate() + parseInt(task.duration.toString()));

  const left = Math.max(
    0,
    ((start.getTime() - dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24) /
      totalDays) *
      100
  );
  const right = Math.min(
    100,
    ((end.getTime() - dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24) /
      totalDays) *
      100
  );
  const width = right - left;

  return { left: `${left}%`, width: `${width}%` };
};
