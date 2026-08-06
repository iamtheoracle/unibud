/**
 * Registries — Boot & Public API
 *
 * All 9 authoritative registries. Registries are the single source of truth —
 * agents never duplicate registry data inside themselves.
 *
 * Boot order: registries with no dependencies first.
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';

import { aiRegistry } from './AIRegistry';
import { capabilityRegistry } from './CapabilityRegistry';
import { promptRegistry } from './PromptRegistry';
import { modelRegistry } from './ModelRegistry';
import { toolRegistry } from './ToolRegistry';
import { workflowRegistry } from './WorkflowRegistry';
import { policyRegistry } from './PolicyRegistry';
import { eventRegistry } from './EventRegistry';
import { serviceRegistry } from './ServiceRegistry';

export const registries = {
  ai: aiRegistry,
  capability: capabilityRegistry,
  prompt: promptRegistry,
  model: modelRegistry,
  tool: toolRegistry,
  workflow: workflowRegistry,
  policy: policyRegistry,
  event: eventRegistry,
  service: serviceRegistry,
};

/** Boot all registries. */
export async function bootRegistries() {
  const order = [
    ['ai', aiRegistry],
    ['capability', capabilityRegistry],
    ['prompt', promptRegistry],
    ['model', modelRegistry],
    ['tool', toolRegistry],
    ['workflow', workflowRegistry],
    ['policy', policyRegistry],
    ['event', eventRegistry],
    ['service', serviceRegistry],
  ];

  const results = {};
  for (const [name, registry] of order) {
    try {
      await registry.init();
      results[name] = 'ready';
      eventBus.publish({ type: 'registry.ready', category: 'lifecycle', payload: { registry: name } });
    } catch (e) {
      logger.error(`Registry boot failed: ${name}`, { error: e.message });
      results[name] = `failed: ${e.message}`;
    }
  }
  return results;
}

export default registries;