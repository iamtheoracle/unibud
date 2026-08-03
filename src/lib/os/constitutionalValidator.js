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
    // Hidden services must not appear in permanent navigation (EXPERIENCES)
    if (EXPERIENCES.find((e) => e.id === service.id)) {
      results.errors.push(`Hidden service "${service.id}" must not appear in permanent navigation`);
      results.valid = false;
    }
  });

  // Phase 4: Every experience in the manifest must be registered in the Experience Registry
  const registeredExperiences = getRegisteredExperiences();
  const registeredIds = new Set(registeredExperiences.map((e) => e.id));
  EXPERIENCES.forEach((manifestExp) => {
    if (!registeredIds.has(manifestExp.id)) {
      results.errors.push(`Experience "${manifestExp.id}" is in the manifest but not registered in the Experience Registry`);
      results.valid = false;
    }
  });

  // Phase 4: Bud must never be registered as an experience
  if (registeredIds.has("bud")) {
    results.errors.push("Bud must never be registered as a permanent experience — Bud is omnipresent, not a destination");
    results.valid = false;
  }

  // Phase 4: Marketplace and Wallet must never be registered as experiences
  if (registeredIds.has("marketplace")) {
    results.errors.push("Marketplace must be a hidden service, not a permanent experience");
    results.valid = false;
  }
  if (registeredIds.has("wallet")) {
    results.errors.push("Wallet must be a hidden service, not a permanent experience");
    results.valid = false;
  }

  // Phase 4: Every experience must consume modules from the Module Registry
  registeredExperiences.forEach((exp) => {
    if (exp.modules && exp.modules.length > 0) {
      exp.modules.forEach((moduleId) => {
        if (moduleId !== "none" && !isModuleRegistered(moduleId)) {
          results.errors.push(`Experience "${exp.id}" consumes unregistered module "${moduleId}" — every module must come from the Module Registry`);
          results.valid = false;
        }
      });
    }
  });

  return results;
}

/**
 * Validate a navigation configuration against the Phase 4 Experience Runtime.
 *
 * Ensures:
 *   - No duplicate navigation definitions
 *   - No hidden service appears in permanent navigation
 *   - Every navigation item is a registered experience
 *   - Bud is not registered as an experience or navigation item
 *   - Marketplace and Wallet are not permanent navigation items
 */
export function validateNavigation(navItems) {
  const errors = [];
  const validExperienceIds = EXPERIENCES.map((e) => e.id);
  const seen = new Set();

  // Get all hidden service IDs to check for leaks
  const services = getRegisteredServices();
  const hiddenServiceIds = services.map((s) => s.id);

  navItems.forEach((item) => {
    // Check for duplicates
    if (item.id) {
      if (seen.has(item.id)) {
        errors.push(`Duplicate navigation definition: "${item.id}" appears more than once`);
      }
      seen.add(item.id);
    }

    // Check it's a valid permanent experience
    if (item.id && !validExperienceIds.includes(item.id)) {
      errors.push(`Navigation item "${item.id}" is not a valid permanent experience`);
    }

    // Bud must be floating, not in navigation
    if (item.id === "bud") {
      errors.push("Bud must be floating and globally available, not in permanent navigation");
    }

    // Marketplace, Wallet, and all hidden services must not be in navigation
    if (["marketplace", "wallet"].includes(item.id)) {
      errors.push(`"${item.id}" must be a hidden service, not permanent navigation`);
    }
    if (hiddenServiceIds.includes(item.id)) {
      errors.push(`Hidden service "${item.id}" must not appear in permanent navigation`);
    }
  });

  // Check exactly 7 permanent experiences are registered
  if (navItems.length !== 7) {
    errors.push(`Expected exactly 7 permanent experiences in navigation, found ${navItems.length}`);
  }

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