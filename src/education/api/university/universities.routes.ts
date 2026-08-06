import type { UniversityService } from '../../services/university/university.service';

export function createUniversityRoutes(service: UniversityService) {
  return {
    'POST /api/education/universities': (body: {
      name: string;
      code: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const university = service.createUniversity(body.name, body.code, body.description, body.metadata);
      return { status: 201, data: university };
    },

    'GET /api/education/universities/:id': (params: { id: string }) => {
      const university = service.getUniversity(params.id);
      return { status: 200, data: university };
    },

    'PUT /api/education/universities/:id': (params: { id: string }, body: Parameters<UniversityService['updateUniversity']>[1]) => {
      const university = service.updateUniversity(params.id, body);
      return { status: 200, data: university };
    },

    'GET /api/education/universities': () => {
      const universities = service.listUniversities();
      return { status: 200, data: universities };
    },

    'DELETE /api/education/universities/:id': (params: { id: string }) => {
      service.deleteUniversity(params.id);
      return { status: 204, data: null };
    },
  };
}
