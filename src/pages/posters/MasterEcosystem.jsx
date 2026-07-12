import React from "react";
import {
  ORACLE_SYSTEMS, PLATFORM_ENGINES, USER_OPERATING_SYSTEMS,
  STUDENT_EXPERIENCE, BUD_CAPABILITIES, INSTITUTION_EXPERIENCE,
  OPERATIONS_CENTER, COMMUNICATION_FLOW, NOTIFICATION_CENTER,
  KNOWLEDGE_NETWORK, PLATFORM_INTEGRATIONS, PLATFORM_INFRASTRUCTURE,
  USER_JOURNEY,
} from "@/lib/masterPosterData";
import {
  MasterHero, MasterSection, SectionConnector,
  BudCapabilitiesSection, JourneySection,
} from "@/components/posters/MasterPosterShared";

export default function MasterEcosystem() {
  return (
    <div
      className="dark min-h-screen"
      style={{ background: "radial-gradient(ellipse 120% 80% at 50% -10%, #0D0D0D, #050505)" }}
    >
      <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-5">
        <MasterHero />
        <SectionConnector />
        <MasterSection title="Platform Architecture" description="Oracle Systems — all connected to Oracle Core" items={ORACLE_SYSTEMS} columns={4} delay={0.1} />
        <SectionConnector />
        <MasterSection title="Platform Engines" description="Seventeen interconnected engines powering every workflow" items={PLATFORM_ENGINES} columns={6} delay={0.15} />
        <SectionConnector />
        <MasterSection title="User Operating Systems" description="Every user type has a dedicated experience" items={USER_OPERATING_SYSTEMS} columns={4} delay={0.2} />
        <SectionConnector />
        <MasterSection title="Student Experience" description="Twenty-seven modules across the complete student journey" items={STUDENT_EXPERIENCE} columns={5} delay={0.25} />
        <SectionConnector />
        <BudCapabilitiesSection items={BUD_CAPABILITIES} delay={0.3} />
        <SectionConnector />
        <MasterSection title="Institution Experience" description="Seventeen modules for university administration" items={INSTITUTION_EXPERIENCE} columns={5} delay={0.35} />
        <SectionConnector />
        <MasterSection title="Operations Center" description="Sixteen modules for platform governance" items={OPERATIONS_CENTER} columns={4} delay={0.4} />
        <SectionConnector />
        <MasterSection title="Communication Flow" description="Real-time communication channels flowing through Bud" items={COMMUNICATION_FLOW} columns={4} delay={0.45} />
        <SectionConnector />
        <MasterSection title="Notification Center" description="Grouped notifications across every category" items={NOTIFICATION_CENTER} columns={4} delay={0.5} />
        <SectionConnector />
        <MasterSection title="Oracle Knowledge Network" description="The global education knowledge graph" items={KNOWLEDGE_NETWORK} columns={5} delay={0.55} />
        <SectionConnector />
        <MasterSection title="Platform Integrations" description="Official external service integrations" items={PLATFORM_INTEGRATIONS} columns={5} delay={0.6} />
        <SectionConnector />
        <MasterSection title="Platform Infrastructure" description="Foundational platform layer" items={PLATFORM_INFRASTRUCTURE} columns={6} delay={0.65} />
        <SectionConnector />
        <JourneySection items={USER_JOURNEY} delay={0.7} />
      </div>
    </div>
  );
}