"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BoardFeature, Release, FeatureStatus, Objective, Idea } from "./features";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabase";

export interface Workspace {
  id: string;
  name: string;
  initial: string;
  color: string;
}

interface AppContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  addWorkspace: (name: string) => void;
  switchWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;
  features: BoardFeature[];
  releases: Release[];
  objectives: Objective[];
  ideas: Idea[];
  addFeature: (releaseId: string, title: string, options?: Partial<BoardFeature>) => void;
  updateFeature: (id: string, updates: Partial<BoardFeature>) => void;
  deleteFeature: (id: string) => void;
  addRelease: (name: string, date: string) => void;
  updateRelease: (id: string, updates: Partial<Release>) => void;
  deleteRelease: (id: string) => void;
  moveFeature: (featureId: string, toReleaseId: string) => void;
  addObjective: (title: string, targetMetric: string) => void;
  deleteObjective: (id: string) => void;
  addIdea: (title: string, description: string, author: string) => void;
  convertIdeaToFeature: (ideaId: string, releaseId: string) => void;
  isPresentMode: boolean;
  setIsPresentMode: (val: boolean) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

const WORKSPACE_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
];

const RELEASE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

// --- DB row mappers ---
function toFeature(row: any): BoardFeature {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    status: row.status as FeatureStatus,
    score: row.score ?? null,
    commentsCount: row.comments_count ?? 0,
    releaseId: row.release_id ?? '',
    tags: row.tags ?? [],
    assignee: row.assignee,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    okrId: row.okr_id ?? undefined,
    blockedBy: row.blocked_by ?? [],
    reach: row.reach ?? undefined,
    impact: row.impact ?? undefined,
    confidence: row.confidence ?? undefined,
    effort: row.effort ?? undefined,
    labels: row.labels ?? [],
    description: row.description ?? undefined,
    prdGenerated: row.prd_generated ?? false,
    prdId: row.prd_id ?? undefined,
  };
}

function featureUpdatesToDb(updates: Partial<BoardFeature>): Record<string, any> {
  const map: Record<string, string> = {
    productId: 'product_id', title: 'title', status: 'status', score: 'score',
    commentsCount: 'comments_count', releaseId: 'release_id', tags: 'tags',
    assignee: 'assignee', okrId: 'okr_id', blockedBy: 'blocked_by',
    reach: 'reach', impact: 'impact', confidence: 'confidence', effort: 'effort',
    labels: 'labels', description: 'description', prdGenerated: 'prd_generated', prdId: 'prd_id',
  };
  const db: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const [key, col] of Object.entries(map)) {
    if (key in updates) db[col] = (updates as any)[key];
  }
  return db;
}

function toRelease(row: any): Release {
  return { id: row.id, name: row.name, date: row.date ?? '', startDate: row.start_date, endDate: row.end_date, color: row.color };
}

function toObjective(row: any): Objective {
  return { id: row.id, title: row.title, targetMetric: row.target_metric };
}

function toIdea(row: any): Idea {
  return { id: row.id, title: row.title, description: row.description, author: row.author, createdAt: row.created_at };
}

function toWorkspace(row: any): Workspace {
  return { id: row.id, name: row.name, initial: row.name.charAt(0).toUpperCase(), color: row.color || WORKSPACE_COLORS[0] };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [features, setFeatures] = useState<BoardFeature[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const activeWorkspaceIdRef = React.useRef('');

  // Keep ref in sync so realtime handlers always see latest workspace
  useEffect(() => { activeWorkspaceIdRef.current = activeWorkspaceId; }, [activeWorkspaceId]);

  // Realtime subscriptions — re-subscribe whenever active workspace changes
  useEffect(() => {
    if (!activeWorkspaceId) return;

    const channel = supabase
      .channel(`workspace-${activeWorkspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'features', filter: `workspace_id=eq.${activeWorkspaceId}` }, (payload) => {
        if (activeWorkspaceIdRef.current !== activeWorkspaceId) return;
        if (payload.eventType === 'INSERT') setFeatures(p => [...p.filter(f => f.id !== payload.new.id), toFeature(payload.new)]);
        if (payload.eventType === 'UPDATE') setFeatures(p => p.map(f => f.id === payload.new.id ? toFeature(payload.new) : f));
        if (payload.eventType === 'DELETE') setFeatures(p => p.filter(f => f.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'releases', filter: `workspace_id=eq.${activeWorkspaceId}` }, (payload) => {
        if (activeWorkspaceIdRef.current !== activeWorkspaceId) return;
        if (payload.eventType === 'INSERT') setReleases(p => [...p.filter(r => r.id !== payload.new.id), toRelease(payload.new)]);
        if (payload.eventType === 'UPDATE') setReleases(p => p.map(r => r.id === payload.new.id ? toRelease(payload.new) : r));
        if (payload.eventType === 'DELETE') setReleases(p => p.filter(r => r.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'objectives', filter: `workspace_id=eq.${activeWorkspaceId}` }, (payload) => {
        if (activeWorkspaceIdRef.current !== activeWorkspaceId) return;
        if (payload.eventType === 'INSERT') setObjectives(p => [...p.filter(o => o.id !== payload.new.id), toObjective(payload.new)]);
        if (payload.eventType === 'UPDATE') setObjectives(p => p.map(o => o.id === payload.new.id ? toObjective(payload.new) : o));
        if (payload.eventType === 'DELETE') setObjectives(p => p.filter(o => o.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas', filter: `workspace_id=eq.${activeWorkspaceId}` }, (payload) => {
        if (activeWorkspaceIdRef.current !== activeWorkspaceId) return;
        if (payload.eventType === 'INSERT') setIdeas(p => [...p.filter(i => i.id !== payload.new.id), toIdea(payload.new)]);
        if (payload.eventType === 'UPDATE') setIdeas(p => p.map(i => i.id === payload.new.id ? toIdea(payload.new) : i));
        if (payload.eventType === 'DELETE') setIdeas(p => p.filter(i => i.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeWorkspaceId]);

  const loadWorkspaceData = useCallback(async (workspaceId: string) => {
    const [fr, rr, or, ir] = await Promise.all([
      supabase.from('features').select('*').eq('workspace_id', workspaceId).order('created_at'),
      supabase.from('releases').select('*').eq('workspace_id', workspaceId).order('created_at'),
      supabase.from('objectives').select('*').eq('workspace_id', workspaceId).order('created_at'),
      supabase.from('ideas').select('*').eq('workspace_id', workspaceId).order('created_at'),
    ]);
    setFeatures((fr.data || []).map(toFeature));
    setObjectives((or.data || []).map(toObjective));
    setIdeas((ir.data || []).map(toIdea));

    if ((rr.data || []).length === 0) {
      const { data } = await supabase
        .from('releases')
        .insert({ workspace_id: workspaceId, name: 'Release 1.0', date: '', color: '#3B82F6' })
        .select().single();
      setReleases(data ? [toRelease(data)] : []);
    } else {
      setReleases(rr.data!.map(toRelease));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]); setActiveWorkspaceId('');
      setFeatures([]); setReleases([]); setObjectives([]); setIdeas([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);

      const { data: owned } = await supabase.from('workspaces').select('*').eq('created_by', user.id);
      const { data: memberships } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id);
      const memberIds = (memberships || []).map((m: any) => m.workspace_id);

      let all: any[] = [...(owned || [])];
      if (memberIds.length > 0) {
        const ownedIds = (owned || []).map((w: any) => w.id);
        const extraIds = memberIds.filter((id: string) => !ownedIds.includes(id));
        if (extraIds.length > 0) {
          const { data: joined } = await supabase.from('workspaces').select('*').in('id', extraIds);
          all = [...all, ...(joined || [])];
        }
      }

      if (all.length === 0) {
        const { data: newWs } = await supabase
          .from('workspaces')
          .insert({ name: 'My Product', color: WORKSPACE_COLORS[0], created_by: user.id })
          .select().single();
        if (newWs) {
          setWorkspaces([toWorkspace(newWs)]);
          setActiveWorkspaceId(newWs.id);
          await loadWorkspaceData(newWs.id);
        }
      } else {
        const mapped = all.map(toWorkspace);
        setWorkspaces(mapped);
        // Check URL for ?workspace= param (set after accepting invite)
        const urlParam = typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('workspace')
          : null;
        const savedId = typeof window !== 'undefined'
          ? localStorage.getItem('activeWorkspaceId')
          : null;
        const preferred = urlParam || savedId;
        const initial = preferred && mapped.find(w => w.id === preferred) ? preferred : mapped[0].id;
        setActiveWorkspaceId(initial);
        await loadWorkspaceData(initial);
      }

      setLoading(false);
    })();
  }, [user?.id, loadWorkspaceData]);

  // --- Workspace actions ---
  const addWorkspace = useCallback(async (name: string) => {
    if (!user) return;
    const color = WORKSPACE_COLORS[workspaces.length % WORKSPACE_COLORS.length];
    const { data } = await supabase.from('workspaces').insert({ name, color, created_by: user.id }).select().single();
    if (!data) return;
    const ws = toWorkspace(data);
    setWorkspaces(prev => [...prev, ws]);
    setActiveWorkspaceId(ws.id);
    const { data: rel } = await supabase.from('releases').insert({ workspace_id: ws.id, name: 'Release 1.0', date: '', color: '#3B82F6' }).select().single();
    setFeatures([]); setReleases(rel ? [toRelease(rel)] : []); setObjectives([]); setIdeas([]);
  }, [user, workspaces.length]);

  const switchWorkspace = useCallback(async (id: string) => {
    setActiveWorkspaceId(id);
    if (typeof window !== 'undefined') localStorage.setItem('activeWorkspaceId', id);
    await loadWorkspaceData(id);
  }, [loadWorkspaceData]);

  const deleteWorkspace = useCallback(async (id: string) => {
    if (workspaces.length <= 1) return;
    await supabase.from('workspaces').delete().eq('id', id);
    const remaining = workspaces.filter(w => w.id !== id);
    setWorkspaces(remaining);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(remaining[0].id);
      await loadWorkspaceData(remaining[0].id);
    }
  }, [workspaces, activeWorkspaceId, loadWorkspaceData]);

  // --- Feature actions ---
  const addFeature = useCallback(async (releaseId: string, title: string, options?: Partial<BoardFeature>) => {
    if (!activeWorkspaceId) return;
    let maxNum = 0;
    features.forEach(f => { const m = f.productId.match(/PROD-(\d+)/); if (m && +m[1] > maxNum) maxNum = +m[1]; });
    const now = new Date().toISOString();
    const { data } = await supabase.from('features').insert({
      workspace_id: activeWorkspaceId,
      product_id: `PROD-${maxNum + 1}`,
      title,
      status: options?.status ?? 'new',
      score: options?.score ?? null,
      comments_count: 0,
      release_id: releaseId || null,
      tags: options?.tags ?? [],
      assignee: options?.assignee ?? null,
      okr_id: options?.okrId ?? null,
      blocked_by: options?.blockedBy ?? [],
      reach: options?.reach ?? null,
      impact: options?.impact ?? null,
      confidence: options?.confidence ?? null,
      effort: options?.effort ?? null,
      labels: options?.labels ?? [],
      description: options?.description ?? null,
      prd_generated: false,
      created_at: now, updated_at: now,
    }).select().single();
    if (data) setFeatures(prev => [...prev, toFeature(data)]);
  }, [activeWorkspaceId, features]);

  const updateFeature = useCallback(async (id: string, updates: Partial<BoardFeature>) => {
    const { data } = await supabase.from('features').update(featureUpdatesToDb(updates)).eq('id', id).select().single();
    if (data) setFeatures(prev => prev.map(f => f.id === id ? toFeature(data) : f));
  }, []);

  const deleteFeature = useCallback(async (id: string) => {
    await supabase.from('features').delete().eq('id', id);
    setFeatures(prev => prev.filter(f => f.id !== id));
  }, []);

  const moveFeature = useCallback(async (featureId: string, toReleaseId: string) => {
    await supabase.from('features').update({ release_id: toReleaseId, updated_at: new Date().toISOString() }).eq('id', featureId);
    setFeatures(prev => prev.map(f => f.id === featureId ? { ...f, releaseId: toReleaseId } : f));
  }, []);

  // --- Release actions ---
  const addRelease = useCallback(async (name: string, date: string) => {
    if (!activeWorkspaceId) return;
    const color = RELEASE_COLORS[releases.length % RELEASE_COLORS.length];
    const { data } = await supabase.from('releases').insert({ workspace_id: activeWorkspaceId, name, date, color }).select().single();
    if (data) setReleases(prev => [...prev, toRelease(data)]);
  }, [activeWorkspaceId, releases.length]);

  const updateRelease = useCallback(async (id: string, updates: Partial<Release>) => {
    const dbUpdates: Record<string, any> = {};
    if ('name' in updates) dbUpdates.name = updates.name;
    if ('date' in updates) dbUpdates.date = updates.date;
    if ('startDate' in updates) dbUpdates.start_date = updates.startDate;
    if ('endDate' in updates) dbUpdates.end_date = updates.endDate;
    if ('color' in updates) dbUpdates.color = updates.color;

    const { data } = await supabase.from('releases').update(dbUpdates).eq('id', id).select().single();
    if (data) setReleases(prev => prev.map(r => r.id === id ? toRelease(data) : r));
  }, []);

  const deleteRelease = useCallback(async (id: string) => {
    const remaining = releases.filter(r => r.id !== id);
    const fallbackId = remaining[0]?.id;
    if (fallbackId) {
      await supabase.from('features').update({ release_id: fallbackId, updated_at: new Date().toISOString() }).eq('release_id', id);
      setFeatures(prev => prev.map(f => f.releaseId === id ? { ...f, releaseId: fallbackId } : f));
    }
    await supabase.from('releases').delete().eq('id', id);
    setReleases(remaining);
  }, [releases]);

  // --- Objective actions ---
  const addObjective = useCallback(async (title: string, targetMetric: string) => {
    if (!activeWorkspaceId) return;
    const { data } = await supabase.from('objectives').insert({ workspace_id: activeWorkspaceId, title, target_metric: targetMetric }).select().single();
    if (data) setObjectives(prev => [...prev, toObjective(data)]);
  }, [activeWorkspaceId]);

  const deleteObjective = useCallback(async (id: string) => {
    await supabase.from('objectives').delete().eq('id', id);
    await supabase.from('features').update({ okr_id: null, updated_at: new Date().toISOString() }).eq('okr_id', id);
    setObjectives(prev => prev.filter(o => o.id !== id));
    setFeatures(prev => prev.map(f => f.okrId === id ? { ...f, okrId: undefined } : f));
  }, []);

  // --- Idea actions ---
  const addIdea = useCallback(async (title: string, description: string, author: string) => {
    if (!activeWorkspaceId) return;
    const { data } = await supabase.from('ideas').insert({ workspace_id: activeWorkspaceId, title, description, author }).select().single();
    if (data) setIdeas(prev => [...prev, toIdea(data)]);
  }, [activeWorkspaceId]);

  const convertIdeaToFeature = useCallback(async (ideaId: string, releaseId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    await addFeature(releaseId, idea.title);
    await supabase.from('ideas').delete().eq('id', ideaId);
    setIdeas(prev => prev.filter(i => i.id !== ideaId));
  }, [ideas, addFeature]);

  return (
    <AppContext.Provider value={{
      workspaces, activeWorkspaceId, addWorkspace, switchWorkspace, deleteWorkspace,
      features, releases, objectives, ideas,
      addFeature, updateFeature, deleteFeature, addRelease, updateRelease, deleteRelease, moveFeature,
      addObjective, deleteObjective, addIdea, convertIdeaToFeature,
      isPresentMode, setIsPresentMode, loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}
