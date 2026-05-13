"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ticket, MailCheck } from "lucide-react";

export function TicketLogin({ ticketId }: { ticketId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/ticket/${ticketId}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <Card className="w-full max-w-sm mx-auto border-0 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-xl text-center p-6">
        <CardContent className="pt-6 space-y-4">
          <MailCheck className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Verifique sua caixa de entrada</h2>
          <p className="text-zinc-500">
            Enviamos um link de acesso para <strong>{email}</strong>. Clique nele para ver o seu ingresso digital.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto border-0 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-xl">
      <CardHeader className="text-center pb-6 pt-8">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
          <Ticket className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-semibold">Acessar Ingresso</CardTitle>
        <CardDescription>Digite o e-mail para o qual o seu convite foi enviado.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMagicLink} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <Input 
            type="email" 
            placeholder="guest@example.com" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-12 text-center text-lg rounded-xl"
          />
          <Button type="submit" className="w-full h-12 text-md rounded-xl" disabled={loading}>
            {loading ? "Enviando..." : "Receber Link Mágico"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
