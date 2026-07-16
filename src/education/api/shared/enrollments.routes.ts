export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const enrollmentRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/enrollments', description: 'Create enrollment', handler: 'enrollmentService.enrollInClass' },
  { method: 'GET', path: '/api/education/enrollments', description: 'List enrollments', handler: 'enrollmentService.listEnrollments' },
  { method: 'GET', path: '/api/education/enrollments/:id', description: 'Get enrollment', handler: 'enrollmentService.getEnrollment' },
  { method: 'POST', path: '/api/education/enrollments/:id/approve', description: 'Approve enrollment', handler: 'enrollmentService.approveEnrollment' },
  { method: 'POST', path: '/api/education/enrollments/withdraw', description: 'Withdraw from class', handler: 'enrollmentService.withdrawFromClass' },
];
