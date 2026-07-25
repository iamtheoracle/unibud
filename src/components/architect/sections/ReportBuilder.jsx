import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { FileBarChart } from "lucide-react";

const FORMATS = ["table", "chart", "csv", "excel", "pdf"];
const SCHEDULES = ["none", "daily", "weekly", "monthly"];

const SCHEMA = [
  { key: "format", label: "Format", type: "select", options: FORMATS },
  { key: "schedule", label: "Schedule", type: "select", options: SCHEDULES },
  { key: "query", label: "Query / Source", type: "text", full: true, placeholder: "entity or SQL-like query" },
  { key: "fields", label: "Fields", type: "list", hint: "Columns to include", full: true },
  { key: "recipients", label: "Recipients", type: "list", hint: "Emails for scheduled delivery", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { format: "table", schedule: "none", query: "", fields: [], recipients: [], description: "" };

export default function ReportBuilder() {
  return <ConfigManager type="report" label="Reports" singular="report" icon={FileBarChart} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}