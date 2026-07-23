import type { IdentityContext, IdentityService, DeviceContext } from "./interface";

/**
 * In-memory identity service. Provides user/session/product/locale/
 * timezone/device context for all other Spark services. No persistence
 * or network calls — state lives for the lifetime of the Spark instance.
 */
export class LocalIdentityService implements IdentityService {
  private contexts = new Map<string, IdentityContext>();

  createContext(input: {
    userId: string;
    sessionId: string;
    product: string;
    locale?: string;
    timezone?: string;
    device?: DeviceContext;
  }): IdentityContext {
    const context: IdentityContext = {
      userId: input.userId,
      sessionId: input.sessionId,
      product: input.product,
      locale: input.locale ?? "en-US",
      timezone: input.timezone ?? "UTC",
      device: input.device,
      createdAt: new Date().toISOString(),
    };
    this.contexts.set(input.sessionId, context);
    return context;
  }

  getContext(sessionId: string): IdentityContext | undefined {
    return this.contexts.get(sessionId);
  }

  updateContext(
    sessionId: string,
    patch: Partial<Omit<IdentityContext, "sessionId" | "createdAt">>
  ): IdentityContext | undefined {
    const existing = this.contexts.get(sessionId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    this.contexts.set(sessionId, updated);
    return updated;
  }

  clearContext(sessionId: string): boolean {
    return this.contexts.delete(sessionId);
  }

  size(): number {
    return this.contexts.size;
  }
}
