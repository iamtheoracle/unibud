export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const facultyRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/faculties', description: 'Create faculty', handler: 'facultyService.createFaculty' },
  { method: 'GET', path: '/api/education/faculties', description: 'List faculties', handler: 'facultyService.listFaculties' },
  { method: 'GET', path: '/api/education/faculties/:id', description: 'Get faculty', handler: 'facultyService.getFaculty' },
  { method: 'PUT', path: '/api/education/faculties/:id', description: 'Update faculty', handler: 'facultyService.updateFaculty' },
  { method: 'DELETE', path: '/api/education/faculties/:id', description: 'Delete faculty', handler: 'facultyService.deleteFaculty' },
];
