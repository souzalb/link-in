"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, LogOut, Calendar, Users, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItems = [
    { href: "/admin/events", icon: Calendar, label: "Eventos" },
    { href: "/admin/dashboard", icon: Users, label: "Dashboard" },
  ];

  return (
    <div className="h-screen flex w-full relative overflow-hidden bg-background">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <aside className="w-72 border-r border-white/10 glass flex flex-col z-10 m-4 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/30">
            <Ticket className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">Link-in</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="relative block">
                {isActive && (
                  <motion.div
                    layoutId="admin-active-nav"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-200 z-10 ${isActive ? "text-primary" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"}`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 m-4 bg-white/5 rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">Administrador</span>
              <span className="text-xs text-zinc-400 truncate w-28">{userEmail || "Carregando..."}</span>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            title="Sair da plataforma"
            className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
