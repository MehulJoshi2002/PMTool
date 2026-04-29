"use client";

import React, { useState } from "react";
import { BoardFeature, Release, STATUS_CONFIG, FeatureStatus } from "../../lib/features";
import BoardFeatureCard from "./BoardFeatureCard";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";

interface FeatureColumnProps {
  release: Release;
  features: BoardFeature[];
  onAddFeature: (releaseId: string, title: string) => void;
  onUpdateFeature: (id: string, updates: Partial<BoardFeature>) => void;
  onDeleteFeature: (id: string) => void;
  onDeleteRelease?: (releaseId: string) => void;
  onDragStart: (featureId: string) => void;
  onDrop: (releaseId: string) => void;
  isDragOver: boolean;
}

export default function FeatureColumn({
  release,
  features,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onDeleteRelease,
  onDragStart,
  onDrop,
  isDragOver,
}: FeatureColumnProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddFeature(release.id, newTitle.trim());
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') {
      setShowAddForm(false);
      setNewTitle('');
    }
  };

  return (
    <div
      className={`w-72 shrink-0 flex flex-col rounded-xl transition-all duration-200 ${
        isOver && isDragOver ? 'bg-blue-500/[0.03] ring-1 ring-blue-500/20' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(release.id);
      }}
    >
      {/* Column Header */}
      <div className="px-3 py-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: release.color }} />
            <h3 className="text-sm font-bold text-white truncate">{release.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5 ml-4">
            {release.date && (
              <span className="text-[10px] text-gray-500">{release.date}</span>
            )}
            <span className="text-[10px] text-gray-600">
              Showing {features.length} of {features.length}
            </span>
          </div>
        </div>

        {/* Column menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md text-gray-600 hover:text-gray-300 hover:bg-white/[0.05] transition"
          >
            <MoreHorizontal size={14} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-50 bg-[#1e2132] border border-white/[0.1] rounded-lg shadow-xl py-1 w-40">
                {onDeleteRelease && (
                  <button
                    onClick={() => {
                      onDeleteRelease(release.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={12} />
                    Delete release
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 scrollbar-thin">
        {features.map((feature) => (
          <BoardFeatureCard
            key={feature.id}
            feature={feature}
            onUpdate={onUpdateFeature}
            onDelete={onDeleteFeature}
            onDragStart={onDragStart}
          />
        ))}

        {/* Add feature form / button */}
        {showAddForm ? (
          <div className="bg-[#1e2132] border border-white/[0.1] rounded-lg p-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Feature title..."
              className="w-full bg-transparent border-none text-sm text-white placeholder-gray-600 focus:outline-none mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewTitle(''); }}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-white/[0.06] hover:border-white/[0.12] text-gray-600 hover:text-gray-400 text-xs transition"
          >
            <Plus size={12} />
            Add feature
          </button>
        )}
      </div>
    </div>
  );
}
