/**
 * UNIBUD Platform Services — Shared infrastructure that powers all Oracle Systems
 *
 * Platform Services answer: "What shared infrastructure powers the platform?"
 *
 * Unlike Oracle Systems (which make decisions about business domains),
 * Platform Services are passive infrastructure — they provide capabilities
 * that every system uses, but don't make business decisions themselves.
 *
 * Integration Bridge is a Platform Service, not an Oracle System,
 * because it doesn't make decisions — it simply connects UNIBUD
 * to external services.
 *
 * Architecture:
 *
 *   Oracle Core → Bud → Oracle Systems → Platform Engines → Platform Services
 */

import {
  Plug, Settings, Bell, Search, Image, CreditCard,
} from "lucide-react";

export const PLATFORM_SERVICES = [
  {
    id: "integration_bridge",
    name: "Integration Bridge",
    codename: "Sync",
    icon: Plug,
    color: "text-info",
    bg: "bg-info/10",
    purpose: "Connect UNIBUD with approved external services",
    description:
      "Connects UNIBUD with approved external services. It doesn't make decisions — it simply connects the platform to external APIs, providers, and systems. All integrations are modular and configurable.",
    providers: [
      "Google", "Apple", "Microsoft", "Payment providers",
      "Maps", "Weather", "Calendar", "Email",
      "WhatsApp Business", "Learning platforms", "Research providers",
      "Storage providers", "Institution APIs",
    ],
    accessRoles: ["oracle", "super_admin", "developer"],
  },
  {
    id: "operations_center",
    name: "Operations Center",
    codename: "Ops",
    icon: Settings,
    color: "text-error",
    bg: "bg-error/10",
    purpose: "Centralized platform operations",
    description:
      "Centralized operations hub for support, moderation, incident management, and day-to-day platform management. Staffed by operators, moderators, and support staff.",
    capabilities: [
      "Support ticket management", "Incident response",
      "Moderation queues", "System monitoring",
      "Fraud prevention", "Verification queues",
    ],
    accessRoles: ["oracle", "super_admin", "platform_admin", "operator", "senior_operator", "moderator", "operations_staff"],
  },
  {
    id: "notification_service",
    name: "Notification Service",
    codename: "Notify",
    icon: Bell,
    color: "text-warning",
    bg: "bg-warning/10",
    purpose: "Unified notification delivery",
    description:
      "Delivers notifications across all channels: push, in-app, email, and SMS. Manages notification preferences, digest scheduling, priority routing, and delivery tracking.",
    capabilities: [
      "Push notifications", "In-app notifications",
      "Email notifications", "SMS notifications",
      "Notification preferences", "Digest scheduling",
      "Priority routing", "Delivery tracking",
    ],
    accessRoles: ["all"],
  },
  {
    id: "search_service",
    name: "Search Service",
    codename: "Search",
    icon: Search,
    color: "text-primary",
    bg: "bg-primary/10",
    purpose: "Universal search across the platform",
    description:
      "Powers universal search across all modules, entities, resources, and people. Provides instant results, faceted filtering, search history, and intelligent ranking.",
    capabilities: [
      "Universal search", "Faceted filtering",
      "Search history", "Intelligent ranking",
      "Instant results", "Entity search",
      "People search", "Resource search",
    ],
    accessRoles: ["all"],
  },
  {
    id: "media_service",
    name: "Media Service",
    codename: "Media",
    icon: Image,
    color: "text-purple",
    bg: "bg-purple/10",
    purpose: "Media storage, processing, and delivery",
    description:
      "Manages all media: image, video, audio, and document storage, processing, optimization, CDN delivery, and thumbnail generation. Handles uploads, transcoding, and access control.",
    capabilities: [
      "Image storage", "Video storage", "Audio storage",
      "Document storage", "Media processing",
      "Optimization", "CDN delivery",
      "Thumbnail generation", "Access control",
    ],
    accessRoles: ["all"],
  },
  {
    id: "payment_service",
    name: "Payment Service",
    codename: "Pay",
    icon: CreditCard,
    color: "text-success",
    bg: "bg-success/10",
    purpose: "Payment processing and billing",
    description:
      "Handles all payment processing, billing, subscriptions, refunds, and financial transactions. Integrates with payment providers via the Integration Bridge. Every transaction is logged and auditable.",
    capabilities: [
      "Payment processing", "Billing",
      "Subscriptions", "Refunds",
      "Transaction logging", "Financial reporting",
      "Invoice generation", "Payment verification",
    ],
    accessRoles: ["oracle", "super_admin", "finance_manager"],
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────
export function getServiceById(id) {
  return PLATFORM_SERVICES.find((s) => s.id === id);
}