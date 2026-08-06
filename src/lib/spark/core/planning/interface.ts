export interface PlanTask {
  id: string;
  title: string;
  done: boolean;
  order: number;
  dependsOn?: string[];
}

export interface Plan {
  id: string;
  goal: string;
  tasks: PlanTask[];
  createdAt: string;
}

export interface PlanningService {
  createPlan(goal: string, taskTitles: string[]): Plan;
  getPlan(planId: string): Plan | undefined;
  completeTask(planId: string, taskId: string): Plan | undefined;
  nextTask(planId: string): PlanTask | undefined;
}
