import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { EditEventForm } from "../EditEventForm";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, description, date, location, estimated_graduates, banner_url")
    .eq("id", id)
    .single();

  if (error || !event) return notFound();

  return <EditEventForm event={event} />;
}
