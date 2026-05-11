"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, TrendingUp, Filter } from "lucide-react";
import { useAppContext } from "../../../lib/AppContext";
import { STATUS_CONFIG, CUSTOM_LABELS } from "../../../lib/features";
import { TutorialButton } from "../../../components/ui/TutorialButton";

export default function LeaderboardPage() {
  const { features } = useAppContext();

  // Sort by score descending, then by creation date
  const rankedFeatures = [...features].sort((a, b) => {
    if (a.score !== b.score) {
      return (b.score || 0) - (a.score || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const scoredFeatures = rankedFeatures.filter(f => f.score != null);
  const unscoredFeatures = rankedFeatures.filter(f => f.score == null);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0E1015] p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition mb-8">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex items-start justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Trophy className="text-yellow-500" size={32} />
                Priority Leaderboard
              </h1>
              <TutorialButton tutorialKey="prioritization" />
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-lg">
              Global ranking of all features across your workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-lg">
            <TrendingUp size={20} />
            <span className="font-bold">{scoredFeatures.length} Scored Features</span>
          </div>
        </div>

        {/* Global List */}
        <div className="bg-white dark:bg-[#171923] rounded-xl border border-slate-200 dark:border-white/[0.06] shadow-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] text-xs font-bold text-slate-600 dark:text-gray-500 uppercase tracking-widest bg-white dark:bg-black/20">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-1">ID</div>
            <div className="col-span-4">Feature</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Labels</div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {scoredFeatures.map((feature, idx) => (
              <div key={feature.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition">
                <div className="col-span-1 text-center">
                  <span className={`text-lg font-black font-mono ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-700' : 'text-slate-400 dark:text-gray-600'}`}>
                    #{idx + 1}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-gray-500">{feature.productId}</span>
                </div>
                <div className="col-span-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{feature.title}</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold text-lg rounded-lg">
                    {feature.score}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_CONFIG[feature.status].bg} ${STATUS_CONFIG[feature.status].color}`}>
                    {STATUS_CONFIG[feature.status].label}
                  </span>
                </div>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {(feature.labels || []).slice(0, 2).map((lId) => {
                    const cfg = CUSTOM_LABELS.find(l => l.id === lId);
                    if (!cfg) return null;
                    return (
                      <span key={lId} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    );
                  })}
                  {(feature.labels || []).length > 2 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-500/10 text-slate-500 dark:text-gray-400 border border-gray-500/20">
                      +{feature.labels!.length - 2}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {scoredFeatures.length === 0 && (
              <div className="p-12 text-center text-slate-600 dark:text-gray-500">
                <Filter size={32} className="mx-auto mb-3 opacity-50" />
                <p>No scored features yet. Go to your board to start prioritizing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Unscored Section */}
        {unscoredFeatures.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-bold text-slate-600 dark:text-gray-500 uppercase tracking-widest mb-4 ml-6">Unscored Backlog ({unscoredFeatures.length})</h2>
            <div className="bg-white dark:bg-[#171923] rounded-xl border border-dashed border-slate-200 dark:border-white/[0.06] overflow-hidden opacity-70 hover:opacity-100 transition">
              {unscoredFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.04]">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-gray-600 w-12">{feature.productId}</span>
                  <p className="text-sm font-semibold text-gray-300 flex-1">{feature.title}</p>
                  <Link href="/features" className="text-xs text-blue-500 hover:text-blue-400 font-medium">Head to board to score →</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
