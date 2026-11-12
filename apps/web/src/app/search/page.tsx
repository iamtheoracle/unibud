import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createConfiguredIdentityServices } from "../../lib/server/identity/identity-runtime";
import { sessionCookieName } from "../../lib/server/identity/http";
import SearchClient from "./search-client";

export default async function SearchPage() {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token) redirect("/login");

  let valid = false;
  let activeProfile = false;
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    valid = validation.valid;
    activeProfile = validation.valid && Boolean(validation.session.activeProfileId);
  } catch {
    redirect("/login");
  }
  if (!valid) redirect("/login");
  if (!activeProfile) redirect("/onboarding");

  return (
    <main className="shell search-shell">
      <header className="topbar">
        <Link className="wordmark" href="/home">unibud<span>.</span></Link>
        <Link className="small-link" href="/home">Back to your spaces</Link>
      </header>
      <SearchClient />
    </main>
  );
}
