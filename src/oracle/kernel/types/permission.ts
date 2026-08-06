export interface IPermission {
  id: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface IPermissionSet {
  userId: string;
  permissions: IPermission[];
}
