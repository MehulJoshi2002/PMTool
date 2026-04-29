"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layers3, Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash — listen for the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0E1015] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
            <Layers3 size={24} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password</p>
        </div>

        <div className="bg-[#171923] rounded-2xl border border-white/[0.06] shadow-xl p-8">
          {!ready ? (
            <p className="text-center text-gray-400 text-sm py-4">Verifying reset link…</p>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/20 border border-white/[0.08] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500/50 transition placeholder-gray-700"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/20 border border-white/[0.08] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500/50 transition placeholder-gray-700"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg transition shadow-lg shadow-blue-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Update password <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
