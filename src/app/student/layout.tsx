import { ReactNode } from "react";
import Link from "next/link";
import { Ticket, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col w-full bg-zinc-50/50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-md">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">Portal do Aluno</span>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link href="/student" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Painel Principal
          </Link>
          <div className="h-4 w-px bg-zinc-300 mx-2"></div>
          <span className="text-sm text-zinc-500 truncate max-w-[120px] sm:max-w-[200px]">{user?.email}</span>
          <form action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}>
            <button type="submit" className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </nav>
      </header>
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
