import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { Bot } from "lucide-react";

const SCHEMA = [
  { key: "personality", label: "Personality", type: "textarea", full: true, hint: "How Bud presents itself as a supportive mentor" },
  { key: "tone", label: "Tone", type: "select", options: ["calm", "friendly", "formal", "energetic", "encouraging"] },
  { key: "prompt_templates", label: "Prompt Templates", type: "list", full: true },
  { key: "institution_policies", label: "Institution Policies", type: "list", hint: "Per-institution behaviour policies", full: true },
  { key: "safety_rules", label: "Safety Rules", type: "list", hint: "Hard limits Bud must never cross", full: true },
  { key: "response_templates", label: "Response Templates", type: "list", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { personality: "", tone: "calm", prompt_templates: [], institution_policies: [], safety_rules: [], response_templates: [], description: "" };

export default function AIBuilder() {
  return <ConfigManager type="ai" label="AI Configs" singular="AI config" icon={Bot} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}