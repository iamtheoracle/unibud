/**
 * Domain: Learning Organization — Types
 */

export type LearningOrganizationType =
  | 'examCentre'
  | 'tutorialCentre'
  | 'academy'
  | 'trainingCentre';

export type LearningProgramStatus = 'active' | 'completed' | 'cancelled';

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
  status: LearningProgramStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLearningOrganizationInput {
  name: string;
  type: LearningOrganizationType;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateLearningOrganizationInput {
  name?: string;
  type?: LearningOrganizationType;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateLearningProgramInput {
  organizationId: string;
  programId: string;
  startDate: Date;
  endDate: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdateLearningProgramInput {
  startDate?: Date;
  endDate?: Date;
  status?: LearningProgramStatus;
  metadata?: Record<string, unknown>;
}
