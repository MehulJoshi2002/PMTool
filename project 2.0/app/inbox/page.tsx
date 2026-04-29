"use client";

import React, { useState } from "react";
import { useAppContext } from "../../lib/AppContext";
import { Inbox, Plus, ArrowRight, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const router = useRouter();
  const { ideas, addIdea, convertIdeaToFeature, releases } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    addIdea(title.trim(), description.trim(), author.trim() || "Anonymous");
    setTitle("");
    setDescription("");
    setAuthor("");
    setShowAddForm(false);
  };

  const handleConvert = (ideaId: string) => {
    const defaultReleaseId = releases[0]?.id;
    if (!defaultReleaseId) {
      alert("You need at least one release to add features.");
      return;
    }
    convertIdeaToFeature(ideaId, defaultReleaseId);
    // Optionally redirect to features board to see it
    // router.push("/features");
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Inbox size={20} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ideas Inbox</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Capture feedback from sales, support, and customers.</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-semibold shadow-lg shadow-pink-500/20 transition"
        >
          <Plus size={16} />
          Log Feedback
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 bg-[#171923] border border-white/[0.08] p-6 rounded-2xl max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Log New Feedback</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Issue / Idea Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Users want an export to CSV option"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-pink-500/50 transition"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Details & Context</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide specific details about what they asked for and why..."
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-pink-500/50 transition resize-y"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requested By (Optional)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Sarah from Sales, or Acme Corp"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-pink-500/50 transition"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold rounded-lg transition"
              >
                Save to Inbox
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ideas List */}
      <div className="space-y-4 max-w-4xl">
        {ideas.length === 0 && !showAddForm && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.05] rounded-3xl">
            <Inbox size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">Inbox is zero</h3>
            <p className="text-gray-500 mt-2 text-center max-w-sm">No pending feedback or ideas. Click "Log Feedback" to record customer requests.</p>
          </div>
        )}

        {ideas.map((idea) => (
          <div key={idea.id} className="bg-[#171923] border border-white/[0.08] rounded-2xl p-6 group hover:border-white/[0.15] transition flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-2">{idea.title}</h3>
              <p className="text-sm text-gray-400 mb-4 whitespace-pre-wrap">{idea.description}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><User size={14} /> {idea.author}</span>
                <span>Logged on {idea.createdAt}</span>
              </div>
            </div>
            
            <div className="shrink-0 flex items-center justify-center h-full">
              <button
                onClick={() => handleConvert(idea.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition whitespace-nowrap"
              >
                Convert to Feature
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
