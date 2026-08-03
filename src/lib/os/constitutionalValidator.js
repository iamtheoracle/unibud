/**
 * UNIBUD OS v4 — Constitutional Validator
 *
 * Validates every build against the five constitutional documents.
 * The build fails if any constitutional rule is violated.
 *
 * References: All five constitutional documents.
 */

import { EXPERIENCES, LAYERS, AI_AUTHORITIES } from "@/lib/os/manifest";
import { getRegisteredModules, isModuleRegistered } from "@/lib/os/moduleRegistry";
import { getRegisteredExperiences } from "@/lib/os/experienceRegistry";
import { getRegisteredServices } from "@/lib/os/hiddenServiceRegistry";

/**
 * Validate a feature against the constitutional four questions.
 * Returns { valid, errors, warnings }.
 */
export function validateFeature(feature) {
  const errors = [];
  const warnings = [];

  // 1. Which layer owns this?
  if (!feature.layer) {
    errors.push("Missing layer ownership — every feature must declare its owning layer");
  } else if (!LAYERS.find((l) => l.id === feature.layer)) {
    errors.push(`Invalid layer "${feature.layer}" — valid layers: ${LAYERS.map((l) => l.id).join(", ")}`);
  }

  // 2. Which authority governs it?
  if (!feature.authority) {
    errors.push("Missing governing authority — every feature must declare its authority");
  } else if (!AI_AUTHORITIES.includes(feature.authority)) {
    errors.push(`Invalid authority "${feature.authority}" — valid authorities: ${AI_AUTHORITIES.join(", ")}`);
  }

  // 3. Which shared module provides it?
  if (!feature.module) {
    errors.push("Missing shared module — every feature must declare its implementing module");
  } else if (feature.module !== "none" && !isModuleRegistered(feature.module)) {
    warnings.push(`Module "${feature.module}" is not yet registered in the module registry`);
  }

  // 4. Which workspace consumes it?
  if (!feature.experience) {
    errors.push("Missing consuming experience — every feature must declare which workspace presents it");
  } else if (!EXPERIENCES.find((e) => e.id === feature.experience)) {
    errors.push(`Invalid experience "${feature.experience}" — valid experiences: ${EXPERIENCES.map((e) => e.id).join(", ")}`);
  }

  // 5. Does it introduce duplication?
  if (feature.duplicates) {
    errors.push("Feature duplicates an existing capability — extend the existing module instead");
  }

  // 6. Zero Demo Policy
  if (feature.hasDemoData) {
    errors.push("VIOLATION: Feature contains demo/fake data — Zero Demo Policy is absolute");
  }

  // 7. No direct API access (Engineering Commandment 2)
  if (feature.directApiAccess) {
    errors.push("VIOLATION: Feature bypasses the Integrator for external API access");
  }

  // 8. Bud visibility rules (AI Constitution)
  if (feature.exposesAuthority) {
    errors.push("VIOLATION: Feature exposes internal authorities to users — only Bud is visible");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate the entire registry state.
 * Checks for duplication, missing registrations, and constitutional compliance.
 */
export function validateRegistry() {
  const results = { valid: true, errors: [], warnings: [] };

  // Check for module duplication
  const modules = getRegisteredModules();
  const moduleIds = modules.map((m) => m.id);
  const duplicates = moduleIds.filter((id, i) => moduleIds.indexOf(id) !== i);
  if (duplicates.length > 0) {
    results.errors.push(`Duplicate modules detected: ${duplicates.join(", ")}`);
    results.valid = false;
  }

  // Check for demo data violations
  const demoViolations = modules.filter((m) => m.hasDemoData);
  if (demoViolations.length > 0) {
    results.errors.push(`Zero Demo Policy violations: ${demoViolations.map((m) => m.id).join(", ")}`);
    results.valid = false;
  }

  // Check experiences reference valid modules
  const experiences = getRegisteredExperiences();
  experiences.forEach((exp) => {
    exp.modules?.forEach((moduleId) => {
      if (moduleId !== "none" && !isModuleRegistered(moduleId)) {
        results.warnings.push(`Experience "${exp.id}" references unregistered module "${moduleId}"`);
      }
    });
  });

  // Check hidden services are not in navigation
  const services = getRegisteredServices();
  services.forEach((service) => {
    if (!service.isHidden) {
      results.warnings.push(`Service "${service.id}" should be marked as hidden`);
    }
  });

  return results;
}

/**
 * Validate a route configuration.
 * Ensures only the seven permanent experiences appear in navigation.
 */
export function validateNavigation(navItems) {
  const errors = [];
  const validExperienceIds = EXPERIENCES.map((e) => e.id);

  navItems.forEach((item) => {
    if (item.id && !validExperienceIds.includes(item.id) && !["bud"].includes(item.id)) {
      errors.push(`Navigation item "${item.id}" is not a valid permanent experience`);
    }
    // Bud must be floating, not in navigation
    if (item.id === "bud") {
      errors.push("Bud must be floating and globally available, not in permanent navigation");
    }
    // Marketplace and Wallet must be hidden
    if (["marketplace", "wallet"].includes(item.id)) {
      errors.push(`"${item.id}" must be a hidden service, not permanent navigation`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Run a full constitutional audit.
 * Returns a comprehensive report.
 */
export function runConstitutionalAudit() {
  const registry = validateRegistry();
  const report = {
    timestamp: new Date().toISOString(),
    valid: registry.valid,
    errors: registry.errors,
    warnings: registry.warnings,
    modules: getRegisteredModules().length,
    experiences: getRegisteredExperiences().length,
    services: getRegisteredServices().length,
  };
  return report;
}

// Export for dev-time console access
if (typeof window !== "undefined") {
  window.__UNIBUD_AUDIT__ = runConstitutionalAudit;
}