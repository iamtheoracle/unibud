/**
 * UNIBUD OS v4 — Constitutional Validator
 *
 * Validates every build against the five constitutional documents.
 * The build fails if any constitutional rule is violated.
 *
 * References: All five constitutional documents.
 */

import { EXPERIENCES, LAYERS, AI_AUTHORITIES } from "@/lib/os/manifest";
import { getRegisteredModules, isModuleRegistered, getModule, getModulesByCategory } from "@/lib/os/moduleRegistry";
import { getRegisteredExperiences } from "@/lib/os/experienceRegistry";
import { getRegisteredServices } from "@/lib/os/hiddenServiceRegistry";
import { validateAllContracts, getAllContracts, getContract, validateContract } from "@/lib/os/experienceContract";
import { SYNC_REGISTRY } from "@/lib/realtime/entitySyncRegistry";

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
 * Phase 5: Validate experience contracts.
 * Ensures every experience uses only registered modules, owns no Platform Core
 * services, has no duplicate implementations, and registers all four hooks.
 */
export function validateExperienceContracts() {
  const results = { valid: true, errors: [], warnings: [] };
  const contractValidation = validateAllContracts();

  if (!contractValidation.valid) {
    results.valid = false;
    results.errors.push(...contractValidation.errors);
  }
  results.warnings.push(...contractValidation.warnings);

  // Check: No experience may own Platform Core services
  const platformCoreModules = ["search", "notifications", "identity"];
  const contracts = getAllContracts();
  contracts.forEach((contract) => {
    contract.modules?.forEach((moduleId) => {
      if (platformCoreModules.includes(moduleId)) {
        results.errors.push(`Experience "${contract.experienceId}" owns Platform Core module "${moduleId}" — must consume from Platform Core`);
        results.valid = false;
      }
    });
  });

  // Check: No direct external API calls from experiences (heuristic — flag modules without authority)
  contracts.forEach((contract) => {
    if (!contract.hooks?.bud || !contract.hooks?.orbit || !contract.hooks?.spark || !contract.hooks?.realtime) {
      results.errors.push(`Experience "${contract.experienceId}" does not register all four Platform Core hooks (Bud, Orbit, Spark, Realtime)`);
      results.valid = false;
    }
  });

  return results;
}

/**
 * Phase 6: Validate Campus migration compliance.
 * Ensures Campus uses only registered modules, owns no Platform Core services,
 * has no duplicate academic implementations, and fully satisfies its contract.
 */
export function validateCampusMigration() {
  const contract = getContract("campus");
  if (!contract) {
    return { valid: false, errors: ["No Campus contract registered"], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  // Campus uses only registered modules
  contract.modules.forEach((moduleId) => {
    if (!isModuleRegistered(moduleId)) {
      errors.push(`Campus uses unregistered module "${moduleId}"`);
    }
  });

  // Campus owns no Platform Core services
  const platformCoreCategories = ["platform-core"];
  const platformCoreModules = ["search", "notifications", "identity", "ai", "realtime", "integrations"];
  contract.modules.forEach((moduleId) => {
    if (platformCoreModules.includes(moduleId)) {
      errors.push(`Campus owns Platform Core service "${moduleId}" — must consume from Platform Core`);
    }
    const mod = getModule(moduleId);
    if (mod && platformCoreCategories.includes(mod.category)) {
      errors.push(`Campus owns Platform Core module "${moduleId}"`);
    }
  });

  // No duplicate academic implementations
  const academicModules = getModulesByCategory("academic");
  const moduleIds = academicModules.map((m) => m.id);
  const duplicates = moduleIds.filter((id, index) => moduleIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate academic modules detected: ${duplicates.join(", ")}`);
  }

  // All realtime flows use the Realtime Engine — verify entity sync coverage
  // Every academic entity must be in SYNC_REGISTRY so Campus updates instantly
  // with no manual refresh. Missing entities are a constitutional violation.
  const academicEntities = [...new Set(academicModules.map((m) => m.entity).filter(Boolean))];
  const unsyncedEntities = academicEntities.filter((e) => !SYNC_REGISTRY[e]);
  if (unsyncedEntities.length > 0) {
    errors.push(`Academic entities not synced by Realtime Engine: ${unsyncedEntities.join(", ")}`);
  }

  // No direct provider calls exist inside Campus
  // Campus must not make direct API calls to external providers — all
  // integrations flow through Platform Core (Bud, Orbit, Spark, Realtime).
  const directProviderPatterns = ["google:", "stripe:", "slack:", "github:", "oauth:", "external-api:"];
  const hasDirectProviderCalls = (contract.permissions || []).some((p) =>
    directProviderPatterns.some((pattern) => p.toLowerCase().startsWith(pattern))
  );
  if (hasDirectProviderCalls) {
    errors.push("Campus makes direct provider calls — must use Platform Core integrations");
  }

  // Campus fully satisfies its Experience Contract
  const contractValidation = validateContract("campus");
  if (!contractValidation.valid) {
    errors.push(...contractValidation.errors);
  }
  warnings.push(...contractValidation.warnings);

  // Campus must be marked as migrated
  if (contract.migrationStatus !== "migrated") {
    warnings.push(`Campus migration status is "${contract.migrationStatus}" — expected "migrated"`);
  }

  // Campus must register all four Platform Core hooks
  const requiredHooks = ["bud", "orbit", "spark", "realtime"];
  requiredHooks.forEach((hook) => {
    if (!contract.hooks?.[hook]) {
      errors.push(`Campus does not register Platform Core hook "${hook}"`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Phase 7: Validate Square migration compliance.
 * Ensures Square uses only registered modules, owns no Platform Core services,
 * has no duplicate social implementations, all realtime flows use the
 * Realtime Engine, and shared modules (Feed, Community, Stories, Live,
 * Podcast) are registered implementations.
 */
export function validateSquareMigration() {
  const contract = getContract("square");
  if (!contract) {
    return { valid: false, errors: ["No Square contract registered"], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  // Square uses only registered modules
  contract.modules.forEach((moduleId) => {
    if (!isModuleRegistered(moduleId)) {
      errors.push(`Square uses unregistered module "${moduleId}"`);
    }
  });

  // Square owns no Platform Core services
  const platformCoreModules = ["search", "notifications", "identity", "ai", "realtime", "integrations"];
  contract.modules.forEach((moduleId) => {
    if (platformCoreModules.includes(moduleId)) {
      errors.push(`Square owns Platform Core service "${moduleId}" — must consume from Platform Core`);
    }
    const mod = getModule(moduleId);
    if (mod && mod.category === "platform-core") {
      errors.push(`Square owns Platform Core module "${moduleId}"`);
    }
  });

  // No duplicate social implementations — verify content modules are unique
  const contentModules = getModulesByCategory("content");
  const contentModuleIds = contentModules.map((m) => m.id);
  const duplicates = contentModuleIds.filter((id, index) => contentModuleIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate social modules detected: ${duplicates.join(", ")}`);
  }

  // Feed, Community, Stories, Live, and Podcast must be shared implementations
  const requiredSharedModules = ["posts", "communities", "stories", "live", "podcasts"];
  requiredSharedModules.forEach((moduleId) => {
    if (!isModuleRegistered(moduleId)) {
      errors.push(`Required shared module "${moduleId}" is not registered — Square cannot consume it`);
    }
    const mod = getModule(moduleId);
    if (mod && mod.consumers && !mod.consumers.includes("square")) {
      warnings.push(`Shared module "${moduleId}" does not list Square as a consumer`);
    }
  });

  // All realtime flows use the Realtime Engine — verify entity sync coverage
  const contentEntities = [...new Set(contentModules.map((m) => m.entity).filter(Boolean))];
  const unsyncedEntities = contentEntities.filter((e) => !SYNC_REGISTRY[e]);
  if (unsyncedEntities.length > 0) {
    errors.push(`Social entities not synced by Realtime Engine: ${unsyncedEntities.join(", ")}`);
  }

  // No direct provider calls exist inside Square
  const directProviderPatterns = ["google:", "stripe:", "slack:", "github:", "oauth:", "external-api:"];
  const hasDirectProviderCalls = (contract.permissions || []).some((p) =>
    directProviderPatterns.some((pattern) => p.toLowerCase().startsWith(pattern))
  );
  if (hasDirectProviderCalls) {
    errors.push("Square makes direct provider calls — must use Platform Core integrations");
  }

  // Square fully satisfies its Experience Contract
  const contractValidation = validateContract("square");
  if (!contractValidation.valid) {
    errors.push(...contractValidation.errors);
  }
  warnings.push(...contractValidation.warnings);

  // Square must be marked as migrated
  if (contract.migrationStatus !== "migrated") {
    warnings.push(`Square migration status is "${contract.migrationStatus}" — expected "migrated"`);
  }

  // Square must register all four Platform Core hooks
  const requiredHooks = ["bud", "orbit", "spark", "realtime"];
  requiredHooks.forEach((hook) => {
    if (!contract.hooks?.[hook]) {
      errors.push(`Square does not register Platform Core hook "${hook}"`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Phase 8: Validate Connect migration compliance.
 * Ensures Connect uses only registered modules, owns no Platform Core services,
 * has no duplicate communication implementations, all realtime flows use the
 * Realtime Engine, and shared modules (Messages, Conversations, Calls) are
 * registered implementations.
 */
export function validateConnectMigration() {
  const contract = getContract("connect");
  if (!contract) {
    return { valid: false, errors: ["No Connect contract registered"], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  // Connect uses only registered modules
  contract.modules.forEach((moduleId) => {
    if (!isModuleRegistered(moduleId)) {
      errors.push(`Connect uses unregistered module "${moduleId}"`);
    }
  });

  // Connect owns no Platform Core services
  const platformCoreModules = ["search", "notifications", "identity", "ai", "realtime", "integrations"];
  contract.modules.forEach((moduleId) => {
    if (platformCoreModules.includes(moduleId)) {
      errors.push(`Connect owns Platform Core service "${moduleId}" — must consume from Platform Core`);
    }
    const mod = getModule(moduleId);
    if (mod && mod.category === "platform-core") {
      errors.push(`Connect owns Platform Core module "${moduleId}"`);
    }
  });

  // No duplicate communication implementations — verify communication modules are unique
  const commModules = getModulesByCategory("communication");
  const commModuleIds = commModules.map((m) => m.id);
  const duplicates = commModuleIds.filter((id, index) => commModuleIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate communication modules detected: ${duplicates.join(", ")}`);
  }

  // Required shared communication modules must be registered
  const requiredSharedModules = ["messages", "conversations", "calls"];
  requiredSharedModules.forEach((moduleId) => {
    if (!isModuleRegistered(moduleId)) {
      errors.push(`Required shared module "${moduleId}" is not registered — Connect cannot consume it`);
    }
    const mod = getModule(moduleId);
    if (mod && mod.consumers && !mod.consumers.includes("connect")) {
      warnings.push(`Shared module "${moduleId}" does not list Connect as a consumer`);
    }
  });

  // All realtime flows use the Realtime Engine — verify entity sync coverage
  const commEntities = [...new Set(commModules.map((m) => m.entity).filter(Boolean))];
  const unsyncedEntities = commEntities.filter((e) => !SYNC_REGISTRY[e]);
  if (unsyncedEntities.length > 0) {
    errors.push(`Communication entities not synced by Realtime Engine: ${unsyncedEntities.join(", ")}`);
  }

  // No direct provider calls exist inside Connect
  const directProviderPatterns = ["google:", "stripe:", "slack:", "github:", "oauth:", "external-api:"];
  const hasDirectProviderCalls = (contract.permissions || []).some((p) =>
    directProviderPatterns.some((pattern) => p.toLowerCase().startsWith(pattern))
  );
  if (hasDirectProviderCalls) {
    errors.push("Connect makes direct provider calls — must use Platform Core integrations");
  }

  // Connect fully satisfies its Experience Contract
  const contractValidation = validateContract("connect");
  if (!contractValidation.valid) {
    errors.push(...contractValidation.errors);
  }
  warnings.push(...contractValidation.warnings);

  // Connect must be marked as migrated
  if (contract.migrationStatus !== "migrated") {
    warnings.push(`Connect migration status is "${contract.migrationStatus}" — expected "migrated"`);
  }

  // Connect must register all four Platform Core hooks
  const requiredHooks = ["bud", "orbit", "spark", "realtime"];
  requiredHooks.forEach((hook) => {
    if (!contract.hooks?.[hook]) {
      errors.push(`Connect does not register Platform Core hook "${hook}"`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Run a full constitutional audit.
 * Returns a comprehensive report including Phase 5 migration validation.
 */
export function runConstitutionalAudit() {
  const registry = validateRegistry();
  const contracts = validateExperienceContracts();
  const campus = validateCampusMigration();
  const square = validateSquareMigration();
  const connect = validateConnectMigration();
  const report = {
    timestamp: new Date().toISOString(),
    valid: registry.valid && contracts.valid && campus.valid && square.valid && connect.valid,
    errors: [...registry.errors, ...contracts.errors, ...campus.errors, ...square.errors, ...connect.errors],
    warnings: [...registry.warnings, ...contracts.warnings, ...campus.warnings, ...square.warnings, ...connect.warnings],
    modules: getRegisteredModules().length,
    experiences: getRegisteredExperiences().length,
    services: getRegisteredServices().length,
    contracts: getAllContracts().length,
    migration: {
      valid: contracts.valid,
      errors: contracts.errors,
      warnings: contracts.warnings,
    },
    campus: {
      valid: campus.valid,
      errors: campus.errors,
      warnings: campus.warnings,
      migrated: campus.valid && getContract("campus")?.migrationStatus === "migrated",
    },
    square: {
      valid: square.valid,
      errors: square.errors,
      warnings: square.warnings,
      migrated: square.valid && getContract("square")?.migrationStatus === "migrated",
    },
    connect: {
      valid: connect.valid,
      errors: connect.errors,
      warnings: connect.warnings,
      migrated: connect.valid && getContract("connect")?.migrationStatus === "migrated",
    },
  };
  return report;
}

// Export for dev-time console access
if (typeof window !== "undefined") {
  window.__UNIBUD_AUDIT__ = runConstitutionalAudit;
}