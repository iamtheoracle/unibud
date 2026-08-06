/**
 * Platform Services — Integration Service Interface
 *
 * The Integration Service manages connections to external systems:
 * university portals, calendar providers, OAuth apps, webhooks, and
 * third-party APIs.
 */

export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

export interface Integration {
  id: string;
  provider: string;
  userId: string;
  status: IntegrationStatus;
  scopes: string[];
  connectedAt?: string;
  lastSyncAt?: string;
  error?: string;
}

export interface IntegrationService {
  /** List all integrations for a user */
  list(userId: string): Promise<Integration[]>;

  /** Connect a new integration (initiates OAuth or direct connection) */
  connect(userId: string, provider: string, scopes: string[]): Promise<Integration>;

  /** Disconnect and remove an integration */
  disconnect(userId: string, integrationId: string): Promise<void>;

  /** Sync data from an active integration */
  sync(userId: string, integrationId: string): Promise<{ itemsSynced: number }>;

  /** Check the status of an integration */
  status(userId: string, integrationId: string): Promise<IntegrationStatus>;
}
