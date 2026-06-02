"use client";

import { useState, useEffect } from "react";
import { issueTicket, revokeTicket, returnQuota } from "./actions";
import { dismissWelcomeModal, dismissDeadlineModal } from "../actions/modals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket as TicketIcon, Send, XCircle, CheckCircle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Allocation = {
  id: string;
  total_quota: number;
  used_quota: number;
  retracted_quota?: number;
  has_seen_welcome?: boolean;
  has_seen_deadline_warning?: boolean;
  events: { id: string; title: string; date: string; location?: string; message_template?: string | null; rsvp_deadline_days?: number; };
};

type Ticket = {
  id: string;
  guest_name: string;
  guest_phone: string;
  status: string;
  events: { title: string };
};

export function StudentDashboard({
  allocations,
  tickets,
}: {
  allocations: Allocation[];
  tickets: Ticket[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [ticketToRevoke, setTicketToRevoke] = useState<{ ticketId: string, allocationId: string } | null>(null);
  const [allocationToReturn, setAllocationToReturn] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);

  const [activeWelcomeAlloc, setActiveWelcomeAlloc] = useState<Allocation | null>(null);
  const [activeDeadlineAlloc, setActiveDeadlineAlloc] = useState<Allocation | null>(null);

  useEffect(() => {
    const welcome = allocations.find(a => a.has_seen_welcome === false);
    if (welcome) {
      setActiveWelcomeAlloc(welcome);
    } else {
      const deadline = allocations.find(a => a.has_seen_deadline_warning === false && (a.retracted_quota || 0) > 0);
      if (deadline) {
        setActiveDeadlineAlloc(deadline);
      }
    }
  }, [allocations]);

  const handleDismissWelcome = async () => {
    if (!activeWelcomeAlloc) return;
    setActiveWelcomeAlloc(null);
    await dismissWelcomeModal(activeWelcomeAlloc.id);
    
    const deadline = allocations.find(a => a.has_seen_deadline_warning === false && (a.retracted_quota || 0) > 0);
    if (deadline && deadline.id !== activeWelcomeAlloc.id) {
      setActiveDeadlineAlloc(deadline);
    }
  };

  const handleDismissDeadline = async () => {
    if (!activeDeadlineAlloc) return;
    setActiveDeadlineAlloc(null);
    await dismissDeadlineModal(activeDeadlineAlloc.id);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    e.target.value = value;
  };

  const handleIssue = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const res = await issueTicket(formData);
    if (res?.error) {
      setError(res.error);
    } else if (res?.ticketId) {
      // Find the allocation to get event details
      const allocId = formData.get("allocation_id");
      const allocation = allocations.find(a => a.id === allocId);
      const rawPhone = formData.get("guest_phone") as string;
      
      if (allocation && rawPhone) {
        const phone = `55${rawPhone.replace(/\D/g, '')}`;
        const event = allocation.events;
        const link = `${window.location.origin}/ticket/${res.ticketId}`;
        
        const confirmDate = new Date(event.date);
        const daysToSubtract = event.rsvp_deadline_days ?? 7;
        confirmDate.setDate(confirmDate.getDate() - daysToSubtract);

        const template = event.message_template || `🎉 CONVITE ESPECIAL: MINHA FORMATURA! 🎓

É com muita alegria que convido você para a minha cerimônia de colação de grau. Foram anos de esforço e agora é hora de comemorar essa vitória! 🚀👔

Guarde esta data na agenda:
🗓️ Quando: {{DATA}}
🕗 Horário: {{HORA}}
📍 Onde: {{LOCAL}}

👗 Traje: Esporte Fino

Sua presença é fundamental para tornar esse dia inesquecível. ✨ Confirme se você vai conseguir ir até o dia {{DATA_CONFIRMACAO}}! 👍

🔗 Acesse seu convite pelo link:
{{LINK}}`;

        const message = template
          .replace(/\{\{DATA\}\}/g, new Date(event.date).toLocaleDateString())
          .replace(/\{\{HORA\}\}/g, new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
          .replace(/\{\{LOCAL\}\}/g, event.location || '[Inserir Local]')
          .replace(/\{\{DATA_CONFIRMACAO\}\}/g, confirmDate.toLocaleDateString())
          .replace(/\{\{LINK\}\}/g, link);
        
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }
    }
    setLoading(false);
  };

  const handleRevoke = async () => {
    if (!ticketToRevoke) return;
    const res = await revokeTicket(ticketToRevoke.ticketId, ticketToRevoke.allocationId);
    if (res?.error) setErrorModal(res.error);
    setTicketToRevoke(null);
  };

  const handleReturnQuota = async () => {
    if (!allocationToReturn) return;
    setLoading(true);
    const res = await returnQuota(allocationToReturn);
    if (res?.error) {
      setErrorModal(res.error);
    } else {
      setSuccessModal("Cota devolvida com sucesso!");
    }
    setAllocationToReturn(null);
    setLoading(false);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Allocations Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {allocations.map((alloc) => (
            <Card key={alloc.id} className=" p-0 glass border-0 rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all flex flex-col">
              <CardHeader className="bg-white/5 border-b border-white/5 p-6">
                <CardTitle className="flex justify-between items-center text-xl text-white">
                  <span className="line-clamp-1">{alloc.events.title}</span>
                  <span className="text-xs font-semibold bg-primary/20 px-3 py-1.5 rounded-full text-primary border border-primary/30">
                    {alloc.used_quota} / {alloc.total_quota} Usados
                  </span>
                </CardTitle>
                <div className="flex justify-between items-center mt-2">
                  <CardDescription className="text-zinc-400">{new Date(alloc.events.date).toLocaleDateString()}</CardDescription>
                  {alloc.used_quota < alloc.total_quota && (
                    <button
                      onClick={() => setAllocationToReturn(alloc.id)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Devolver uma cota de convite"
                    >
                      <RotateCcw className="w-3 h-3" /> Devolver Convite
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-6 mt-auto">
                {alloc.used_quota < alloc.total_quota ? (
                  <form action={handleIssue} className="space-y-5">
                    {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertDescription>{error}</AlertDescription></Alert>}
                    <input type="hidden" name="event_id" value={alloc.events.id} />
                    <input type="hidden" name="allocation_id" value={alloc.id} />

                    <div className="space-y-2">
                      <Label htmlFor="guest_name" className="text-zinc-300 ml-1">Nome do Convidado</Label>
                      <Input id="guest_name" name="guest_name" required placeholder="João da Silva" className="bg-black/40 border-white/10 text-white rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest_phone" className="text-zinc-300 ml-1">Telefone do Convidado (WhatsApp)</Label>
                      <Input 
                        id="guest_phone" 
                        name="guest_phone" 
                        type="tel" 
                        required 
                        placeholder="(11) 99999-9999" 
                        onChange={handlePhoneChange}
                        maxLength={15}
                        className="bg-black/40 border-white/10 text-white rounded-xl h-12" 
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2" disabled={loading}>
                      <Send className="w-4 h-4 mr-2" />
                      Emitir Ingresso
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6 text-zinc-500">
                    <TicketIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Você já utilizou toda a sua cota de ingressos para este evento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Issued Tickets */}
        <div className="flex items-center justify-between mt-12 mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">Seus Ingressos Emitidos</h2>
          <span className="text-sm text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            {tickets.length} {tickets.length === 1 ? 'ingresso' : 'ingressos'}
          </span>
        </div>

        {tickets.length === 0 ? (
          <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <TicketIcon className="w-16 h-16 text-zinc-700 mb-4" />
            <p className="text-lg font-semibold text-zinc-400">Nenhum ingresso emitido ainda</p>
            <p className="text-sm text-zinc-500 mt-1">Use os cards acima para emitir convites para seus amigos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const allocation = allocations.find(a => a.events.title === ticket.events.title);

              const statusConfig = {
                issued: { label: "Emitido", icon: TicketIcon, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                checked_in: { label: "Validado", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
                revoked: { label: "Cancelado", icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" },
              }[ticket.status] ?? { label: ticket.status, icon: TicketIcon, color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" };

              const StatusIcon = statusConfig.icon;
              const hasActions = ticket.status === 'issued' && allocation;

              return (
                <div key={ticket.id} className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 text-primary font-bold">
                    {ticket.guest_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Main info — takes all remaining space */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{ticket.guest_name}</div>
                    <div className="text-xs text-zinc-500 truncate mt-0.5">{ticket.guest_phone || 'Sem telefone'}</div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">{ticket.events.title}</div>
                  </div>

                  {/* Right column: badge on top, buttons below (when applicable) */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>

                    {/* Action buttons — only when ticket is actionable */}
                    {hasActions && (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="h-7 px-3 text-xs font-medium text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-white/8 hover:border-primary/20 transition-all"
                          onClick={() => {
                            const url = `${window.location.origin}/ticket/${ticket.id}`;
                            if (navigator.clipboard && window.isSecureContext) {
                              navigator.clipboard.writeText(url);
                            } else {
                              const textArea = document.createElement("textarea");
                              textArea.value = url;
                              textArea.style.position = "fixed";
                              textArea.style.left = "-999999px";
                              textArea.style.top = "-999999px";
                              document.body.appendChild(textArea);
                              textArea.focus();
                              textArea.select();
                              try {
                                document.execCommand('copy');
                              } catch (err) {
                                console.error('Fallback copy failed', err);
                              }
                              document.body.removeChild(textArea);
                            }
                            setSuccessModal("Link copiado! Cole no WhatsApp do seu convidado.");
                          }}
                        >
                          Copiar Link
                        </button>
                        <button
                          className="h-7 px-3 text-xs font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/8 hover:border-red-500/20 transition-all"
                          onClick={() => setTicketToRevoke({ ticketId: ticket.id, allocationId: allocation.id })}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      <AlertDialog open={!!ticketToRevoke} onOpenChange={(open) => !open && setTicketToRevoke(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white">Cancelar Ingresso</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja cancelar este ingresso? O convite será invalidado e o link enviado deixará de funcionar. Sua cota será reembolsada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-11 px-6 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/10">Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="h-11 px-6 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/40 hover:text-white rounded-xl">
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return Quota Confirmation Modal */}
      <AlertDialog open={!!allocationToReturn} onOpenChange={(open) => !open && setAllocationToReturn(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white">Devolver Convite</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja devolver este convite? Você terá um convite a menos para este evento e não poderá emitir ingressos no lugar dele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-11 px-6 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/10" disabled={loading}>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturnQuota} disabled={loading} className="h-11 px-6 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/40 hover:text-white rounded-xl">
              {loading ? "Devolvendo..." : "Sim, Devolver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Modal */}
      <AlertDialog open={!!errorModal} onOpenChange={(open) => !open && setErrorModal(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white">Ops, ocorreu um erro</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {errorModal}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-11 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl border-0">Entendi</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <AlertDialog open={!!successModal} onOpenChange={(open) => !open && setSuccessModal(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" /> Sucesso!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {successModal}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-11 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl border-0">Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Welcome Modal */}
      <AlertDialog open={!!activeWelcomeAlloc} onOpenChange={(open) => !open && handleDismissWelcome()}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white">Bem-vindo(a) ao {activeWelcomeAlloc?.events.title}!</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 space-y-4 pt-2 flex flex-col">
              <span className="block">Você recebeu {activeWelcomeAlloc?.total_quota} convites para distribuir.</span>
              <span className="block">
                <strong>Atenção ao prazo:</strong> Você tem até {activeWelcomeAlloc?.events.rsvp_deadline_days ?? 7} dias antes da data do evento para emitir e enviar os convites aos seus convidados.
              </span>
              <span className="block">
                Os convites não emitidos até a data limite retornarão automaticamente para a organização do evento. Distribua com antecedência!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-11 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl border-0" onClick={handleDismissWelcome}>
              Entendi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deadline Warning Modal */}
      <AlertDialog open={!!activeDeadlineAlloc} onOpenChange={(open) => !open && handleDismissDeadline()}>
        <AlertDialogContent className="glass border-red-500/20 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-500" /> Prazo Encerrado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 space-y-2 pt-2 flex flex-col">
              <span className="block">O prazo para emissão de convites do evento <strong>{activeDeadlineAlloc?.events.title}</strong> terminou.</span>
              <span className="block">Como você não distribuiu todos os seus convites a tempo, <strong>{activeDeadlineAlloc?.retracted_quota} convite(s)</strong> retornaram automaticamente para a organização do evento.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-11 px-6 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl" onClick={handleDismissDeadline}>
              Estou Ciente
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
