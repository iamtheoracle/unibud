import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentModel } from '../../models/shared/student.model';
import { StudentService } from '../../services/shared/student.service';

vi.mock('../../models/shared/student.model', () => ({
  StudentModel: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
    findContexts: vi.fn(),
  },
}));

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(() => {
    service = new StudentService();
    vi.clearAllMocks();
  });

  it('should register a new student', async () => {
    const mockStudent = {
      id: '1',
      userId: '',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(StudentModel.findByEmail).mockResolvedValue(null);
    vi.mocked(StudentModel.create).mockResolvedValue(mockStudent);

    const result = await service.registerStudent('john@test.com', 'John', 'Doe');

    expect(result).toEqual(mockStudent);
    expect(StudentModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'john@test.com', firstName: 'John', lastName: 'Doe', status: 'active' })
    );
  });

  it('should throw when registering duplicate email', async () => {
    const mockStudent = {
      id: '1',
      userId: '',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(StudentModel.findByEmail).mockResolvedValue(mockStudent);

    await expect(service.registerStudent('john@test.com', 'John', 'Doe')).rejects.toThrow('already exists');
  });

  it('should get student by id', async () => {
    const mockStudent = {
      id: '1',
      userId: '',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(StudentModel.findById).mockResolvedValue(mockStudent);

    const result = await service.getStudent('1');
    expect(result).toEqual(mockStudent);
  });

  it('should throw when student not found', async () => {
    vi.mocked(StudentModel.findById).mockResolvedValue(null);
    await expect(service.getStudent('999')).rejects.toThrow('not found');
  });

  it('should list student contexts', async () => {
    const contexts = [
      { id: 'ctx-1', studentId: '1', contextType: 'university' as const, contextId: 'uni-1', status: 'active' as const, enrolledAt: new Date() },
    ];
    vi.mocked(StudentModel.findContexts).mockResolvedValue(contexts);

    await expect(service.getStudentContexts('1')).resolves.toEqual(contexts);
  });
});
