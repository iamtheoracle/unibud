import type { LearningOrgStudentService } from '../../services/learning-org/org-student.service';

export function createOrgStudentRoutes(service: LearningOrgStudentService) {
  return {
    'POST /api/education/org-students': (body: {
      organizationId: string;
      userId: string;
      programId: string;
      enrollmentNumber?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const student = service.enrollStudent(body.organizationId, body.userId, body.programId, body.enrollmentNumber, body.metadata);
      return { status: 201, data: student };
    },

    'GET /api/education/org-students/:id': (params: { id: string }) => {
      const student = service.getStudent(params.id);
      return { status: 200, data: student };
    },

    'PUT /api/education/org-students/:id': (params: { id: string }, body: Parameters<LearningOrgStudentService['updateStudent']>[1]) => {
      const student = service.updateStudent(params.id, body);
      return { status: 200, data: student };
    },

    'GET /api/education/org-students': (query: { organizationId?: string; programId?: string }) => {
      const students = service.listStudents(query.organizationId, query.programId);
      return { status: 200, data: students };
    },

    'POST /api/education/org-students/:id/activate': (params: { id: string }) => {
      service.activateStudent(params.id);
      return { status: 200, data: null };
    },

    'POST /api/education/org-students/:id/deactivate': (params: { id: string }) => {
      service.deactivateStudent(params.id);
      return { status: 200, data: null };
    },
  };
}
