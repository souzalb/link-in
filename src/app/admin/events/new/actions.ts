"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const location = formData.get("location") as string;
  const estimated_graduates = parseInt(formData.get("estimated_graduates") as string || "0", 10);
  
  const bannerFile = formData.get("banner_file") as File | null;
  let banner_url = null;

  // 1. Handle File Upload if provided
  if (bannerFile && bannerFile.size > 0) {
    const fileExt = bannerFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, bannerFile);

    if (uploadError) {
      return { error: `Upload falhou: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);
      
    banner_url = publicUrlData.publicUrl;
  }

  // 2. Insert into Events table
  const { error } = await supabase.from("events").insert([
    {
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      estimated_graduates,
      banner_url,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  redirect("/admin/events");
}
