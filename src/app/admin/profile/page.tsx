import { redirect } from "next/navigation";
import { getCurrentUser } from "./actions";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <ProfileClient user={user} />;
}
