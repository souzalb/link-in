"use client";

import { useState } from "react";
import { updateEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

// Attempt to parse a stored location string back into address fields.
// Format: "Street, Number - Complement - Neighborhood, City - State, CEP: 00000-000"
function parseLocation(location: string) {
  const defaults = { street: "", number: "", complement: "", neighborhood: "", city: "", state: "" };
  const cepMatch = location?.match(/CEP:\s*([\d-]+)/);
  const cep = cepMatch?.[1] ?? "";

  // Strip CEP part
  const withoutCep = location?.replace(/,?\s*CEP:\s*[\d-]+/, "") ?? "";

  // Expect: "Street, Number[ - Complement] - Neighborhood, City - State"
  const segments = withoutCep.split(" - ").map((s) => s.trim());

  const streetNumber = segments[0]?.split(",").map((s) => s.trim()) ?? [];
  const street = streetNumber[0] ?? "";
  const number = streetNumber[1] ?? "";

  let complement = "";
  let neighborhood = "";
  let city = "";
  let state = "";

  if (segments.length >= 3) {
    const isLength4 = segments.length >= 4;
    complement = isLength4 ? segments[1] : "";
    const neighborhoodCitySeg = isLength4 ? segments[2] : segments[1];
    state = isLength4 ? segments[3] : segments[2];

    const ncParts = neighborhoodCitySeg.split(",").map(s => s.trim());
    neighborhood = ncParts[0] ?? "";
    city = ncParts[1] ?? "";
  }

  return { cep, address: { ...defaults, street, number, complement, neighborhood, city, state } };
}

// Format datetime-local value from ISO string
function toDateTimeLocal(isoString: string) {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  estimated_graduates: number;
  invites_per_student?: number;
  banner_url: string | null;
}

export function EditEventForm({ event }: { event: EventData }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(event.banner_url);

  const parsed = parseLocation(event.location ?? "");
  const [cep, setCep] = useState(parsed.cep);
  const [address, setAddress] = useState(parsed.address);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let newCep = e.target.value.replace(/\D/g, "");
    if (newCep.length > 8) newCep = newCep.slice(0, 8);
    const maskedCep = newCep.replace(/^(\d{5})(\d)/, "$1-$2");
    setCep(maskedCep);

    if (newCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress((prev) => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const formattedLocation = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""} - ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${cep}`;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await updateEvent(event.id, formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-5xl space-y-4 pb-4">
      <Link href={`/admin/events/${event.id}`} className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para o Evento
      </Link>

      <Card className="glass border-0 rounded-[2rem] overflow-hidden p-0">
        <CardHeader className="bg-white/5 border-b border-white/5 pb-4 pt-5 px-6">
          <CardTitle className="text-2xl text-white">Editar Evento</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Atualize os detalhes do evento. O banner só será alterado se você enviar uma nova imagem.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-zinc-300 ml-1">Título do Evento</Label>
                  <Input id="title" name="title" required defaultValue={event.title} placeholder="Ex: Formatura Computação 2026" className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-300 ml-1">Descrição</Label>
                  <Input id="description" name="description" defaultValue={event.description ?? ""} placeholder="Breve resumo sobre o evento..." className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-zinc-300 ml-1">Data e Hora</Label>
                    <Input id="date" name="date" type="datetime-local" required defaultValue={toDateTimeLocal(event.date)} className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimated_graduates" className="text-zinc-300 ml-1">Qtd. Formandos</Label>
                      <Input id="estimated_graduates" name="estimated_graduates" type="number" min="0" required defaultValue={event.estimated_graduates} placeholder="Ex: 50" className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invites_per_student" className="text-zinc-300 ml-1">Convites/Formando</Label>
                      <Input id="invites_per_student" name="invites_per_student" type="number" min="1" required defaultValue={event.invites_per_student ?? 3} placeholder="Ex: 3" className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Label htmlFor="banner_file" className="text-zinc-300 ml-1">Capa do Evento (deixe vazio para manter a atual)</Label>
                  <div className={`relative flex items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl overflow-hidden transition-colors ${preview ? "border-primary/50 bg-primary/5" : "border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20"}`}>
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-zinc-500">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-xs">Clique para enviar uma nova imagem</span>
                      </div>
                    )}
                    <input type="file" id="banner_file" name="banner_file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-4 h-full">
                  <h3 className="text-sm font-medium text-zinc-400">Localização</h3>

                  <input type="hidden" name="location" value={formattedLocation} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="cep" className="text-zinc-300 ml-1 text-xs">CEP</Label>
                      <Input id="cep" value={cep} onChange={handleCepChange} placeholder="00000-000" maxLength={9} className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="street" className="text-zinc-300 ml-1 text-xs">Rua / Avenida</Label>
                      <Input id="street" name="street" value={address.street} onChange={handleAddressChange} placeholder="Nome da rua" required className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="number" className="text-zinc-300 ml-1 text-xs">Número</Label>
                      <Input id="number" name="number" value={address.number} onChange={handleAddressChange} placeholder="123" required className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="complement" className="text-zinc-300 ml-1 text-xs">Compl.</Label>
                      <Input id="complement" name="complement" value={address.complement} onChange={handleAddressChange} placeholder="Sala..." className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="neighborhood" className="text-zinc-300 ml-1 text-xs">Bairro</Label>
                      <Input id="neighborhood" name="neighborhood" value={address.neighborhood} onChange={handleAddressChange} placeholder="Bairro" required className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-zinc-300 ml-1 text-xs">Cidade</Label>
                      <Input id="city" name="city" value={address.city} onChange={handleAddressChange} placeholder="Cidade" required className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-zinc-300 ml-1 text-xs">Estado (UF)</Label>
                      <Input id="state" name="state" value={address.state} onChange={handleAddressChange} placeholder="UF" maxLength={2} required className="bg-black/40 border-white/10 text-white h-11 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
              <Link href={`/admin/events/${event.id}`} passHref>
                <Button variant="outline" type="button" className="h-11 px-6 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/10">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
