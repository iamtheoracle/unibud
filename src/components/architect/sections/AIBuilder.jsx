import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { Bot } from "lucide-react";

const SCHEMA = [
  { key: "prompt_templates", label: "Prompt Templates", type: "list", hint: "Named prompt templates", full: true },
  { key: "ai_actions", label: "AI Actions", type: "list", hint: "Callable actions exposed to Bud/Spark", full: true },
  { key: "ai_permissions", label: "AI Permissions", type: "list", hint: "What AI may do (read, write, call, escalate)", full: true },
  { key: "ai_routing", label: "AI Routing", type: "text", full: true, placeholder: "e.g. fallback: gemini_3_flash → base_1" },
  { key: "context_rules", label: "Context Rules", type: "list", hint: "What context to include per scenario", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { prompt_templates: [], ai_actions: [], ai_permissions: [], ai_routing: "", context_rules: [], description: "" };

export default function AIBuilder() {
  return <ConfigManager type="ai" label="AI Configs" singular="AI config" icon={Bot} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}