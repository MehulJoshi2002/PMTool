"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get("invite");

  const [status, setStatus] = useState<"loading" | "accepting" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const acceptInvite = async () => {
      if (!inviteCode) {
        setStatus("error");
        setMessage("No invite code provided.");
        return;
      }

      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        setStatus("error");
        setMessage("You must be logged in to accept an invite. Please sign in and try again.");
        return;
      }

      const userId = session.session.user.id;
      setStatus("accepting");

      try {
        const response = await fetch("/api/invite-accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteCode,
            userId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(result.error || "Failed to accept invite.");
          return;
        }

        setStatus("success");
        setMessage("Invite accepted! You can now access the workspace.");
        setWorkspaceId(result.workspaceId);
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.message || "An error occurred while accepting the invite.");
      }
    };

    acceptInvite();
  }, [inviteCode]);

  return (
    <div className="min-h-screen bg-[#0E1015] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#171923] rounded-3xl border border-white/[0.06] p-8 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 size={48} className="text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Processing Invite</h1>
              <p className="text-gray-400">Preparing your workspace access...</p>
            </>
          )}

          {status === "accepting" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 size={48} className="text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Accepting Invite</h1>
              <p className="text-gray-400">Setting up your workspace membership...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invite Accepted!</h1>
              <p className="text-gray-400 mb-6">{message}</p>
              <Link
                href={workspaceId ? `/?workspace=${encodeURIComponent(workspaceId)}` : "/"}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <AlertTriangle size={48} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invite Error</h1>
              <p className="text-red-200 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Sign In or Sign Up
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-gray-200 transition"
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E1015]" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
