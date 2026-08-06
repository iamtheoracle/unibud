import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import Discover from "@/pages/Discover";

/**
 * DiscoveryExperience — the ecosystem discovery workspace on the v4 OS runtime.
 *
 * Discovery is the entry point to the UNIBUD ecosystem. It owns:
 * People, Communities, Clubs, Events, Marketplace discovery, Opportunities,
 * Creators, Trending, Recommendations, Search, and Campus exploration.
 *
 * Discovery never owns messaging, profiles, wallet, or academic management.
 *
 * Platform Core integration:
 * • ContextProvider — sets hybrid context (discovery is context-neutral)
 * • Orbit — recommendation engine powers suggestions
 * • Search — universal search surfaces here
 * • Realtime Engine — live trending and activity updates
 */
export default function DiscoveryExperience() {
  const { setContext } = useContextSystem();

  useEffect(() => {
    setContext("hybrid");
  }, [setContext]);

  return <Discover />;
}