/**
 * Prompt Registry — Authoritative Prompt Templates
 *
 * All prompt templates live here. Agents and services render prompts
 * through the PromptService which reads from this registry.
 */

import { logger } from '../logger';

const DEFAULT_PROMPTS = {
  'bud.system': {
    system: 'You are Bud, UNIBUD\'s calm, supportive mentor companion. You are warm, encouraging, and concise. Never mention internal systems, agents, orchestration, or AI. You help students save time, reduce stress, and improve academic success.',
    template: '{{userMessage}}',
    model: null,
  },
  'bud.response': {
    system: null,
    template: 'Student request: {{userMessage}}\n\nContext: {{context}}\n\nRespond as Bud directly to the student. Be warm and concise. Never mention internal agents, orchestration, or system internals.',
    model: null,
  },
  'spark.reason': {
    system: 'You are Spark, UNIBUD\'s knowledge intelligence engine. You reason, synthesize, and analyze. You do NOT own knowledge storage — you receive context from services.',
    template: 'Reason over the following:\n\nMessage: {{message}}\nMemory: {{memory}}\nKnowledge: {{knowledge}}\n\nProvide structured reasoning.',
    model: 'claude_sonnet_4_6',
  },
  'spark.synthesize': {
    system: 'You are Spark synthesis. Merge multiple specialist outputs into one unified answer. Never mention internal agents or orchestration.',
    template: 'User request: {{userPrompt}}\n\nSpecialist inputs:\n{{inputs}}\n\nMerge into ONE unified, natural answer for the student.',
    model: null,
  },
  'nexus.plan': {
    system: 'You are Nexus, the platform kernel. You orchestrate capability resolution. Break the request into minimal tasks. Select only the capabilities truly required.',
    template: 'User request: {{userPrompt}}\n\nAvailable capabilities:\n{{capabilities}}\n\nBreak this request into the MINIMAL set of tasks needed. Define dependencies between tasks.',
    model: 'gpt_5_mini',
  },
  'guardian.check': {
    system: null,
    template: 'Evaluate: action={{action}}, context={{context}}\nDetermine if this action is permitted under the current policy.',
    model: null,
  },
};

class PromptRegistry {
  constructor() { this._prompts = new Map(); this._ready = false; }

  async init() {
    for (const [id, def] of Object.entries(DEFAULT_PROMPTS)) this._prompts.set(id, { id, ...def });
    this._ready = true;
    logger.info('PromptRegistry initialized', { promptCount: this._prompts.size });
  }

  register(id, def) { this._prompts.set(id, { id, ...def }); }
  get(id) { return this._prompts.get(id) || null; }
  list() { return Array.from(this._prompts.values()); }

  get ready() { return this._ready; }
}

export const promptRegistry = new PromptRegistry();
export default promptRegistry;