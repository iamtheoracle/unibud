export interface DeviceContext {
  type?: "desktop" | "mobile" | "tablet" | "server" | "unknown";
  os?: string;
}

export interface IdentityContext {
  userId: string;
  sessionId: string;
  product: string;
  locale: string;
  timezone: string;
  device?: DeviceContext;
  createdAt: string;
}

export interface IdentityService {
  /** Create (or overwrite) the identity context for a session. */
  createContext(input: {
    userId: string;
    sessionId: string;
    product: string;
    locale?: string;
    timezone?: string;
    device?: DeviceContext;
  }): IdentityContext;
  getContext(sessionId: string): IdentityContext | undefined;
  updateContext(
    sessionId: string,
    patch: Partial<Omit<IdentityContext, "sessionId" | "createdAt">>
  ): IdentityContext | undefined;
  clearContext(sessionId: string): boolean;
  /** Number of active identity contexts currently tracked. */
  size(): number;
}
