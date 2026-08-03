/**
 * Spark — Knowledge Intelligence
 *
 * Spark ONLY performs:
 *   - reasoning
 *   - synthesis
 *   - academic analysis
 *   - long-context understanding
 *
 * Spark MUST NOT:
 *   - own databases
 *   - own memory
 *   - own vector storage
 *   - own knowledge repositories
 *
 * Knowledge comes from: KnowledgeService, SearchService, MemoryService.
 * LLM invocation goes through: ModelService.
 * Prompt rendering goes through: PromptService.
 */

import { logger } from '../logger';
import { telemetryService } from '../services/TelemetryService';
import { modelService } from '../services/ModelService';
import { promptService } from '../services/PromptService';

class Spark {
  constructor() { this._ready = false; }

  init() {
    this._ready = true;
    logger.info('Spark knowledge intelligence initialized');
  }

  /**
   * Process a request: reason over context and synthesize a response.
   * Context (memory, knowledge) is provided BY Nexus — Spark does not
   * fetch it itself.
   */
  async process({ message, memory, knowledge, context, fileUrls, correlationId }) {
    const span = telemetryService.startSpan('spark.process', { correlationId });

    try {
      // Build context summary from provided memory + knowledge
      const memoryContext = (memory || [])
        .map((m) => m.content || '')
        .filter(Boolean)
        .slice(0, 5)
        .join('\n');

      const knowledgeContext = (knowledge || [])
        .map((k) => `${k.title || ''}: ${k.description || ''}`)
        .filter(Boolean)
        .slice(0, 5)
        .join('\n');

      const ctxLine = context?.screen
        ? `The student is on the ${context.screen.name} page.`
        : '';

      // Reason over message + context using ModelService (not direct InvokeLLM)
      const reasonPrompt = promptService.render('spark.reason', {
        message,
        memory: memoryContext || 'No relevant memories.',
        knowledge: knowledgeContext || 'No relevant knowledge found.',
      });

      let reasoning = '';
      if (reasonPrompt) {
        try {
          reasoning = await modelService.invoke({
            prompt: `${reasonPrompt.system || ''}\n\n${reasonPrompt.user}`,
            taskTier: 'complex',
          });
        } catch (e) {
          logger.warn('Spark reasoning failed, continuing without', { error: e.message });
        }
      }

      // Personality system prompt — provided by Bud via Oracle context.
      // Bud owns the voice; Spark owns the LLM invocation.
      const personalityPrompt = context?.systemPrompt || '';

      // Synthesize the final Bud-facing response
      const responsePrompt = promptService.render('bud.response', {
        userMessage: message,
        context: [ctxLine, memoryContext, knowledgeContext, reasoning ? `Reasoning: ${reasoning}` : '']
          .filter(Boolean)
          .join('\n'),
      });

      let text;
      try {
        const fallback = personalityPrompt
          ? `${personalityPrompt}\n\nStudent: ${message}\n\nRespond warmly and helpfully. Never mention internal agents or orchestration.`
          : `You are Bud, UNIBUD's calm, supportive mentor companion.\n\nStudent: ${message}\n\nRespond warmly and helpfully. Never mention internal agents or orchestration.`;
        const params = {
          prompt: responsePrompt
            ? `${personalityPrompt ? personalityPrompt + '\n\n' : ''}${responsePrompt.system || ''}\n\n${responsePrompt.user}`
            : fallback,
          taskTier: 'standard',
        };
        if (fileUrls?.length) params.fileUrls = fileUrls;
        text = await modelService.invoke(params);
      } catch (e) {
        logger.error('Spark synthesis failed', { error: e.message });
        text = "I'm having trouble connecting right now. Let's try again in a moment!";
      }

      telemetryService.endSpan(span, 'ok');

      return {
        text,
        agentsUsed: ['spark'],
        reasoningProvided: Boolean(reasoning),
      };
    } catch (e) {
      logger.error('Spark process error', { error: e.message, correlationId });
      telemetryService.endSpan(span, 'error');
      return {
        text: "I'm having trouble connecting right now. Let's try again in a moment!",
        agentsUsed: [],
        error: e.message,
      };
    }
  }

  /** Synthesize multiple agent outputs into one unified response. */
  async synthesize({ userPrompt, inputs, context }) {
    const span = telemetryService.startSpan('spark.synthesize');

    try {
      const prompt = promptService.render('spark.synthesize', {
        userPrompt,
        inputs: inputs.map((r) => `[${r.agent_id}] ${r.output}`).join('\n'),
      });

      const text = await modelService.invoke({
        prompt: `${prompt?.system || ''}\n\n${prompt?.user}`,
        taskTier: 'standard',
        fileUrls: context?.fileUrls,
      });

      telemetryService.endSpan(span, 'ok');
      return text;
    } catch (e) {
      logger.error('Spark synthesize error', { error: e.message });
      telemetryService.endSpan(span, 'error');
      return "I'm having trouble synthesizing that right now.";
    }
  }

  get ready() { return this._ready; }
}

export const spark = new Spark();
export default spark;