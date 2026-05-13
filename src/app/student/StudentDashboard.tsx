"use client";

import { useState } from "react";
import { issueTicket, revokeTicket } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket as TicketIcon, Send, XCircle, CheckCircle } from "lucide-react";
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
  events: { id: string; title: string; date: string };
};

type Ticket = {
  id: string;
  guest_name: string;
  guest_email: string;
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
  const [ticketToRevoke, setTicketToRevoke] = useState<{ticketId: string, allocationId: string} | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);

  const handleIssue = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const res = await issueTicket(formData);
    if (res?.error) setError(res.error);
    setLoading(false);
  };

  const handleRevoke = async () => {
    if (!ticketToRevoke) return;
    const res = await revokeTicket(ticketToRevoke.ticketId, ticketToRevoke.allocationId);
    if (res?.error) setErrorModal(res.error);
    setTicketToRevoke(null);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Allocations Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {allocations.map((alloc) => (
            <Card key={alloc.id} className="glass border-0 rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all flex flex-col">
              <CardHeader className="bg-white/5 border-b border-white/5 pb-6">
                <CardTitle className="flex justify-between items-center text-xl text-white">
                  <span className="line-clamp-1">{alloc.events.title}</span>
                  <span className="text-xs font-semibold bg-primary/20 px-3 py-1.5 rounded-full text-primary border border-primary/30">
                    {alloc.used_quota} / {alloc.total_quota} Usados
                  </span>
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-2">{new Date(alloc.events.date).toLocaleDateString()}</CardDescription>
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
                      <Label htmlFor="guest_email" className="text-zinc-300 ml-1">E-mail do Convidado</Label>
                      <Input id="guest_email" name="guest_email" type="email" required placeholder="joao@exemplo.com.br" className="bg-black/40 border-white/10 text-white rounded-xl h-12" />
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
        <h2 className="text-2xl font-bold tracking-tight text-white mt-12 mb-6">Seus Ingressos Emitidos</h2>
        <div className="glass rounded-[2rem] border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 border-b border-white/5 text-zinc-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-medium">Convidado</th>
                  <th className="px-6 py-5 font-medium">Evento</th>
                  <th className="px-6 py-5 font-medium">Status</th>
                  <th className="px-6 py-5 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">Nenhum ingresso emitido ainda.</td>
                  </tr>
                )}
                {tickets.map((ticket) => {
                  const allocation = allocations.find(a => a.events.title === ticket.events.title);
                  return (
                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{ticket.guest_name}</div>
                        <div className="text-zinc-400 mt-1">{ticket.guest_email}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{ticket.events.title}</td>
                      <td className="px-6 py-4">
                        {ticket.status === 'issued' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30"><TicketIcon className="w-3.5 h-3.5"/> Emitido</span>}
                        {ticket.status === 'checked_in' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle className="w-3.5 h-3.5"/> Validado</span>}
                        {ticket.status === 'revoked' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30"><XCircle className="w-3.5 h-3.5"/> Cancelado</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ticket.status === 'issued' && allocation && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl" 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/ticket/${ticket.id}`);
                                setSuccessModal("Link do ingresso copiado com sucesso! Agora é só colar no WhatsApp do seu convidado.");
                              }}
                            >
                              Copiar Link
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl" 
                              onClick={() => setTicketToRevoke({ ticketId: ticket.id, allocationId: allocation.id })}
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      <AlertDialog open={!!ticketToRevoke} onOpenChange={(open) => !open && setTicketToRevoke(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl p-8">
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

      {/* Error Modal */}
      <AlertDialog open={!!errorModal} onOpenChange={(open) => !open && setErrorModal(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl p-8">
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
        <AlertDialogContent className="glass border-white/10 rounded-3xl p-8">
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
    </>
  );
}
