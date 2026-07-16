import type { SubjectService } from '../../services/shared/subject.service';

export function createSubjectRoutes(service: SubjectService) {
  return {
    'POST /api/education/subjects': (body: {
      programId: string;
      code: string;
      name: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const subject = service.createSubject(body.programId, body.code, body.name, body.description, body.metadata);
      return { status: 201, data: subject };
    },

    'GET /api/education/subjects/:id': (params: { id: string }) => {
      const subject = service.getSubject(params.id);
      return { status: 200, data: subject };
    },

    'PUT /api/education/subjects/:id': (params: { id: string }, body: Parameters<SubjectService['updateSubject']>[1]) => {
      const subject = service.updateSubject(params.id, body);
      return { status: 200, data: subject };
    },

    'GET /api/education/subjects': (query: { programId?: string }) => {
      const subjects = service.listSubjects(query.programId);
      return { status: 200, data: subjects };
    },

    'DELETE /api/education/subjects/:id': (params: { id: string }) => {
      service.deleteSubject(params.id);
      return { status: 204, data: null };
    },
  };
}
