"use client";

import { useState } from "react";
import { singleAllocate } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, Loader2 } from "lucide-react";

export function SingleAllocationForm({ eventId }: { eventId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const cpfPrefix = formData.get("cpfPrefix") as string;
    const additionalQuota = parseInt(formData.get("additionalQuota") as string || "1", 10);

    const res = await singleAllocate(eventId, email.toLowerCase().trim(), cpfPrefix.trim(), additionalQuota);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.message || "Convites alocados com sucesso.");
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-500/10 border-green-500/20 text-green-400">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="single_email" className="text-zinc-300 ml-1 text-xs">E-mail do Aluno</Label>
          <Input 
            id="single_email" 
            name="email" 
            type="email" 
            required 
            placeholder="aluno@email.com" 
            className="bg-black/40 border-white/10 text-white h-10 rounded-xl" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="single_cpf" className="text-zinc-300 ml-1 text-xs">Prefixo do CPF (6 díg.)</Label>
            <Input 
              id="single_cpf" 
              name="cpfPrefix" 
              type="text" 
              required 
              maxLength={6}
              pattern="\d{6}"
              placeholder="123456" 
              className="bg-black/40 border-white/10 text-white h-10 rounded-xl" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalQuota" className="text-zinc-300 ml-1 text-xs">Adicionar (+)</Label>
            <Input 
              id="additionalQuota" 
              name="additionalQuota" 
              type="number" 
              min="1" 
              required 
              defaultValue="1" 
              className="bg-black/40 border-white/10 text-white h-10 rounded-xl" 
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2 mt-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
        {loading ? "Processando..." : "Distribuir Convites Extras"}
      </Button>
    </form>
  );
}
