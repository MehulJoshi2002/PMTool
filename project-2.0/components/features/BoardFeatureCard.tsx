"use client";

import React, { useState } from "react";
import { BoardFeature, STATUS_CONFIG, FeatureStatus, CUSTOM_LABELS } from "../../lib/features";
import { BarChart3, MessageCircle, MoreHorizontal, Trash2, Pencil, ChevronDown, Target, Link as LinkIcon, AlertTriangle, FileText, TrendingUp, Tag, ChevronUp } from "lucide-react";
import { useAppContext } from "../../lib/AppContext";
import { useRouter } from "next/navigation";

interface BoardFeatureCardProps {
  feature: BoardFeature;
  onUpdate: (id: string, updates: Partial<BoardFeature>) => void;
  onDelete: (id: string) => void;
  onDragStart: (featureId: string) => void;
}

export default function BoardFeatureCard({
  feature,
  onUpdate,
  onDelete,
  onDragStart,
}: BoardFeatureCardProps) {
  const { objectives, features, releases } = useAppContext();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(feature.title);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showOkrPicker, setShowOkrPicker] = useState(false);
  const [showBlockerPicker, setShowBlockerPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = STATUS_CONFIG[feature.status];
  const linkedOkr = objectives.find(o => o.id === feature.okrId);
  const myBlockers = feature.blockedBy || [];
  const myLabels = feature.labels || [];
  
  // Get first blocker for display
  const primaryBlocker = myBlockers.length > 0 ? features.find(f => f.id === myBlockers[0]) : null;
  
  // Calculate Temporal Violation logic
  let hasViolation = false;
  let blockerString = "";
  if (primaryBlocker) {
    const myReleaseIdx = releases.findIndex(r => r.id === feature.releaseId);
    const blockerReleaseIdx = releases.findIndex(r => r.id === primaryBlocker.releaseId);
    if (myReleaseIdx !== -1 && blockerReleaseIdx !== -1) {
      if (myReleaseIdx <= blockerReleaseIdx) {
        hasViolation = true;
      }
    }
    blockerString = primaryBlocker.productId;
  }

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdate(feature.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleScoreChange = (field: 'reach' | 'impact' | 'confidence' | 'effort', value: number) => {
    const r = field === 'reach' ? value : (feature.reach || 1);
    const i = field === 'impact' ? value : (feature.impact || 1);
    const c = field === 'confidence' ? value : (feature.confidence || 1);
    const e = field === 'effort' ? value : (feature.effort || 1);
    
    // Auto-calculate score
    const newScore = Math.round((r * i * c) / e);
    
    onUpdate(feature.id, {
      [field]: value,
      score: newScore
    });
  };

  const toggleLabel = (labelId: string) => {
    const newLabels = myLabels.includes(labelId)
      ? myLabels.filter(id => id !== labelId)
      : [...myLabels, labelId];
    onUpdate(feature.id, { labels: newLabels });
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(feature.id);
      }}
      className={`bg-[#171923] border ${hasViolation ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-white/[0.06]'} rounded-lg p-3.5 hover:border-white/[0.12] hover:bg-[#1c1f2e] transition group cursor-grab active:cursor-grabbing active:shadow-2xl active:shadow-blue-500/10 active:ring-1 active:ring-blue-500/20`}
    >
      {/* Dependency Warning */}
      {hasViolation && (
        <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded mb-3 border border-red-500/20">
          <AlertTriangle size={12} />
          BLOCKED BY {blockerString}
        </div>
      )}

      {/* Top row: ID + actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <Plus size={10} className="text-white" />
          </div>
          <span className="text-[10px] font-bold text-gray-500 font-mono">{feature.productId}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* PRD Badge */}
          {feature.prdGenerated && (
            <span
              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 cursor-pointer hover:bg-violet-500/20 transition"
              title="PRD Generated"
              onClick={() => router.push(`/prd?featureId=${feature.id}`)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <FileText size={9} /> PRD
            </span>
          )}
          {/* Inline Score badge */}
          {feature.score != null ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 transition"
              title="Inline Priority Score"
            >
              <TrendingUp size={10} /> {feature.score}
              {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-[9px] text-gray-500 hover:text-blue-400 transition font-medium border border-dashed border-gray-600/50 px-1.5 py-0.5 rounded"
              title="Score feature"
            >
              Assess Score
            </button>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-0.5 rounded text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition"
            >
              <MoreHorizontal size={12} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} onMouseDown={(e) => e.stopPropagation()} />
                <div className="absolute right-0 top-6 z-50 bg-[#1e2132] border border-white/[0.1] rounded-lg shadow-xl py-1 w-36" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/[0.05] transition"
                  >
                    <Pencil size={11} />
                    Edit title
                  </button>
                  <button
                    onClick={() => { onDelete(feature.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      {isEditing ? (
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveTitle();
            if (e.key === 'Escape') { setEditTitle(feature.title); setIsEditing(false); }
          }}
          className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none border-b border-blue-500/50 mb-2 cursor-text"
          autoFocus
        />
      ) : (
        <p className="text-sm font-semibold text-white mb-2 leading-snug">{feature.title}</p>
      )}

      {/* Inline Expandable Scorecard */}
      {isExpanded && (
        <div className="mb-3 p-3 bg-black/20 rounded-lg border border-white/[0.04]" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Scorecard</span>
            <span className="text-xs font-mono font-bold text-blue-400">{feature.score ?? '-'}</span>
          </div>
          
          <div className="space-y-2">
            {[
              { id: 'reach', label: 'Reach', max: 5 },
              { id: 'impact', label: 'Impact', max: 5 },
              { id: 'confidence', label: 'Confidence', max: 5 },
              { id: 'effort', label: 'Effort', max: 5 }
            ].map(field => {
              const val = feature[field.id as keyof BoardFeature] as number || 1;
              const pct = ((val - 1) / (field.max - 1)) * 100;
              return (
                <div key={field.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-medium uppercase">{field.label}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{val}/{field.max}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={field.max}
                    value={val}
                    onChange={(e) => handleScoreChange(field.id as any, Number(e.target.value))}
                    className="w-full h-1 appearance-none rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, #3b82f6 ${pct}%, #1e293b ${pct}%)` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom row: Status */}
      <div className="flex items-center justify-between">
        <div className="relative" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowStatusPicker(!showStatusPicker)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition hover:opacity-80 ${statusInfo.bg} ${statusInfo.color}`}
          >
            {statusInfo.label}
            <ChevronDown size={10} />
          </button>
          {showStatusPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowStatusPicker(false)} />
              <div className="absolute left-0 top-7 z-50 bg-[#1e2132] border border-white/[0.1] rounded-lg shadow-xl py-1 w-44">
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onUpdate(feature.id, { status: key as FeatureStatus });
                      setShowStatusPicker(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-white/[0.05] ${
                      feature.status === key ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${val.bg.replace('bg-', 'bg-').replace('/15', '')}`}
                      style={{ backgroundColor: val.color.includes('emerald') ? '#10b981' : val.color.includes('blue') ? '#3b82f6' : val.color.includes('violet') ? '#8b5cf6' : val.color.includes('amber') ? '#f59e0b' : val.color.includes('cyan') ? '#06b6d4' : val.color.includes('orange') ? '#f97316' : '#6b7280' }}
                    />
                    {val.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* OKR Assignment */}
        <div className="relative" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowOkrPicker(!showOkrPicker)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition hover:opacity-80 border ${
              linkedOkr 
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                : 'text-gray-500 border-white/[0.05] hover:bg-white/[0.05] hover:text-gray-300'
            }`}
            title={linkedOkr ? `Linked to OKR: ${linkedOkr.title}` : 'Link to OKR'}
          >
            <Target size={10} />
            {linkedOkr ? 'OKR' : 'Link OKR'}
          </button>
          
          {showOkrPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowOkrPicker(false)} />
              <div className="absolute left-0 top-7 z-50 bg-[#1e2132] border border-white/[0.1] rounded-lg shadow-xl py-1 w-56">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/[0.05] mb-1">
                  Link to Objective
                </div>
                
                <button
                  onClick={() => {
                    onUpdate(feature.id, { okrId: undefined });
                    setShowOkrPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition hover:bg-white/[0.05] ${
                    !feature.okrId ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  <span className="truncate">None / Unlinked</span>
                </button>

                {objectives.map((okr) => (
                  <button
                    key={okr.id}
                    onClick={() => {
                      onUpdate(feature.id, { okrId: okr.id });
                      setShowOkrPicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition hover:bg-white/[0.05] ${
                      feature.okrId === okr.id ? 'text-orange-400 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    <span className="truncate text-left flex-1" title={okr.title}>{okr.title}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Blocker Assignment */}
        <div className="relative ml-1" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowBlockerPicker(!showBlockerPicker)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition border ${
              primaryBlocker 
                ? hasViolation ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:opacity-80' : 'bg-white/[0.05] text-white border-white/[0.1] hover:bg-white/[0.08]' 
                : 'text-gray-500 border-transparent hover:bg-white/[0.05] hover:text-gray-300'
            }`}
          >
            <LinkIcon size={10} />
            {primaryBlocker ? primaryBlocker.productId : 'Link Blocker'}
          </button>
          
          {showBlockerPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBlockerPicker(false)} />
              <div className="absolute right-0 top-7 z-50 bg-[#1e2132] border border-white/[0.1] rounded-lg shadow-xl py-1 w-64 max-h-64 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/[0.05] mb-1">
                  Mark Blocked By
                </div>
                
                <button
                  onClick={() => {
                    onUpdate(feature.id, { blockedBy: [] });
                    setShowBlockerPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition hover:bg-white/[0.05] ${
                    myBlockers.length === 0 ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  <span className="truncate">No Blockers</span>
                </button>

                {features.filter(f => f.id !== feature.id).map((other) => {
                  const isBlocking = myBlockers.includes(other.id);
                  return (
                    <button
                      key={other.id}
                      onClick={() => {
                        onUpdate(feature.id, { blockedBy: [other.id] });
                        setShowBlockerPicker(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-white/[0.05] ${
                        isBlocking ? 'text-red-400 font-semibold' : 'text-gray-400'
                      }`}
                    >
                      <span className="text-[10px] font-mono shrink-0">{other.productId}</span>
                      <span className="truncate text-left flex-1" title={other.title}>{other.title}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Labels Bottom Picker */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        {myLabels.map(lId => {
          const cfg = CUSTOM_LABELS.find(l => l.id === lId);
          if (!cfg) return null;
          return (
            <span key={lId} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${cfg.color}`}>
              {cfg.label}
            </span>
          );
        })}
        
        <div className="relative inline-block mt-0.5">
          <button
            onClick={() => setShowLabelPicker(!showLabelPicker)}
            className="text-[9px] text-gray-500 hover:text-gray-300 font-medium flex items-center gap-0.5 transition"
          >
            <Tag size={9} /> {myLabels.length > 0 ? '+' : 'Add Label'}
          </button>
          
          {showLabelPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLabelPicker(false)} />
              <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#1e2132] border border-white/[0.1] rounded-lg shadow-xl py-1 w-40 max-h-48 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/[0.05] mb-1">
                  Tags
                </div>
                {CUSTOM_LABELS.map(cfg => {
                  const isActive = myLabels.includes(cfg.id);
                  return (
                    <button
                      key={cfg.id}
                      onClick={() => toggleLabel(cfg.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-white/[0.05] ${
                        isActive ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-sm border ${cfg.color}`} />
                      <span className={isActive ? 'text-white font-medium' : 'text-gray-400'}>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Re-use Plus icon inline
function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
