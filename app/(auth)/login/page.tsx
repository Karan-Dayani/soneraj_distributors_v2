"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { createClient } from "@/app/utils/supabase/client";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/app/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  // const supabase = createClient();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Lookup Email
      const { data, error: rpcError } = await supabase.rpc(
        "get_email_from_username",
        { p_username: username }
      );

      const emailData = data as { email: string } | null;

      if (rpcError) throw rpcError;
      if (!emailData || !emailData.email) throw new Error("User not found");

      const userEmail = emailData.email;

      // 2. Login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authError) throw authError;

      router.refresh();
      router.push("/");
    } catch (err) {
      console.log(err); // Good for debugging
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center font-sans px-4">
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-lg border border-platinum p-8">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-black.png"
            alt="Logo"
            width={1000}
            height={1000}
            loading="eager"
            className="w-60 h-auto object-contain"
          />
        </div>

        <form className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-gunmetal mb-8">
            Admin Login
          </h2>

          {error && (
            <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-iron-grey">
              Username
            </label>
            <input
              type="text"
              className="w-full px-0 py-2 bg-transparent border-b-2 border-pale-slate text-shadow-grey placeholder-pale-slate-2 focus:outline-none focus:border-gunmetal transition-colors"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-iron-grey">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-0 py-2 bg-transparent border-b-2 border-pale-slate text-shadow-grey placeholder-pale-slate-2 focus:outline-none focus:border-gunmetal transition-colors pr-10"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-2 text-slate-grey hover:text-gunmetal"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-gunmetal hover:bg-shadow-grey text-white rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
            disabled={loading}
            onClick={(e) => handleLogin(e)}
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="https://karan-dayani.vercel.app/"
            target="_blank"
            className="text-xs text-slate-grey hover:underline"
          >
            Software made by Karan Dayani
          </a>
        </div>
      </div>
    </div>
  );
}
