import React from "react";
import ConfigManager, { GenericConfigEditor } from "@/components/architect/ConfigManager";
import { ShieldCheck } from "lucide-react";

const SCHEMA = [
  { key: "roles", label: "Roles", type: "list", hint: "Role keys (e.g. admin, registrar, dean, lecturer)" },
  { key: "permissions", label: "Permissions", type: "list", hint: "Granular permission keys (e.g. users.read, institutions.write)" },
  { key: "access_rules", label: "Access Rules", type: "keyvalue", hint: "Resource → rule (e.g. Student → read,update)", full: true },
  { key: "feature_access", label: "Feature Access", type: "list", hint: "Feature flags this role may use", full: true },
  { key: "institution_policies", label: "Institution Policies", type: "list", hint: "Per-institution policy overrides", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
const DEFAULT = { roles: [], permissions: [], access_rules: [], feature_access: [], institution_policies: [], description: "" };

export default function PermissionBuilder() {
  return <ConfigManager type="permission" label="Permissions" singular="permission" icon={ShieldCheck} Editor={GenericConfigEditor} defaultConfig={DEFAULT} schema={SCHEMA} />;
}