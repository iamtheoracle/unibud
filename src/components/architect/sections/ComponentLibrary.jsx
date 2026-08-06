import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { Boxes } from "lucide-react";

const CATS = ["Buttons", "Inputs", "Cards", "Charts", "Tables", "Forms", "Modals", "Tabs"];

const SCHEMA = [
  { key: "category", label: "Category", type: "select", options: CATS },
  { key: "component_name", label: "Component Name", type: "text", placeholder: "e.g. Primary Button" },
  { key: "reusable_id", label: "Reusable ID", type: "text", placeholder: "e.g. primary_button" },
  { key: "props", label: "Props", type: "list", full: true, hint: "Configurable props / variants" },
  { key: "template", label: "Template / Markup", type: "textarea", full: true },
  { key: "notes", label: "Notes", type: "textarea", full: true },
];
const DEFAULT = { category: "Buttons", component_name: "", reusable_id: "", props: [], template: "", notes: "" };

export default function ComponentLibrary() {
  return <ConfigManager type="component" label="Components" singular="component" icon={Boxes} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}