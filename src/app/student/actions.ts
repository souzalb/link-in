"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function issueTicket(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const eventId = formData.get("event_id") as string;
  const guestName = formData.get("guest_name") as string;
  const guestPhone = formData.get("guest_phone") as string;
  const allocationId = formData.get("allocation_id") as string;

  // Transaction-like logic
  // 1. Check allocation quota
  const { data: allocation, error: allocError } = await supabase
    .from("allocations")
    .select("total_quota, used_quota")
    .eq("id", allocationId)
    .single();

  if (allocError || !allocation) return { error: "Allocation not found" };

  if (allocation.used_quota >= allocation.total_quota) {
    return { error: "Quota exceeded. You cannot issue more tickets." };
  }

  // 2. Insert ticket
  const { data: newTicket, error: ticketError } = await supabase.from("tickets").insert({
    event_id: eventId,
    allocated_by: user.email,
    guest_name: guestName,
    guest_phone: guestPhone,
    status: "issued",
  }).select("id").single();

  if (ticketError || !newTicket) return { error: "Failed to issue ticket." };

  // 3. Update allocation (bypassing RLS with Service Role Key)
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await adminClient
    .from("allocations")
    .update({ used_quota: allocation.used_quota + 1 })
    .eq("id", allocationId);

  if (updateError) {
    console.error("Failed to update allocation quota:", updateError);
    return { error: "Erro ao atualizar a cota do aluno." };
  }

  revalidatePath("/student");
  return { success: true, ticketId: newTicket.id };
}

export async function revokeTicket(ticketId: string, allocationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // 1. Verify ticket is issued (not checked in)
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("status")
    .eq("id", ticketId)
    .eq("allocated_by", user.email)
    .single();

  if (ticketError || !ticket) return { error: "Ticket not found or unauthorized" };

  if (ticket.status !== "issued" && ticket.status !== "pending") {
    return { error: "Cannot revoke a ticket that is already checked in or revoked." };
  }

  // 2. Update ticket status
  const { error: updateError } = await supabase
    .from("tickets")
    .update({ status: "revoked" })
    .eq("id", ticketId);

  if (updateError) return { error: "Failed to revoke ticket" };

  // 3. Update allocation (return the quota) bypassing RLS
  const { data: allocation } = await supabase
    .from("allocations")
    .select("used_quota")
    .eq("id", allocationId)
    .single();

  if (allocation && allocation.used_quota > 0) {
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await adminClient
      .from("allocations")
      .update({ used_quota: allocation.used_quota - 1 })
      .eq("id", allocationId);
  }

  revalidatePath("/student");
  return { success: true };
}

export async function returnQuota(allocationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get the allocation
  const { data: allocation, error: allocError } = await supabase
    .from("allocations")
    .select("total_quota, used_quota, student_email")
    .eq("id", allocationId)
    .single();

  if (allocError || !allocation) return { error: "Cota não encontrada." };
  if (allocation.student_email !== user.email) return { error: "Não autorizado." };
  if (allocation.total_quota <= allocation.used_quota) return { error: "Você não possui cotas não utilizadas para devolver." };

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await adminClient
    .from("allocations")
    .update({ total_quota: allocation.total_quota - 1 })
    .eq("id", allocationId);

  if (updateError) {
    console.error("Failed to return quota:", updateError);
    return { error: "Erro ao devolver a cota." };
  }

  revalidatePath("/student");
  return { success: true };
}
