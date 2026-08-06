import type { LearningOrganizationService } from '../../services/learning-org/organization.service';
import type { LearningOrgType } from '../../types/learning-org';

export function createOrganizationRoutes(service: LearningOrganizationService) {
  return {
    'POST /api/education/organizations': (body: {
      name: string;
      type: LearningOrgType;
      description?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const org = service.createOrganization(body.name, body.type, body.description, body.metadata);
      return { status: 201, data: org };
    },

    'GET /api/education/organizations/:id': (params: { id: string }) => {
      const org = service.getOrganization(params.id);
      return { status: 200, data: org };
    },

    'PUT /api/education/organizations/:id': (params: { id: string }, body: Parameters<LearningOrganizationService['updateOrganization']>[1]) => {
      const org = service.updateOrganization(params.id, body);
      return { status: 200, data: org };
    },

    'GET /api/education/organizations': (query: { type?: LearningOrgType }) => {
      const orgs = service.listOrganizations(query.type);
      return { status: 200, data: orgs };
    },

    'DELETE /api/education/organizations/:id': (params: { id: string }) => {
      service.deleteOrganization(params.id);
      return { status: 204, data: null };
    },
  };
}
