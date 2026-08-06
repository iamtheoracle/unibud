/**
 * Education Module — Class Service
 */

import type { IClass, IClassSchedule, IClassService } from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class ClassService implements IClassService {
  private readonly store: Map<string, IClass> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('ClassService');
  }

  createClass(
    orgId: string,
    programId: string,
    subjectId: string,
    educatorId: string,
    name: string,
    schedule?: IClassSchedule,
  ): IClass {
    const now = new Date();
    const cls: IClass = {
      id: generateId(),
      organizationId: orgId,
      programId,
      subjectId,
      educatorId,
      name,
      schedule,
      students: [],
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(cls.id, cls);
    this.logger.info('class.created', { id: cls.id, name, orgId });
    return cls;
  }

  getClass(id: string): IClass {
    const cls = this.store.get(id);
    if (!cls) throw new Error(`Class not found: ${id}`);
    return cls;
  }

  updateClass(
    id: string,
    data: Partial<Omit<IClass, 'id' | 'createdAt'>>,
  ): IClass {
    const cls = this.getClass(id);
    const updated: IClass = { ...cls, ...data, id, createdAt: cls.createdAt, updatedAt: new Date() };
    this.store.set(id, updated);
    this.logger.info('class.updated', { id });
    return updated;
  }

  listClasses(orgId?: string, programId?: string, educatorId?: string): IClass[] {
    return [...this.store.values()].filter(
      (c) =>
        (orgId === undefined || c.organizationId === orgId) &&
        (programId === undefined || c.programId === programId) &&
        (educatorId === undefined || c.educatorId === educatorId),
    );
  }

  deleteClass(id: string): void {
    this.getClass(id);
    this.store.delete(id);
    this.logger.info('class.deleted', { id });
  }

  addStudent(classId: string, studentId: string): void {
    const cls = this.getClass(classId);
    if (!cls.students.includes(studentId)) {
      cls.students.push(studentId);
      cls.updatedAt = new Date();
      this.store.set(classId, cls);
      this.logger.info('class.student.added', { classId, studentId });
    }
  }

  removeStudent(classId: string, studentId: string): void {
    const cls = this.getClass(classId);
    cls.students = cls.students.filter((s) => s !== studentId);
    cls.updatedAt = new Date();
    this.store.set(classId, cls);
    this.logger.info('class.student.removed', { classId, studentId });
  }
}
