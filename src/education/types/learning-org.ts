export type LearningOrganizationType = 'examCentre' | 'tutorialCentre' | 'academy' | 'trainingCentre';

export interface ILearningOrganization {
  id: string;
  name: string;
  type: LearningOrganizationType;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearningProgram {
  id: string;
  organizationId: string;
  programId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
