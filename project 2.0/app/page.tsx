"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ListChecks, Workflow, Layers3, ArrowUpRight, Plus, Activity,
  Target, TrendingUp, ChevronRight, FileText, Presentation,
  AlertTriangle, Zap, Flame, ArrowRight, Clock, CheckCircle2,
} from "lucide-react";
import { useAppContext } from "../lib/AppContext";
import { STATUS_CONFIG, isFeatureStuck, daysSince, ACTIVE_STATUSES } from "../lib/features";

const QUICK_ACTIONS = [
  { label: "Global Leaderboard", description: "View workspace-wide ranked priority", href: "/project/demo", icon: <ListChecks size={20} />, color: "bg-blue-500/10 text-blue-400" },
  { label: "Features Board", description: "Manage features across releases", href: "/features", icon: <Layers3 size={20} />, color: "bg-violet-500/10 text-violet-400" },
  { label: "Roadmapping", description: "Build user flows & journey maps", href: "/roadmapping", icon: <Workflow size={20} />, color: "bg-emerald-500/10 text-emerald-400" },
  { label: "AI PRD Generator", description: "Instantly draft structured PRDs", href: "/prd", icon: <FileText size={20} />, color: "bg-rose-500/10 text-rose-400" },
];

// Pipeline stages
const PIPELINE_STAGES = [
  { key: "new",              label: "Ideas",    color: "bg-gray-500",   barColor: "bg-gray-500/60" },
  { key: "under_consideration", label: "Review",  color: "bg-amber-500", barColor: "bg-amber-500/60" },
  { key: "in_design",        label: "Design",   color: "bg-violet-500", barColor: "bg-violet-500/60" },
  { key: "in_development",   label: "Dev",      color: "bg-blue-500",   barColor: "bg-blue-500/60" },
  { key: "in_review",        label: "Review",   color: "bg-orange-500", barColor: "bg-orange-500/60" },
  { key: "shipped",          label: "Shipped",  color: "bg-emerald-500", barColor: "bg-emerald-500/60" },
];

export default function Home() {
  const ctx = useAppContext();
  const router = useRouter();
  const features = ctx?.features || [];
  const workspaces = ctx?.workspaces || [];
  const activeWorkspaceId = ctx?.activeWorkspaceId;
  const objectives = ctx?.objectives || [];
  const isPresentMode = ctx?.isPresentMode || false;
  const setIsPresentMode = ctx?.setIsPresentMode || (() => {});

  const [mounted, setMounted] = useState(false);
  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);

  useEffect(() => { setMounted(true); }, []);

  // ---- Intelligence computations ----
  const totalFeatures = features.length;
  const shippedFeatures = features.filter(f => f.status === "shipped").length;

  // 🔴 Blocked & Stuck
  const blockedFeatures = features.filter(f => (f.blockedBy?.length ?? 0) > 0);
  const stuckFeatures   = features.filter(f => isFeatureStuck(f) && !(f.blockedBy?.length));
  const atRisk          = [...blockedFeatures, ...stuckFeatures];

  // 🟡 High score, no action
  const highScoreUnstarted = [...features]
    .filter(f => (f.score ?? 0) > 0 && (f.status === "new" || f.status === "under_consideration"))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 4);

  // 🔥 Top priority this week (top 3 by score)
  const topPriority = [...features]
    .filter(f => f.score != null && f.status !== "shipped")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  // Pipeline stage counts
  const stageCounts = PIPELINE_STAGES.map(s => ({
    ...s,
    count: features.filter(f => f.status === s.key).length,
  }));
  const maxStageCount = Math.max(...stageCounts.map(s => s.count), 1);

  const noIntelligence = atRisk.length === 0 && highScoreUnstarted.length === 0 && topPriority.length === 0;

  if (!mounted) return null;

  return (
    <div className={`h-screen flex flex-col overflow-y-auto ${isPresentMode ? "p-12" : "p-8"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`${isPresentMode ? "text-4xl" : "text-2xl"} font-bold text-white tracking-tight`}>
            {activeWs?.name || "Product Workspace"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isPresentMode ? "Strategic Product Overview" : "Here is what needs your attention today."}
          </p>
        </div>

        {!isPresentMode && (
          <button
            onClick={() => setIsPresentMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-violet-500/20 transition group"
          >
            <Presentation size={18} className="group-hover:scale-110 transition-transform" />
            Present Mode
          </button>
        )}
      </div>

      {/* Quick Actions */}
      {!isPresentMode && (
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 p-5 rounded-xl bg-[#171923] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#1c1f2e] transition group"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                </div>
                <ArrowUpRight size={16} className="text-gray-600 group-hover:text-blue-400 transition shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {totalFeatures === 0 ? (
        /* ---- Empty State ---- */
        <div className="bg-[#171923] rounded-xl border border-dashed border-white/[0.08] p-12 text-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Layers3 size={32} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Your dashboard is empty</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Add features to the board, score them in the prioritization tool, and the dashboard will automatically surface what needs your attention.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/features" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-600/20">
              <Plus size={16} /> Add Your First Feature
            </Link>
            <Link href="/roadmapping" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-semibold transition border border-white/[0.05]">
              <Workflow size={16} /> Build a Journey Map
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ---- Pipeline Funnel ---- */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Feature Pipeline</h2>
              <Link href="/features" className="text-xs text-gray-600 hover:text-gray-300 transition flex items-center gap-1">
                Open Board <ChevronRight size={12} />
              </Link>
            </div>
            <div className="bg-[#171923] rounded-xl border border-white/[0.06] p-5">
              <div className="grid grid-cols-6 gap-3">
                {stageCounts.map((stage) => (
                  <Link key={stage.key} href="/features"
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-full h-16 flex items-end mb-2 rounded overflow-hidden bg-white/[0.03]">
                      <div
                        className={`w-full ${stage.barColor} rounded transition-all duration-500 group-hover:opacity-100 opacity-70`}
                        style={{ height: `${stage.count === 0 ? 4 : Math.max(12, (stage.count / maxStageCount) * 64)}px` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">{stage.count}</span>
                    <span className="text-[10px] text-gray-600 mt-0.5 text-center">{stage.label}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-gray-600">
                <span>{totalFeatures} total features</span>
                <span>{shippedFeatures} shipped · {features.filter(f => f.score != null).length} scored</span>
              </div>
            </div>
          </section>

          {/* ---- Intelligence Panels ---- */}
          {noIntelligence ? (
            <div className="bg-[#171923] rounded-xl border border-white/[0.06] p-8 text-center">
              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-1">Everything looks healthy</p>
              <p className="text-xs text-gray-500">No blocked features. Score your features to unlock priority intelligence.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* 🔴 Blocked & Stuck */}
              <section className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Blocked & Stuck</h2>
                  <span className="ml-auto text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">{atRisk.length}</span>
                </div>
                {atRisk.length === 0 ? (
                  <div className="flex-1 bg-[#171923] rounded-xl border border-white/[0.06] p-6 flex items-center justify-center">
                    <p className="text-xs text-gray-600">No blocked or stuck features 🎉</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-2">
                    {atRisk.map(f => {
                      const isBlocked = (f.blockedBy?.length ?? 0) > 0;
                      const days = daysSince(f.updatedAt);
                      return (
                        <div key={f.id} className="bg-[#171923] rounded-xl border border-red-500/20 p-4 hover:border-red-500/40 transition">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] font-mono text-gray-500">{f.productId}</span>
                              <p className="text-sm font-semibold text-white leading-tight">{f.title}</p>
                            </div>
                            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                          </div>
                          <p className="text-[11px] text-red-400 mb-3">
                            {isBlocked ? `Blocked by ${f.blockedBy![0]}` : `Stuck for ${days} days in ${STATUS_CONFIG[f.status].label}`}
                          </p>
                          <Link href="/features" className="text-[11px] text-gray-500 hover:text-white transition flex items-center gap-1 font-medium">
                            Fix on board <ArrowRight size={10} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 🟡 High Score — No Action */}
              <section className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">High Value — Unstarted</h2>
                  <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{highScoreUnstarted.length}</span>
                </div>
                {highScoreUnstarted.length === 0 ? (
                  <div className="flex-1 bg-[#171923] rounded-xl border border-white/[0.06] p-6 flex items-center justify-center">
                    <p className="text-xs text-gray-600 text-center">Score features in Prioritization<br/>to surface opportunities here</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-2">
                    {highScoreUnstarted.map(f => (
                      <div key={f.id} className="bg-[#171923] rounded-xl border border-amber-500/20 p-4 hover:border-amber-500/40 transition">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-mono text-gray-500">{f.productId}</span>
                            <p className="text-sm font-semibold text-white leading-tight">{f.title}</p>
                          </div>
                          <span className="text-lg font-bold font-mono text-amber-400 shrink-0">{f.score}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_CONFIG[f.status].bg} ${STATUS_CONFIG[f.status].color}`}>
                            {STATUS_CONFIG[f.status].label}
                          </span>
                          <Link href="/features" className="text-[11px] text-gray-500 hover:text-white transition flex items-center gap-1 font-medium">
                            Start this <ArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 🔥 Top Priority This Week */}
              <section className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={12} className="text-orange-400" />
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Priority This Week</h2>
                </div>
                {topPriority.length === 0 ? (
                  <div className="flex-1 bg-[#171923] rounded-xl border border-white/[0.06] p-6 flex items-center justify-center">
                    <p className="text-xs text-gray-600 text-center">Score features to see<br/>your top 3 priorities here</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-2">
                    {topPriority.map((f, i) => {
                      const rankColors = ["text-orange-400", "text-gray-300", "text-amber-600"];
                      const rankLabels = ["1st", "2nd", "3rd"];
                      const okr = objectives.find(o => o.id === f.okrId);
                      return (
                        <div key={f.id} className="bg-[#171923] rounded-xl border border-white/[0.06] p-4 hover:border-orange-500/20 transition">
                          <div className="flex items-start gap-3">
                            <div className={`text-xs font-black font-mono ${rankColors[i]} w-6 shrink-0 mt-0.5`}>{rankLabels[i]}</div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-mono text-gray-500">{f.productId}</span>
                              <p className="text-sm font-semibold text-white leading-tight truncate">{f.title}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_CONFIG[f.status].bg} ${STATUS_CONFIG[f.status].color}`}>
                                  {STATUS_CONFIG[f.status].label}
                                </span>
                                {okr && (
                                  <span className="text-[10px] text-orange-400/80 flex items-center gap-0.5">
                                    <Target size={9} /> {okr.title.slice(0, 24)}…
                                  </span>
                                )}
                                {f.prdGenerated && (
                                  <span className="text-[10px] text-violet-400 flex items-center gap-0.5">
                                    <FileText size={9} /> PRD
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold font-mono text-white">{f.score}</div>
                              <div className="text-[9px] text-gray-600 uppercase">score</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Link href="/project/demo" className="flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition py-2 font-medium">
                      View all scored features <ChevronRight size={12} />
                    </Link>
                  </div>
                )}
              </section>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
