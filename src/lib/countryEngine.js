/**
 * UNIBUD Global Country Engine
 *
 * Every country follows one architecture. Only the data changes.
 * The architecture never changes.
 *
 * Each country supports the same set of domains, configured via
 * the Country Registry. No country-specific code — everything is
 * data-driven and registry-referenced.
 */

import {
  Landmark, GraduationCap, HeartPulse, Banknote, Bus,
  Phone, Newspaper, Trophy, Clapperboard, Briefcase,
  Award, FlaskConical, Plane, MapPin, CloudSun,
  Siren, Sparkles,
} from "lucide-react";

export const COUNTRY_DOMAINS = [
  {
    id: "government",
    label: "Government",
    icon: Landmark,
    color: "text-primary",
    description: "Government services, ministries, and regulatory bodies",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    color: "text-info",
    description: "Education system, institutions, and academic structures",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: HeartPulse,
    color: "text-error",
    description: "Healthcare services, hospitals, and medical information",
  },
  {
    id: "finance",
    label: "Finance",
    icon: Banknote,
    color: "text-success",
    description: "Banking, payments, and financial services",
  },
  {
    id: "transport",
    label: "Transport",
    icon: Bus,
    color: "text-warning",
    description: "Public transport, roads, and commute information",
  },
  {
    id: "telecommunications",
    label: "Telecommunications",
    icon: Phone,
    color: "text-info",
    description: "Telecom providers, networks, and connectivity",
  },
  {
    id: "news",
    label: "News",
    icon: Newspaper,
    color: "text-foreground",
    description: "News sources and current affairs",
  },
  {
    id: "sports",
    label: "Sports",
    icon: Trophy,
    color: "text-warning",
    description: "Official sports information, fixtures, and standings",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Clapperboard,
    color: "text-purple",
    description: "Entertainment, media, and cultural content",
  },
  {
    id: "employment",
    label: "Employment",
    icon: Briefcase,
    color: "text-info",
    description: "Job markets, employment services, and career resources",
  },
  {
    id: "scholarships",
    label: "Scholarships",
    icon: Award,
    color: "text-success",
    description: "Scholarship opportunities and funding programs",
  },
  {
    id: "research",
    label: "Research",
    icon: FlaskConical,
    color: "text-purple",
    description: "Research institutions, publications, and academic output",
  },
  {
    id: "tourism",
    label: "Tourism",
    icon: Plane,
    color: "text-info",
    description: "Tourism, travel, and cultural landmarks",
  },
  {
    id: "maps",
    label: "Maps",
    icon: MapPin,
    color: "text-warning",
    description: "Mapping services and geographic data",
  },
  {
    id: "weather",
    label: "Weather",
    icon: CloudSun,
    color: "text-info",
    description: "Weather data and climate information",
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: Siren,
    color: "text-error",
    description: "Emergency services and safety information",
  },
  {
    id: "culture",
    label: "Culture",
    icon: Sparkles,
    color: "text-purple",
    description: "Cultural heritage, traditions, and community life",
  },
];

export const COUNTRY_ENGINE_PRINCIPLES = [
  "One architecture for every country — only the data changes",
  "No country-specific code — everything is registry-driven",
  "Every country supports the same 17 domains",
  "Operators extend country data via the Country Registry without changing code",
  "The platform supports worldwide growth without redesigning the architecture",
];

export function getDomainById(id) {
  return COUNTRY_DOMAINS.find((d) => d.id === id);
}

export function getCountryConfig(countryCode) {
  // In production, this fetches from the Country Registry entity.
  // The architecture ensures every country returns the same domain structure.
  return {
    country_code: countryCode,
    domains: COUNTRY_DOMAINS.map((d) => ({
      ...d,
      configured: false, // Will be true when registry data is populated
      data_sources: [],
    })),
  };
}