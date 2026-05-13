import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BulkAllocationForm } from "./BulkAllocationForm";
import Link from "next/link";
import { ArrowLeft, Ticket, Users, Calendar, MapPin, CheckCircle } from "lucide-react";

import { DeleteEventButton } from "./DeleteEventButton";

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      allocations (
        total_quota,
        used_quota
      ),
      tickets (
        status
      )
    `)
    .eq("id", id)
    .single();

  if (error || !event) {
    console.error("Supabase Error on Event Query:", error);
    return (
      <div className="p-8 text-white">
        <h2>Error Loading Event</h2>
        <p>ID: {id}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        <p>{!event ? "Event not found in DB." : ""}</p>
      </div>
    );
  }

  // Calculate stats safely
  const totalAllocatedQuota = (event.allocations || []).reduce((sum: number, alloc: any) => sum + alloc.total_quota, 0);
  const totalIssuedTickets = (event.allocations || []).reduce((sum: number, alloc: any) => sum + alloc.used_quota, 0);
  const totalCheckedIn = (event.tickets || []).filter((t: any) => t.status === 'checked_in').length;
  
  const issuePercentage = totalAllocatedQuota > 0 ? Math.round((totalIssuedTickets / totalAllocatedQuota) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/admin/events" className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Eventos
        </Link>
        <DeleteEventButton eventId={id} />
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Event Details & Bulk Action */}
        <div className="flex-1 space-y-8 w-full">
          <Card className="glass border-0 rounded-[2rem] overflow-hidden">
            <div className="h-48 bg-black/40 relative">
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center">
                   <Calendar className="w-16 h-16 text-white/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="text-3xl text-white">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2 text-zinc-400">
                <Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleString('pt-BR')}
              </CardDescription>
              {event.location && (
                <CardDescription className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4" /> {event.location}
                </CardDescription>
              )}
              {event.description && <p className="mt-4 text-zinc-300">{event.description}</p>}
            </CardHeader>
          </Card>

          <Card className="glass border-0 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Cadastramento em Massa
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Cadastre alunos e atribua cotas instantaneamente. Eles podem acessar com seus e-mails e a senha padrão: <strong>linkin_default_2026</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <BulkAllocationForm eventId={event.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats */}
        <div className="w-full md:w-80 space-y-6">
          <Card className="glass border-0 rounded-[2rem] overflow-hidden p-6 relative">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-2xl rounded-full"></div>
             <h3 className="text-lg font-semibold text-white mb-6">Estatísticas de Distribuição</h3>
             
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400 flex items-center gap-1"><Ticket className="w-4 h-4"/> Emitidos / Cota Total</span>
                    <span className="text-white font-medium">{totalIssuedTickets} / {totalAllocatedQuota}</span>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${issuePercentage}%` }}></div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="bg-green-500/20 p-3 rounded-xl text-green-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Entradas Validadas</p>
                    <p className="text-2xl font-bold text-white">{totalCheckedIn}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total de Alunos</p>
                    <p className="text-2xl font-bold text-white">{(event.allocations || []).length}</p>
                  </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
