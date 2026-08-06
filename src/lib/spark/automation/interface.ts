export interface AutomationTask {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: unknown;
  error?: string;
}

export type AutomationHandler = (input?: unknown) => Promise<unknown>;

export interface AutomationService {
  registerTask(name: string, handler: AutomationHandler): void;
  run(name: string, input?: unknown): Promise<AutomationTask>;
  history(limit?: number): AutomationTask[];
}
