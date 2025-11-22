"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Lookup Email
      const { data: emailData, error: rpcError } = await supabase.rpc(
        "get_email_from_username",
        { p_username: username }
      );

      if (rpcError) throw rpcError;
      if (!emailData || emailData.length === 0)
        throw new Error("User not found");

      const userEmail = emailData[0].email;

      // 2. Login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authError) throw authError;

      router.refresh();
      router.push("/");
    } catch (err) {
      console.error(err); // Good for debugging
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md p-8 bg-white rounded shadow"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">
          Restricted Access
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold">Username</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold">Password</label>
          <input
            type="password"
            required
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full p-2 text-white bg-black rounded disabled:bg-gray-500"
        >
          {loading ? "Checking..." : "Login"}
        </button>
      </form>
    </div>
  );
}
