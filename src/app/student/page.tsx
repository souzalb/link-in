import { createClient } from "@/utils/supabase/server";
import { StudentDashboard } from "./StudentDashboard";

export default async function StudentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  // Fetch allocations
  const { data: allocations } = await supabase
    .from("allocations")
    .select(`
      id, total_quota, used_quota,
      events (id, title, date)
    `)
    .eq("student_email", user.email);

  // Fetch issued tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id, guest_name, guest_email, status,
      events (title)
    `)
    .eq("allocated_by", user.email)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Sua Cota</h1>
        <p className="text-zinc-400">Gerencie seus convites de eventos e lista de convidados.</p>
      </div>

      <StudentDashboard 
        allocations={allocations as any || []} 
        tickets={tickets as any || []} 
      />
    </div>
  );
}
