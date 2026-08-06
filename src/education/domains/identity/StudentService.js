/**
 * Education Module — Domain 1: Identity
 * StudentService
 *
 * Manages student identities with support for multiple academic contexts.
 * One student identity, multiple educational contexts.
 */

import { base44 } from "@/api/base44Client";
import { EducationServiceBase } from "@/education/ServiceBase";

class StudentService extends EducationServiceBase {
  constructor() {
    super(base44.entities.Student, "StudentService");
  }

  // ─── Commands ─────────────────────────────────────────────────────────────

  getCommands() {
    return [
      { name: "RegisterStudent", description: "Register a new student identity" },
      { name: "ActivateStudent", description: "Activate a student account" },
      { name: "DeactivateStudent", description: "Deactivate a student account" },
      { name: "SuspendStudent", description: "Suspend a student account" },
      { name: "AddStudentContext", description: "Add an academic context to a student" },
      { name: "RemoveStudentContext", description: "Remove an academic context from a student" },
      { name: "UpdateStudentContext", description: "Update a student's academic context" },
    ];
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  getEvents() {
    return [
      { name: "identity.student_registered", description: "A new student was registered" },
      { name: "identity.student_activated", description: "A student was activated" },
      { name: "identity.student_deactivated", description: "A student was deactivated" },
      { name: "identity.student_suspended", description: "A student was suspended" },
      { name: "identity.student_context_added", description: "An academic context was added to a student" },
      { name: "identity.student_context_removed", description: "An academic context was removed" },
      { name: "identity.student_context_updated", description: "A student's academic context was updated" },
    ];
  }

  // ─── Permissions ──────────────────────────────────────────────────────────

  getPermissions() {
    return [
      { name: "identity.manage_students", description: "Create, update, and delete student records", roles: ["oracle", "super_admin", "platform_admin", "university_admin"] },
      { name: "identity.view_students", description: "View student records", roles: ["oracle", "super_admin", "platform_admin", "university_admin", "faculty_admin", "department_admin", "lecturer"] },
      { name: "identity.manage_contexts", description: "Manage student academic contexts", roles: ["oracle", "super_admin", "university_admin"] },
    ];
  }

  // ─── Core Operations ──────────────────────────────────────────────────────

  async registerStudent(data) {
    const student = await base44.entities.Student.create({
      ...data,
      status: "active",
      registration_source: data.registration_source || "admin_created",
    });
    this.emit("identity.student_registered", student);
    return student;
  }

  async getStudent(id) {
    const students = await base44.entities.Student.filter({ id });
    return students?.[0] || null;
  }

  async listStudents(filters = {}) {
    if (Object.keys(filters).length === 0) {
      return base44.entities.Student.list("-created_date");
    }
    return base44.entities.Student.filter(filters);
  }

  async updateStudent(id, data) {
    const student = await base44.entities.Student.update(id, data);
    return student;
  }

  async activateStudent(id) {
    const student = await base44.entities.Student.update(id, { status: "active" });
    this.emit("identity.student_activated", student);
    return student;
  }

  async deactivateStudent(id) {
    const student = await base44.entities.Student.update(id, { status: "inactive" });
    this.emit("identity.student_deactivated", student);
    return student;
  }

  async suspendStudent(id, reason) {
    const student = await base44.entities.Student.update(id, { status: "suspended", notes: reason });
    this.emit("identity.student_suspended", student);
    return student;
  }

  async deleteStudent(id) {
    await base44.entities.Student.delete(id);
  }

  // ─── Context Management ───────────────────────────────────────────────────

  async addStudentContext(studentId, contextData) {
    const context = await base44.entities.StudentContext.create({
      ...contextData,
      student_id: studentId,
      status: "active",
    });
    this.emit("identity.student_context_added", { studentId, context });
    return context;
  }

  async getStudentContexts(studentId) {
    return base44.entities.StudentContext.filter({ student_id: studentId });
  }

  async updateStudentContext(contextId, data) {
    const context = await base44.entities.StudentContext.update(contextId, data);
    this.emit("identity.student_context_updated", context);
    return context;
  }

  async removeStudentContext(contextId) {
    await base44.entities.StudentContext.delete(contextId);
    this.emit("identity.student_context_removed", { contextId });
  }
}

export const studentService = new StudentService();
export default studentService;
