/**
 * Education Module — Domain 1: Identity
 * EducatorService
 *
 * Manages educator identities with support for multiple teaching contexts.
 * One educator identity, multiple educational contexts.
 */

import { base44 } from "@/api/base44Client";
import { EducationServiceBase } from "@/education/ServiceBase";

class EducatorService extends EducationServiceBase {
  constructor() {
    super(base44.entities.Educator, "EducatorService");
  }

  // ─── Commands ─────────────────────────────────────────────────────────────

  getCommands() {
    return [
      { name: "RegisterEducator", description: "Register a new educator identity" },
      { name: "ActivateEducator", description: "Activate an educator account" },
      { name: "DeactivateEducator", description: "Deactivate an educator account" },
      { name: "AssignToContext", description: "Assign educator to a teaching context" },
      { name: "RemoveFromContext", description: "Remove educator from a teaching context" },
      { name: "AssignSubjects", description: "Assign subjects to an educator" },
    ];
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  getEvents() {
    return [
      { name: "identity.educator_registered", description: "A new educator was registered" },
      { name: "identity.educator_activated", description: "An educator was activated" },
      { name: "identity.educator_deactivated", description: "An educator was deactivated" },
      { name: "identity.educator_assigned", description: "An educator was assigned to a context" },
      { name: "identity.educator_removed_from_context", description: "An educator was removed from a context" },
    ];
  }

  // ─── Permissions ──────────────────────────────────────────────────────────

  getPermissions() {
    return [
      { name: "identity.manage_educators", description: "Create, update, and delete educator records", roles: ["oracle", "super_admin", "platform_admin", "university_admin"] },
      { name: "identity.view_educators", description: "View educator records", roles: ["oracle", "super_admin", "platform_admin", "university_admin", "faculty_admin", "department_admin"] },
    ];
  }

  // ─── Core Operations ──────────────────────────────────────────────────────

  async registerEducator(data) {
    const educator = await base44.entities.Educator.create({
      ...data,
      status: "active",
      registration_source: data.registration_source || "invitation",
    });
    this.emit("identity.educator_registered", educator);
    return educator;
  }

  async getEducator(id) {
    const educators = await base44.entities.Educator.filter({ id });
    return educators?.[0] || null;
  }

  async listEducators(filters = {}) {
    if (Object.keys(filters).length === 0) {
      return base44.entities.Educator.list("-created_date");
    }
    return base44.entities.Educator.filter(filters);
  }

  async updateEducator(id, data) {
    return base44.entities.Educator.update(id, data);
  }

  async activateEducator(id) {
    const educator = await base44.entities.Educator.update(id, { status: "active" });
    this.emit("identity.educator_activated", educator);
    return educator;
  }

  async deactivateEducator(id) {
    const educator = await base44.entities.Educator.update(id, { status: "inactive" });
    this.emit("identity.educator_deactivated", educator);
    return educator;
  }

  async deleteEducator(id) {
    await base44.entities.Educator.delete(id);
  }

  // ─── Context Management ───────────────────────────────────────────────────

  async assignToContext(educatorId, contextData) {
    const context = await base44.entities.EducatorContext.create({
      ...contextData,
      educator_id: educatorId,
      status: "active",
    });
    this.emit("identity.educator_assigned", { educatorId, context });
    return context;
  }

  async getEducatorContexts(educatorId) {
    return base44.entities.EducatorContext.filter({ educator_id: educatorId });
  }

  async updateEducatorContext(contextId, data) {
    return base44.entities.EducatorContext.update(contextId, data);
  }

  async removeFromContext(contextId) {
    await base44.entities.EducatorContext.delete(contextId);
    this.emit("identity.educator_removed_from_context", { contextId });
  }
}

export const educatorService = new EducatorService();
export default educatorService;
