"use client";

import React, { useState } from "react";
import { useAppContext } from "../../lib/AppContext";
import { Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TimelinePage() {
  const { releases, features, isPresentMode } = useAppContext();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  return (
    <div className={`min-h-screen bg-[#0f0f1a] text-white flex flex-col ${isPresentMode ? 'p-12' : 'p-8'}`}>
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
              <p className="text-sm text-gray-500 font-medium mt-1">High-level release schedule and strategic delivery view.</p>
            </div>
          </div>
        </div>

        {!isPresentMode && (
          <div className="flex items-center gap-3">
            <button className="p-2 border border-white/[0.08] text-gray-400 hover:text-white rounded-lg transition hover:bg-white/[0.05]">
              <Filter size={16} />
            </button>
            <div className="flex items-center bg-[#171923] border border-white/[0.08] rounded-lg p-1 text-sm">
              <button 
                onClick={() => setCurrentYear(y => y - 1)}
                className="p-1 px-2 text-gray-400 hover:text-white transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold px-4">{currentYear}</span>
              <button 
                onClick={() => setCurrentYear(y => y + 1)}
                className="p-1 px-2 text-gray-400 hover:text-white transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-[#171923] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
        {/* Timeline Header (Months) */}
        <div className="flex items-end h-14 border-b border-white/[0.08] bg-white/[0.01]">
          <div className="w-64 shrink-0 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-r border-white/[0.08]">
            Releases
          </div>
          <div className="flex-1 flex px-4">
            {MONTHS.map(m => (
              <div key={m} className="flex-1 text-center pb-2">
                <span className="text-xs font-bold text-gray-500">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar">
          {releases.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-3">
              <Calendar size={32} className="opacity-50" />
              <p>No releases scheduled</p>
            </div>
          ) : (
            <div className="relative pb-10">
              {/* Vertical month dividers */}
              <div className="absolute inset-0 left-64 flex px-4 pointer-events-none">
                {MONTHS.map(m => (
                  <div key={m} className="flex-1 border-r border-dashed border-white/[0.03] h-full" />
                ))}
              </div>

              {releases.map((release, i) => {
                const releaseFeatures = features.filter(f => f.releaseId === release.id);
                
                // Mock width and offset if dates are missing, otherwise spread broadly
                // A real Gantt parses 'startDate' and 'endDate' into actual pixels based on domain.
                // We'll fake a staggered rendering here to show off the visual capability.
                const staggerStart = Math.min((i * 10), 75); // offsets every release by 10%
                const mockWidth = Math.max(15, 30 - (i * 2)); // varying widths
                
                return (
                  <div key={release.id} className="group relative flex border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                    <div className="w-64 shrink-0 py-5 px-6 border-r border-white/[0.08] flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: release.color }} />
                        <span className="text-sm font-bold text-white truncate">{release.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium pl-4">{releaseFeatures.length} features planned</span>
                    </div>

                    <div className="flex-1 px-4 py-5 flex items-center relative z-10">
                      {/* Timeline Bar */}
                      <div 
                        className="absolute h-8 rounded-full shadow-lg border border-white/10 flex items-center transition-all duration-500 hover:brightness-110 cursor-pointer overflow-hidden backdrop-blur-md"
                        style={{ 
                          left: `calc(${staggerStart}% + 1rem)`, 
                          width: `${mockWidth}%`,
                          background: `linear-gradient(90deg, ${release.color}dd, ${release.color}ff)`
                        }}
                      >
                        <span className="px-3 text-xs font-semibold text-white drop-shadow-md truncate">
                          {release.date || `Q${Math.floor(i/3) + 1} Target`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
