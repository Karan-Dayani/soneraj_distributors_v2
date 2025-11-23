import { createClient } from "@/app/utils/supabase/server";
import LogoutButton from "@/app/components/LogoutButton";

export default async function Home() {
  const supabase = await createClient();

  // Get the User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should not happen because middleware protects it,
    // but TS might complain if we don't check.
    return <div>Please log in</div>;
  }

  // Get the Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen p-10 bg-bright-snow">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold">
            {/* TypeScript knows 'username' exists here! */}
            Welcome back, {profile?.username}!
          </h2>
        </div>
      </div>
    </div>
  );
}
