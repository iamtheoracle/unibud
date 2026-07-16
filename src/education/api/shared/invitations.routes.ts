export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  handler: string;
}

export const invitationRoutes: RouteDefinition[] = [
  { method: 'POST', path: '/api/education/invitations', description: 'Send invitation', handler: 'invitationService.sendInvitation' },
  { method: 'POST', path: '/api/education/invitations/accept', description: 'Accept invitation', handler: 'invitationService.acceptInvitation' },
  { method: 'POST', path: '/api/education/invitations/reject', description: 'Reject invitation', handler: 'invitationService.rejectInvitation' },
];
