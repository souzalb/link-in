"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAllocation(formData: FormData) {
  const supabase = await createClient();

  const event_id = formData.get("event_id") as string;
  const student_email = formData.get("student_email") as string;
  const total_quota = parseInt(formData.get("total_quota") as string, 10);

  if (!event_id || !student_email || isNaN(total_quota) || total_quota < 1) {
    return { error: "Invalid input values." };
  }

  const { error } = await supabase.from("allocations").insert({
    event_id,
    student_email,
    total_quota,
  });

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: "Allocation for this student on this event already exists." };
    }
    return { error: "Failed to create allocation." };
  }

  revalidatePath("/admin/allocations");
  return { success: true };
}
