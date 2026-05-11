"use client";

import React, { useState } from "react";
import { useAppContext } from "../../lib/AppContext";
import { Calendar, ChevronLeft, ChevronRight, Filter, Pencil, X, Clock } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLOR_SWATCHES = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

export default function TimelinePage() {
  const { releases, features, isPresentMode, updateRelease } = useAppContext();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Editing state for customizing timeline of a release
  const [editingReleaseId, setEditingReleaseId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleStartEdit = (release: any) => {
    setEditingReleaseId(release.id);
    setEditName(release.name);
    setEditStart(release.startDate || "");
    setEditEnd(release.endDate || "");
    setEditColor(release.color || "#3B82F6");
  };

  const handleSaveEdit = async () => {
    if (!editingReleaseId) return;
    updateRelease(editingReleaseId, {
      name: editName,
      startDate: editStart,
      endDate: editEnd,
      color: editColor
    });
    setEditingReleaseId(null);
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#0f0f1a] text-slate-900 dark:text-white flex flex-col ${isPresentMode ? 'p-12' : 'p-8'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            {!isPresentMode && (
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Calendar size={20} className="text-indigo-400" />
              </div>
            )}
            <div>
              <h1 className={`${isPresentMode ? 'text-4xl' : 'text-2xl'} font-bold tracking-tight`}>Roadmap Timeline</h1>
              <p className="text-sm text-slate-600 dark:text-gray-500 font-medium mt-1">High-level release schedule and strategic delivery view.</p>
            </div>
          </div>
        </div>

        {!isPresentMode && (
          <div className="flex items-center gap-3">
            <button className="p-2 border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition hover:bg-slate-200 dark:bg-white/[0.05]">
              <Filter size={16} />
            </button>
            <div className="flex items-center bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] rounded-lg p-1 text-sm">
              <button 
                onClick={() => setCurrentYear(y => y - 1)}
                className="p-1 px-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold px-4">{currentYear}</span>
              <button 
                onClick={() => setCurrentYear(y => y + 1)}
                className="p-1 px-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
        {/* Timeline Header (Months) */}
        <div className="flex items-end h-14 border-b border-slate-200 dark:border-white/[0.08] bg-white/[0.01]">
          <div className="w-64 shrink-0 px-6 py-3 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider border-r border-slate-200 dark:border-white/[0.08]">
            Releases
          </div>
          <div className="flex-1 flex px-4">
            {MONTHS.map(m => (
              <div key={m} className="flex-1 text-center pb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-gray-500">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar">
          {releases.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 dark:text-gray-500 flex-col gap-3">
              <Calendar size={32} className="opacity-50" />
              <p>No releases scheduled</p>
            </div>
          ) : (
            <div className="relative pb-10">
              {/* Vertical month dividers */}
              <div className="absolute inset-0 left-64 flex px-4 pointer-events-none">
                {MONTHS.map(m => (
                  <div key={m} className="flex-1 border-r border-dashed border-slate-200/30 dark:border-white/[0.03] h-full" />
                ))}
              </div>

              {releases.map((release, i) => {
                const releaseFeatures = features.filter(f => f.releaseId === release.id);
                
                // Parse exact calendar dates
                let staggerStart = Math.min((i * 10), 75);
                let mockWidth = Math.max(15, 30 - (i * 2));
                let displayLabel = release.date || `Q${Math.floor(i/3) + 1} Target`;
                let hasCustomTimeline = false;

                if (release.startDate && release.endDate && release.startDate.includes('-') && release.endDate.includes('-')) {
                  const startD = new Date(release.startDate);
                  const endD = new Date(release.endDate);
                  if (!isNaN(startD.getTime()) && !isNaN(endD.getTime())) {
                    // Day of year calculator
                    const getDayOfYear = (d: Date) => {
                      const start = new Date(d.getFullYear(), 0, 0);
                      const diff = d.getTime() - start.getTime();
                      const oneDay = 1000 * 60 * 60 * 24;
                      return Math.floor(diff / oneDay);
                    };

                    const startDay = getDayOfYear(startD);
                    const endDay = getDayOfYear(endD);
                    
                    staggerStart = (startDay / 365) * 100;
                    mockWidth = Math.max(3, ((endDay - startDay + 1) / 365) * 100);
                    
                    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
                    displayLabel = `${startD.toLocaleDateString('en-US', formatOpts)} - ${endD.toLocaleDateString('en-US', formatOpts)}`;
                    hasCustomTimeline = true;
                  }
                }
                
                return (
                  <div key={release.id} className="group relative flex border-b border-slate-100 dark:border-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.01] transition min-h-20">
                    <div className="w-64 shrink-0 py-5 px-6 border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-center relative">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: release.color }} />
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{release.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-gray-500 font-medium pl-4">{releaseFeatures.length} features planned</span>
                      
                      {/* Edit Trigger */}
                      {!isPresentMode && (
                        <button
                          onClick={() => handleStartEdit(release)}
                          className="absolute right-4 p-1.5 rounded bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition"
                          title="Schedule Release"
                        >
                          <Pencil size={11} />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 px-4 py-5 flex items-center relative z-10">
                      {/* Timeline Bar */}
                      <div 
                        onClick={() => !isPresentMode && handleStartEdit(release)}
                        className="absolute h-10 rounded-xl shadow-lg border border-white/10 flex items-center transition-all duration-300 hover:brightness-110 cursor-pointer overflow-hidden backdrop-blur-md"
                        style={{ 
                          left: `calc(${staggerStart}% + 1rem)`, 
                          width: `calc(${mockWidth}% - 2rem)`,
                          background: `linear-gradient(90deg, ${release.color}dd, ${release.color}ff)`
                        }}
                      >
                        <div className="px-3 flex flex-col justify-center min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white drop-shadow-md truncate">
                            {release.name}
                          </span>
                          <span className="text-[10px] text-slate-800/80 dark:text-white/70 font-semibold drop-shadow-sm truncate flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {displayLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sleek Custom Frosted Modal for Scheduling / Editing */}
      {editingReleaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#1a1c29] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-6 w-[400px] transform transition-all">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-white/[0.05] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule & Style Release</h3>
              <button 
                onClick={() => setEditingReleaseId(null)}
                className="p-1 rounded-md text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Release Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Release Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Start & End Dates Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Swatch Color</label>
                <div className="flex gap-2.5">
                  {COLOR_SWATCHES.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${editColor === c ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 border-t border-slate-100 dark:border-white/[0.05] pt-4">
              <button 
                onClick={() => setEditingReleaseId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-bold rounded-lg transition"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
