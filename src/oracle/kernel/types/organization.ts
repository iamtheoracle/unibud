export interface IOrganization {
  id: string;
  name: string;
  type?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
