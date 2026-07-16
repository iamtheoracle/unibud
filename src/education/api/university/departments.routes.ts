export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const departmentRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/departments', description: 'Create department', handler: 'departmentService.createDepartment' },
  { method: 'GET', path: '/api/education/departments', description: 'List departments', handler: 'departmentService.listDepartments' },
  { method: 'GET', path: '/api/education/departments/:id', description: 'Get department', handler: 'departmentService.getDepartment' },
  { method: 'PUT', path: '/api/education/departments/:id', description: 'Update department', handler: 'departmentService.updateDepartment' },
  { method: 'DELETE', path: '/api/education/departments/:id', description: 'Delete department', handler: 'departmentService.deleteDepartment' },
];
