"use client";

import React, { useState } from "react";
import { useAppContext } from "../../lib/AppContext";
import { Target, Plus, Trash2, PieChart } from "lucide-react";

import { TutorialButton } from "../../components/ui/TutorialButton";

export default function OKRsPage() {
  const { objectives, addObjective, deleteObjective, features } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget.trim()) return;
    addObjective(newTitle.trim(), newTarget.trim());
    setNewTitle("");
    setNewTarget("");
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f1a] p-8 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Target size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Objectives & Key Results (OKRs)</h1>
                <TutorialButton tutorialKey="okrs" />
              </div>
              <p className="text-sm text-slate-600 dark:text-gray-500 font-medium mt-1">Map strategic goals to actual shipped features.</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-slate-900 dark:text-white rounded-lg font-semibold shadow-sm dark:shadow-lg shadow-orange-500/20 transition"
        >
          <Plus size={16} />
          New Objective
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] p-6 rounded-2xl max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Define Key Result</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Objective Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Expand into Enterprise Market"
                className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500/50 transition"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Target Metric</label>
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="e.g. Increase enterprise ARR by 20%"
                className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500/50 transition"
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-slate-900 dark:text-white text-sm font-semibold rounded-lg transition"
              >
                Save OKR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OKR List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {objectives.length === 0 && !showAddForm && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.05] rounded-3xl">
            <Target size={48} className="text-slate-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">No OKRs defined</h3>
            <p className="text-slate-600 dark:text-gray-500 mt-2 text-center max-w-sm">Strategic goals are the backbone of a great product. Define high-level objectives here and link features to them on the board.</p>
          </div>
        )}

        {objectives.map((okr) => {
          const linkedFeatures = features.filter((f) => f.okrId === okr.id);
          const shippedFeatures = linkedFeatures.filter((f) => f.status === 'shipped');
          const totalLinked = linkedFeatures.length;
          const progressPercentage = totalLinked === 0 ? 0 : Math.round((shippedFeatures.length / totalLinked) * 100);

          return (
            <div key={okr.id} className="bg-white dark:bg-[#171923] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 group hover:border-white/[0.15] transition flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="px-2 py-1 bg-slate-200 dark:bg-white/[0.05] text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 dark:border-white/[0.1]">
                  Objective
                </div>
                <button 
                  onClick={() => deleteObjective(okr.id)}
                  className="p-1.5 text-slate-400 dark:text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition rounded hover:bg-slate-200 dark:bg-white/[0.05]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{okr.title}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 flex-1">{okr.targetMetric}</p>
              
              {/* Progress Tracker */}
              <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{progressPercentage}%</span>
                    <span className="text-xs text-slate-600 dark:text-gray-500 ml-2 font-medium">Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-gray-500">
                    <PieChart size={14} />
                    {shippedFeatures.length} / {totalLinked} Shipped
                  </div>
                </div>
                
                <div className="w-full h-2.5 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.02]">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercentage}%` }} 
                  />
                </div>
                
                {totalLinked === 0 && (
                  <p className="text-[10px] text-orange-400/80 mt-3 text-center">
                    Go to the Features Board and link a feature to this OKR.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
