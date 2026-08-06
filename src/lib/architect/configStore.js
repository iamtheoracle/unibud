import { base44 } from "@/api/base44Client";

export const CONFIG_TYPES = ["entity", "form", "workflow", "dashboard", "role", "automation", "notification", "report", "api", "theme", "ai"];

async function audit(action, target, severity = "info") {
  try { await base44.entities.AuditLog.create({ action, actor_name: "Platform Architect", target_type: "architect", target_name: target, severity }); } catch {}
}

export const listConfigs = (type) => base44.entities.ArchitectConfig.filter({ type }, "-updated_date", 200);
export const listAllConfigs = () => base44.entities.ArchitectConfig.list("-updated_date", 200);
export const listByStatus = (status) => base44.entities.ArchitectConfig.filter({ status }, "-updated_date", 200);

export async function createConfig(data) {
  const rec = await base44.entities.ArchitectConfig.create({ status: "draft", version: 1, ...data });
  await audit("architect_create", `${data.type}:${data.name}`, "info");
  return rec;
}
export async function saveConfig(id, config) { return base44.entities.ArchitectConfig.update(id, { config }); }
export async function publishConfig(id) {
  const c = await base44.entities.ArchitectConfig.get(id);
  await base44.entities.ArchitectConfig.update(id, { status: "published", version: (c.version || 1) + 1 });
  await audit("architect_publish", `${c.type}:${c.name}`, "info");
}
export async function rollbackConfig(id) {
  const c = await base44.entities.ArchitectConfig.get(id);
  await base44.entities.ArchitectConfig.update(id, { status: "draft", version: Math.max(1, (c.version || 1) - 1) });
  await audit("architect_rollback", `${c.type}:${c.name}`, "warning");
}
export async function duplicateConfig(c) {
  const { id, created_date, updated_date, created_by_id, ...rest } = c;
  const dup = await createConfig({ ...rest, name: `${c.name} (Copy)`, key: `${c.key || ""}_copy`, status: "draft", version: 1 });
  return dup;
}
export const archiveConfig = (id) => base44.entities.ArchitectConfig.update(id, { status: "archived" });

export const listProjects = () => base44.entities.ArchitectProject.list("-created_date", 100);
export const createProject = (data) => base44.entities.ArchitectProject.create(data);