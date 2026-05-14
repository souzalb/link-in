"use client";

import { useState } from "react";
import { createEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function CreateEventPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createEvent(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link href="/admin/events" className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Eventos
      </Link>
      
      <Card className="glass border-0 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/5 pb-8 pt-8 px-8">
          <CardTitle className="text-3xl text-white">Criar Novo Evento</CardTitle>
          <CardDescription className="text-zinc-400 text-base">Preencha os detalhes para registrar um novo evento na plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-300 ml-1">Título do Evento</Label>
              <Input id="title" name="title" required placeholder="Ex: Formatura Computação 2026" className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300 ml-1">Descrição</Label>
              <Input id="description" name="description" placeholder="Breve resumo sobre o evento..." className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-300 ml-1">Data e Hora</Label>
                <Input id="date" name="date" type="datetime-local" required className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-zinc-300 ml-1">Localização</Label>
                <Input id="location" name="location" required placeholder="Ex: Salão Principal" className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_graduates" className="text-zinc-300 ml-1">Número Estimado de Formandos</Label>
              <Input id="estimated_graduates" name="estimated_graduates" type="number" min="0" required placeholder="Ex: 50" className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
              <p className="text-xs text-zinc-500 ml-1">A capacidade de convites (3 por formando) será calculada automaticamente.</p>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="banner_file" className="text-zinc-300 ml-1">Capa do Evento (Foto)</Label>
              <div className="flex items-center gap-4">
                <div className={`relative flex items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl overflow-hidden transition-colors ${preview ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20'}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-500">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">Clique para enviar uma imagem</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="banner_file" 
                    name="banner_file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
              <Link href="/admin/events" passHref>
                <Button variant="outline" type="button" className="h-12 px-6 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/10">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {loading ? "Criando..." : "Criar Evento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
