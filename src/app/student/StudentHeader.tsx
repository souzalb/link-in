"use client";

import Link from "next/link";
import { Ticket, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function StudentHeader({ email }: { email: string | null | undefined }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    /* Outer wrapper: fixed to viewport, full-width, pointer-events-none so content underneath is clickable */
    <div className="fixed top-0 inset-x-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 pointer-events-none">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass border border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] pointer-events-auto w-full"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-primary p-1.5 sm:p-2 rounded-xl shadow-lg shadow-primary/30 shrink-0">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-base sm:text-xl tracking-tight text-white hidden sm:inline-block">
            Link-in
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/student"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Meu Painel</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white leading-tight">Aluno</span>
              <span className="text-xs text-zinc-400 truncate max-w-[140px]">{email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">
                {email ? email.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sair da plataforma"
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </nav>
      </motion.header>
    </div>
  );
}
