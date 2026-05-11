"use client";

import React from "react";
import {
  DiagramNode,
  Connection,
  ShapeType,
  NODE_COLORS,
} from "../../lib/diagram";
import { X, Trash2 } from "lucide-react";

interface PropertiesPanelProps {
  node: DiagramNode | null;
  connections: Connection[];
  nodes: DiagramNode[];
  onUpdateNode: (id: string, updates: Partial<DiagramNode>) => void;
  onDeleteNode: (id: string) => void;
  onClose: () => void;
}

const SHAPE_OPTIONS: { value: ShapeType; label: string }[] = [
  { value: "process", label: "Process" },
  { value: "decision", label: "Decision" },
  { value: "terminal", label: "Start / End" },
  { value: "data", label: "Data" },
  { value: "note", label: "Note" },
];

export default function PropertiesPanel({
  node,
  connections,
  nodes,
  onUpdateNode,
  onDeleteNode,
  onClose,
}: PropertiesPanelProps) {
  if (!node) return null;

  const nodeConnections = connections.filter(
    (c) => c.fromNodeId === node.id || c.toNodeId === node.id
  );

  return (
    <aside className="w-72 bg-white dark:bg-[#1a1a2e] border-l border-slate-200 dark:border-white/5 flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
          Properties
        </h3>
        <button
          onClick={onClose}
          className="text-slate-600 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300 transition"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Label
          </label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => onUpdateNode(node.id, { label: e.target.value })}
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
            placeholder="Node label..."
          />
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Font Size
          </label>
          <input
            type="number"
            value={node.fontSize || 13}
            onChange={(e) => onUpdateNode(node.id, { fontSize: Number(e.target.value) })}
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
            min="8"
            max="72"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            value={node.description}
            onChange={(e) =>
              onUpdateNode(node.id, { description: e.target.value })
            }
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition resize-none"
            rows={3}
            placeholder="Add notes..."
          />
        </div>

        {/* Shape Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Shape Type
          </label>
          <select
            value={node.type}
            onChange={(e) =>
              onUpdateNode(node.id, { type: e.target.value as ShapeType })
            }
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            {SHAPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {NODE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onUpdateNode(node.id, { color })}
                className="w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor:
                    node.color === color ? "#fff" : "transparent",
                  boxShadow:
                    node.color === color
                      ? `0 0 0 2px ${color}66`
                      : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Position
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="text-[10px] text-slate-600 dark:text-gray-500 font-mono">X</span>
              <input
                type="number"
                value={node.x}
                onChange={(e) =>
                  onUpdateNode(node.id, { x: Number(e.target.value) })
                }
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-2 py-1.5 rounded-md font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-slate-600 dark:text-gray-500 font-mono">Y</span>
              <input
                type="number"
                value={node.y}
                onChange={(e) =>
                  onUpdateNode(node.id, { y: Number(e.target.value) })
                }
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-2 py-1.5 rounded-md font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Connections info */}
        {nodeConnections.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Connections ({nodeConnections.length})
            </label>
            <div className="space-y-1.5">
              {nodeConnections.map((conn) => {
                const otherNodeId =
                  conn.fromNodeId === node.id
                    ? conn.toNodeId
                    : conn.fromNodeId;
                const otherNode = nodes.find((n) => n.id === otherNodeId);
                const direction =
                  conn.fromNodeId === node.id ? "→" : "←";
                return (
                  <div
                    key={conn.id}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 bg-white/5 px-2 py-1.5 rounded-md"
                  >
                    <span className="text-blue-400 font-mono">{direction}</span>
                    <span className="truncate">
                      {otherNode?.label || "Unknown"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete button */}
      <div className="p-5 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={() => onDeleteNode(node.id)}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-4 py-2.5 rounded-lg transition font-medium text-sm"
        >
          <Trash2 size={16} />
          Delete Node
        </button>
      </div>
    </aside>
  );
}
