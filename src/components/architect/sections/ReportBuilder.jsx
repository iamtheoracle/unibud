import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { FileBarChart } from "lucide-react";

const FORMATS = ["table", "chart", "csv", "excel", "pdf"];
const SCHEDULES = ["none", "daily", "weekly", "monthly"];

const SCHEMA = [
  { key: "format", label: "Format", type: "select", options: FORMATS },
  { key: "export", label: "Export", type: "select", options: ["none", "csv", "excel", "pdf"] },
  { key: "schedule", label: "Scheduling", type: "select", options: SCHEDULES },
  { key: "query", label: "Query / Source", type: "text", full: true, placeholder: "entity or SQL-like query" },
  { key: "filters", label: "Filters", type: "list", hint: "e.g. status=published, date>=2026-01-01", full: true },
  { key: "grouping", label: "Grouping", type: "text", placeholder: "e.g. by institution, by month" },
  { key: "fields", label: "Fields / Columns", type: "list", full: true },
  { key: "recipients", label: "Recipients", type: "list", hint: "Emails for scheduled delivery", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { format: "table", export: "none", schedule: "none", query: "", filters: [], grouping: "", fields: [], recipients: [], description: "" };

export default function ReportBuilder() {
  return <ConfigManager type="report" label="Reports" singular="report" icon={FileBarChart} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}