import type {
  ContextService,
  EnvironmentContext,
  SessionContextSnapshot,
} from "./interface";

/**
 * Tracks per-session environmental/product awareness (in addition to
 * the user/session identity owned by the Identity service). Kept
 * separate from Identity because context changes far more often
 * (network quality, current screen, ephemeral attributes) than
 * identity does.
 */
export class LocalContextService implements ContextService {
  private environments = new Map<string, EnvironmentContext>();
  private attributes = new Map<string, Record<string, unknown>>();

  setEnvironment(sessionId: string, env: EnvironmentContext): void {
    this.environments.set(sessionId, env);
  }

  setAttribute(sessionId: string, key: string, value: unknown): void {
    const existing = this.attributes.get(sessionId) ?? {};
    existing[key] = value;
    this.attributes.set(sessionId, existing);
  }

  getSnapshot(sessionId: string, product: string): SessionContextSnapshot {
    return {
      sessionId,
      product,
      environment: this.environments.get(sessionId),
      attributes: this.attributes.get(sessionId) ?? {},
      updatedAt: new Date().toISOString(),
    };
  }

  clear(sessionId: string): boolean {
    const hadEnv = this.environments.delete(sessionId);
    const hadAttrs = this.attributes.delete(sessionId);
    return hadEnv || hadAttrs;
  }
}
