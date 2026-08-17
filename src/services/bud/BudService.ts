/**
 * Bud Service: User-facing AI assistant.
 * Delegates orchestration to Orbit.
 * May format the final response.
 * Never directly invokes specialists.
 */

import { OrbitService } from '../orbit/OrbitService';

export interface BudResponse {
  response?: string;
  error?: string;
}

export class BudService {
  private orbit: OrbitService;

  constructor() {
    this.orbit = new OrbitService();
  }

  /**
   * Respond to a user message.
   * Delegates all orchestration to Orbit.
   */
  async respond(
    studentId: string,
    message: string,
    history: string[] = [],
    context: any = {}
  ): Promise<BudResponse> {
    try {
      const orbitResponse = await this.orbit.orchestrate(studentId, message, history, context);

      if (orbitResponse.error) {
        return { error: orbitResponse.error };
      }

      // Optional: Format the response for better presentation
      // For now, return as-is
      return { response: orbitResponse.result };
    } catch (err: any) {
      return { error: `Internal system error: ${err?.message || 'Unknown error'}` };
    }
  }
}
