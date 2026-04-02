"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearCurrentUserScope, saveCurrentUserScope } from "@/lib/user-scope";

export function AuthStorageSync() {
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    async function syncCurrentUser() {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled || error) return;

      if (!data.user) {
        clearCurrentUserScope();
        return;
      }

      saveCurrentUserScope({
        id: data.user.id,
        email: data.user.email ?? "",
        fullName: (data.user.user_metadata?.full_name as string | undefined) ?? ""
      });
    }

    void syncCurrentUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        clearCurrentUserScope();
        return;
      }

      saveCurrentUserScope({
        id: session.user.id,
        email: session.user.email ?? "",
        fullName: (session.user.user_metadata?.full_name as string | undefined) ?? ""
      });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
