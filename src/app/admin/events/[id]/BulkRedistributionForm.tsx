"use client";

import { useState } from "react";
import { bulkRedistribute } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Loader2, Info } from "lucide-react";

export function BulkRedistributionForm({ eventId }: { eventId: string }) {
  const [entries, setEntries] = useState("");
  const [quota, setQuota] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await bulkRedistribute(eventId, entries, quota);
    setResult(res);
    if (res.success) setEntries("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
      {result?.success && (
        <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="redistribute_entries" className="text-zinc-300">
          Alunos — formato: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">email</code> (um por linha)
        </Label>

        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Cada linha deve conter <strong>apenas o e-mail</strong> do aluno. Utilize esta opção se os alunos já tiverem sido cadastrados antes.
            <br />
            Exemplo: <code className="opacity-80">joao.silva@uni.edu.br</code>
          </span>
        </div>

        <Textarea
          id="redistribute_entries"
          required
          value={entries}
          onChange={(e) => setEntries(e.target.value)}
          placeholder={"joao.silva@uni.edu.br\nmaria.souza@uni.edu.br"}
          className="min-h-[140px] bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50 rounded-xl font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="redistribute_quota" className="text-zinc-300">Nova Cota Total (ingressos por aluno)</Label>
        <Input
          id="redistribute_quota"
          type="number"
          min={1}
          required
          value={quota}
          onChange={(e) => setQuota(parseInt(e.target.value) || 1)}
          className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary/50"
        />
      </div>

      <Button type="submit" disabled={loading || entries.trim().length === 0} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Users className="w-5 h-5 mr-2" /> Redistribuir Cotas</>}
      </Button>
    </form>
  );
}
