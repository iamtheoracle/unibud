import type { ClassService } from '../../services/shared/class.service';

export function createClassRoutes(service: ClassService) {
  return {
    'POST /api/education/classes': (body: {
      organizationId: string;
      programId: string;
      subjectId: string;
      educatorId: string;
      name: string;
      schedule?: unknown;
      code?: string;
      capacity?: number;
      metadata?: Record<string, unknown>;
    }) => {
      const cls = service.createClass(body.organizationId, body.programId, body.subjectId, body.educatorId, body.name, body.schedule, body.code, body.capacity, body.metadata);
      return { status: 201, data: cls };
    },

    'GET /api/education/classes/:id': (params: { id: string }) => {
      const cls = service.getClass(params.id);
      return { status: 200, data: cls };
    },

    'PUT /api/education/classes/:id': (params: { id: string }, body: Parameters<ClassService['updateClass']>[1]) => {
      const cls = service.updateClass(params.id, body);
      return { status: 200, data: cls };
    },

    'GET /api/education/classes': (query: { organizationId?: string; programId?: string; educatorId?: string }) => {
      const classes = service.listClasses(query.organizationId, query.programId, query.educatorId);
      return { status: 200, data: classes };
    },

    'DELETE /api/education/classes/:id': (params: { id: string }) => {
      service.deleteClass(params.id);
      return { status: 204, data: null };
    },
  };
}
