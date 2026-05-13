"use client";

import { useState } from "react";
import { bulkAllocate } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Loader2 } from "lucide-react";

export function BulkAllocationForm({ eventId }: { eventId: string }) {
  const [emails, setEmails] = useState("");
  const [quota, setQuota] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await bulkAllocate(eventId, emails, quota);
    setResult(res);
    if (res.success) setEmails("");
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
        <Label htmlFor="emails" className="text-zinc-300">E-mails dos Alunos (um por linha ou separados por vírgula)</Label>
        <Textarea 
          id="emails" 
          required 
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="aluno1@universidade.edu.br&#10;aluno2@universidade.edu.br" 
          className="min-h-[120px] bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quota" className="text-zinc-300">Cota Padrão (ingressos por aluno)</Label>
        <Input 
          id="quota" 
          type="number" 
          min={1} 
          required 
          value={quota}
          onChange={(e) => setQuota(parseInt(e.target.value) || 1)}
          className="bg-black/40 border-white/10 text-white h-12 focus-visible:ring-primary/50"
        />
      </div>

      <Button type="submit" disabled={loading || emails.trim().length === 0} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Users className="w-5 h-5 mr-2" /> Distribuir Cotas</>}
      </Button>
    </form>
  );
}
