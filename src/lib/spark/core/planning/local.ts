import type { Plan, PlanTask, PlanningService } from "./interface";

/**
 * In-memory planning service. Handles goal decomposition into ordered,
 * dependency-aware tasks. No AI provider is required for the core
 * sequencing logic; reasoning-assisted decomposition can be layered on
 * top later via the ReasoningService.
 */
export class LocalPlanningService implements PlanningService {
  private plans = new Map<string, Plan>();
  private counter = 0;

  createPlan(goal: string, taskTitles: string[]): Plan {
    const id = `plan_${++this.counter}_${Date.now()}`;
    const tasks: PlanTask[] = taskTitles.map((title, index) => ({
      id: `${id}_task_${index}`,
      title,
      done: false,
      order: index,
      dependsOn: index > 0 ? [`${id}_task_${index - 1}`] : [],
    }));
    const plan: Plan = { id, goal, tasks, createdAt: new Date().toISOString() };
    this.plans.set(id, plan);
    return plan;
  }

  getPlan(planId: string): Plan | undefined {
    return this.plans.get(planId);
  }

  completeTask(planId: string, taskId: string): Plan | undefined {
    const plan = this.plans.get(planId);
    if (!plan) return undefined;
    const task = plan.tasks.find((t) => t.id === taskId);
    if (task) task.done = true;
    return plan;
  }

  nextTask(planId: string): PlanTask | undefined {
    const plan = this.plans.get(planId);
    if (!plan) return undefined;
    return plan.tasks
      .filter((t) => !t.done)
      .sort((a, b) => a.order - b.order)
      .find((t) =>
        (t.dependsOn ?? []).every(
          (depId) => plan.tasks.find((d) => d.id === depId)?.done
        )
      );
  }
}
