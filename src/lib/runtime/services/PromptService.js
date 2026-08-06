/**
 * Prompt Service — Prompt Template Rendering
 *
 * Renders prompt templates from the PromptRegistry. Agents use this service
 * to build prompts — they never hardcode prompt text.
 */

import { logger } from '../logger';
import { promptRegistry } from '../registries/PromptRegistry';

class PromptService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('PromptService initialized');
  }

  /** Render a prompt template by ID with variables. */
  render(templateId, variables = {}) {
    const template = promptRegistry.get(templateId);
    if (!template) {
      logger.warn('Prompt template not found', { templateId });
      return null;
    }
    let rendered = template.template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value ?? ''));
    }
    return { system: template.system || null, user: rendered, model: template.model || null };
  }

  /** Render just the system prompt. */
  renderSystem(templateId) {
    const template = promptRegistry.get(templateId);
    return template?.system || null;
  }

  get ready() { return this._ready; }
}

export const promptService = new PromptService();
export default promptService;