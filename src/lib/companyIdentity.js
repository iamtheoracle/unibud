/**
 * UNIBUD — Official Company Identity
 * Owner: My Realm Network Limited
 *
 * Single source of truth for the platform's corporate identity.
 * All screens, legal pages, and internal metadata reference these values.
 * Students only ever see the `public` fields; `PLATFORM_INTERNAL_METADATA`
 * is reserved for Spark Kernel configuration and API headers and is never
 * surfaced in the student UI.
 */

export const COMPANY_IDENTITY = {
  companyName: "My Realm Network Limited",
  shortName: "My Realm Network",
  rcNumber: "RC 9645700",
  rcNumberShort: "9645700",
  country: "Federal Republic of Nigeria",
  countryShort: "Nigeria",
  city: "Abuja",
  tagline: "The Future Starts Together.",
  copyright: "© 2026 My Realm Network Limited. All Rights Reserved.",
  parentOrganization: "My Realm Network Limited",
};

export const PLATFORM_IDENTITY = {
  product: "UNIBUD",
  version: "1.0",
  build: "Production",
  core: "Spark Kernel",
  companion: "Bud",
};

/**
 * Internal metadata — Spark Kernel configuration & API headers only.
 * Never expose technical details from this object to students.
 */
export const PLATFORM_INTERNAL_METADATA = {
  organization: "My Realm Network Limited",
  platform: "UNIBUD",
  core: "Spark",
  registration: "RC9645700",
};

// Legal footer convenience strings.
export const LEGAL_OWNERSHIP =
  "This application is owned and operated by My Realm Network Limited (RC 9645700).";
export const LEGAL_PROVIDER =
  "This service is provided by My Realm Network Limited. Corporate Registration Number: RC 9645700.";