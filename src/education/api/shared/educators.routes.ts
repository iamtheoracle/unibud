import type { EducatorService } from '../../services/shared/educator.service';

export function createEducatorRoutes(service: EducatorService) {
  return {
    'POST /api/education/educators': (body: {
      email: string;
      name: string;
      bio?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const educator = service.registerEducator(body.email, body.name, body.bio, body.metadata);
      return { status: 201, data: educator };
    },

    'GET /api/education/educators/:id': (params: { id: string }) => {
      const educator = service.getEducator(params.id);
      return { status: 200, data: educator };
    },

    'PUT /api/education/educators/:id': (params: { id: string }, body: Parameters<EducatorService['updateEducator']>[1]) => {
      const educator = service.updateEducator(params.id, body);
      return { status: 200, data: educator };
    },

    'GET /api/education/educators': (query: { organizationId?: string }) => {
      const educators = service.listEducators(query.organizationId);
      return { status: 200, data: educators };
    },

    'POST /api/education/educators/:id/organizations': (params: { id: string }, body: { organizationId: string }) => {
      service.assignToOrganization(params.id, body.organizationId);
      return { status: 200, data: null };
    },
  };
}
