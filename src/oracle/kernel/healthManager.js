/** @typedef {'healthy'|'degraded'|'unhealthy'} HealthStatus */

export class HealthManager {
  constructor() {
    /** @type {Map<string, () => Promise<{status: HealthStatus; details?: unknown}>|{status: HealthStatus; details?: unknown}>} */
    this.checks = new Map();
  }

  /**
   * @param {string} id
   * @param {() => Promise<{status: HealthStatus; details?: unknown}>|{status: HealthStatus; details?: unknown}} check
   */
  registerCheck(id, check) {
    if (this.checks.has(id)) {
      throw new Error(`Health check already registered: ${id}`);
    }

    this.checks.set(id, check);
  }

  async evaluate() {
    /** @type {Record<string, {status: HealthStatus; details?: unknown}>} */
    const checks = {};
    /** @type {HealthStatus[]} */
    const statuses = [];

    for (const [id, check] of this.checks.entries()) {
      const result = await check();
      checks[id] = result;
      statuses.push(result.status);
    }

    return {
      status: aggregate(statuses),
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}

/** @param {HealthStatus[]} statuses */
function aggregate(statuses) {
  if (statuses.includes("unhealthy")) {
    return "unhealthy";
  }

  if (statuses.includes("degraded")) {
    return "degraded";
  }

  return "healthy";
}
