import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { BellRing } from "lucide-react";

const SCHEMA = [
  { key: "in_app", label: "In-App", type: "switch" },
  { key: "email", label: "Email", type: "switch" },
  { key: "sms", label: "SMS", type: "switch" },
  { key: "push", label: "Push", type: "switch" },
  { key: "subject", label: "Subject", type: "text", full: true, placeholder: "Notification subject" },
  { key: "body", label: "Body", type: "textarea", full: true, hint: "Use {{variables}}" },
  { key: "variables", label: "Variables", type: "list", hint: "Available template variables", full: true },
  { key: "condition", label: "Condition", type: "text", full: true, placeholder: "e.g. user.role === 'student'" },
  { key: "locale", label: "Locale", type: "text", placeholder: "e.g. en, fr" },
];
const DEFAULT = { in_app: true, email: false, sms: false, push: false, subject: "", body: "", variables: [], condition: "", locale: "en" };

export default function NotificationBuilder() {
  return <ConfigManager type="notification" label="Notifications" singular="notification" icon={BellRing} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}