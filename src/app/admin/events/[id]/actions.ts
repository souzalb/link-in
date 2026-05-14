"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  // Parse emails
  const rawEmails = emailsText.split(/[\n,;]+/).map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
  const emails = [...new Set(rawEmails)]; // remove duplicates

  if (emails.length === 0) return { error: "No valid emails found." };

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

  for (const email of emails) {
    // 1. Create or ensure user exists using Admin API
    const { error: authError } = await adminClient.auth.admin.createUser({
      email: email,
      password: "linkin_default_2026",
      email_confirm: true,
    });
    
    // authError is fine if user already exists

    // 2. Insert into user_roles (default is student, so we can let the trigger handle it, 
    // or insert if not exists to be safe)
    
    // 3. Upsert allocation
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
    message: `Alocados ${successCount} alunos com sucesso.` + (errorCount > 0 ? ` Falhas: ${errorCount}.` : "") 
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
