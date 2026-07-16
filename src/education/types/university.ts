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
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
