export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const permissionRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/permissions', description: 'Define permission', handler: 'permissionService.definePermission' },
  { method: 'POST', path: '/api/education/permissions/grant', description: 'Grant permission', handler: 'permissionService.grantPermission' },
  { method: 'POST', path: '/api/education/permissions/revoke', description: 'Revoke permission', handler: 'permissionService.revokePermission' },
  { method: 'GET', path: '/api/education/permissions/check', description: 'Check permission', handler: 'permissionService.hasPermission' },
];
