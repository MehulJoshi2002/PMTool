"use client";

import React, { useState, useCallback } from "react";
import {
  FeatureStatus,
  STATUS_CONFIG,
} from "../../lib/features";
import { useAppContext } from "../../lib/AppContext";
import FeatureColumn from "./FeatureColumn";
import { Plus, Search, Filter, LayoutGrid, ArrowDownUp } from "lucide-react";
import { TutorialButton } from "../ui/TutorialButton";

export default function FeaturesBoard() {
  const {
    features,
    releases,
    addFeature,
    updateFeature,
    deleteFeature,
    addRelease,
    deleteRelease,
    moveFeature,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'score_desc'>('default');
  const [showAddRelease, setShowAddRelease] = useState(false);
  const [newReleaseName, setNewReleaseName] = useState('');
  const [newReleaseDate, setNewReleaseDate] = useState('');
  const [draggedFeatureId, setDraggedFeatureId] = useState<string | null>(null);
  const [showAddFeatureForm, setShowAddFeatureForm] = useState(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');

  // Filter & Sort features
  let filteredFeatures = features.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.productId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (sortBy === 'score_desc') {
    filteredFeatures = filteredFeatures.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else {
    filteredFeatures = filteredFeatures.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Get features for a release
  const getFeaturesForRelease = useCallback(
    (releaseId: string) => filteredFeatures.filter((f) => f.releaseId === releaseId),
    [filteredFeatures]
  );

  // Drag and drop between columns
  const handleDragStart = useCallback((featureId: string) => {
    setDraggedFeatureId(featureId);
  }, []);

  const handleDrop = useCallback(
    (releaseId: string) => {
      if (draggedFeatureId) {
        moveFeature(draggedFeatureId, releaseId);
        setDraggedFeatureId(null);
      }
    },
    [draggedFeatureId, moveFeature]
  );

  // Add release column
  const handleAddRelease = useCallback(() => {
    if (!newReleaseName.trim()) return;
    addRelease(newReleaseName.trim(), newReleaseDate);
    setNewReleaseName('');
    setNewReleaseDate('');
    setShowAddRelease(false);
  }, [newReleaseName, newReleaseDate, addRelease]);

  // Add feature from header
  const handleAddFeatureFromHeader = () => {
    if (!newFeatureTitle.trim()) return;
    const targetRelease = releases[0]?.id || '';
    addFeature(targetRelease, newFeatureTitle.trim());
    setNewFeatureTitle('');
    setShowAddFeatureForm(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] px-6 py-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Features board</h1>
            <TutorialButton tutorialKey="board" />

            {/* Add feature button with inline form */}
            {showAddFeatureForm ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeatureTitle}
                  onChange={(e) => setNewFeatureTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddFeatureFromHeader();
                    if (e.key === 'Escape') { setShowAddFeatureForm(false); setNewFeatureTitle(''); }
                  }}
                  placeholder="Feature title..."
                  className="bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 placeholder-gray-600 w-56"
                  autoFocus
                />
                <button
                  onClick={handleAddFeatureFromHeader}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-semibold transition"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddFeatureForm(false); setNewFeatureTitle(''); }}
                  className="px-2 py-1.5 text-xs text-slate-600 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddFeatureForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-semibold transition shadow-sm dark:shadow-lg shadow-blue-600/20"
              >
                <Plus size={14} />
                Add feature
              </button>
            )}

            <button
              onClick={() => setShowAddRelease(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition"
            >
              Add release
            </button>
          </div>
        </div>

        {/* Toolbar row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features..."
              className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-600 dark:text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FeatureStatus | 'all')}
              className="bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-gray-400 text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-gray-900">All statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key} className="bg-gray-900">{val.label}</option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5 ml-2">
            <ArrowDownUp size={14} className="text-slate-600 dark:text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-gray-400 text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="default" className="bg-gray-900">Date Added</option>
              <option value="score_desc" className="bg-gray-900">Highest Score</option>
            </select>
          </div>

          {/* Summary */}
          <div className="ml-auto text-xs text-slate-600 dark:text-gray-500 font-mono">
            {filteredFeatures.length} features · {releases.length} releases
          </div>
        </div>
      </div>

      {/* Add release modal */}
      {showAddRelease && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2132] border border-slate-200 dark:border-white/[0.08] rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Add Release</h3>
            <input
              type="text"
              value={newReleaseName}
              onChange={(e) => setNewReleaseName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddRelease(); }}
              placeholder="Release name"
              className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 mb-3 placeholder-gray-600"
              autoFocus
            />
            <input
              type="text"
              value={newReleaseDate}
              onChange={(e) => setNewReleaseDate(e.target.value)}
              placeholder="Target date (e.g. 31 Jul, 2026)"
              className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 mb-4 placeholder-gray-600"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddRelease(false)} className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition">Cancel</button>
              <button onClick={handleAddRelease} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-semibold rounded-lg transition">Add Release</button>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full p-4 gap-4 min-w-max">
          {releases.map((release) => (
            <FeatureColumn
              key={release.id}
              release={release}
              features={getFeaturesForRelease(release.id)}
              onAddFeature={addFeature}
              onUpdateFeature={updateFeature}
              onDeleteFeature={deleteFeature}
              onDeleteRelease={releases.length > 1 ? deleteRelease : undefined}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              isDragOver={draggedFeatureId !== null}
            />
          ))}

          {/* Add column button */}
          <div className="w-72 shrink-0">
            <button
              onClick={() => setShowAddRelease(true)}
              className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.06] hover:border-white/[0.12] flex items-center justify-center gap-2 text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-slate-500 dark:text-gray-400 text-xs font-medium transition"
            >
              <Plus size={14} />
              Add column
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
