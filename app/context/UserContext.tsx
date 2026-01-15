// app/context/UserContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";

// 1. Define the shape of your User Data
type UserData = {
  userId: string;
  username: string;
  email: string | undefined;
  role: string;
};

// 2. Create the Context
const UserContext = createContext<UserData | null>(null);

// 3. Create the Provider Component
export function UserProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: UserData;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 4. Create a custom hook for easy access
export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined || context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
