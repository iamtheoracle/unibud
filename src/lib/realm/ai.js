/**
 * AI Service — Spark. An INTERNAL intelligence engine: personalization,
 * memory, recommendations, adaptive home, predictions, automation, context.
 * Bud communicates with Spark internally; Spark never appears in navigation
 * or as a standalone feature.
 */
export function aiService(base44) {
  return {
    invoke: (opts) => base44.integrations.Core.InvokeLLM(opts),
    remember: (entry) => base44.entities.BudMemory.create(entry),
    recall: (q, ...rest) => base44.entities.BudMemory.filter(q, ...rest),
    listMemory: (...rest) => base44.entities.BudMemory.list(...rest),
  };
}