import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { ShieldCheck } from "lucide-react";

const SCHEMA = [
  { key: "permissions", label: "Permissions", type: "list", hint: "Granular permission keys (e.g. users.read, institutions.write)" },
  { key: "menus", label: "Menus", type: "list", hint: "Visible navigation menus" },
  { key: "routes", label: "Routes", type: "list", hint: "Accessible routes/paths" },
  { key: "crud_rights", label: "CRUD Rights", type: "keyvalue", hint: "Entity → allowed operations (e.g. Student → read,update)" },
  { key: "feature_access", label: "Feature Access", type: "list", hint: "Feature flags this role may use" },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { permissions: [], menus: [], routes: [], crud_rights: [], feature_access: [], description: "" };

export default function RoleBuilder() {
  return <ConfigManager type="role" label="Roles" singular="role" icon={ShieldCheck} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}