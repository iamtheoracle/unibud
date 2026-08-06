/**
 * Marketplace Capability Platform Specification
 *
 * Directive 5 (refined): The Marketplace is not a list of separate marketplaces.
 * It is a single commerce platform built on reusable primitives. Individual
 * marketplaces (Student, Institution, Digital, Book, Accommodation, Services,
 * Freelance, Event Tickets, Food Ordering, Equipment Rental) are configurations
 * of the same underlying platform.
 *
 * This is an implementation document — it changes as the commerce platform evolves.
 */

// ─── Commerce Primitives ──────────────────────────────────────────────────
// Every marketplace is built from these reusable capabilities.
export const COMMERCE_PRIMITIVES = [
  {
    id: "listings",
    label: "Listings",
    description: "Create, edit, publish, and manage product/service listings",
    ownedBy: "orbit",
  },
  {
    id: "catalog",
    label: "Catalog",
    description: "Structured catalog with categories, tags, attributes, and search",
    ownedBy: "lens",
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock tracking, availability, variants, and reservations",
    ownedBy: "forge",
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Dynamic pricing, discounts, bundles, and currency support",
    ownedBy: "forge",
  },
  {
    id: "orders",
    label: "Orders",
    description: "Order creation, lifecycle, fulfillment tracking, and history",
    ownedBy: "forge",
  },
  {
    id: "payments",
    label: "Payments",
    description: "Payment processing, split payments, and refunds via Bank Service",
    ownedBy: "oracle",
  },
  {
    id: "escrow",
    label: "Escrow",
    description: "Hold funds until delivery confirmation — marketplace trust",
    ownedBy: "sentinel",
  },
  {
    id: "disputes",
    label: "Disputes",
    description: "Dispute resolution, mediation, and outcome tracking",
    ownedBy: "sentinel",
  },
  {
    id: "messaging",
    label: "Messaging",
    description: "Buyer-seller communication, inquiries, and negotiations",
    ownedBy: "echo",
  },
  {
    id: "ratings",
    label: "Ratings & Reviews",
    description: "Product and seller ratings, review moderation, trust scores",
    ownedBy: "sentinel",
  },
  {
    id: "delivery",
    label: "Delivery",
    description: "Delivery options, tracking, pickup coordination",
    ownedBy: "forge",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Sales metrics, GMV tracking, seller performance, trends",
    ownedBy: "pulse",
  },
];

// ─── Marketplace Configurations ──────────────────────────────────────────
// Each marketplace is a configuration of the same primitives — not a separate codebase.
export const MARKETPLACE_CONFIGS = [
  {
    id: "student",
    label: "Student Marketplace",
    description: "Peer-to-peer buying, selling, and trading among students",
    primitives: ["listings", "catalog", "orders", "payments", "messaging", "ratings"],
    identity: "casual, social, campus-native",
    ownedBy: "orbit",
  },
  {
    id: "institution",
    label: "Institution Marketplace",
    description: "Official institution-sanctioned commerce (merch, supplies)",
    primitives: ["listings", "catalog", "inventory", "orders", "payments", "delivery", "analytics"],
    identity: "official, institutional",
    ownedBy: "orbit",
  },
  {
    id: "digital",
    label: "Digital Marketplace",
    description: "Digital goods — notes, templates, software, digital art",
    primitives: ["listings", "catalog", "orders", "payments", "escrow", "ratings", "analytics"],
    identity: "modern, tech-forward, instant delivery",
    ownedBy: "orbit",
  },
  {
    id: "book",
    label: "Book Marketplace",
    description: "Textbooks, course materials, and academic books",
    primitives: ["listings", "catalog", "inventory", "orders", "payments", "delivery", "ratings"],
    identity: "academic, organized by course/subject",
    ownedBy: "orbit",
  },
  {
    id: "accommodation",
    label: "Accommodation Marketplace",
    description: "Student housing, room rentals, and short-term stays",
    primitives: ["listings", "catalog", "orders", "payments", "escrow", "messaging", "ratings", "disputes"],
    identity: "trust-focused, detailed, verification-heavy",
    ownedBy: "orbit",
  },
  {
    id: "services",
    label: "Services Marketplace",
    description: "Tutoring, design, writing, tech support, and other services",
    primitives: ["listings", "catalog", "orders", "payments", "escrow", "messaging", "ratings", "disputes"],
    identity: "professional, portfolio-driven",
    ownedBy: "orbit",
  },
  {
    id: "freelance",
    label: "Freelance Marketplace",
    description: "Project-based work, gigs, and freelance opportunities",
    primitives: ["listings", "catalog", "orders", "payments", "escrow", "messaging", "ratings", "disputes", "analytics"],
    identity: "project-focused, milestone-driven",
    ownedBy: "orbit",
  },
  {
    id: "event_tickets",
    label: "Event Tickets",
    description: "Ticket sales for campus events, concerts, and gatherings",
    primitives: ["listings", "catalog", "inventory", "orders", "payments", "delivery", "analytics"],
    identity: "urgency-driven, social, shareable",
    ownedBy: "orbit",
  },
  {
    id: "food_ordering",
    label: "Food Ordering",
    description: "Campus food vendors, restaurants, and meal delivery",
    primitives: ["listings", "catalog", "inventory", "orders", "payments", "delivery", "ratings", "analytics"],
    identity: "fast, visual, real-time tracking",
    ownedBy: "orbit",
  },
  {
    id: "equipment_rental",
    label: "Equipment Rental",
    description: "Rent equipment — cameras, projectors, lab gear, sports equipment",
    primitives: ["listings", "catalog", "inventory", "orders", "payments", "escrow", "delivery", "ratings", "disputes"],
    identity: "logistics-focused, availability-driven",
    ownedBy: "orbit",
  },
];

// ─── Product Identity Rules ───────────────────────────────────────────────
// Directive 7: Each marketplace has its own identity but shares primitives.
export const MARKETPLACE_IDENTITIES = {
  rule: "Every marketplace must have its own navigation, interactions, colors, motion, typography, empty states, and dashboards. They belong to one ecosystem but should never feel like copies.",
  colorMapping: {
    student: "vibrant, social",
    institution: "formal, authoritative",
    digital: "electric, modern",
    book: "warm, academic",
    accommodation: "trust, safety",
    services: "professional, clean",
    freelance: "dynamic, portfolio",
    event_tickets: "exciting, urgent",
    food_ordering: "appetizing, fast",
    equipment_rental: "practical, logistical",
  },
};

// ─── Engineering Gates for Marketplace ────────────────────────────────────
export const MARKETPLACE_ENGINEERING_PLAN = {
  phase1: {
    name: "Commerce Primitive Platform",
    gates: ["Discovery", "Architecture", "Design", "Implementation", "Testing", "Security Review", "Performance Review", "Documentation", "Deployment", "Monitoring"],
    deliverable: "Reusable commerce primitives as independent modules",
    owner: "forge",
  },
  phase2: {
    name: "Marketplace Configurations",
    gates: ["Discovery", "Design", "Implementation", "Testing", "Accessibility Review", "Documentation", "Deployment", "Monitoring"],
    deliverable: "Individual marketplaces configured from primitives with unique identities",
    owner: "orbit",
  },
  phase3: {
    name: "Commerce Analytics & GMV Tracking",
    gates: ["Architecture", "Implementation", "Testing", "Documentation", "Monitoring"],
    deliverable: "Platform KPI tracking — GMV, seller performance, adoption",
    owner: "pulse",
  },
};