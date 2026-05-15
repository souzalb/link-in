import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = roleData?.role;

  if (role === "admin" || role === "super_admin") {
    redirect("/admin/events");
  } else if (role === "scanner") {
    redirect("/scanner");
  } else {
    // Default to student portal
    redirect("/student");
  }
}
