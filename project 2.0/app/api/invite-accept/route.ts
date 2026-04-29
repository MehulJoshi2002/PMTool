import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inviteCode = String(body.inviteCode || "").trim();
    const userId = String(body.userId || "").trim();

    if (!inviteCode || !userId) {
      return NextResponse.json(
        { error: "inviteCode and userId are required" },
        { status: 400 }
      );
    }

    // Find the invite
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("workspace_invitations")
      .select("id, workspace_id, email, status")
      .eq("invite_code", inviteCode)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invite not found or already used" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: `Invite is ${invite.status}` },
        { status: 400 }
      );
    }

    // Get the user's email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData.user?.email) {
      return NextResponse.json(
        { error: "Unable to fetch user email" },
        { status: 400 }
      );
    }

    const userEmail = userData.user.email.toLowerCase();
    if (userEmail !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Invite email does not match your account email" },
        { status: 403 }
      );
    }

    // Create workspace member record
    const { error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .insert({
        workspace_id: invite.workspace_id,
        user_id: userId,
        user_email: userEmail,
        role: "member",
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      );
    }

    // Mark invite as accepted
    const { error: updateError } = await supabaseAdmin
      .from("workspace_invitations")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    if (updateError) {
      console.warn("Failed to update invite status:", updateError.message);
    }

    return NextResponse.json({
      success: true,
      workspaceId: invite.workspace_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
