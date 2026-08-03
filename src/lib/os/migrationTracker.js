/**
 * UNIBUD OS v4 — Migration Tracker
 *
 * Tracks the migration status of every experience from legacy architecture
 * to the v4 Experience Runtime. Provides metrics for the Migration Dashboard.
 *
 * References: Phase 5 Migration Framework.
 */

import { getAllContracts, validateAllContracts, getContract } from "./experienceContract";
import { getRegisteredModules, getModulesByCategory } from "./moduleRegistry";
import { getRegisteredExperiences } from "./experienceRegistry";
import { getRegisteredServices } from "./hiddenServiceRegistry";
import { validateCampusMigration } from "./constitutionalValidator";
import { EXPERIENCES } from "./manifest";

const STATUS_WEIGHTS = { pending: 0, "in-progress": 0.5, migrated: 1 };

/**
 * Get the overall migration progress across all experiences.
 * @returns {Object} { percentage, migrated, inProgress, pending, total }
 */
export function getOverallProgress() {
  const contracts = getAllContracts();
  const total = EXPERIENCES.length;
  let score = 0;
  let migrated = 0;
  let inProgress = 0;
  let pending = 0;

  for (const exp of EXPERIENCES) {
    const contract = contracts.find((c) => c.experienceId === exp.id);
    const status = contract?.migrationStatus || "pending";
    score += STATUS_WEIGHTS[status] || 0;
    if (status === "migrated") migrated++;
    else if (status === "in-progress") inProgress++;
    else pending++;
  }

  return {
    percentage: Math.round((score / total) * 100),
    migrated,
    inProgress,
    pending,
    total,
  };
}

/**
 * Get per-experience migration status.
 */
export function getExperienceMigrationStatus() {
  const contracts = getAllContracts();
  return EXPERIENCES.map((exp) => {
    const contract = contracts.find((c) => c.experienceId === exp.id);
    return {
      id: exp.id,
      label: exp.label,
      to: exp.to,
      icon: exp.icon,
      status: contract?.migrationStatus || "pending",
      modules: contract?.modules || [],
      legacyComponents: contract?.legacyComponents || [],
      hooks: contract?.hooks || {},
      permissions: contract?.permissions || [],
      hiddenServices: contract?.hiddenServices || [],
      hasContract: !!contract,
    };
  });
}

/**
 * Get all legacy components across all experiences.
 */
export function getAllLegacyComponents() {
  const statuses = getExperienceMigrationStatus();
  const all = [];
  statuses.forEach((exp) => {
    exp.legacyComponents.forEach((component) => {
      all.push({ experience: exp.id, component, status: exp.status });
    });
  });
  return all;
}

/**
 * Get all modules consumed across all experiences.
 * Used to verify no duplicates exist.
 */
export function getModuleConsumption() {
  const contracts = getAllContracts();
  const consumption = new Map(); // moduleId → [experienceIds]

  contracts.forEach((contract) => {
    contract.modules?.forEach((moduleId) => {
      if (!consumption.has(moduleId)) consumption.set(moduleId, []);
      consumption.get(moduleId).push(contract.experienceId);
    });
  });

  return Array.from(consumption.entries()).map(([moduleId, consumers]) => ({
    moduleId,
    consumers,
    isRegistered: getRegisteredModules().some((m) => m.id === moduleId),
    consumerCount: consumers.length,
  }));
}

/**
 * Get platform core dependency usage.
 * Tracks which experiences use each Platform Core service.
 */
export function getPlatformCoreUsage() {
  const contracts = getAllContracts();
  const hooks = { bud: 0, orbit: 0, spark: 0, realtime: 0 };

  contracts.forEach((contract) => {
    if (contract.hooks?.bud) hooks.bud++;
    if (contract.hooks?.orbit) hooks.orbit++;
    if (contract.hooks?.spark) hooks.spark++;
    if (contract.hooks?.realtime) hooks.realtime++;
  });

  return {
    hooks,
    totalExperiences: contracts.length,
    contextProvider: contracts.length,
    search: contracts.filter((c) => c.modules?.includes("search")).length,
    notifications: contracts.filter((c) => c.modules?.includes("notifications")).length,
  };
}

/**
 * Get constitutional validation results for the migration.
 */
export function getConstitutionalStatus() {
  const contractValidation = validateAllContracts();
  return {
    valid: contractValidation.valid,
    errors: contractValidation.errors,
    warnings: contractValidation.warnings,
    perExperience: contractValidation.perExperience,
  };
}

/**
 * Get Campus-specific migration metrics.
 * Campus is the reference implementation — its metrics set the template
 * for all subsequent experience migrations.
 */
export function getCampusMigrationReport() {
  const contract = getContract("campus");
  const validation = validateCampusMigration();
  const academicModules = getModulesByCategory("academic");

  return {
    migrated: contract?.migrationStatus === "migrated",
    isReferenceImplementation: contract?.isReferenceImplementation || false,
    modulesConsumed: contract?.modules || [],
    academicModuleCount: academicModules.length,
    legacyComponents: contract?.legacyComponents || [],
    legacyRemaining: (contract?.legacyComponents || []).length,
    hooks: contract?.hooks || {},
    permissions: contract?.permissions || [],
    hiddenServices: contract?.hiddenServices || [],
    constitutional: {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    },
    platformCoreAdoption: {
      contextProvider: true,
      realtimeEngine: contract?.hooks?.realtime || false,
      bud: contract?.hooks?.bud || false,
      orbit: contract?.hooks?.orbit || false,
      spark: contract?.hooks?.spark || false,
      moduleRegistry: (contract?.modules || []).every((id) => getRegisteredModules().some((m) => m.id === id)),
      hiddenServiceRegistry: (contract?.hiddenServices || []).length > 0,
      experienceContract: !!contract,
    },
  };
}

/**
 * Get a comprehensive migration report for the dashboard.
 */
export function getMigrationReport() {
  return {
    overall: getOverallProgress(),
    experiences: getExperienceMigrationStatus(),
    legacyComponents: getAllLegacyComponents(),
    moduleConsumption: getModuleConsumption(),
    platformCore: getPlatformCoreUsage(),
    constitutional: getConstitutionalStatus(),
    campus: getCampusMigrationReport(),
    modules: {
      total: getRegisteredModules().length,
      byCategory: {
        content: getModulesByCategory("content").length,
        community: getModulesByCategory("community").length,
        communication: getModulesByCategory("communication").length,
        identity: getModulesByCategory("identity").length,
        discovery: getModulesByCategory("discovery").length,
        academic: getModulesByCategory("academic").length,
      },
    },
    services: getRegisteredServices().length,
    experiencesRegistered: getRegisteredExperiences().length,
  };
}