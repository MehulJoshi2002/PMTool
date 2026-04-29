import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface WorkspaceMember {
  id: string;
  user_id: string;
  workspace_id: string;
  user_email: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export function useWorkspaceMembers(workspaceId: string | null) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const loadMembers = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("workspace_members")
        .select("id, user_id, workspace_id, user_email, role, joined_at")
        .eq("workspace_id", workspaceId)
        .order("joined_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setMembers([]);
      } else {
        setMembers((data as WorkspaceMember[]) || []);
      }

      setLoading(false);
    };

    loadMembers();
  }, [workspaceId]);

  return { members, loading, error };
}
