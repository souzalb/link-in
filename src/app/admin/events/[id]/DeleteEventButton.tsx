"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteEvent } from "./actions";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setConfirmOpen(false);
    const res = await deleteEvent(eventId);
    if (res?.error) {
      setErrorModal(res.error);
      setLoading(false);
    } else {
      router.push("/admin/events");
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        disabled={loading}
        onClick={() => setConfirmOpen(true)}
        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 h-9 px-4 rounded-xl"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {loading ? "Excluindo..." : "Excluir Evento"}
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Evento</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza absoluta que deseja excluir este evento? Todos os ingressos e cotas distribuídas serão apagados permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              Sim, Excluir Evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!errorModal} onOpenChange={() => setErrorModal(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Erro ao Excluir</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {errorModal}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-primary hover:bg-primary/90 text-white rounded-xl border-0">Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
