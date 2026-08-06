/**
 * @typedef {{
 *  id: string;
 *  version?: string;
 *  setup: (context: Record<string, unknown>) => Promise<void>|void;
 * }} OraclePlugin
 */

export class PluginRegistrar {
  /** @param {Record<string, unknown>} context */
  constructor(context) {
    this.context = context;
    /** @type {Map<string, OraclePlugin>} */
    this.plugins = new Map();
  }

  /** @param {OraclePlugin} plugin */
  register(plugin) {
    if (!plugin?.id) {
      throw new Error("Plugin id is required");
    }

    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin already registered: ${plugin.id}`);
    }

    this.plugins.set(plugin.id, plugin);
  }

  async initializeAll() {
    for (const plugin of this.plugins.values()) {
      await plugin.setup(this.context);
    }
  }

  list() {
    return Array.from(this.plugins.values());
  }
}
