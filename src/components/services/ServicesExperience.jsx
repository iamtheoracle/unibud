import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import Services from "@/pages/Services";

/**
 * ServicesExperience — the migrated Services gateway on the v4 OS runtime.
 *
 * Services is the gateway to hidden products. It exposes workflows like:
 * Marketplace, Wallet, Housing, Tutors, Printing, Food, Transport,
 * Healthcare, Campus Services, Student ID, and Payments.
 *
 * Marketplace and Wallet remain hidden products — they are launched through
 * Services or by user intent, never as permanent navigation destinations.
 *
 * Platform Core integration:
 * • ContextProvider — sets hybrid context (gateway is context-neutral)
 * • Bud — personalized service recommendations
 * • Orbit — context-aware service surfacing
 * • Spark — workflow automation for service requests
 * • Realtime Engine — service availability updates instantly
 *
 * Migration, not reconstruction. User-visible behavior is unchanged.
 * Services is the canonical services gateway implementation.
 */
export default function ServicesExperience() {
  const { setContext } = useContextSystem();

  useEffect(() => {
    setContext("hybrid");
  }, [setContext]);

  return <Services />;
}