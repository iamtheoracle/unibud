import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { Palette } from "lucide-react";

const SCHEMA = [
  { key: "primary_color", label: "Primary Color", type: "text", placeholder: "#7FD8FF" },
  { key: "accent_color", label: "Accent Color", type: "text", placeholder: "#7FD8FF" },
  { key: "background", label: "Background", type: "text", placeholder: "#0B0B0C" },
  { key: "radius", label: "Radius", type: "text", placeholder: "1.5rem" },
  { key: "shadow", label: "Shadows", type: "text", placeholder: "soft / premium / elevated" },
  { key: "spacing", label: "Spacing Scale", type: "text", placeholder: "8pt grid" },
  { key: "font_heading", label: "Heading Font", type: "text", placeholder: "SF Pro Display" },
  { key: "font_body", label: "Body Font", type: "text", placeholder: "SF Pro Text" },
  { key: "icon_set", label: "Icon Set", type: "text", placeholder: "lucide" },
  { key: "logo_url", label: "Logo URL", type: "text", full: true },
  { key: "institution_theme", label: "Institution Theme", type: "text", placeholder: "Institution id or name (leave blank for global)" },
  { key: "branding_notes", label: "Branding Notes", type: "textarea", full: true },
];
const DEFAULT = { primary_color: "#7FD8FF", accent_color: "#7FD8FF", background: "#0B0B0C", radius: "1.5rem", shadow: "premium", spacing: "8pt grid", font_heading: "SF Pro Display", font_body: "SF Pro Text", icon_set: "lucide", logo_url: "", institution_theme: "", branding_notes: "" };

export default function ThemeBuilder() {
  return <ConfigManager type="theme" label="Themes" singular="theme" icon={Palette} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}