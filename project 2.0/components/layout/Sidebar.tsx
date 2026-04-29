"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Workflow,
  Layers3,
  ChevronDown,
  Sparkles,
  Plus,
  Trash2,
  Check,
  FileText,
  Target,
  Inbox,
  Calendar,
  Users,
  LogOut,
} from "lucide-react";
import { useAppContext } from "../../lib/AppContext";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
  { label: "Ideas Inbox", href: "/inbox", icon: <Inbox size={18} /> },
  { label: "Objectives (OKRs)", href: "/okrs", icon: <Target size={18} /> },
  { label: "Features", href: "/features", icon: <Layers3 size={18} /> },
  { label: "Timeline", href: "/timeline", icon: <Calendar size={18} /> },
  { label: "Team", href: "/team", icon: <Users size={18} /> },
  { label: "Prioritization", href: "/project/demo", icon: <ListChecks size={18} /> },
  { label: "Roadmapping", href: "/roadmapping", icon: <Workflow size={18} /> },
];

const TOOLS_NAV: NavItem[] = [
  { label: "PRD Generator", href: "/prd", icon: <FileText size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { workspaces, activeWorkspaceId, addWorkspace, switchWorkspace, deleteWorkspace } = useAppContext();
  const { user, signOut } = useAuth();
  const [showWorkspacePicker, setShowWorkspacePicker] = useState(false);
  const [showNewWsForm, setShowNewWsForm] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleAddWorkspace = () => {
    if (!newWsName.trim()) return;
    addWorkspace(newWsName.trim());
    setNewWsName('');
    setShowNewWsForm(false);
    setShowWorkspacePicker(false);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#12141c] border-r border-white/[0.06]" style={{ width: 'var(--sidebar-width, 260px)' }}>
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight tracking-tight">ProductOS</h1>
            <p className="text-[10px] text-gray-500 font-medium">Product Workspace</p>
          </div>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="mx-4 mb-4 relative">
        <button
          onClick={() => setShowWorkspacePicker(!showWorkspacePicker)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${activeWs?.color || 'from-emerald-500 to-teal-600'} flex items-center justify-center text-[10px] font-bold text-white`}>
              {activeWs?.initial || 'P'}
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">{activeWs?.name || 'My Product'}</p>
              <p className="text-[10px] text-gray-500">Workspace</p>
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-300 transition" />
        </button>

        {/* Workspace dropdown */}
        {showWorkspacePicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setShowWorkspacePicker(false); setShowNewWsForm(false); }} />
            <div className="absolute left-0 right-0 top-12 z-50 bg-[#1e2132] border border-white/[0.1] rounded-xl shadow-2xl py-2 overflow-hidden">
              <p className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Workspaces</p>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition ${
                    ws.id === activeWorkspaceId ? 'bg-blue-500/10' : 'hover:bg-white/[0.04]'
                  }`}
                  onClick={() => { switchWorkspace(ws.id); setShowWorkspacePicker(false); }}
                >
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${ws.color} flex items-center justify-center text-[9px] font-bold text-white`}>
                    {ws.initial}
                  </div>
                  <span className="text-xs font-medium text-white flex-1">{ws.name}</span>
                  {ws.id === activeWorkspaceId && <Check size={12} className="text-blue-400" />}
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteWorkspace(ws.id); }}
                      className="text-gray-600 hover:text-red-400 transition p-0.5"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}

              <div className="border-t border-white/[0.06] mt-1 pt-1">
                {showNewWsForm ? (
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') setShowNewWsForm(false); }}
                      placeholder="Workspace name..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:border-blue-500 placeholder-gray-600 mb-2"
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <button onClick={handleAddWorkspace} className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-semibold rounded-md">Create</button>
                      <button onClick={() => setShowNewWsForm(false)} className="px-2.5 py-1 text-[10px] text-gray-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewWsForm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition"
                  >
                    <Plus size={12} />
                    New workspace
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="mb-1">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Workspace</p>
          {MAIN_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group ${
                isActive(item.href)
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <span className={isActive(item.href) ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 mb-2">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tools</p>
          {TOOLS_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group ${
                isActive(item.href)
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <span className={isActive(item.href) ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              <div className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/20">
                AI
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || ""}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-gray-600 hover:text-red-400 transition p-1 rounded-md hover:bg-red-500/10"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
