"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers3, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Successfully logged in
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0E1015] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
            <Layers3 size={24} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-600 dark:text-gray-500 text-sm mt-1">Sign in to your Voxamo workspace</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-[#171923] rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider pl-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500/50 transition placeholder-gray-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500/50 transition placeholder-gray-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white text-sm font-bold py-2.5 rounded-lg transition shadow-sm dark:shadow-lg shadow-blue-500/20 mt-4"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
            <p className="text-sm text-slate-600 dark:text-gray-500">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
