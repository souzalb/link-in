import { createClient } from "@/utils/supabase/server";
import { StudentDashboard } from "./StudentDashboard";
import { enforceEventDeadline } from "@/app/actions/retraction";

export default async function StudentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  // Get event IDs to enforce deadlines
  const { data: initialAllocations } = await supabase
    .from("allocations")
    .select("event_id")
    .eq("student_email", user.email);

  if (initialAllocations && initialAllocations.length > 0) {
    const eventIds = Array.from(new Set(initialAllocations.map(a => a.event_id)));
    for (const eid of eventIds) {
      await enforceEventDeadline(eid);
    }
  }

  // Fetch final allocations with flags
  const { data: allocations } = await supabase
    .from("allocations")
    .select(`
      id, total_quota, used_quota, retracted_quota, has_seen_welcome, has_seen_deadline_warning,
      events (id, title, date, location, message_template, rsvp_deadline_days)
    `)
    .eq("student_email", user.email);

  // Fetch issued tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id, guest_name, guest_phone, status,
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
