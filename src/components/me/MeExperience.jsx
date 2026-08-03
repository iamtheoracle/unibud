import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import MeTab from "@/pages/tabs/MeTab";

/**
 * MeExperience — the migrated Me operating profile on the v4 OS runtime.
 *
 * Me is the user's operating profile. It owns:
 * Identity, Preferences, Settings, Privacy, Security, Devices, Notifications,
 * Achievements, Portfolio, Academic Profile, Social Profile, and Wallet Profile.
 *
 * Me consumes Platform Core — it owns no infrastructure.
 *
 * Platform Core integration:
 * • ContextProvider — sets hybrid context (profile is context-neutral)
 * • Identity Service — student profile, public profiles, creator profiles
 * • Bud — academic insights, smart reminders, achievement recommendations
 * • Realtime Engine — profile data, achievements, wallet updates sync instantly
 * • Spark — background indexing of portfolio and achievements
 *
 * Migration, not reconstruction. User-visible behavior is unchanged.
 * Me is the canonical operating profile implementation.
 */
export default function MeExperience() {
  const { setContext } = useContextSystem();

  useEffect(() => {
    setContext("hybrid");
  }, [setContext]);

  return <MeTab />;
}