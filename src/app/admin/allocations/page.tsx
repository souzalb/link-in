import { createClient } from "@/utils/supabase/server";
import { AllocationsClient } from "./AllocationsClient";

export default async function AdminAllocationsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase.from("events").select("id, title").order("date", { ascending: true });
  const { data: allocations } = await supabase
    .from("allocations")
    .select("*, events(title)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Distribuição de Cotas</h1>
        <p className="text-muted-foreground">Gerencie as cotas de alunos e limites de ingressos por evento.</p>
      </div>

      <AllocationsClient events={events || []} allocations={allocations || []} />
    </div>
  );
}
