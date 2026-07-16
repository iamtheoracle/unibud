export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const organizationRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/organizations', description: 'Create learning organization', handler: 'organizationService.createOrganization' },
  { method: 'GET', path: '/api/education/organizations', description: 'List learning organizations', handler: 'organizationService.listOrganizations' },
  { method: 'GET', path: '/api/education/organizations/:id', description: 'Get learning organization', handler: 'organizationService.getOrganization' },
  { method: 'PUT', path: '/api/education/organizations/:id', description: 'Update learning organization', handler: 'organizationService.updateOrganization' },
  { method: 'DELETE', path: '/api/education/organizations/:id', description: 'Delete learning organization', handler: 'organizationService.deleteOrganization' },
];
