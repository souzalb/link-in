"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Checks if the event's deadline has passed and automatically retracts
 * unused quota from all students in that event.
 */
export async function enforceEventDeadline(eventId: string) {
  const supabase = await createClient();

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("date, rsvp_deadline_days")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    console.error("Failed to fetch event for deadline enforcement", eventError);
    return;
  }

  const rsvpDeadlineDays = event.rsvp_deadline_days ?? 7;
  const eventDate = new Date(event.date);
  const deadlineDate = new Date(eventDate);
  deadlineDate.setDate(deadlineDate.getDate() - rsvpDeadlineDays);

  const now = new Date();

  // If deadline has not passed, do nothing
  if (now < deadlineDate) {
    return;
  }

  // Fetch all allocations for this event that have unused quota
  // and haven't been fully retracted yet.
  const { data: allocations, error: allocError } = await supabase
    .from("allocations")
    .select("id, total_quota, used_quota, retracted_quota")
    .eq("event_id", eventId);

  if (allocError || !allocations) {
    console.error("Failed to fetch allocations for deadline enforcement", allocError);
    return;
  }

  for (const alloc of allocations) {
    // If the student has unused tickets
    if (alloc.total_quota > alloc.used_quota) {
      const unused = alloc.total_quota - alloc.used_quota;
      
      // We reduce the total_quota to match used_quota
      // And we store the unused amount in retracted_quota
      // Also we ensure has_seen_deadline_warning is false so they see the modal again if they had unused tickets
      await supabase
        .from("allocations")
        .update({
          total_quota: alloc.used_quota,
          retracted_quota: alloc.retracted_quota + unused,
          has_seen_deadline_warning: false
        })
        .eq("id", alloc.id);
    }
  }
}
