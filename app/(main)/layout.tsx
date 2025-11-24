// app/(main)/layout.tsx
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserProvider } from "@/app/context/UserContext"; // <--- Import this
import Header from "../components/Header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const userData = {
    userId: user.id,
    email: user.email,
    username: profile?.username || "User", // Fallback if no username set
  };

  return (
    <UserProvider value={userData}>
      <div className="h-16">
        <Header />
      </div>

      <main className="flex-1 bg-bright-snow overflow-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </UserProvider>
  );
}
