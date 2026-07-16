export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const subjectRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/subjects', description: 'Create subject', handler: 'subjectService.createSubject' },
  { method: 'GET', path: '/api/education/subjects', description: 'List subjects', handler: 'subjectService.listSubjects' },
  { method: 'GET', path: '/api/education/subjects/:id', description: 'Get subject', handler: 'subjectService.getSubject' },
  { method: 'PUT', path: '/api/education/subjects/:id', description: 'Update subject', handler: 'subjectService.updateSubject' },
  { method: 'DELETE', path: '/api/education/subjects/:id', description: 'Delete subject', handler: 'subjectService.deleteSubject' },
];
