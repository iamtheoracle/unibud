/**
 * Platform Services — Automation Service Interface
 *
 * The Automation Service runs background tasks and workflows on behalf
 * of students and platform products. Tasks are registered by name and
 * executed asynchronously.
 *
 * Promoted from Spark's internal automation service.
 * Underlying implementation: src/lib/spark/automation/
 */

export type AutomationStatus = "pending" | "running" | "completed" | "failed";

export interface AutomationTask {
  id: string;
  name: string;
  status: AutomationStatus;
  result?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export type AutomationHandler = (input?: unknown) => Promise<unknown>;

export interface AutomationService {
  /** Register a named automation handler */
  registerTask(name: string, handler: AutomationHandler): void;

  /** Run a registered task by name */
  run(name: string, input?: unknown): Promise<AutomationTask>;

  /** Return the most recent task history */
  history(limit?: number): AutomationTask[];
}
