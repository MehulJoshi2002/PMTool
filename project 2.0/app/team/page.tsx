"use client";

import React, { useEffect, useState } from "react";
import { Users, Plus, Loader2, AlertTriangle, Trash2, Copy, Check } from "lucide-react";
import { useAppContext } from "../../lib/AppContext";
import { supabase } from "../../lib/supabase";
import { useWorkspaceMembers } from "../../lib/useWorkspaceMembers";

interface Invite {
  id: string;
  email: string;
  status: string;
  invited_at: string;
  invite_code: string;
}

interface CurrentUser {
  email: string;
  name: string;
}

export default function TeamPage() {
  const { activeWorkspaceId } = useAppContext();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const { members, loading: loadingMembers } = useWorkspaceMembers(activeWorkspaceId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (invite: Invite) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const link = `${appUrl}/accept-invite?invite=${encodeURIComponent(invite.invite_code)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const email = data.session.user.email || "unknown@example.com";
        const name = (data.session.user.user_metadata as any)?.full_name || email.split('@')[0];
        setCurrentUser({ email, name });
      }
      if (error) {
        console.warn("Unable to load session:", error.message);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    const loadInvites = async () => {
      setLoadingInvites(true);
      setInviteError(null);

      const response = await fetch(`/api/invites?workspaceId=${encodeURIComponent(activeWorkspaceId)}`);
      if (!response.ok) {
        setInviteError("Failed to load invites for this workspace.");
        setLoadingInvites(false);
        return;
      }

      const data = await response.json();
      setInvites(data.invites || []);
      setLoadingInvites(false);
    };

    loadInvites();
  }, [activeWorkspaceId]);

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const response = await fetch('/api/invites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      if (response.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      }
    } catch (error: any) {
      console.error('Failed to delete invite:', error?.message);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !activeWorkspaceId) return;

    setInviting(true);
    setInviteError(null);

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: activeWorkspaceId,
          email: inviteEmail,
          inviterEmail: currentUser?.email,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setInviteError(result.error || 'Could not send invite.');
        return;
      }

      setInvites((prev) => [result.invite, ...prev]);
      setInviteEmail('');
    } catch (error: any) {
      setInviteError(error?.message || 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1015] text-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-gray-400">Manage team members and invitations for this workspace.</p>
        </div>

        <div className="grid gap-6">
          {/* Current Members */}
          <div className="bg-[#171923] rounded-3xl border border-white/[0.06] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Team Members</h2>
                <p className="text-sm text-gray-500">Active members in this workspace.</p>
              </div>
              <div className="rounded-full bg-[#111423] px-3 py-2 text-xs uppercase tracking-[0.15em] text-gray-400">
                {loadingMembers ? 'Loading' : `${members.length} member${members.length === 1 ? '' : 's'}`}
              </div>
            </div>

            {loadingMembers ? (
              <div className="rounded-3xl border border-white/[0.06] bg-black/20 px-6 py-10 text-center text-sm text-gray-400">Loading members…</div>
            ) : members.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/[0.08] bg-black/20 px-6 py-10 text-center text-sm text-gray-500">
                No team members yet. Invites accepted will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex flex-col gap-3 rounded-3xl border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Users size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.user_email}</p>
                        <p className="text-xs text-gray-500">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-300">
                      {member.role}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite New Member */}
          <div className="bg-[#171923] rounded-3xl border border-white/[0.06] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Invite New Member</h2>
                <p className="text-sm text-gray-500">Send a workspace invitation by email.</p>
              </div>
              {currentUser ? (
                <div className="flex items-center gap-2 rounded-full bg-[#111423] px-4 py-2 text-sm text-gray-300">
                  <Users size={16} />
                  Signed in as {currentUser.email}
                </div>
              ) : (
                <div className="rounded-full bg-[#111423] px-4 py-2 text-sm text-gray-400">No authenticated user detected</div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {inviting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {inviting ? 'Sending' : 'Send invite'}
              </button>
            </div>

            {inviteError && (
              <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                <AlertTriangle size={16} className="inline-block mr-2 align-text-bottom" />
                {inviteError}
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500">
              Invites are sent via email with a link to accept and join the workspace.
            </p>
          </div>

          {/* Pending Invitations */}
          <div className="bg-[#171923] rounded-3xl border border-white/[0.06] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Pending Invitations</h2>
                <p className="text-sm text-gray-500">Invites waiting to be accepted.</p>
              </div>
              <div className="rounded-full bg-[#111423] px-3 py-2 text-xs uppercase tracking-[0.15em] text-gray-400">
                {loadingInvites ? 'Loading' : `${invites.filter(i => i.status === 'pending').length} pending`}
              </div>
            </div>

            {loadingInvites ? (
              <div className="rounded-3xl border border-white/[0.06] bg-black/20 px-6 py-10 text-center text-sm text-gray-400">Loading invites…</div>
            ) : invites.filter(i => i.status === 'pending').length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/[0.08] bg-black/20 px-6 py-10 text-center text-sm text-gray-500">
                No pending invites.
              </div>
            ) : (
              <div className="space-y-4">
                {invites.filter(i => i.status === 'pending').map((invite) => (
                  <div key={invite.id} className="flex flex-col gap-3 rounded-3xl border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{invite.email}</p>
                      <p className="text-xs text-gray-500">Sent {new Date(invite.invited_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
                        <div className="w-2 h-2 rounded-full bg-amber-300" />
                        Pending
                      </div>
                      <button
                        onClick={() => handleCopyLink(invite)}
                        title="Copy invite link"
                        className="p-2 rounded-xl text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 transition"
                      >
                        {copiedId === invite.id ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => handleDeleteInvite(invite.id)}
                        title="Cancel invite"
                        className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
