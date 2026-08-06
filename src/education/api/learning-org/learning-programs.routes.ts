export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const learningProgramRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/learning-programs', description: 'Create learning program', handler: 'learningProgramService.createProgram' },
  { method: 'GET', path: '/api/education/learning-programs', description: 'List learning programs', handler: 'learningProgramService.listPrograms' },
  { method: 'GET', path: '/api/education/learning-programs/:id', description: 'Get learning program', handler: 'learningProgramService.getProgram' },
  { method: 'PUT', path: '/api/education/learning-programs/:id', description: 'Update learning program', handler: 'learningProgramService.updateProgram' },
  { method: 'DELETE', path: '/api/education/learning-programs/:id', description: 'Delete learning program', handler: 'learningProgramService.deleteProgram' },
];
