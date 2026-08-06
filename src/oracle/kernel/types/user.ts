export interface IUser {
  id: string;
  email: string;
  displayName?: string;
  roles?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
