import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("workspace_invitations")
    .select("id, email, status, invited_at, invite_code")
    .eq("workspace_id", workspaceId)
    .order("invited_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invites: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const workspaceId = String(body.workspaceId || "").trim();
    const inviterEmail = typeof body.inviterEmail === "string" ? body.inviterEmail.trim() : null;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const code = crypto.randomUUID();

    const { data, error } = await supabaseAdmin
      .from("workspace_invitations")
      .insert({
        workspace_id: workspaceId,
        email,
        status: "pending",
        invited_at: new Date().toISOString(),
        invite_code: code,
        inviter_email: inviterEmail,
      })
      .select("id, email, status, invited_at, invite_code")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (RESEND_API_KEY) {
      const inviteUrl = `${APP_URL}/accept-invite?invite=${encodeURIComponent(code)}`;
      const message = {
        from: "noreply@biorx.in",
        to: email,
        subject: "Join your Voxamo workspace",
        html: `<p>Hello,</p><p>You have been invited to join a Voxamo workspace.</p><p><a href="${inviteUrl}" style="color:#6366f1;font-weight:bold;text-decoration:none;">Click here to join</a></p><p>If you don't have an account yet, sign up first and then return to this link.</p>`,
      };

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn("Resend email failed:", text);
      }
    }

    return NextResponse.json({ invite: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const inviteId = String(body.inviteId || "").trim();

    if (!inviteId) {
      return NextResponse.json({ error: "inviteId is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("workspace_invitations")
      .delete()
      .eq("id", inviteId)
      .eq("status", "pending");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
