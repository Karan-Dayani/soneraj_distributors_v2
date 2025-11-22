"use client";

import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Clear data
    router.push("/login"); // Redirect
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
    >
      Log Out
    </button>
  );
}
