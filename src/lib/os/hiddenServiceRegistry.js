/**
 * UNIBUD OS v4 — Hidden Service Registry
 *
 * Services that are never part of permanent navigation.
 * They appear only when requested or contextually relevant.
 *
 * References: OS Constitution (Marketplace & Wallet decoupled from navigation),
 * Engineering Constitution (Commandment 6 — strengthen the OS).
 */

import { HIDDEN_SERVICES } from "@/lib/os/manifest";

const REGISTRY = new Map();

/**
 * Register a hidden service.
 * @param {Object} service - Service definition
 * @param {string} service.id - Unique identifier
 * @param {string} service.name - Display name
 * @param {string} service.to - Route path
 * @param {string} service.icon - Lucide icon name
 * @param {string} service.description - What the service does
 * @param {string} [service.context] - When this service is most relevant
 * @param {string[]} [service.triggers] - Contextual triggers that surface this service
 * @param {boolean} [service.requiresAuth] - Whether authentication is required
 * @param {string[]} [service.permissions] - Required permissions
 */
export function registerHiddenService(service) {
  if (!service.id) throw new Error("Service registration requires an id");
  REGISTRY.set(service.id, {
    ...service,
    layer: "experiences",
    isHidden: true,
    registeredAt: Date.now(),
  });
  return REGISTRY.get(service.id);
}

/**
 * Get a hidden service by ID.
 */
export function getService(id) {
  return REGISTRY.get(id);
}

/**
 * Get all registered hidden services.
 */
export function getRegisteredServices() {
  return Array.from(REGISTRY.values());
}

/**
 * Get services relevant to a given context.
 * Services without context triggers are always available.
 */
export function getServicesForContext(contextId) {
  return getRegisteredServices().filter((s) => {
    if (!s.triggers || s.triggers.length === 0) return true;
    return s.triggers.includes(contextId);
  });
}

/**
 * Get services triggered by a specific event/time context.
 * @param {string} trigger - e.g., "exam-week", "weekend", "morning-before-class"
 */
export function getServicesByTrigger(trigger) {
  return getRegisteredServices().filter((s) => s.triggers?.includes(trigger));
}

// ─── Register Core Hidden Services ────────────────────────────────────────

const CORE_SERVICES = [
  {
    id: "marketplace",
    name: "Marketplace",
    to: "/services/marketplace",
    icon: "ShoppingBag",
    description: "Buy, sell, and trade within the campus community",
    triggers: ["weekend"],
    requiresAuth: true,
    permissions: ["read:marketplace"],
  },
  {
    id: "wallet",
    name: "Wallet",
    to: "/services/wallet",
    icon: "Wallet",
    description: "Payments, tuition, scholarships, and student banking",
    requiresAuth: true,
    permissions: ["read:wallet"],
  },
  {
    id: "housing",
    name: "Housing",
    to: "/services/housing",
    icon: "Home",
    description: "Off-campus accommodation listings and housing services",
    triggers: ["weekend"],
    requiresAuth: true,
  },
  {
    id: "student-jobs",
    name: "Student Jobs",
    to: "/services/student-jobs",
    icon: "Briefcase",
    description: "On-campus employment opportunities and work-study programs",
    requiresAuth: true,
  },
  {
    id: "tutors",
    name: "Tutors",
    to: "/services/tutors",
    icon: "GraduationCap",
    description: "Find peer and professional tutors for your courses",
    triggers: ["exam-week"],
    requiresAuth: true,
  },
  {
    id: "campus-services",
    name: "Campus Services",
    to: "/services/campus-services",
    icon: "Building2",
    description: "Facilities, maintenance, laundry, and campus utilities",
  },
  {
    id: "payments",
    name: "Payments",
    to: "/services/payments",
    icon: "CreditCard",
    description: "Pay fees, recharge wallet, and manage payment methods",
    requiresAuth: true,
    permissions: ["read:wallet"],
  },
  {
    id: "student-id",
    name: "Student ID",
    to: "/services/student-id",
    icon: "IdCard",
    description: "Digital student ID card and campus credentials",
    requiresAuth: true,
  },
  {
    id: "ticketing",
    name: "Ticketing",
    to: "/services/ticketing",
    icon: "Ticket",
    description: "Event tickets, transport passes, and campus bookings",
    requiresAuth: true,
  },
  {
    id: "printing",
    name: "Printing",
    to: "/services/printing",
    icon: "Printer",
    description: "Campus printing services and document submission",
    triggers: ["exam-week"],
  },
  {
    id: "transport",
    name: "Transport",
    to: "/services/transport",
    icon: "Bus",
    description: "Bus routes, shuttle schedules, and transport bookings",
    triggers: ["morning-before-class"],
  },
  {
    id: "food",
    name: "Food",
    to: "/services/food",
    icon: "UtensilsCrossed",
    description: "Campus dining, food ordering, and meal plans",
    triggers: ["weekend"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    to: "/services/healthcare",
    icon: "HeartPulse",
    description: "Campus clinic, health services, and appointments",
  },
  {
    id: "campus-utilities",
    name: "Campus Utilities",
    to: "/services/campus-utilities",
    icon: "Plug",
    description: "Electricity, data, laundry, and campus utility services",
  },
];

CORE_SERVICES.forEach((service) => registerHiddenService(service));