import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningOrganizationModel } from '../../models/learning-org/organization.model';
import { LearningOrganizationService } from '../../services/learning-org/organization.service';

vi.mock('../../models/learning-org/organization.model', () => ({
  LearningOrganizationModel: {
    findByName: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('LearningOrganizationService', () => {
  let service: LearningOrganizationService;

  beforeEach(() => {
    service = new LearningOrganizationService();
    vi.clearAllMocks();
  });

  it('creates an organization when no duplicate exists', async () => {
    const organization = {
      id: 'org-1',
      name: 'UniBud Academy',
      type: 'academy' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(LearningOrganizationModel.findByName).mockResolvedValue(null);
    vi.mocked(LearningOrganizationModel.create).mockResolvedValue(organization);

    await expect(service.createOrganization('UniBud Academy', 'academy')).resolves.toEqual(organization);
  });

  it('filters organizations by type', async () => {
    const organizations = [
      { id: 'org-1', name: 'UniBud Academy', type: 'academy' as const, createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(LearningOrganizationModel.findAll).mockResolvedValue(organizations);

    await expect(service.listOrganizations('academy')).resolves.toEqual(organizations);
    expect(LearningOrganizationModel.findAll).toHaveBeenCalledWith('academy');
  });
});
