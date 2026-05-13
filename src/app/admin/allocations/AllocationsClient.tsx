"use client";

import { useState } from "react";
import { createAllocation } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AllocationsClient({ events, allocations }: { events: any[]; allocations: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createAllocation(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3 items-start">
      <Card className="lg:col-span-1 shadow-sm border-0 ring-1 ring-black/5">
        <CardHeader>
          <CardTitle>Nova Cota</CardTitle>
          <CardDescription>Atribua uma cota de ingressos a um aluno.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            
            <div className="space-y-2">
              <Label htmlFor="event_id">Selecione o Evento</Label>
              <select 
                id="event_id" 
                name="event_id" 
                required 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Escolha um evento --</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_email">E-mail do Aluno</Label>
              <Input id="student_email" name="student_email" type="email" required placeholder="student@university.edu" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_quota">Cota Total de Ingressos</Label>
              <Input id="total_quota" name="total_quota" type="number" min={1} required defaultValue={10} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Distribuindo..." : "Criar Cota"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b text-zinc-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Aluno</th>
                <th className="px-6 py-4 font-medium">Evento</th>
                <th className="px-6 py-4 font-medium">Cota</th>
                <th className="px-6 py-4 font-medium text-right">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {allocations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Nenhuma cota distribuída ainda.</td>
                </tr>
              )}
              {allocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4 font-medium text-zinc-900">{alloc.student_email}</td>
                  <td className="px-6 py-4 text-zinc-700">{alloc.events.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 rounded bg-zinc-100 text-zinc-700 font-medium">
                      {alloc.used_quota} / {alloc.total_quota}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-500">
                    {new Date(alloc.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
