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
          <h1 className="text-3xl font-bold tracking-tight text-white">Eventos</h1>
          <p className="text-zinc-400">Gerencie seus eventos e formaturas.</p>
        </div>
        <Link href="/admin/events/new" className={buttonVariants({ className: "h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]" })}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Evento
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 && (
          <div className="col-span-full py-16 text-center glass border border-white/10 rounded-3xl">
            <h3 className="text-xl font-semibold text-white">Nenhum evento encontrado</h3>
            <p className="text-zinc-400 mt-2 mb-6">Comece criando um novo evento na plataforma.</p>
            <Link href="/admin/events/new" className={buttonVariants({ variant: "outline", className: "h-11 px-6 rounded-xl border-white/10 text-white hover:bg-white/10" })}>Criar Evento</Link>
          </div>
        )}
        
        {events?.map((event) => (
          <Card key={event.id} className="overflow-hidden group glass border-0 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/[0.04] transition-all duration-300 flex flex-col">
            <div className="h-48 bg-black/40 relative">
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-primary/40" />
                </div>
              )}
            </div>
            <CardHeader className="p-6">
              <CardTitle className="text-xl line-clamp-1 text-white">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-2 text-zinc-400">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString()}
              </CardDescription>
              {event.location && (
                <CardDescription className="flex items-center gap-1.5 text-zinc-400 mt-1">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{event.location}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-6 pt-0 mt-auto">
              <Link href={`/admin/events/${event.id}`} className={buttonVariants({ variant: "secondary", className: "w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white border-0 transition-colors" })}>
                 Gerenciar Evento
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
