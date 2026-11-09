import { notFound } from "next/navigation";
import { ProfileManager } from "../../../components/profile-manager";
import { ProfileExperienceView } from "../../../components/profile-experience-view";

/**
 * Isolated browser-test surface. It is deliberately unavailable in production,
 * even if the test flag is accidentally copied into a production environment.
 * Playwright intercepts the authenticated API boundary; real authorization and
 * PostgreSQL behavior remain covered by the database integration suite.
 */
export default function ProfileBrowserTestPage() {
  if (process.env.NODE_ENV === "production" || process.env.UNIBUD_E2E_TEST_MODE !== "true") {
    notFound();
  }
  return (
    <main className="shell">
      <header className="topbar">
        <a className="wordmark" href="/home">unibud<span>.</span></a>
        <span className="eyebrow">Browser test fixture</span>
      </header>
      <ProfileExperienceView activeProfileId="20000000-0000-4000-8000-000000000001" />
      <ProfileManager activeProfileId="20000000-0000-4000-8000-000000000001" />
    </main>
  );
}
