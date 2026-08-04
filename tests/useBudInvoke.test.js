import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const renderPrompt = vi.fn();
const invokeModel = vi.fn();

vi.mock("@/lib/runtime/services/PromptService", () => ({
  promptService: {
    render: (...args) => renderPrompt(...args),
  },
}));

vi.mock("@/lib/runtime/services/ModelService", () => ({
  modelService: {
    invoke: (...args) => invokeModel(...args),
  },
}));

import { useBudInvoke } from "@/hooks/useBudInvoke";

describe("useBudInvoke", () => {
  beforeEach(() => {
    renderPrompt.mockReset();
    invokeModel.mockReset();
  });

  it("renders a prompt template and routes invocation through modelService", async () => {
    renderPrompt.mockReturnValue({
      system: "system prompt",
      user: "user prompt",
      model: "gpt_5_mini",
    });
    invokeModel.mockResolvedValue({ response: "Bud reply" });

    const { result } = renderHook(() => useBudInvoke());

    await act(async () => {
      await result.current.invoke({
        templateId: "bud.hub_invite",
        variables: { userMessage: "Hi", context: "Hub context" },
        autoDismiss: 0,
      });
    });

    expect(renderPrompt).toHaveBeenCalledWith("bud.hub_invite", { userMessage: "Hi", context: "Hub context" });
    expect(invokeModel).toHaveBeenCalledWith({
      prompt: "system prompt\n\nuser prompt",
      taskTier: "standard",
      model: "gpt_5_mini",
      fileUrls: undefined,
    });
    expect(result.current.response).toBe("Bud reply");
    expect(result.current.processing).toBe(false);
  });

  it("falls back to the provided prompt when template rendering fails", async () => {
    renderPrompt.mockReturnValue(null);
    invokeModel.mockResolvedValue("Fallback reply");

    const { result } = renderHook(() => useBudInvoke());

    await act(async () => {
      await result.current.invoke({
        templateId: "missing.template",
        fallbackPrompt: "fallback prompt",
        autoDismiss: 0,
      });
    });

    expect(invokeModel).toHaveBeenCalledWith({
      prompt: "fallback prompt",
      taskTier: "standard",
      model: undefined,
      fileUrls: undefined,
    });
    expect(result.current.response).toBe("Fallback reply");
  });
});
