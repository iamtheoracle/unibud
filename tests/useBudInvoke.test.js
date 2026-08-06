import { describe, it, expect, vi, beforeEach } from "vitest";

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

beforeEach(() => {
  renderPrompt.mockReset();
  invokeModel.mockReset();
});

describe("useBudInvoke", () => {
  it("renders a prompt template and routes invocation through modelService", async () => {
    renderPrompt.mockReturnValue({
      system: "system prompt",
      user: "user prompt",
      model: "gpt_5_mini",
    });
    invokeModel.mockResolvedValue({ response: "Bud reply" });

    const { useBudInvoke } = await import("@/hooks/useBudInvoke");
    const hook = useBudInvoke();

    await hook.invoke({
      templateId: "bud.hub_invite",
      variables: { userMessage: "Hi", context: "Hub context" },
      autoDismiss: 0,
    });

    expect(renderPrompt).toHaveBeenCalledWith("bud.hub_invite", { userMessage: "Hi", context: "Hub context" });
    expect(invokeModel).toHaveBeenCalledWith({
      prompt: "system prompt\n\nuser prompt",
      taskTier: "standard",
      model: "gpt_5_mini",
      fileUrls: undefined,
    });
  });

  it("falls back to the provided prompt when template rendering fails", async () => {
    renderPrompt.mockReturnValue(null);
    invokeModel.mockResolvedValue("Fallback reply");

    const react = await import("react");
    const stateValues = [];
    let setterIndex = 0;
    vi.spyOn(react, "useState").mockImplementation((initial) => {
      const index = setterIndex++;
      stateValues[index] = initial;
      return [stateValues[index], (value) => { stateValues[index] = value; }];
    });

    try {
      const { useBudInvoke } = await import("@/hooks/useBudInvoke?fallback");
      const hook = useBudInvoke();
      await hook.invoke({ templateId: "missing.template", fallbackPrompt: "fallback prompt", autoDismiss: 0 });
    } finally {
      react.useState.mockRestore();
    }

    expect(invokeModel).toHaveBeenCalledWith({
      prompt: "fallback prompt",
      taskTier: "standard",
      model: undefined,
      fileUrls: undefined,
    });
  });
});
