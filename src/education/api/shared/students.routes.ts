export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const studentRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/students', description: 'Register a new student', handler: 'studentService.registerStudent' },
  { method: 'GET', path: '/api/education/students', description: 'List all students', handler: 'studentService.listStudents' },
  { method: 'GET', path: '/api/education/students/:id', description: 'Get student by ID', handler: 'studentService.getStudent' },
  { method: 'PUT', path: '/api/education/students/:id', description: 'Update student', handler: 'studentService.updateStudent' },
  { method: 'POST', path: '/api/education/students/:id/activate', description: 'Activate student', handler: 'studentService.activateStudent' },
  { method: 'POST', path: '/api/education/students/:id/deactivate', description: 'Deactivate student', handler: 'studentService.deactivateStudent' },
  { method: 'GET', path: '/api/education/students/:id/contexts', description: 'Get student contexts', handler: 'studentService.getStudentContexts' },
];
