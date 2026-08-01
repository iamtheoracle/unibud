/**
 * Model Registry — Available AI Models
 *
 * Authoritative list of available LLM models with their capabilities
 * and cost tiers. ModelService routes requests based on this registry.
 */

import { logger } from '../logger';

const DEFAULT_MODELS = [
  { model_id: 'gpt_5_mini', name: 'GPT-5 Mini', provider: 'openai', tier: 'fast', supportsVision: true, supportsWebSearch: false, costCredits: 1 },
  { model_id: 'gemini_3_flash', name: 'Gemini 3 Flash', provider: 'google', tier: 'fast', supportsVision: true, supportsWebSearch: true, costCredits: 1 },
  { model_id: 'gpt_5_4', name: 'GPT-5.4', provider: 'openai', tier: 'standard', supportsVision: true, supportsWebSearch: false, costCredits: 2 },
  { model_id: 'gpt_5_6_sol', name: 'GPT-5.6 Sol', provider: 'openai', tier: 'standard', supportsVision: true, supportsWebSearch: false, costCredits: 2 },
  { model_id: 'claude_sonnet_4_6', name: 'Claude Sonnet 4.6', provider: 'anthropic', tier: 'standard', supportsVision: true, supportsWebSearch: false, costCredits: 3 },
  { model_id: 'gemini_3_1_pro', name: 'Gemini 3.1 Pro', provider: 'google', tier: 'standard', supportsVision: true, supportsWebSearch: true, costCredits: 3 },
  { model_id: 'claude_opus_4_6', name: 'Claude Opus 4.6', provider: 'anthropic', tier: 'complex', supportsVision: true, supportsWebSearch: false, costCredits: 5 },
  { model_id: 'claude_opus_4_7', name: 'Claude Opus 4.7', provider: 'anthropic', tier: 'complex', supportsVision: true, supportsWebSearch: false, costCredits: 5 },
  { model_id: 'claude_opus_4_8', name: 'Claude Opus 4.8', provider: 'anthropic', tier: 'complex', supportsVision: true, supportsWebSearch: false, costCredits: 5 },
  { model_id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'anthropic', tier: 'standard', supportsVision: true, supportsWebSearch: false, costCredits: 3 },
];

class ModelRegistry {
  constructor() { this._models = new Map(); this._ready = false; }

  async init() {
    for (const model of DEFAULT_MODELS) this._models.set(model.model_id, model);
    this._ready = true;
    logger.info('ModelRegistry initialized', { modelCount: this._models.size });
  }

  register(modelDef) { this._models.set(modelDef.model_id, modelDef); }
  get(modelId) { return this._models.get(modelId) || null; }
  list() { return Array.from(this._models.values()); }
  getDefault() { return this._models.get('gpt_5_mini') || null; }

  /** Find models that support a specific capability. */
  findByCapability(supportsVision, supportsWebSearch) {
    return this.list().filter((m) =>
      (!supportsVision || m.supportsVision) && (!supportsWebSearch || m.supportsWebSearch));
  }

  get ready() { return this._ready; }
}

export const modelRegistry = new ModelRegistry();
export default modelRegistry;