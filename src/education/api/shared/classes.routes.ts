export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const classRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/classes', description: 'Create class', handler: 'classService.createClass' },
  { method: 'GET', path: '/api/education/classes', description: 'List classes', handler: 'classService.listClasses' },
  { method: 'GET', path: '/api/education/classes/:id', description: 'Get class', handler: 'classService.getClass' },
  { method: 'PUT', path: '/api/education/classes/:id', description: 'Update class', handler: 'classService.updateClass' },
  { method: 'DELETE', path: '/api/education/classes/:id', description: 'Delete class', handler: 'classService.deleteClass' },
  { method: 'POST', path: '/api/education/classes/:id/students', description: 'Add student to class', handler: 'classService.addStudent' },
  { method: 'DELETE', path: '/api/education/classes/:id/students/:studentId', description: 'Remove student from class', handler: 'classService.removeStudent' },
];
