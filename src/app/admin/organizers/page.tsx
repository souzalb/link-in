import { getOrganizers } from "./actions";
import { OrganizersClient } from "./OrganizersClient";

export default async function OrganizersPage() {
  const { organizers, callerRole } = await getOrganizers();
  return <OrganizersClient organizers={organizers} callerRole={callerRole} />;
}
