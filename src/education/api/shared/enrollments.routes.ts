import type { EnrollmentService } from '../../services/shared/enrollment.service';

export function createEnrollmentRoutes(service: EnrollmentService) {
  return {
    'POST /api/education/enrollments': (body: {
      studentId: string;
      classId: string;
      metadata?: Record<string, unknown>;
    }) => {
      const enrollment = service.enrollInClass(body.studentId, body.classId, body.metadata);
      return { status: 201, data: enrollment };
    },

    'GET /api/education/enrollments/:id': (params: { id: string }) => {
      const enrollment = service.getEnrollment(params.id);
      return { status: 200, data: enrollment };
    },

    'GET /api/education/enrollments': (query: { studentId?: string; classId?: string }) => {
      const enrollments = service.listEnrollments(query.studentId, query.classId);
      return { status: 200, data: enrollments };
    },

    'DELETE /api/education/enrollments': (body: { studentId: string; classId: string }) => {
      service.withdrawFromClass(body.studentId, body.classId);
      return { status: 200, data: null };
    },

    'POST /api/education/enrollments/:id/approve': (params: { id: string }) => {
      service.approveEnrollment(params.id);
      return { status: 200, data: null };
    },
  };
}
