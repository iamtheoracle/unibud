/**
 * Domain: University — Type Exports
 */

export interface IUniversity {
  id: string;
  name: string;
  code: string;
  description?: string;
  faculties: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFaculty {
  id: string;
  universityId: string;
  name: string;
  code: string;
  departments: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  courses: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUniCourse {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUniversityInput {
  name: string;
  code: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateUniversityInput {
  name?: string;
  code?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateFacultyInput {
  universityId: string;
  name: string;
  code: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateFacultyInput {
  name?: string;
  code?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateDepartmentInput {
  facultyId: string;
  name: string;
  code: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateUniCourseInput {
  departmentId: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateUniCourseInput {
  code?: string;
  name?: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
}
