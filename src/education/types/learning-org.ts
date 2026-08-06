// ─── Learning Organization Ecosystem Types ────────────────────────────────────

export type LearningOrgType = 'examCentre' | 'tutorialCentre' | 'academy' | 'trainingCentre';

export interface ILearningOrganization {
  id: string;
  name: string;
  type: LearningOrgType;
  description?: string;
  educators: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearningOrgStudent {
  id: string;
  userId: string;
  organizationId: string;
  programId: string;
  enrollmentNumber?: string;
  status: 'active' | 'inactive' | 'completed' | 'withdrawn';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
