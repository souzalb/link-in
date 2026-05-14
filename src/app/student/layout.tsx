import { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import { StudentHeader } from "./StudentHeader";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col w-full relative bg-background">
      {/* Decorative Blur Backgrounds — fixed so they don't expand page width on mobile */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <StudentHeader email={user?.email} />

      {/* pt accounts for fixed header height (≈72px) + island gap (12px/16px) + breathing room */}
      <main className="flex-1 pt-24 px-3 pb-8 sm:pt-28 sm:px-6 md:px-8 z-10 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
