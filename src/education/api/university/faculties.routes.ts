import type { FacultyService } from '../../services/university/faculty.service';

export function createFacultyRoutes(service: FacultyService) {
  return {
    'POST /api/education/faculties': (body: {
      universityId: string;
      name: string;
      code: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const faculty = service.createFaculty(body.universityId, body.name, body.code, body.description, body.metadata);
      return { status: 201, data: faculty };
    },

    'GET /api/education/faculties/:id': (params: { id: string }) => {
      const faculty = service.getFaculty(params.id);
      return { status: 200, data: faculty };
    },

    'PUT /api/education/faculties/:id': (params: { id: string }, body: Parameters<FacultyService['updateFaculty']>[1]) => {
      const faculty = service.updateFaculty(params.id, body);
      return { status: 200, data: faculty };
    },

    'GET /api/education/faculties': (query: { universityId?: string }) => {
      const faculties = service.listFaculties(query.universityId);
      return { status: 200, data: faculties };
    },

    'DELETE /api/education/faculties/:id': (params: { id: string }) => {
      service.deleteFaculty(params.id);
      return { status: 204, data: null };
    },
  };
}
