/**
 * Jobs Service — background jobs, automations, and scheduled work.
 * Reuses the Automation + AutomationRun entities and the runAutomation
 * backend function. No new job runner is introduced.
 */
export function jobsService(base44) {
  return {
    /** List automation definitions. */
    list: (...rest) => base44.entities.Automation.list(...rest),

    /** Fetch a single automation definition. */
    get: (id) => base44.entities.Automation.get(id),

    /** Trigger an automation by id (delegates to the runAutomation backend fn). */
    run: (automationId, input) =>
      base44.functions?.runAutomation?.({ automation_id: automationId, input }),

    /** Execution history for an automation. */
    runs: (automationId, ...rest) =>
      base44.entities.AutomationRun.filter({ automation_id: automationId }, ...rest),

    /** Record a manual run log entry. */
    logRun: (entry) => base44.entities.AutomationRun.create(entry),
  };
}