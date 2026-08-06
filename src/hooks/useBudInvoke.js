import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useBudInvoke — shared hook for invoking Bud (LLM) with auto-dismiss.
 * Used by both the academic study companion and the non-academic @Bud invite bar.
 *
 * After Bud responds, the response auto-dismisses after `autoDismiss` ms,
 * representing Bud quietly leaving the conversation.
 */
export function useBudInvoke() {
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState(null);

  const invoke = useCallback(async (prompt, autoDismiss = 10000) => {
    setProcessing(true);
    setResponse(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { response: { type: "string" } } },
      });
      setResponse(result.response || "I'm here to help.");
    } catch {
      setResponse("I couldn't process that right now. Try again in a moment.");
    }
    setProcessing(false);
    if (autoDismiss > 0) {
      setTimeout(() => setResponse(null), autoDismiss);
    }
  }, []);

  const clear = useCallback(() => setResponse(null), []);

  return { processing, response, invoke, clear };
}