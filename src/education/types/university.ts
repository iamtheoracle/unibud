// ─── University Ecosystem Types ───────────────────────────────────────────────

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
  description?: string;
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
  description?: string;
  courses: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse {
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

export interface IUniversityStudent {
  id: string;
  userId: string;
  universityId: string;
  departmentId: string;
  courseId: string;
  matriculationNumber?: string;
  level?: '100' | '200' | '300' | '400' | '500' | '600';
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
