export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const educatorRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/educators', description: 'Register a new educator', handler: 'educatorService.registerEducator' },
  { method: 'GET', path: '/api/education/educators', description: 'List all educators', handler: 'educatorService.listEducators' },
  { method: 'GET', path: '/api/education/educators/:id', description: 'Get educator by ID', handler: 'educatorService.getEducator' },
  { method: 'PUT', path: '/api/education/educators/:id', description: 'Update educator', handler: 'educatorService.updateEducator' },
  { method: 'POST', path: '/api/education/educators/:id/context', description: 'Assign educator to context', handler: 'educatorService.assignToContext' },
  { method: 'DELETE', path: '/api/education/educators/:id/context', description: 'Remove educator from context', handler: 'educatorService.removeFromContext' },
  { method: 'GET', path: '/api/education/educators/:id/contexts', description: 'Get educator contexts', handler: 'educatorService.getEducatorContexts' },
];
