"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Layers3, Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset password</h1>
          <p className="text-gray-500 text-sm mt-1">We'll send you a reset link</p>
        </div>

        <div className="bg-[#171923] rounded-2xl border border-white/[0.06] shadow-xl p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle size={40} className="text-green-400" />
              <p className="text-white font-semibold">Check your email</p>
              <p className="text-gray-400 text-sm">We sent a reset link to <span className="text-white">{email}</span></p>
              <Link href="/login" className="mt-4 text-blue-400 hover:text-blue-300 text-sm transition">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
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
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send reset link <ArrowRight size={16} /></>}
              </button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-400 transition">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
