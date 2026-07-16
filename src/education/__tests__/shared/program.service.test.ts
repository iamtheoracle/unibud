import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramModel } from '../../models/shared/program.model';
import { ProgramService } from '../../services/shared/program.service';

vi.mock('../../models/shared/program.model', () => ({
  ProgramModel: {
    findByCode: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProgramService', () => {
  let service: ProgramService;

  beforeEach(() => {
    service = new ProgramService();
    vi.clearAllMocks();
  });

  it('creates a program with an empty subject list', async () => {
    const program = {
      id: 'prog-1',
      name: 'Computer Science',
      code: 'CS',
      type: 'degree',
      subjects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(ProgramModel.findByCode).mockResolvedValue(null);
    vi.mocked(ProgramModel.create).mockResolvedValue(program);

    await expect(service.createProgram('Computer Science', 'CS', 'degree')).resolves.toEqual(program);
    expect(ProgramModel.create).toHaveBeenCalledWith(expect.objectContaining({ subjects: [] }));
  });

  it('adds a subject to a program when absent', async () => {
    vi.mocked(ProgramModel.findById).mockResolvedValue({
      id: 'prog-1',
      name: 'Computer Science',
      code: 'CS',
      type: 'degree',
      subjects: ['sub-1'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(ProgramModel.update).mockResolvedValue({
      id: 'prog-1',
      name: 'Computer Science',
      code: 'CS',
      type: 'degree',
      subjects: ['sub-1', 'sub-2'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.addSubject('prog-1', 'sub-2');
    expect(ProgramModel.update).toHaveBeenCalledWith('prog-1', { subjects: ['sub-1', 'sub-2'] });
  });

  it('removes a subject from a program', async () => {
    vi.mocked(ProgramModel.findById).mockResolvedValue({
      id: 'prog-1',
      name: 'Computer Science',
      code: 'CS',
      type: 'degree',
      subjects: ['sub-1', 'sub-2'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(ProgramModel.update).mockResolvedValue({
      id: 'prog-1',
      name: 'Computer Science',
      code: 'CS',
      type: 'degree',
      subjects: ['sub-2'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.removeSubject('prog-1', 'sub-1');
    expect(ProgramModel.update).toHaveBeenCalledWith('prog-1', { subjects: ['sub-2'] });
  });
});
