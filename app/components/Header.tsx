// components/Header.tsx
"use client";

import Image from "next/image";
import { useUser } from "@/app/context/UserContext";
import {
  Home,
  Layers,
  LogOut as LogOutIcon,
  Menu,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLogout } from "../utils/hooks/useLogout";

const menuItems = [
  { name: "Home", icon: <Home size={20} />, route: "/" },
  { name: "Cart", icon: <ShoppingCart size={20} />, route: "/" },
  { name: "Retailers", icon: <Users size={20} />, route: "/retailers" },
  { name: "Orders", icon: <Package size={20} />, route: "/" },
  { name: "Stock", icon: <Layers size={20} />, route: "/" },
];

export default function Header() {
  const { username } = useUser();
  const { logout } = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* --- Top Header Bar --- */}
      <header className="flex items-center justify-between h-full px-6 bg-shadow-grey relative z-50">
        <Image
          src={"/logo-white.png"}
          alt="logo"
          width={1000}
          height={1000}
          className="w-32 h-auto object-contain"
        />

        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={30} className="text-platinum" />
        </div>
      </header>

      {/* --- NEW: Overlay / Backdrop --- 
          - top-16: Starts below the header
          - inset-0: Covers the rest of the screen
          - invisible: Hides it from mouse events when closed
      */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`
          fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300
          ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* --- Sidebar Panel --- */}
      <div
        className={`
        fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] 
        bg-shadow-grey border-l border-gunmetal shadow-2xl
        transition-all duration-300 ease-in-out overflow-hidden flex flex-col
        ${isSidebarOpen ? "w-64" : "w-0"}
      `}
      >
        <div className="min-w-[16rem] flex flex-col h-full">
          <div className="px-6 py-6 border-b border-gunmetal flex items-center justify-between">
            <h2 className="text-platinum font-semibold tracking-wider text-md">
              Hi, {username}
            </h2>
          </div>

          {/* --- Navigation Items --- */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.route}
                    className="
                  group flex items-center gap-3 px-4 py-3 rounded-lg
                  text-pale-slate transition-all duration-200
                  hover:bg-gunmetal hover:text-white hover:shadow-md
                  active:bg-iron-grey
                "
                  >
                    {/* Icon color changes on group hover */}
                    <span className="text-slate-grey group-hover:text-platinum transition-colors">
                      {item.icon}
                    </span>
                    <span className="font-medium tracking-wide">
                      {item.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- Footer / User Section --- */}
          <div className="p-4 border-t border-gunmetal bg-shadow-grey">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900/50 text-red-200 hover:bg-red-900/70 transition-all cursor-pointer"
            >
              <LogOutIcon size={20} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
