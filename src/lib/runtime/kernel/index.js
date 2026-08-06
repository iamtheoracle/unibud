/**
 * Kernel — Public API
 *
 * The 5 kernel components that form the AI runtime:
 *   Oracle  — runtime kernel (coordinator)
 *   Nexus   — platform kernel (orchestration)
 *   Guardian — governance enforcement
 *   Spark   — knowledge intelligence
 *   Orbit   — execution management
 *
 * Dependency injection:
 *   Oracle depends on Nexus + Guardian
 *   Nexus depends on Spark
 *   Guardian depends on PolicyRegistry + AuditService
 *   Spark depends on ModelService + PromptService
 *   Orbit depends on WorkflowRegistry + ConfigurationService
 */

import { oracle } from './Oracle';
import { nexus } from './Nexus';
import { guardian } from './Guardian';
import { spark } from './Spark';
import { orbit } from './Orbit';

export { oracle, nexus, guardian, spark, orbit };

/**
 * Boot the AI runtime kernel.
 * Initializes in dependency order and injects dependencies.
 */
export async function bootKernel() {
  // 1. Initialize leaf components (no internal kernel dependencies)
  guardian.init();
  spark.init();
  orbit.init();

  // 2. Initialize Nexus (depends on Spark)
  nexus.init({ spark });

  // 3. Initialize Oracle (depends on Nexus + Guardian)
  oracle.init({ nexus, guardian });

  return { oracle, nexus, guardian, spark, orbit };
}

export default { oracle, nexus, guardian, spark, orbit };