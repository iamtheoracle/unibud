import { useState, useCallback } from "react";
import { modelService } from "@/lib/runtime/services/ModelService";
import { promptService } from "@/lib/runtime/services/PromptService";

function coerceBudText(result) {
  if (typeof result === "string") return result;
  if (result && typeof result.response === "string") return result.response;
  if (result && typeof result.text === "string") return result.text;
  return "I'm here to help.";
}

/**
 * useBudInvoke — shared hook for invoking Bud with runtime services.
 * Used by both the academic study companion and the non-academic @Bud invite bar.
 *
 * After Bud responds, the response auto-dismisses after `autoDismiss` ms,
 * representing Bud quietly leaving the conversation.
 */
export function useBudInvoke() {
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState(null);

  const invoke = useCallback(async ({ templateId = "bud.response", variables = {}, fallbackPrompt, autoDismiss = 10000, taskTier = "standard", fileUrls } = {}) => {
    setProcessing(true);
    setResponse(null);

    try {
      const rendered = promptService.render(templateId, variables);
      const prompt = rendered
        ? `${rendered.system ? `${rendered.system}

` : ""}${rendered.user}`
        : fallbackPrompt;

      if (!prompt) {
        throw new Error(`Unable to render Bud prompt for template: ${templateId}`);
      }

      const result = await modelService.invoke({
        prompt,
        taskTier,
        model: rendered?.model || undefined,
        fileUrls,
      });

      setResponse(coerceBudText(result));
    } catch {
      setResponse("I couldn't process that right now. Try again in a moment.");
    } finally {
      setProcessing(false);
    }

    if (autoDismiss > 0) {
      setTimeout(() => setResponse(null), autoDismiss);
    }
  }, []);

  const clear = useCallback(() => setResponse(null), []);

  return { processing, response, invoke, clear };
}
