import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { Zap } from "lucide-react";

const TRIGGERS = ["user_created", "student_registered", "payment_received", "assignment_submitted", "grade_published", "institution_created", "scheduled"];

const SCHEMA = [
  { key: "trigger", label: "Trigger", type: "select", options: TRIGGERS },
  { key: "enabled", label: "Enabled", type: "switch" },
  { key: "delay", label: "Delay", type: "text", placeholder: "e.g. 10m, 2h, 1d" },
  { key: "actions", label: "Actions", type: "list", hint: "email, sms, push, ai, database_update, api_call, webhook", full: true },
  { key: "webhook_url", label: "Webhook URL", type: "text", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { trigger: "user_created", enabled: true, delay: "", actions: [], webhook_url: "", description: "" };

export default function AutomationBuilder() {
  return <ConfigManager type="automation" label="Automations" singular="automation" icon={Zap} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}