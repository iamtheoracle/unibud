import type { InvitationService } from '../../services/shared/invitation.service';
import type { IInvitation } from '../../types/shared';

export function createInvitationRoutes(service: InvitationService) {
  return {
    'POST /api/education/invitations': (body: {
      email: string;
      type: 'educator' | 'student' | 'admin';
      organizationId: string;
      programId?: string;
      data?: Record<string, unknown>;
    }) => {
      const invitation = service.sendInvitation(body.email, body.type, body.organizationId, body.programId, body.data);
      return { status: 201, data: invitation };
    },

    'GET /api/education/invitations/:id': (params: { id: string }) => {
      const invitation = service.getInvitation(params.id);
      return { status: 200, data: invitation };
    },

    'GET /api/education/invitations': (query: { organizationId?: string; status?: IInvitation['status'] }) => {
      const invitations = service.listInvitations(query.organizationId, query.status);
      return { status: 200, data: invitations };
    },

    'POST /api/education/invitations/accept': (body: { token: string }) => {
      const invitation = service.acceptInvitation(body.token);
      return { status: 200, data: invitation };
    },

    'POST /api/education/invitations/reject': (body: { token: string }) => {
      service.rejectInvitation(body.token);
      return { status: 200, data: null };
    },
  };
}
