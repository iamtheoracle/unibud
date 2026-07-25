import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { Code2 } from "lucide-react";

const SCHEMA = [
  { key: "endpoints", label: "REST Endpoints", type: "list", hint: "method path (e.g. GET /v1/students)", full: true },
  { key: "webhooks", label: "Webhooks", type: "list", hint: "Outbound webhook destinations", full: true },
  { key: "rate_limit", label: "Rate Limit", type: "text", placeholder: "e.g. 100/min per key" },
  { key: "testing", label: "Testing Console", type: "textarea", hint: "Sample request / response notes", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { endpoints: [], webhooks: [], rate_limit: "100/min", testing: "", description: "" };

export default function APIBuilder() {
  return <ConfigManager type="api" label="APIs" singular="API" icon={Code2} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}