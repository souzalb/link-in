"use client";

import { useState } from "react";
import { createOrganizer, editOrganizer, resetOrganizerPassword, deleteOrganizer } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, ShieldCheck, Mail, User, Lock, Calendar, Crown, Pencil, KeyRound, Trash2 } from "lucide-react";

type Role = "admin" | "super_admin";

interface Organizer {
  id: string;
  email: string;
  name: string;
  created_at: string;
  role: Role;
}

function RoleBadge({ role }: { role: Role }) {
  if (role === "super_admin") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
        <Crown className="w-3 h-3" /> Super Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
      <ShieldCheck className="w-3 h-3" /> Organizador
    </span>
  );
}

function FormFeedback({ error, success }: { error: string | null; success: string | null }) {
  if (error) return <Alert className="bg-red-500/10 border-red-500/20 text-red-400"><AlertDescription>{error}</AlertDescription></Alert>;
  if (success) return <Alert className="bg-green-500/10 border-green-500/20 text-green-400"><AlertDescription>{success}</AlertDescription></Alert>;
  return null;
}

// ─── Dialogs ─────────────────────────────────────────────────────────────────

function CreateDialog({ open, onClose, isSuperAdmin, onCreated }: {
  open: boolean; onClose: () => void; isSuperAdmin: boolean; onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    const form = e.currentTarget;
    const result = await createOrganizer(new FormData(form));
    if (result?.error) { setError(result.error); }
    else { setSuccess("Organizador criado com sucesso!"); form.reset(); setTimeout(() => { onClose(); onCreated(); }, 1000); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 rounded-3xl max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Novo Organizador
          </DialogTitle>
          <DialogDescription className="text-zinc-400">Crie uma conta de administrador.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <FormFeedback error={error} success={success} />
          <div className="space-y-2">
            <Label htmlFor="c-name" className="text-zinc-300">Nome</Label>
            <div className="relative"><User className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <Input id="c-name" name="name" required placeholder="Nome completo" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email" className="text-zinc-300">E-mail</Label>
            <div className="relative"><Mail className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <Input id="c-email" name="email" type="email" required placeholder="email@org.com" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-password" className="text-zinc-300">Senha</Label>
            <div className="relative"><Lock className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <Input id="c-password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
            </div>
          </div>
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="c-role" className="text-zinc-300">Função</Label>
              <select id="c-role" name="role" className="flex h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="admin">Organizador</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          )}
          {!isSuperAdmin && <input type="hidden" name="role" value="admin" />}
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2">
            {loading ? "Criando..." : "Criar Organizador"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ org, open, onClose, onSaved }: {
  org: Organizer; open: boolean; onClose: () => void; onSaved: (updated: Organizer) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await editOrganizer(org.id, formData);
    if (result?.error) { setError(result.error); }
    else {
      onSaved({ ...org, name: formData.get("name") as string, role: formData.get("role") as Role });
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 rounded-3xl max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" /> Editar Organizador
          </DialogTitle>
          <DialogDescription className="text-zinc-400 truncate">{org.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2">
            <Label htmlFor="e-name" className="text-zinc-300">Nome</Label>
            <div className="relative"><User className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <Input id="e-name" name="name" required defaultValue={org.name} placeholder="Nome completo" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-role" className="text-zinc-300">Função</Label>
            <select id="e-role" name="role" defaultValue={org.role} className="flex h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="admin">Organizador</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({ org, open, onClose }: {
  org: Organizer; open: boolean; onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setFeedback(null);
    const form = e.currentTarget;
    const pwd = (form.elements.namedItem("new_password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm_password") as HTMLInputElement).value;
    if (pwd !== confirm) { setFeedback({ type: "error", msg: "As senhas não coincidem." }); setLoading(false); return; }
    const result = await resetOrganizerPassword(org.id, pwd);
    if (result?.error) { setFeedback({ type: "error", msg: result.error }); }
    else { setFeedback({ type: "success", msg: "Senha redefinida com sucesso!" }); form.reset(); setTimeout(onClose, 1000); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 rounded-3xl max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Redefinir Senha
          </DialogTitle>
          <DialogDescription className="text-zinc-400 truncate">{org.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {feedback && <Alert className={feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}><AlertDescription>{feedback.msg}</AlertDescription></Alert>}
          <div className="space-y-2">
            <Label htmlFor="r-pwd" className="text-zinc-300">Nova senha</Label>
            <div className="relative"><Lock className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <Input id="r-pwd" name="new_password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-confirm" className="text-zinc-300">Confirmar senha</Label>
            <div className="relative"><Lock className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <Input id="r-confirm" name="confirm_password" type="password" required minLength={6} placeholder="Repita a nova senha" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {loading ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OrganizersClient({ organizers: initial, callerRole }: {
  organizers: Organizer[];
  callerRole: Role;
}) {
  const [organizers, setOrganizers] = useState(initial);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Organizer | null>(null);
  const [resetTarget, setResetTarget] = useState<Organizer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organizer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isSuperAdmin = callerRole === "super_admin";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const result = await deleteOrganizer(deleteTarget.id);
    if (!result?.error) {
      setOrganizers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    }
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Organizadores</h1>
          <p className="text-zinc-400 mt-1">Gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Novo Organizador
        </Button>
      </div>

      {/* List */}
      <Card className="glass border-0 rounded-[2rem] overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 border-b border-white/5 text-zinc-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Organizador</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Função</th>
                <th className="px-6 py-4 font-medium text-right">Cadastrado em</th>
                {isSuperAdmin && <th className="px-6 py-4 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {organizers.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-6 py-16 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-3">
                      <ShieldCheck className="w-12 h-12 opacity-20" />
                      <p>Nenhum organizador cadastrado ainda.</p>
                    </div>
                  </td>
                </tr>
              )}
              {organizers.map((org) => (
                <tr key={org.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {(org.name || org.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-white">{org.name || <span className="text-zinc-500 italic">Sem nome</span>}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 group-hover:text-zinc-300">{org.email}</td>
                  <td className="px-6 py-4"><RoleBadge role={org.role} /></td>
                  <td className="px-6 py-4 text-right text-zinc-500 group-hover:text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(org.created_at).toLocaleDateString("pt-BR", { timeZone: 'America/Sao_Paulo' })}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(org)}
                          title="Editar"
                          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResetTarget(org)}
                          title="Redefinir senha"
                          className="p-2 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(org)}
                          title="Excluir"
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialogs */}
      <CreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isSuperAdmin={isSuperAdmin}
        onCreated={() => window.location.reload()}
      />

      {editTarget && (
        <EditDialog
          org={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            setOrganizers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setEditTarget(null);
          }}
        />
      )}

      {resetTarget && (
        <ResetPasswordDialog
          org={resetTarget}
          open={!!resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir organizador?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Isso removerá permanentemente <strong className="text-white">{deleteTarget?.name || deleteTarget?.email}</strong> do sistema. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              {deleteLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
