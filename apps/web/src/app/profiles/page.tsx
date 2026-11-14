import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createConfiguredIdentityServices } from "../../lib/server/identity/identity-runtime";
import { sessionCookieName } from "../../lib/server/identity/http";
import { ProfileManager } from "../../components/profile-manager";
import { ProfileExperienceView } from "../../components/profile-experience-view";
import { getWorkforceSessionGate } from "../../lib/server/workforce/workforce-session-gate";

export default async function ProfilesPage() {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token) redirect("/login");

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) redirect("/login");
    const workforceGate = await getWorkforceSessionGate(validation.account.id,validation.session.id);
    if (workforceGate === "mfa_enrollment_required" || workforceGate === "mfa_verification_required") redirect("/operations/security/mfa");
    if (workforceGate === "ready") redirect("/workforce/home");
    if (workforceGate === "blocked") redirect("/login");
    return (
      <main className="shell">
        <header className="topbar">
          <a className="wordmark" href="/home">unibud<span>.</span></a>
          <span className="eyebrow">Account and identity</span>
          <a className="small-link" href="/home">Back to home</a>
        </header>
        <ProfileExperienceView activeProfileId={validation.session.activeProfileId ?? null} />
        <ProfileManager activeProfileId={validation.session.activeProfileId ?? null} />
        <footer>UNIBUD · One account, distinct identities, carefully scoped access.</footer>
      </main>
    );
  } catch {
    redirect("/login");
  }
}
