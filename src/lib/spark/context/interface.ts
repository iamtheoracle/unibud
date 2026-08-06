export interface EnvironmentContext {
  platform?: string;
  appVersion?: string;
  networkQuality?: "offline" | "poor" | "good" | "excellent";
}

export interface SessionContextSnapshot {
  sessionId: string;
  product: string;
  environment?: EnvironmentContext;
  attributes: Record<string, unknown>;
  updatedAt: string;
}

export interface ContextService {
  setEnvironment(sessionId: string, env: EnvironmentContext): void;
  setAttribute(sessionId: string, key: string, value: unknown): void;
  getSnapshot(sessionId: string, product: string): SessionContextSnapshot;
  clear(sessionId: string): boolean;
}
