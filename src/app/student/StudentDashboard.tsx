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
            <Card key={alloc.id} className="border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex justify-between items-center text-lg">
                  <span className="line-clamp-1">{alloc.events.title}</span>
                  <span className="text-sm font-normal bg-white px-3 py-1 rounded-full text-primary border border-primary/20">
                    {alloc.used_quota} / {alloc.total_quota} Usados
                  </span>
                </CardTitle>
                <CardDescription>{new Date(alloc.events.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {alloc.used_quota < alloc.total_quota ? (
                  <form action={handleIssue} className="space-y-4">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    <input type="hidden" name="event_id" value={alloc.events.id} />
                    <input type="hidden" name="allocation_id" value={alloc.id} />
                    
                    <div className="space-y-2">
                      <Label htmlFor="guest_name">Nome do Convidado</Label>
                      <Input id="guest_name" name="guest_name" required placeholder="João da Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest_email">E-mail do Convidado</Label>
                      <Input id="guest_email" name="guest_email" type="email" required placeholder="joao@exemplo.com.br" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
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
        <h2 className="text-2xl font-bold tracking-tight mt-12 mb-4">Seus Ingressos Emitidos</h2>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b text-zinc-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Convidado</th>
                  <th className="px-6 py-4 font-medium">Evento</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Nenhum ingresso emitido ainda.</td>
                  </tr>
                )}
                {tickets.map((ticket) => {
                  const allocation = allocations.find(a => a.events.title === ticket.events.title);
                  return (
                    <tr key={ticket.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900">{ticket.guest_name}</div>
                        <div className="text-zinc-500">{ticket.guest_email}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-700">{ticket.events.title}</td>
                      <td className="px-6 py-4">
                        {ticket.status === 'issued' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><TicketIcon className="w-3.5 h-3.5"/> Emitido</span>}
                        {ticket.status === 'checked_in' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"><CheckCircle className="w-3.5 h-3.5"/> Validado</span>}
                        {ticket.status === 'revoked' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700"><XCircle className="w-3.5 h-3.5"/> Cancelado</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ticket.status === 'issued' && allocation && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                            onClick={() => setTicketToRevoke({ ticketId: ticket.id, allocationId: allocation.id })}
                          >
                            Cancelar
                          </Button>
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
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Ingresso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este ingresso? O convite será invalidado e o link enviado deixará de funcionar. Sua cota será reembolsada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Modal */}
      <AlertDialog open={!!errorModal} onOpenChange={(open) => !open && setErrorModal(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Ops, ocorreu um erro</AlertDialogTitle>
            <AlertDialogDescription>
              {errorModal}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-primary hover:bg-primary/90 text-white rounded-xl border-0">Entendi</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
