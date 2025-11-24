// app/hooks/useLogout.ts
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useLogout() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.refresh(); // Clears the Server Component cache
      router.push("/login"); // Redirects
    } catch (error) {
      console.error("Logout failed", error);
      setLoading(false);
    }
  };

  return { logout, loading };
}
