import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { sessionCookieName } from "@/lib/server/identity/http";
import OperationsAuditClient from "./operations-audit-client";

export const dynamic = "force-dynamic";

export default async function OperationsAuditPage() {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token) redirect("/login");
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) redirect("/login");
  } catch {
    redirect("/login");
  }
  return <OperationsAuditClient />;
}
