export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const programRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/programs', description: 'Create academic program', handler: 'programService.createProgram' },
  { method: 'GET', path: '/api/education/programs', description: 'List academic programs', handler: 'programService.listPrograms' },
  { method: 'GET', path: '/api/education/programs/:id', description: 'Get academic program', handler: 'programService.getProgram' },
  { method: 'PUT', path: '/api/education/programs/:id', description: 'Update academic program', handler: 'programService.updateProgram' },
  { method: 'DELETE', path: '/api/education/programs/:id', description: 'Delete academic program', handler: 'programService.deleteProgram' },
  { method: 'POST', path: '/api/education/programs/:id/subjects', description: 'Add subject to program', handler: 'programService.addSubject' },
  { method: 'DELETE', path: '/api/education/programs/:id/subjects/:subjectId', description: 'Remove subject from program', handler: 'programService.removeSubject' },
];
