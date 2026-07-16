import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UniversityModel } from '../../models/university/university.model';
import { UniversityService } from '../../services/university/university.service';

vi.mock('../../models/university/university.model', () => ({
  UniversityModel: {
    findByCode: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('UniversityService', () => {
  let service: UniversityService;

  beforeEach(() => {
    service = new UniversityService();
    vi.clearAllMocks();
  });

  it('creates a university', async () => {
    const university = {
      id: 'uni-1',
      name: 'UniBud University',
      code: 'UBU',
      faculties: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(UniversityModel.findByCode).mockResolvedValue(null);
    vi.mocked(UniversityModel.create).mockResolvedValue(university);

    await expect(service.createUniversity('UniBud University', 'UBU')).resolves.toEqual(university);
  });

  it('lists universities', async () => {
    const universities = [
      { id: 'uni-1', name: 'UniBud University', code: 'UBU', faculties: [], createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(UniversityModel.findAll).mockResolvedValue(universities);

    await expect(service.listUniversities()).resolves.toEqual(universities);
  });
});
