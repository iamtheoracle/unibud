"use client";

import { useEffect, useMemo, useState } from "react";

type ProfileKind = "personal" | "creator" | "page_community";
type ProfileRecord = {
  accountId: string;
  relationship: "owner" | "delegated";
  role: string;
  membershipStatus: "active" | "pending" | "suspended" | "revoked";
  canSwitchToProfile: boolean;
  profile: {
    id: string;
    ownerAccountId: string;
    kind: ProfileKind;
    handle: string;
    displayName: string;
    visibility: "private" | "limited" | "public";
    status: "active" | "restricted" | "archived";
  };
};

type Section = { id: string; label: string; heading: string; description: string; state: "available" | "planned" };

const experiences: Record<ProfileKind, { title: string; eyebrow: string; purpose: string; sections: Section[] }> = {
  personal: {
    title: "Personal profile",
    eyebrow: "Your personal identity",
    purpose: "Your individual space for the people you know, the things you share, and the information you choose to make visible.",
    sections: [
      { id: "about", label: "About", heading: "About you", description: "Your personal identity and profile information. Account credentials and security remain in account settings.", state: "available" },
      { id: "connections", label: "Connections", heading: "Your connections", description: "A dedicated place for your friends and personal connections. Connection discovery and relationship controls are being connected to Connect.", state: "planned" },
      { id: "posts", label: "Posts", heading: "Your posts", description: "Personal updates belong here, separate from creator publishing and page announcements.", state: "planned" },
      { id: "highlights", label: "Highlights", heading: "Your highlights", description: "A personal collection of moments and information you choose to feature.", state: "planned" },
      { id: "privacy", label: "Privacy", heading: "Personal privacy", description: "Visibility and discoverability controls will be enforced by the profile privacy service. This view does not change permissions.", state: "planned" }
    ]
  },
  creator: {
    title: "Creator profile",
    eyebrow: "Your publishing identity",
    purpose: "A distinct public identity for your creative work, publishing activity, portfolio, and audience.",
    sections: [
      { id: "about", label: "About", heading: "Creator identity", description: "Your creator name, handle, biography and public identity.", state: "available" },
      { id: "publishing", label: "Publishing", heading: "Creator publishing", description: "Creator posts and publishing workflows will be managed independently from personal posts.", state: "planned" },
      { id: "work", label: "Featured work", heading: "Featured work", description: "A portfolio area for selected work, projects and published media.", state: "planned" },
      { id: "audience", label: "Audience", heading: "Your audience", description: "Audience and follower information will appear here when the audience service is connected.", state: "planned" },
      { id: "links", label: "Links", heading: "Creator links", description: "A dedicated space for your creator destinations and external work.", state: "planned" },
      { id: "insights", label: "Insights", heading: "Creator insights", description: "Performance reporting is not enabled yet; no estimated or sample metrics are shown.", state: "planned" },
      { id: "monetisation", label: "Monetisation", heading: "Eligible monetisation", description: "Monetisation remains unavailable until eligibility, payments, compliance and creator controls are implemented.", state: "planned" }
    ]
  },
  page_community: {
    title: "Page / community",
    eyebrow: "Your group identity",
    purpose: "A shared identity for an organisation, institution, brand or community, with membership and administration scoped to this page.",
    sections: [
      { id: "about", label: "About", heading: "Page information", description: "Your page name, handle, visibility and public identity.", state: "available" },
      { id: "posts", label: "Posts", heading: "Page posts", description: "Updates published in this page's identity, separate from personal and creator content.", state: "planned" },
      { id: "announcements", label: "Announcements", heading: "Announcements", description: "Important information for followers and members of this page or community.", state: "planned" },
      { id: "members", label: "Members", heading: "Members and followers", description: "Membership, followers and participation will be scoped to this page only.", state: "planned" },
      { id: "events", label: "Events", heading: "Page events", description: "Activities and events associated with this organisation or community.", state: "planned" },
      { id: "rules", label: "Rules", heading: "Community rules", description: "Published expectations and participation rules for this community.", state: "planned" },
      { id: "administrators", label: "Administrators", heading: "Page administrators", description: "Delegated access is managed separately below. A page role never grants access to the owner's personal account.", state: "available" },
      { id: "moderation", label: "Moderation", heading: "Moderation", description: "Moderation tools and review workflows will be added with explicit page-scoped permissions.", state: "planned" }
    ]
  }
};

export function ProfileExperienceView({ activeProfileId }: { activeProfileId: string | null }) {
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSection, setSelectedSection] = useState("about");

  useEffect(() => {
    let mounted = true;
    fetch("/api/profiles", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Could not load your profile context.");
        return await response.json() as { profiles?: ProfileRecord[] };
      })
      .then(body => { if (mounted) setProfiles(body.profiles ?? []); })
      .catch(cause => { if (mounted) setError(cause instanceof Error ? cause.message : "Could not load your profile context."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const active = useMemo(
    () => profiles.find(item => item.profile.id === activeProfileId && item.membershipStatus === "active" && item.profile.status === "active"),
    [profiles, activeProfileId]
  );
  const experience = active ? experiences[active.profile.kind] : null;
  const section = experience?.sections.find(item => item.id === selectedSection) ?? experience?.sections[0];

  useEffect(() => { setSelectedSection("about"); }, [activeProfileId]);

  if (loading) return <section className="profile-experience"><p className="profile-muted">Loading your active profile…</p></section>;
  if (error) return <section className="profile-experience"><p className="profile-alert profile-error" role="alert">{error}</p></section>;
  if (!active || !experience || !section) return null;

  const profile = active.profile;
  return (
    <section className={"profile-experience profile-experience-" + profile.kind} aria-labelledby="active-profile-title">
      <div className="profile-experience-head">
        <div className="profile-experience-avatar" aria-hidden="true">{profile.displayName.slice(0, 1).toUpperCase()}</div>
        <div className="profile-experience-heading">
          <p className="eyebrow">{experience.eyebrow}</p>
          <h2 id="active-profile-title">{profile.displayName}</h2>
          <p>@{profile.handle} <span aria-hidden="true">·</span> {profile.visibility} <span aria-hidden="true">·</span> {active.relationship === "owner" ? "Owned by you" : "Delegated " + active.role}</p>
        </div>
        <span className="profile-experience-kind">{experience.title}</span>
      </div>
      <p className="profile-experience-purpose">{experience.purpose}</p>
      <nav className="profile-experience-nav" aria-label={experience.title + " sections"}>
        {experience.sections.map(item => (
          <button key={item.id} type="button" className={selectedSection === item.id ? "is-selected" : ""} aria-current={selectedSection === item.id ? "page" : undefined} onClick={() => setSelectedSection(item.id)}>{item.label}</button>
        ))}
      </nav>
      <div className="profile-experience-content" aria-live="polite">
        <div>
          <p className="eyebrow">{section.state === "available" ? "Profile foundation" : "Planned capability"}</p>
          <h3>{section.heading}</h3>
          <p>{section.description}</p>
        </div>
        {section.state === "available"
          ? <span className="profile-experience-status">Identity details available</span>
          : <span className="profile-experience-status is-planned">Not connected yet</span>}
      </div>
    </section>
  );
}
