export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const courseRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/courses', description: 'Create course', handler: 'courseService.createCourse' },
  { method: 'GET', path: '/api/education/courses', description: 'List courses', handler: 'courseService.listCourses' },
  { method: 'GET', path: '/api/education/courses/:id', description: 'Get course', handler: 'courseService.getCourse' },
  { method: 'PUT', path: '/api/education/courses/:id', description: 'Update course', handler: 'courseService.updateCourse' },
  { method: 'DELETE', path: '/api/education/courses/:id', description: 'Delete course', handler: 'courseService.deleteCourse' },
];
