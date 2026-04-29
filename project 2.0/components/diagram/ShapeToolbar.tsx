"use client";

import React from "react";
import { ShapeType } from "../../lib/diagram";
import {
  RectangleHorizontal,
  Diamond,
  Circle,
  Hexagon,
  StickyNote,
  Trash2,
  RotateCcw,
  Download,
  MousePointer2,
  Spline,
} from "lucide-react";

interface ShapeToolbarProps {
  activeTool: "select" | "connect" | null;
  onSetTool: (tool: "select" | "connect" | null) => void;
  onClearAll: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
}

const SHAPE_OPTIONS: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  {
    type: "process",
    label: "Process",
    icon: <RectangleHorizontal size={22} />,
  },
  {
    type: "decision",
    label: "Decision",
    icon: <Diamond size={22} />,
  },
  {
    type: "terminal",
    label: "Start / End",
    icon: <Circle size={22} />,
  },
  {
    type: "data",
    label: "Data",
    icon: <Hexagon size={22} />,
  },
  {
    type: "note",
    label: "Note",
    icon: <StickyNote size={22} />,
  },
];

export default function ShapeToolbar({
  activeTool,
  onSetTool,
  onClearAll,
  onDeleteSelected,
  hasSelection,
}: ShapeToolbarProps) {
  const handleDragStart = (e: React.DragEvent, type: ShapeType) => {
    e.dataTransfer.setData("application/shape-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="w-[72px] bg-[#1a1a2e] flex flex-col items-center py-4 gap-1 border-r border-white/5 select-none shrink-0">
      {/* Tool Modes */}
      <button
        onClick={() => onSetTool(activeTool === "select" ? null : "select")}
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
          activeTool === "select"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
        title="Select & Move"
      >
        <MousePointer2 size={20} />
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Select
        </span>
      </button>

      <button
        onClick={() => onSetTool(activeTool === "connect" ? null : "connect")}
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
          activeTool === "connect"
            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
            : "text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
        title="Connect Shapes"
      >
        <Spline size={20} />
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Connect
        </span>
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-white/10 my-2" />

      {/* Shape Palette */}
      {SHAPE_OPTIONS.map((shape) => (
        <div
          key={shape.type}
          draggable
          onDragStart={(e) => handleDragStart(e, shape.type)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white cursor-grab active:cursor-grabbing transition-all duration-200 group relative"
          title={`Drag to add: ${shape.label}`}
        >
          {shape.icon}
          <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {shape.label}
          </span>
        </div>
      ))}

      {/* Divider */}
      <div className="w-8 h-px bg-white/10 my-2" />

      {/* Actions */}
      <button
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
          hasSelection
            ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
            : "text-gray-600 cursor-not-allowed"
        }`}
        title="Delete Selected"
      >
        <Trash2 size={20} />
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Delete
        </span>
      </button>

      <button
        onClick={onClearAll}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 group relative"
        title="Clear All"
      >
        <RotateCcw size={20} />
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Clear All
        </span>
      </button>
    </aside>
  );
}
