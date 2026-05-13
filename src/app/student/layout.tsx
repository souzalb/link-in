import { ReactNode } from "react";
import Link from "next/link";
import { Ticket, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col w-full relative overflow-hidden bg-background">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20 m-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30">
            <Ticket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white hidden sm:inline-block">Link-in</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/student" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Meu Painel</span>
          </Link>
          <div className="h-4 w-px bg-white/10"></div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-white">Aluno</span>
              <span className="text-xs text-zinc-400 truncate max-w-[150px]">{user?.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
              <span className="text-primary font-bold text-xs">
                {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            
            <form action={async () => {
              "use server";
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect("/login");
            }}>
              <button type="submit" title="Sair da plataforma" className="ml-2 p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 shrink-0">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </nav>
      </header>
      
      <main className="flex-1 p-4 md:p-8 z-10 relative overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
