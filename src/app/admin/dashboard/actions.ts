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
  const total_quota = parseInt(formData.get("total_quota") as string) || 10;

  const { error } = await supabase
    .from("allocations")
    .upsert({
      event_id,
      student_email,
      total_quota,
    }, { onConflict: "event_id,student_email" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}
