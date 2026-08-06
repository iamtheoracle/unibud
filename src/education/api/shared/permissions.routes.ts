import type { PermissionService } from '../../services/shared/permission.service';

export function createPermissionRoutes(service: PermissionService) {
  return {
    'POST /api/education/permissions': (body: {
      name: string;
      description?: string;
      scope?: string;
    }) => {
      const permission = service.definePermission(body.name, body.description, body.scope);
      return { status: 201, data: permission };
    },

    'GET /api/education/permissions': () => {
      const permissions = service.listPermissions();
      return { status: 200, data: permissions };
    },

    'POST /api/education/permissions/grant': (body: {
      userId: string;
      permissionName: string;
      context?: Record<string, unknown>;
    }) => {
      service.grantPermission(body.userId, body.permissionName, body.context);
      return { status: 200, data: null };
    },

    'POST /api/education/permissions/revoke': (body: {
      userId: string;
      permissionName: string;
      context?: Record<string, unknown>;
    }) => {
      service.revokePermission(body.userId, body.permissionName, body.context);
      return { status: 200, data: null };
    },

    'GET /api/education/permissions/check': (query: {
      userId: string;
      permissionName: string;
      context?: string;
    }) => {
      const context = query.context ? JSON.parse(query.context) : undefined;
      const hasPermission = service.hasPermission(query.userId, query.permissionName, context);
      return { status: 200, data: { hasPermission } };
    },
  };
}
