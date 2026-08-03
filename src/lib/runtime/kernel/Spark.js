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

      // ── Study Help Routing: compose natural language from structured recommendations ──
      // When the Student Routing Engine has found candidates, Spark composes
      // a natural Bud response from the structured data — never exposing
      // internal routing logic, scores, or agent names.
      if (context?.isStudyHelp && context?.routingRecommendations) {
        const recs = context.routingRecommendations;
        const workloadWarning = context.workloadWarning;
        const proactiveSuggestions = context.proactiveSuggestions;
        const topic = context.classifiedTopic;

        const typeLabels = {
          study_group: 'Study Group', mentor: 'Mentor', tutor: 'Tutor',
          classmate: 'Classmate', faculty: 'Faculty', resource: 'Resource',
          event: 'Event', knowledge: 'Info', presence: 'Online Now', session: 'Active Session',
          course: 'Course', opportunity: 'Opportunity', scholarship: 'Scholarship',
          space: 'Campus Space', club: 'Club', marketplace: 'Marketplace',
          finance: 'Finance', wellness: 'Wellness', task: 'Task',
          company: 'Company', certification: 'Certification',
        };

        const recLines = recs.map((r, i) => {
          const label = typeLabels[r.type] || r.type;
          return `${i + 1}. ${label}: ${r.name} — ${r.detail}`;
        }).join('\n');

        const proactiveLines = proactiveSuggestions?.length
          ? proactiveSuggestions.map((s) => `- ${s.message}`).join('\n')
          : '';

        const routingPrompt = `${personalityPrompt}

You are Bud, UNIBUD's calm, supportive mentor companion. A student asked a question.

The intelligence layer found these options:
${recLines || 'No specific matches found — provide general guidance.'}

${workloadWarning ? `WORKLOAD NOTE: ${workloadWarning.message}` : ''}

${proactiveLines ? `PROACTIVE INSIGHTS:\n${proactiveLines}` : ''}

${topic?.course ? `Course: ${topic.course}` : ''}
${topic?.topic ? `Topic: ${topic.topic}` : ''}
${topic?.domains ? `Areas: ${topic.domains.join(', ')}` : ''}

Compose a warm, natural response that:
- Presents the best options conversationally (never mention scores, routing logic, internal systems, engine names, or domain classifications)
- If there's a workload note, gently advise accordingly
- Recommends the single best option with a clear reason
- Weaves in proactive insights naturally if relevant
- Keeps it concise, encouraging, and specific to what was found

Student's message: ${message}`;

        try {
          text = await modelService.invoke({ prompt: routingPrompt, taskTier: 'standard' });
        } catch (e) {
          logger.error('Spark routing composition failed', { error: e.message });
          text = "I found some study options for you, but I'm having trouble formatting them right now. Please try again in a moment!";
        }

        telemetryService.endSpan(span, 'ok');
        return {
          text,
          agentsUsed: ['spark', 'studentRouting'],
          reasoningProvided: false,
        };
      }

      // ── Default flow: synthesize from memory + knowledge context ──
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