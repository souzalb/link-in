"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAllocation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const event_id = formData.get("event_id") as string;
  const student_email = formData.get("student_email") as string;
  const added_quota = parseInt(formData.get("total_quota") as string) || 10;

  // Fetch event capacity and current allocations to calculate limits
  const { data: event } = await supabase
    .from("events")
    .select("estimated_graduates, invites_per_student, allocations(student_email, total_quota, used_quota)")
    .eq("id", event_id)
    .single();

  if (!event) return { error: "Evento não encontrado." };

  const maxQuota = event.estimated_graduates * (event.invites_per_student || 3);
  const currentAllocations = event.allocations || [];
  const currentTotalQuota = currentAllocations.reduce((acc: number, alloc: any) => acc + alloc.total_quota, 0);

  const availableQuota = maxQuota - currentTotalQuota;
  
  if (added_quota > availableQuota) {
    return { error: `Limite excedido! Você está tentando alocar mais ${added_quota} convite(s), mas o evento só tem ${availableQuota} disponível(is).` };
  }

  // Find existing allocation
  const existingAlloc = currentAllocations.find((a: any) => a.student_email === student_email);
  const newTotalQuota = existingAlloc ? existingAlloc.total_quota + added_quota : added_quota;

  const { error } = await supabase
    .from("allocations")
    .upsert({
      event_id,
      student_email,
      total_quota: newTotalQuota,
    }, { onConflict: "event_id,student_email" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}
