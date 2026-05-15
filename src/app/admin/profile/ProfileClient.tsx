"use client";

import { useState } from "react";
import { updateProfile, updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, Crown } from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  role: string;
}

function FeedbackAlert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <Alert
      className={
        type === "success"
          ? "bg-green-500/10 border-green-500/20 text-green-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }
    >
      <span className="flex items-center gap-2">
        {type === "success" ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0" />
        )}
        <AlertDescription>{message}</AlertDescription>
      </span>
    </Alert>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "super_admin") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
        <Crown className="w-3.5 h-3.5" />
        Super Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
      <ShieldCheck className="w-3.5 h-3.5" />
      Organizador
    </span>
  );
}

export function ProfileClient({ user }: { user: CurrentUser }) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [displayName, setDisplayName] = useState(user.name);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await updateProfile(formData);
    if (result?.error) {
      setProfileFeedback({ type: "error", message: result.error });
    } else {
      setDisplayName(formData.get("name") as string);
      setProfileFeedback({ type: "success", message: "Perfil atualizado com sucesso!" });
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await updatePassword(formData);
    if (result?.error) {
      setPasswordFeedback({ type: "error", message: result.error });
    } else {
      setPasswordFeedback({ type: "success", message: "Senha alterada com sucesso!" });
      form.reset();
    }
    setPasswordLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Meu Perfil</h1>
        <p className="text-zinc-400 mt-1">Gerencie suas informações pessoais e credenciais de acesso.</p>
      </div>

      {/* Avatar + info banner */}
      <Card className="glass border-0 rounded-[2rem] p-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)]">
              <span className="text-primary font-bold text-3xl">
                {(displayName || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            {user.role === "super_admin" && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                <Crown className="w-3 h-3 text-yellow-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 overflow-hidden min-w-0">
            <p className="text-xl font-bold text-white truncate leading-tight">
              {displayName || <span className="text-zinc-500 italic font-normal text-base">Sem nome</span>}
            </p>
            <p className="text-sm text-zinc-400 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {user.email}
            </p>
            <div className="mt-1">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card className="glass border-0 rounded-[2rem] overflow-hidden p-0">
        <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">Informações Pessoais</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {profileFeedback && <FeedbackAlert type={profileFeedback.type} message={profileFeedback.message} />}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Nome de exibição</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
                <Input
                  id="name"
                  name="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">E-mail</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
                <Input
                  value={user.email}
                  disabled
                  className="pl-11 h-12 bg-black/20 border-white/5 text-zinc-500 rounded-xl cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-zinc-600 ml-1">O e-mail não pode ser alterado.</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={profileLoading}
                className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {profileLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="glass border-0 rounded-[2rem] overflow-hidden p-0">
        <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">Alterar Senha</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {passwordFeedback && <FeedbackAlert type={passwordFeedback.type} message={passwordFeedback.message} />}
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-zinc-300">Senha atual</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
                <Input id="current_password" name="current_password" type="password" required placeholder="••••••••" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-zinc-300">Nova senha</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
                <Input id="new_password" name="new_password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-zinc-300">Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
                <Input id="confirm_password" name="confirm_password" type="password" required minLength={6} placeholder="Repita a nova senha" className="pl-11 h-12 bg-black/40 border-white/10 text-white rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={passwordLoading} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {passwordLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
