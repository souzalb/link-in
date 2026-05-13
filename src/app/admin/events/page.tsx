import { createClient } from "@/utils/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e formaturas.</p>
        </div>
        <Link href="/admin/events/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Evento
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed rounded-xl">
            <h3 className="text-lg font-semibold text-zinc-900">Nenhum evento encontrado</h3>
            <p className="text-zinc-500 mt-1 mb-4">Comece criando um novo evento.</p>
            <Link href="/admin/events/new" className={buttonVariants({ variant: "outline" })}>Criar Evento</Link>
          </div>
        )}
        
        {events?.map((event) => (
          <Card key={event.id} className="overflow-hidden group hover:shadow-md transition-all">
            <div className="h-32 bg-zinc-200 relative">
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-primary/40" />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(event.date).toLocaleDateString()}
              </CardDescription>
              {event.location && (
                <CardDescription className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">{event.location}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Link href={`/admin/events/${event.id}`} className={buttonVariants({ variant: "secondary", className: "w-full" })}>
                 Gerenciar Evento
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
