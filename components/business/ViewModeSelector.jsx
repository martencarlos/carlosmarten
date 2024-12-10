// components/ViewModeSelector.tsx

"use client";
import React from "react";
import { Button } from "@components/ui/button";

export const ViewModeSelector = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <Button
        variant={viewMode === "overview" ? "default" : "outline"}
        className="rounded-r-none"
        onClick={() => onViewModeChange("overview")}
      >
        Overview
      </Button>
      <Button
        variant={viewMode === "month" ? "default" : "outline"}
        className="rounded-none border-l-0"
        onClick={() => onViewModeChange("month")}
      >
        Month
      </Button>
      <Button
        variant={viewMode === "year" ? "default" : "outline"}
        className="rounded-l-none border-l-0"
        onClick={() => onViewModeChange("year")}
      >
        Year
      </Button>
    </div>
  );
};
