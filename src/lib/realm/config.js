/**
 * Shared Configuration Service — read-only access to the platform manifest.
 * Reuses the Platform Intelligence Layer, platform services / engines /
 * registries catalogs. No configuration is duplicated; callers reference
 * the single source of truth through this facade.
 */
import { PLATFORM_INTELLIGENCE, generatePlatformIntelligenceReport } from "@/lib/platformIntelligence";
import { PLATFORM_SERVICES, getServiceById } from "@/lib/platformServices";
import { PLATFORM_ENGINES, getEngineById } from "@/lib/platformEngines";
import { REGISTRIES, getRegistryById } from "@/lib/globalRegistries";

export function configService(base44) {
  return {
    app: { name: "UNIBUD", layer: "Super Platform" },

    services: () => PLATFORM_SERVICES,
    getService: (id) => getServiceById(id),

    engines: () => PLATFORM_ENGINES,
    getEngine: (id) => getEngineById(id),

    registries: () => REGISTRIES,
    getRegistry: (id) => getRegistryById(id),

    intelligence: () => PLATFORM_INTELLIGENCE,
    report: () => generatePlatformIntelligenceReport(),
  };
}