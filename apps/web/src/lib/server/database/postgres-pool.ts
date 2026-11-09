import "server-only";

import { Pool, type PoolClient, type PoolConfig } from "pg";
import type { SqlClient, SqlPool, SqlResult } from "./account-context-core";

class PgSqlClient implements SqlClient {
  private readonly client: PoolClient;

  constructor(client: PoolClient) {
    this.client = client;
  }

  async query<Row = unknown>(sql: string, values?: readonly unknown[]): Promise<SqlResult<Row>> {
    const result = await this.client.query(sql, values ? [...values] : undefined);
    return { rows: result.rows as Row[] };
  }

  release(): void {
    this.client.release();
  }
}

export class PostgresSqlPool implements SqlPool {
  private readonly pool: Pool;

  constructor(connectionString: string, applicationName: string) {
    let parsed: URL;
    try {
      parsed = new URL(connectionString);
    } catch {
      throw new Error("A valid PostgreSQL connection URL is required.");
    }
    if (!["postgres:", "postgresql:"].includes(parsed.protocol) ||
        !parsed.hostname || !parsed.username || !parsed.password) {
      throw new Error("PostgreSQL URL must include protocol, host and dedicated login credentials.");
    }

    const config: PoolConfig = {
      connectionString,
      application_name: applicationName,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      allowExitOnIdle: false,
      ...(process.env.NODE_ENV === "production"
        ? { ssl: { rejectUnauthorized: true } }
        : {})
    };
    this.pool = new Pool(config);
    this.pool.on("error", () => {
      // Do not log connection strings, credentials, SQL values or account data.
    });
  }

  async connect(): Promise<SqlClient> {
    return new PgSqlClient(await this.pool.connect());
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

let authPool: PostgresSqlPool | undefined;
let appPool: PostgresSqlPool | undefined;

/** Auth RPC pool: login principal granted unibud_auth, never direct table access. */
export function getAuthDatabasePool(): PostgresSqlPool {
  if (!authPool) {
    const connectionString = process.env.UNIBUD_AUTH_DATABASE_URL?.trim();
    if (!connectionString) throw new Error("UNIBUD_AUTH_DATABASE_URL is not configured.");
    authPool = new PostgresSqlPool(connectionString, "unibud-auth-runtime");
  }
  return authPool;
}

/** Tenant-scoped application pool: login principal granted unibud_app, never BYPASSRLS. */
export function getAppDatabasePool(): PostgresSqlPool {
  if (!appPool) {
    const connectionString = process.env.UNIBUD_APP_DATABASE_URL?.trim();
    if (!connectionString) throw new Error("UNIBUD_APP_DATABASE_URL is not configured.");
    appPool = new PostgresSqlPool(connectionString, "unibud-app-runtime");
  }
  return appPool;
}

export async function closeDatabasePools(): Promise<void> {
  const pools = [authPool, appPool].filter((pool): pool is PostgresSqlPool => Boolean(pool));
  authPool = undefined;
  appPool = undefined;
  await Promise.all(pools.map(pool => pool.close()));
}
