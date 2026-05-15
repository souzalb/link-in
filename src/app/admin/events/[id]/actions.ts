"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const location = formData.get("location") as string;
  const estimated_graduates = parseInt(formData.get("estimated_graduates") as string || "0", 10);

  const bannerFile = formData.get("banner_file") as File | null;
  let banner_url: string | undefined = undefined;

  if (bannerFile && bannerFile.size > 0) {
    const fileExt = bannerFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, bannerFile);

    if (uploadError) return { error: `Upload falhou: ${uploadError.message}` };

    const { data: publicUrlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);

    banner_url = publicUrlData.publicUrl;
  }

  const updatePayload: Record<string, unknown> = {
    title,
    description,
    date: new Date(date).toISOString(),
    location,
    estimated_graduates,
  };

  if (banner_url !== undefined) {
    updatePayload.banner_url = banner_url;
  }

  const { error } = await supabase
    .from("events")
    .update(updatePayload)
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  redirect(`/admin/events/${eventId}`);
}

export async function bulkAllocate(eventId: string, emailsText: string, quota: number) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Basic security check to ensure caller is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleData?.role !== "admin") return { error: "Not authorized" };

  // Parse entries: each line must be "email,cpfPrefix"
  const rawLines = emailsText.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);

  if (rawLines.length === 0) return { error: "Nenhuma entrada encontrada." };

  // Validate and parse each line
  const parsed: { email: string; cpfPrefix: string }[] = [];
  for (const line of rawLines) {
    const commaIdx = line.indexOf(",");
    if (commaIdx === -1) {
      return { error: `Formato inválido na linha: "${line}". Use o formato: email,123456` };
    }
    const email = line.slice(0, commaIdx).trim().toLowerCase();
    const cpfPrefix = line.slice(commaIdx + 1).trim().replace(/\D/g, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: `E-mail inválido: "${email}"` };
    }
    if (cpfPrefix.length !== 6) {
      return { error: `O prefixo do CPF de "${email}" deve ter exatamente 6 dígitos. Recebido: "${line.slice(commaIdx + 1).trim()}"` };
    }
    parsed.push({ email, cpfPrefix });
  }

  // Remove duplicates by email (keep last occurrence)
  const deduped = parsed.reduce((acc, entry) => {
    acc.set(entry.email, entry);
    return acc;
  }, new Map<string, { email: string; cpfPrefix: string }>());
  const entries = Array.from(deduped.values());
  const emails = entries.map(e => e.email);

  if (emails.length === 0) return { error: "Nenhum e-mail válido encontrado." };

  // Fetch event capacity and current allocations
  const { data: event } = await supabase
    .from("events")
    .select("estimated_graduates, allocations(student_email, total_quota, used_quota)")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Evento não encontrado." };

  const maxQuota = event.estimated_graduates * 3;
  const currentAllocations = event.allocations || [];
  const currentTotalQuota = currentAllocations.reduce((acc: number, alloc: any) => acc + alloc.total_quota, 0);

  // Calculate net change
  let netQuotaChange = 0;
  for (const email of emails) {
    const existing = currentAllocations.find((a: any) => a.student_email === email);
    if (existing) {
      if (quota < existing.used_quota) {
        return { error: `Não é possível reduzir a cota de ${email} para ${quota}, pois ele já utilizou ${existing.used_quota}.` };
      }
      netQuotaChange += (quota - existing.total_quota);
    } else {
      netQuotaChange += quota;
    }
  }

  const availableQuota = maxQuota - currentTotalQuota;
  if (netQuotaChange > availableQuota) {
    return { error: `Limite excedido! Você está tentando alocar mais ${netQuotaChange} convite(s), mas só há ${availableQuota} disponível(is).` };
  }

  let successCount = 0;
  let errorCount = 0;

  for (const { email, cpfPrefix } of entries) {
    // 1. Try to create user with CPF prefix as password.
    //    If user already exists, update their password to the new CPF prefix.
    const { error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: cpfPrefix,
      email_confirm: true,
    });

    if (createError) {
      const isAlreadyRegistered =
        createError.message.toLowerCase().includes("already been registered") ||
        (createError as any).code === "email_exists";

      if (isAlreadyRegistered) {
        // Update password so it always reflects the current CPF prefix
        const { data: listData } = await adminClient.auth.admin.listUsers();
        const existingUser = listData?.users?.find(u => u.email === email);
        if (existingUser) {
          await adminClient.auth.admin.updateUserById(existingUser.id, { password: cpfPrefix });
        }
      } else {
        console.error(`Auth error for ${email}:`, createError);
        errorCount++;
        continue;
      }
    }

    // 2. Upsert allocation
    const { error: allocError } = await supabase
      .from("allocations")
      .upsert({
        event_id: eventId,
        student_email: email,
        total_quota: quota,
      }, { onConflict: "event_id,student_email" });

    if (allocError) {
      console.error(`Failed allocation for ${email}:`, allocError);
      errorCount++;
    } else {
      successCount++;
    }
  }

  revalidatePath(`/admin/events/${eventId}`);
  return {
    success: true,
    message: `${successCount} aluno(s) cadastrado(s) com sucesso.` + (errorCount > 0 ? ` Falhas: ${errorCount}.` : "")
  };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}
