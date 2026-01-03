// app/(main)/layout.tsx
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserProvider } from "@/app/context/UserContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import QueryProvider from "../components/QueryProvider";
import { ToastProvider } from "../context/ToastContext";

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
    username: profile?.username || "User",
  };

  return (
    <UserProvider value={userData}>
      <CartProvider>
        <ToastProvider>
          <QueryProvider>
            <div className="h-12">
              <Header />
            </div>

            <main className="flex-1 bg-bright-snow overflow-auto h-[calc(100vh-3rem)] no-scrollbar">
              {children}
            </main>
          </QueryProvider>
        </ToastProvider>
      </CartProvider>
    </UserProvider>
  );
}
