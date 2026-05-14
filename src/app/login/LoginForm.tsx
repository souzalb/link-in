"use client";

import { useState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ticket, User, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    // Auto-fill the default password for students
    if (role === "student") {
      formData.append("password", "linkin_default_2026");
    }

    const result = await login(formData);
    if (result?.error) {
      setError(result.error === "Invalid login credentials" && role === "student" 
        ? "Aluno não encontrado. Verifique seu e-mail." 
        : result.error);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass border-0 rounded-[2rem] overflow-hidden">
      <CardHeader className="space-y-3 text-center pb-8 pt-10">
        <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-2 shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)]">
          <Ticket className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-white">Link-in</CardTitle>
        <CardDescription className="text-zinc-400 font-medium">
          Acesse seu painel exclusivo
        </CardDescription>
      </CardHeader>
      
      <div className="px-6 pb-6">
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 relative">
          {/* Animated active background */}
          <div 
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-primary/20 border border-primary/30 rounded-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(${role === "student" ? "0" : "calc(100% + 0.375rem)"})` }}
          />
          <button 
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors relative z-10 ${role === "student" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            onClick={() => { setRole("student"); setError(null); }}
          >
            <User className="w-4 h-4" /> Aluno
          </button>
          <button 
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors relative z-10 ${role === "admin" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            onClick={() => { setRole("admin"); setError(null); }}
          >
            <ShieldCheck className="w-4 h-4" /> Organizador
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }}>
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 ml-1">E-mail</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="seu@email.com" 
                required 
                className="h-14 bg-black/40 border-white/10 text-white rounded-2xl px-4 placeholder:text-zinc-600 focus-visible:ring-primary/50" 
              />
            </div>

            <AnimatePresence>
              {role === "admin" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="password" className="text-zinc-300 ml-1">Senha</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required={role === "admin"} 
                    className="h-14 bg-black/40 border-white/10 text-white rounded-2xl px-4 focus-visible:ring-primary/50" 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              className={`w-full h-14 text-base font-semibold rounded-2xl transition-all duration-300 ${
                loading 
                  ? "bg-primary/70 text-white cursor-not-allowed" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]"
              }`}
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Acessar Plataforma"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
