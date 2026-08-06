import type { UniversityStudentService } from '../../services/university/university-student.service';
import type { IUniversityStudent } from '../../types/university';

export function createUniversityStudentRoutes(service: UniversityStudentService) {
  return {
    'POST /api/education/university-students': (body: {
      universityId: string;
      userId: string;
      departmentId: string;
      courseId: string;
      matriculationNumber?: string;
      level?: IUniversityStudent['level'];
      metadata?: Record<string, unknown>;
    }) => {
      const student = service.enrollStudent(body.universityId, body.userId, body.departmentId, body.courseId, body.matriculationNumber, body.level, body.metadata);
      return { status: 201, data: student };
    },

    'GET /api/education/university-students/:id': (params: { id: string }) => {
      const student = service.getStudent(params.id);
      return { status: 200, data: student };
    },

    'PUT /api/education/university-students/:id': (params: { id: string }, body: Parameters<UniversityStudentService['updateStudent']>[1]) => {
      const student = service.updateStudent(params.id, body);
      return { status: 200, data: student };
    },

    'GET /api/education/university-students': (query: { universityId?: string; departmentId?: string; courseId?: string }) => {
      const students = service.listStudents(query.universityId, query.departmentId, query.courseId);
      return { status: 200, data: students };
    },

    'POST /api/education/university-students/:id/activate': (params: { id: string }) => {
      service.activateStudent(params.id);
      return { status: 200, data: null };
    },

    'POST /api/education/university-students/:id/deactivate': (params: { id: string }) => {
      service.deactivateStudent(params.id);
      return { status: 200, data: null };
    },
  };
}
