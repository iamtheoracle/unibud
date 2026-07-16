import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EducatorModel } from '../../models/shared/educator.model';
import { EducatorService } from '../../services/shared/educator.service';

vi.mock('../../models/shared/educator.model', () => ({
  EducatorModel: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
    findContexts: vi.fn(),
    createContext: vi.fn(),
    deleteContext: vi.fn(),
  },
}));

describe('EducatorService', () => {
  let service: EducatorService;

  beforeEach(() => {
    service = new EducatorService();
    vi.clearAllMocks();
  });

  it('registers a new educator', async () => {
    const educator = {
      id: 'ed-1',
      userId: '',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@test.com',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(EducatorModel.findByEmail).mockResolvedValue(null);
    vi.mocked(EducatorModel.create).mockResolvedValue(educator);

    await expect(service.registerEducator('ada@test.com', 'Ada', 'Lovelace')).resolves.toEqual(educator);
  });

  it('assigns an educator to a context once', async () => {
    const educator = {
      id: 'ed-1',
      userId: '',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@test.com',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(EducatorModel.findById).mockResolvedValue(educator);
    vi.mocked(EducatorModel.findContexts).mockResolvedValue([]);
    vi.mocked(EducatorModel.createContext).mockResolvedValue({
      id: 'ctx-1',
      educatorId: 'ed-1',
      contextType: 'university',
      contextId: 'uni-1',
      assignedAt: new Date(),
    });

    await service.assignToContext('ed-1', 'university', 'uni-1');
    expect(EducatorModel.createContext).toHaveBeenCalledWith(
      expect.objectContaining({ educatorId: 'ed-1', contextType: 'university', contextId: 'uni-1' })
    );
  });

  it('removes educator context when it exists', async () => {
    vi.mocked(EducatorModel.findContexts).mockResolvedValue([
      { id: 'ctx-1', educatorId: 'ed-1', contextType: 'university', contextId: 'uni-1', assignedAt: new Date() },
    ]);

    await service.removeFromContext('ed-1', 'university', 'uni-1');
    expect(EducatorModel.deleteContext).toHaveBeenCalledWith('ctx-1');
  });
});
