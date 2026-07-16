export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const universityRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/universities', description: 'Create university', handler: 'universityService.createUniversity' },
  { method: 'GET', path: '/api/education/universities', description: 'List universities', handler: 'universityService.listUniversities' },
  { method: 'GET', path: '/api/education/universities/:id', description: 'Get university', handler: 'universityService.getUniversity' },
  { method: 'PUT', path: '/api/education/universities/:id', description: 'Update university', handler: 'universityService.updateUniversity' },
  { method: 'DELETE', path: '/api/education/universities/:id', description: 'Delete university', handler: 'universityService.deleteUniversity' },
];
