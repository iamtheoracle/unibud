/**
 * UNIBUD Global Registries — Registry-Driven Architecture
 *
 * Nothing is hardcoded. Every module references registries instead of
 * embedding data. This enables worldwide growth without redesigning
 * the platform architecture.
 *
 * Nine registries power the platform:
 *   Country · Knowledge Source · Institution · Organization · Service
 *   Partner · Connector · User · Verification
 */

import {
  Globe, BookOpen, Building2, Briefcase, Server,
  Handshake, Plug, Users, ShieldCheck,
} from "lucide-react";

export const REGISTRIES = [
  {
    id: "country",
    name: "Country Registry",
    icon: Globe,
    color: "text-primary",
    bg: "bg-primary/10",
    description:
      "Every country follows one architecture. Government, education, healthcare, finance, transport, telecommunications, employment, scholarships, research, maps, weather, tourism, news, sports, entertainment, student life, and emergency services. Only the data changes — the architecture never changes.",
    recordCount: 195,
    fields: [
      "name", "iso_code", "region", "currency", "languages",
      "education_system", "phone_code", "flag_emoji", "timezones",
      "supported_domains",
    ],
    configurable: true,
  },
  {
    id: "knowledge_source",
    name: "Knowledge Source Registry",
    icon: BookOpen,
    color: "text-info",
    bg: "bg-info/10",
    description:
      "Structured registry of trusted knowledge sources: education, governments, research, scholarships, international organizations, news, health, transport, finance, maps, weather, developer resources, AI platforms, and other approved services. Every source supports verification, version history, localization, trust levels, country coverage, ownership, audit history, and search indexing.",
    recordCount: 0,
    fields: [
      "name", "source_type", "url", "trust_level", "verification_status",
      "country_coverage", "language_coverage", "last_updated", "owner",
      "version", "audit_history", "search_indexed",
    ],
    configurable: true,
  },
  {
    id: "institution",
    name: "Institution Registry",
    icon: Building2,
    color: "text-warning",
    bg: "bg-warning/10",
    description:
      "Worldwide institution index: universities, polytechnics, colleges of education, technical institutes, higher colleges, community colleges, and other higher education institutions. No hardcoded institutions — every institution is a configurable registry record with academic structure, calendar, terminology, grading, and verification status.",
    recordCount: 0,
    fields: [
      "name", "short_name", "type", "country", "city", "website",
      "logo_url", "accent_color", "academic_structure", "academic_calendar",
      "identifier_types", "credit_system", "grading_system", "terminology",
      "verification_status", "data_sources",
    ],
    configurable: true,
  },
  {
    id: "organization",
    name: "Organization Registry",
    icon: Briefcase,
    color: "text-info",
    bg: "bg-info/10",
    description:
      "Organizations connected to the education ecosystem: companies, NGOs, government agencies, research labs, startups, and other organizations that offer jobs, internships, scholarships, partnerships, or services to students and institutions.",
    recordCount: 0,
    fields: [
      "name", "type", "industry", "size", "headquarters", "locations",
      "website", "logo_url", "is_hiring", "is_sponsor", "social_links",
    ],
    configurable: true,
  },
  {
    id: "service",
    name: "Service Registry",
    icon: Server,
    color: "text-purple",
    bg: "bg-purple/10",
    description:
      "Internal specialist services coordinated by Oracle and accessed through Bud. Academic, Admissions, Research, Library, Scholarship, Career, Marketplace, Housing, Transport, Community, Event, Security, Moderation, Analytics, Integration, Notification, Payment, and Communication Services.",
    recordCount: 18,
    fields: [
      "name", "parent_agent", "domain", "modules", "access_roles",
      "description", "status",
    ],
    configurable: true,
  },
  {
    id: "partner",
    name: "Partner Registry",
    icon: Handshake,
    color: "text-success",
    bg: "bg-success/10",
    description:
      "Strategic partners: payment providers, cloud services, telecom operators, education boards, government agencies, and other organizations with formal partnerships that enable platform integrations and services.",
    recordCount: 0,
    fields: [
      "name", "partner_type", "partnership_level", "contact_email",
      "contract_start", "contract_end", "services_provided", "status",
    ],
    configurable: true,
  },
  {
    id: "connector",
    name: "Connector Registry",
    icon: Plug,
    color: "text-info",
    bg: "bg-info/10",
    description:
      "OAuth connectors and integration bridges: Google, Apple, Microsoft, Slack, GitHub, Notion, Salesforce, HubSpot, and other approved external services. Each connector has configurable scopes, connection modes (shared, app-user, BYO-shared), and webhook support.",
    recordCount: 0,
    fields: [
      "name", "integration_type", "connection_mode", "scopes",
      "webhook_supported", "auth_status", "connector_id",
    ],
    configurable: true,
  },
  {
    id: "user",
    name: "User Registry",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    description:
      "All platform users: future students, students, lecturers, platform operators, and feature-flagged roles (alumni, institution staff, university administration). Every user has a journey stage, institution context, role, and permission profile.",
    recordCount: 0,
    fields: [
      "full_name", "email", "role", "user_type", "university",
      "faculty", "department", "level", "journey_stage",
      "institution_verification_status", "permissions",
    ],
    configurable: false,
  },
  {
    id: "verification",
    name: "Verification Registry",
    icon: ShieldCheck,
    color: "text-error",
    bg: "bg-error/10",
    description:
      "Verification records: institution verification, lecturer identity verification, student identifier verification, and organization verification. Every verification has a method, status, verifier, timestamp, and audit trail.",
    recordCount: 0,
    fields: [
      "entity_type", "entity_id", "verification_method", "status",
      "verified_by_id", "verified_at", "evidence_url", "notes",
    ],
    configurable: false,
  },
];

export function getRegistryById(id) {
  return REGISTRIES.find((r) => r.id === id);
}

export const REGISTRY_PRINCIPLES = [
  "No module should hardcode country-specific logic or external websites",
  "Everything references registries instead of embedding data",
  "Every registry record is configurable, versioned, searchable, auditable, and scalable",
  "Operators can extend any registry without changing platform code",
  "The platform supports worldwide growth without redesigning the architecture",
];