/**
 * Model Service — LLM Invocation & Model Routing
 *
 * Wraps InvokeLLM. Agents use this service — they never call InvokeLLM directly.
 * Model routing selects the appropriate model based on task complexity.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

const MODEL_MAP = {
  fast: 'gemini_3_flash',
  standard: 'gpt_5_mini',
  complex: 'claude_sonnet_4_6',
  reasoning: 'claude_opus_4_6',
  web: 'gemini_3_flash', // supports add_context_from_internet
};

class ModelService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('ModelService initialized');
  }

  /** Route to a model based on task tier. */
  route(taskTier = 'standard') {
    return MODEL_MAP[taskTier] || MODEL_MAP.standard;
  }

  /** Invoke an LLM with optional model routing. */
  async invoke({ prompt, model, responseJsonSchema, addContextFromInternet = false, fileUrls, taskTier }) {
    const selectedModel = model || this.route(taskTier);
    const started = Date.now();

    try {
      const params = { prompt };
      if (selectedModel) params.model = selectedModel;
      if (responseJsonSchema) params.response_json_schema = responseJsonSchema;
      if (addContextFromInternet) {
        params.add_context_from_internet = true;
        // Only gemini models support web search
        if (!selectedModel?.includes('gemini')) params.model = MODEL_MAP.web;
      }
      if (fileUrls?.length) params.file_urls = fileUrls;

      const result = await base44.integrations.Core.InvokeLLM(params);
      const latency = Date.now() - started;

      eventBus.publish({
        type: 'model.invoked',
        category: 'monitoring',
        payload: { model: selectedModel, latencyMs: latency, success: true },
      });

      return result;
    } catch (e) {
      const latency = Date.now() - started;
      logger.error('Model invoke failed', { model: selectedModel, error: e.message, latencyMs: latency });
      eventBus.publish({
        type: 'model.invoke_failed',
        category: 'monitoring',
        payload: { model: selectedModel, error: e.message, latencyMs: latency },
      });
      throw e;
    }
  }

  get ready() { return this._ready; }
}

export const modelService = new ModelService();
export default modelService;