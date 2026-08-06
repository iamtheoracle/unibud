import type { ProgramService } from '../../services/shared/program.service';

export function createProgramRoutes(service: ProgramService) {
  return {
    'POST /api/education/programs': (body: {
      name: string;
      type: string;
      organizationType: 'university' | 'learningOrg';
      description?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const program = service.createProgram(body.name, body.type, body.organizationType, body.description, body.metadata);
      return { status: 201, data: program };
    },

    'GET /api/education/programs/:id': (params: { id: string }) => {
      const program = service.getProgram(params.id);
      return { status: 200, data: program };
    },

    'PUT /api/education/programs/:id': (params: { id: string }, body: Parameters<ProgramService['updateProgram']>[1]) => {
      const program = service.updateProgram(params.id, body);
      return { status: 200, data: program };
    },

    'GET /api/education/programs': (query: { type?: string; organizationType?: 'university' | 'learningOrg' }) => {
      const programs = service.listPrograms(query.type, query.organizationType);
      return { status: 200, data: programs };
    },

    'DELETE /api/education/programs/:id': (params: { id: string }) => {
      service.deleteProgram(params.id);
      return { status: 204, data: null };
    },
  };
}
