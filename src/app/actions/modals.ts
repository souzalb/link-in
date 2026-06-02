"use server";

import { createClient } from "@/utils/supabase/server";

export async function dismissWelcomeModal(allocationId: string) {
  const supabase = await createClient();
  await supabase
    .from("allocations")
    .update({ has_seen_welcome: true })
    .eq("id", allocationId);
}

export async function dismissDeadlineModal(allocationId: string) {
  const supabase = await createClient();
  await supabase
    .from("allocations")
    .update({ has_seen_deadline_warning: true })
    .eq("id", allocationId);
}
