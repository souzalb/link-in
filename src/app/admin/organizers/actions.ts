"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type Role = "admin" | "super_admin";

async function getCallerRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
  return { userId: user.id, role: data?.role as Role | undefined };
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createOrganizer(formData: FormData) {
  const caller = await getCallerRole();
  if (!caller) return { error: "Not authenticated" };
  if (!["admin", "super_admin"].includes(caller.role ?? "")) return { error: "Sem permissão." };

  const adminClient = createAdminClient();
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "admin";

  // Only super_admin can create super_admins
  if (role === "super_admin" && caller.role !== "super_admin") {
    return { error: "Apenas Super Admins podem criar outros Super Admins." };
  }

  if (password.length < 6) return { error: "A senha deve ter no mínimo 6 caracteres." };

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createError) {
    const isExisting =
      createError.message.toLowerCase().includes("already been registered") ||
      (createError as any).code === "email_exists";
    return { error: isExisting ? "Já existe um usuário com esse e-mail." : createError.message };
  }

  const { error: roleError } = await adminClient
    .from("user_roles")
    .upsert({ user_id: created.user.id, role }, { onConflict: "user_id" });

  if (roleError) return { error: `Usuário criado, mas falha ao atribuir role: ${roleError.message}` };

  revalidatePath("/admin/organizers");
  return { success: true };
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export async function editOrganizer(targetUserId: string, formData: FormData) {
  const caller = await getCallerRole();
  if (!caller) return { error: "Not authenticated" };
  if (caller.role !== "super_admin") return { error: "Apenas Super Admins podem editar organizadores." };

  const adminClient = createAdminClient();
  const name = formData.get("name") as string;
  const role = (formData.get("role") as string) || "admin";

  const { error: authError } = await adminClient.auth.admin.updateUserById(targetUserId, {
    user_metadata: { name },
  });
  if (authError) return { error: authError.message };

  const { error: roleError } = await adminClient
    .from("user_roles")
    .upsert({ user_id: targetUserId, role }, { onConflict: "user_id" });
  if (roleError) return { error: roleError.message };

  revalidatePath("/admin/organizers");
  return { success: true };
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetOrganizerPassword(targetUserId: string, newPassword: string) {
  const caller = await getCallerRole();
  if (!caller) return { error: "Not authenticated" };
  if (caller.role !== "super_admin") return { error: "Apenas Super Admins podem resetar senhas." };
  if (newPassword.length < 6) return { error: "A senha deve ter no mínimo 6 caracteres." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, { password: newPassword });
  if (error) return { error: error.message };

  return { success: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteOrganizer(targetUserId: string) {
  const caller = await getCallerRole();
  if (!caller) return { error: "Not authenticated" };
  if (caller.role !== "super_admin") return { error: "Apenas Super Admins podem excluir organizadores." };
  if (caller.userId === targetUserId) return { error: "Você não pode excluir a si mesmo." };

  const adminClient = createAdminClient();

  await adminClient.from("user_roles").delete().eq("user_id", targetUserId);
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
  if (error) return { error: error.message };

  revalidatePath("/admin/organizers");
  return { success: true };
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function getOrganizers() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: adminRoles, error } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .in("role", ["admin", "super_admin"]);

  if (error || !adminRoles) return { organizers: [], callerRole: "admin" as Role };

  const { data: { user: caller } } = await supabase.auth.getUser();
  const callerRoleRow = adminRoles.find((r) => r.user_id === caller?.id);
  const callerRole = (callerRoleRow?.role ?? "admin") as Role;

  const { data: allUsers } = await adminClient.auth.admin.listUsers();
  const roleMap = new Map(adminRoles.map((r) => [r.user_id, r.role as Role]));

  const organizers = (allUsers?.users ?? [])
    .filter((u) => roleMap.has(u.id))
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      name: (u.user_metadata?.name as string) ?? "",
      created_at: u.created_at,
      role: roleMap.get(u.id) ?? "admin",
    }));

  return { organizers, callerRole };
}
