import type { CourseService } from '../../services/university/course.service';

export function createCourseRoutes(service: CourseService) {
  return {
    'POST /api/education/courses': (body: {
      departmentId: string;
      code: string;
      name: string;
      description?: string;
      credits?: number;
      metadata?: Record<string, unknown>;
    }) => {
      const course = service.createCourse(body.departmentId, body.code, body.name, body.description, body.credits, body.metadata);
      return { status: 201, data: course };
    },

    'GET /api/education/courses/:id': (params: { id: string }) => {
      const course = service.getCourse(params.id);
      return { status: 200, data: course };
    },

    'PUT /api/education/courses/:id': (params: { id: string }, body: Parameters<CourseService['updateCourse']>[1]) => {
      const course = service.updateCourse(params.id, body);
      return { status: 200, data: course };
    },

    'GET /api/education/courses': (query: { departmentId?: string }) => {
      const courses = service.listCourses(query.departmentId);
      return { status: 200, data: courses };
    },

    'DELETE /api/education/courses/:id': (params: { id: string }) => {
      service.deleteCourse(params.id);
      return { status: 204, data: null };
    },
  };
}
