import { describe, expect, it, vi } from 'vitest';

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {},
  },
}));

import {
  educationModule,
  educationRoutes,
  studentRoutes,
  educatorRoutes,
  programRoutes,
  universityRoutes,
  organizationRoutes,
} from '../index';

describe('education module integration', () => {
  it('exposes a stable module contract', async () => {
    expect(educationModule.name).toBe('education');
    expect(educationModule.version).toBe('1.0.0');
    await expect(educationModule.initialize()).resolves.toBeUndefined();
    await expect(educationModule.shutdown()).resolves.toBeUndefined();
    expect(educationModule.students).toBeDefined();
    expect(educationModule.universities).toBeDefined();
    expect(educationModule.organizations).toBeDefined();
  });

  it('aggregates unique route definitions', () => {
    const coreRoutes = [...studentRoutes, ...educatorRoutes, ...programRoutes, ...universityRoutes, ...organizationRoutes];
    expect(educationRoutes.length).toBeGreaterThan(coreRoutes.length);
    const uniqueRoutes = new Set(educationRoutes.map((route) => `${route.method}:${route.path}`));
    expect(uniqueRoutes.size).toBe(educationRoutes.length);
    expect(educationRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/api/education/students' }),
        expect.objectContaining({ path: '/api/education/universities' }),
        expect.objectContaining({ path: '/api/education/organizations' }),
      ])
    );
  });
});
