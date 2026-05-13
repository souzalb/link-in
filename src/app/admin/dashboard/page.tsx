import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: events } = await supabase.from("events").select("id, title, date").order("date", { ascending: true });
  const { data: allocations } = await supabase
    .from("allocations")
    .select("*, events(title, date)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-400">Visão geral, distribuição de cotas e métricas do sistema.</p>
      </div>

      <DashboardClient events={events || []} allocations={allocations || []} />
    </div>
  );
}
