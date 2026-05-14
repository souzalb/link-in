"use client";

import { useState, useMemo } from "react";
import { createAllocation } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Ticket, Search, Calendar, Filter, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DashboardClient({ events, allocations }: { events: any[]; allocations: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filters state
  const [searchEmail, setSearchEmail] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createAllocation(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsDialogOpen(false);
    }
    setLoading(false);
  };

  // Metrics calculation
  const totalAllocations = allocations.length;
  const totalQuota = allocations.reduce((sum, alloc) => sum + alloc.total_quota, 0);
  const totalUsed = allocations.reduce((sum, alloc) => sum + alloc.used_quota, 0);

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter((alloc) => {
      const matchEmail = alloc.student_email.toLowerCase().includes(searchEmail.toLowerCase());
      const matchEvent = filterEvent ? alloc.event_id === filterEvent : true;
      
      let matchDate = true;
      if (filterMonth && alloc.events?.date) {
        const allocDate = new Date(alloc.events.date);
        const [year, month] = filterMonth.split("-");
        matchDate = allocDate.getFullYear() === parseInt(year) && (allocDate.getMonth() + 1) === parseInt(month);
      }

      return matchEmail && matchEvent && matchDate;
    });
  }, [allocations, searchEmail, filterEvent, filterMonth]);

  return (
    <div className="space-y-8 pb-12">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-0 rounded-[2rem] overflow-hidden p-6 relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/20 p-3 rounded-xl text-primary">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-zinc-400 font-medium">Alunos Beneficiados</p>
          </div>
          <p className="text-4xl font-bold text-white">{totalAllocations}</p>
        </Card>

        <Card className="glass border-0 rounded-[2rem] overflow-hidden p-6 relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
              <Ticket className="w-6 h-6" />
            </div>
            <p className="text-zinc-400 font-medium">Cotas Distribuídas</p>
          </div>
          <p className="text-4xl font-bold text-white">{totalQuota}</p>
        </Card>

        <Card className="glass border-0 rounded-[2rem] overflow-hidden p-6 relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-500/20 p-3 rounded-xl text-green-400">
              <Ticket className="w-6 h-6" />
            </div>
            <p className="text-zinc-400 font-medium">Ingressos Emitidos</p>
          </div>
          <p className="text-4xl font-bold text-white">{totalUsed}</p>
        </Card>
      </div>

      {/* Main Table Section */}
      <Card className="glass border-0 rounded-[2rem] overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <Input 
                placeholder="Buscar por e-mail..." 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-11 bg-black/40 border-white/10 text-white rounded-xl h-11 w-full"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select 
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="flex h-11 w-full md:w-48 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os Eventos</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              
              <Input 
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-black/40 border-white/10 text-white rounded-xl h-11 w-full md:w-48"
              />
            </div>
          </div>

          {/* New Allocation Modal Trigger */}
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full lg:w-auto shrink-0 shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Distribuição
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="glass border-white/10 rounded-3xl max-w-md p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Nova Cota</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Atribua uma cota de ingressos a um aluno de forma individual.
                </DialogDescription>
              </DialogHeader>
              <form action={handleSubmit} className="space-y-4 pt-4">
                {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertDescription>{error}</AlertDescription></Alert>}
                
                <div className="space-y-2">
                  <Label htmlFor="event_id" className="text-zinc-300">Selecione o Evento</Label>
                  <select 
                    id="event_id" 
                    name="event_id" 
                    required 
                    className="flex h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Escolha um evento --</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student_email" className="text-zinc-300">E-mail do Aluno</Label>
                  <Input id="student_email" name="student_email" type="email" required placeholder="aluno@exemplo.com.br" className="h-12 bg-black/40 border-white/10 text-white rounded-xl px-4" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_quota" className="text-zinc-300">Quantidade de convites a adicionar</Label>
                  <Input id="total_quota" name="total_quota" type="number" min={1} required defaultValue={3} className="h-12 bg-black/40 border-white/10 text-white rounded-xl px-4" />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-6" disabled={loading}>
                  {loading ? "Distribuindo..." : "Criar Cota"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 border-b border-white/5 text-zinc-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Aluno</th>
                <th className="px-6 py-4 font-medium">Evento</th>
                <th className="px-6 py-4 font-medium">Cota</th>
                <th className="px-6 py-4 font-medium text-right">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAllocations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="w-12 h-12 opacity-20 mb-4" />
                      <p>Nenhuma cota encontrada com esses filtros.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredAllocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">{alloc.student_email}</td>
                  <td className="px-6 py-4 text-zinc-400 group-hover:text-zinc-300">{alloc.events?.title || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-zinc-300 font-medium border border-white/5">
                      <Ticket className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      {alloc.used_quota} / {alloc.total_quota}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-500 group-hover:text-zinc-400">
                    {new Date(alloc.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
