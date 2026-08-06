import type { IClass } from '../../types/shared';
import { ClassModel } from '../../models/shared/class.model';
import { generateId } from '../../utils';

export class ClassService {
  private store = new Map<string, ClassModel>();

  createClass(
    organizationId: string,
    programId: string,
    subjectId: string,
    educatorId: string,
    name: string,
    schedule?: unknown,
    code?: string,
    capacity?: number,
    metadata?: Record<string, unknown>,
  ): IClass {
    const id = generateId('cls');
    const cls = new ClassModel({ id, organizationId, programId, subjectId, educatorId, name, code, schedule, capacity, students: [], metadata });
    this.store.set(id, cls);
    return cls.toJSON();
  }

  getClass(id: string): IClass {
    const cls = this.store.get(id);
    if (!cls) throw new Error(`Class not found: ${id}`);
    return cls.toJSON();
  }

  updateClass(id: string, data: Partial<Pick<IClass, 'name' | 'code' | 'schedule' | 'capacity' | 'metadata'>>): IClass {
    const cls = this.store.get(id);
    if (!cls) throw new Error(`Class not found: ${id}`);
    if (data.name !== undefined) cls.name = data.name;
    if (data.code !== undefined) cls.code = data.code;
    if (data.schedule !== undefined) cls.schedule = data.schedule;
    if (data.capacity !== undefined) cls.capacity = data.capacity;
    if (data.metadata !== undefined) cls.metadata = data.metadata;
    cls.updatedAt = new Date();
    return cls.toJSON();
  }

  listClasses(organizationId?: string, programId?: string, educatorId?: string): IClass[] {
    return Array.from(this.store.values())
      .filter(c =>
        (!organizationId || c.organizationId === organizationId) &&
        (!programId || c.programId === programId) &&
        (!educatorId || c.educatorId === educatorId)
      )
      .map(c => c.toJSON());
  }

  deleteClass(id: string): void {
    if (!this.store.has(id)) throw new Error(`Class not found: ${id}`);
    this.store.delete(id);
  }
}
