import type {
  AutomationHandler,
  AutomationService,
  AutomationTask,
} from "./interface";

/**
 * In-process workflow/task runner. Registers named handlers and
 * executes them on demand, tracking status/result/error for diagnostics.
 * No external orchestration system is required at this stage.
 */
export class LocalAutomationService implements AutomationService {
  private handlers = new Map<string, AutomationHandler>();
  private tasks: AutomationTask[] = [];
  private counter = 0;

  registerTask(name: string, handler: AutomationHandler): void {
    this.handlers.set(name, handler);
  }

  async run(name: string, input?: unknown): Promise<AutomationTask> {
    const handler = this.handlers.get(name);
    const task: AutomationTask = {
      id: `task_${++this.counter}_${Date.now()}`,
      name,
      status: "pending",
    };
    this.tasks.push(task);
    if (!handler) {
      task.status = "failed";
      task.error = `No automation task registered under name "${name}".`;
      return task;
    }
    task.status = "running";
    try {
      task.result = await handler(input);
      task.status = "completed";
    } catch (err) {
      task.status = "failed";
      task.error = err instanceof Error ? err.message : String(err);
    }
    return task;
  }

  history(limit = 50): AutomationTask[] {
    return this.tasks.slice(-limit);
  }
}
