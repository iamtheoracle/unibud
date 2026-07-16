import type { DepartmentService } from '../../services/university/department.service';

export function createDepartmentRoutes(service: DepartmentService) {
  return {
    'POST /api/education/departments': (body: {
      facultyId: string;
      name: string;
      code: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const department = service.createDepartment(body.facultyId, body.name, body.code, body.description, body.metadata);
      return { status: 201, data: department };
    },

    'GET /api/education/departments/:id': (params: { id: string }) => {
      const department = service.getDepartment(params.id);
      return { status: 200, data: department };
    },

    'PUT /api/education/departments/:id': (params: { id: string }, body: Parameters<DepartmentService['updateDepartment']>[1]) => {
      const department = service.updateDepartment(params.id, body);
      return { status: 200, data: department };
    },

    'GET /api/education/departments': (query: { facultyId?: string }) => {
      const departments = service.listDepartments(query.facultyId);
      return { status: 200, data: departments };
    },

    'DELETE /api/education/departments/:id': (params: { id: string }) => {
      service.deleteDepartment(params.id);
      return { status: 204, data: null };
    },
  };
}
