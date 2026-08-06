/**
 * Spark Global Namespace.
 *
 * Provides a single process-wide Spark kernel instance so that modules
 * across the app share one EventBus and one service container. Use
 * `getSparkKernel()` to access it; call `resetSparkKernel()` only in tests.
 */
import { createSpark, type Spark } from "./index";

let kernel: Spark | null = null;

export function getSparkKernel(): Spark {
  if (!kernel) kernel = createSpark();
  return kernel;
}

export function resetSparkKernel(): void {
  kernel = null;
}