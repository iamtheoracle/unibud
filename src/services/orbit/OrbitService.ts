/**
 * Orbit Service: Orchestration and routing authority.
 * Determines which specialists are required for a request.
 * Coordinates Guardian pre-check, Spark execution, and Guardian output-check.
 */

import { GuardianService } from '../guardian/GuardianService';
import { SparkService, ExecutionPlan, ExecutionResult } from '../spark/SparkService';
import { AgentRegistry } from '../registry/AgentRegistry';

export interface OrchestrationResult {
  result: string;
  error?: string;
}

export class OrbitService {
  private registry: AgentRegistry;
  private guardian: GuardianService;
  private spark: SparkService;

  constructor() {
    this.registry = new AgentRegistry();
    this.guardian = new GuardianService();
    this.spark = new SparkService(this.registry);
  }

  /**
   * Orchestrate a user request.
   * Flow: Guardian pre-check → Routing → Spark execution → Guardian output-check
   */
  async orchestrate(
    studentId: string,
    message: string,
    history: string[],
    context: any = {}
  ): Promise<OrchestrationResult> {
    // 1. Guardian pre-check
    const preCheck = await this.guardian.preCheck(studentId, message, context);
    if (!preCheck.allowed) {
      return { result: '', error: preCheck.reason || 'Blocked by Guardian' };
    }

    // 2. Route: Determine which active specialists are required
    const requiredAgents = this.route(message);
    if (requiredAgents.length === 0) {
      return { result: '', error: 'No applicable specialists for this request' };
    }

    // 3. Create execution plan and send to Spark
    const plan: ExecutionPlan = {
      agentIds: requiredAgents,
      prompt: message,
      context: { studentId, history, ...context },
      studentId,
    };

    const executionResult = await this.spark.executePlan(plan);

    // 4. Check for execution errors
    if (Object.keys(executionResult.errors).length > 0) {
      const errorMessages = Object.values(executionResult.errors).join('; ');
      return { result: '', error: `Execution failure: ${errorMessages}` };
    }

    // 5. Aggregate results
    const aggregated = Object.values(executionResult.results).join('\n\n');

    // 6. Guardian output-check
    const outputCheck = await this.guardian.outputCheck(aggregated);
    if (!outputCheck.safe) {
      return { result: '', error: outputCheck.reason || 'Guardian rejected output' };
    }

    return { result: aggregated.trim(), error: undefined };
  }

  /**
   * Route: Determine which active specialists are needed.
   * Uses capability-based keyword matching.
   * Frozen specialists are excluded from routing (Spark will reject them anyway).
   */
  private route(message: string): string[] {
    const activeAgents = this.registry.getActiveAgents();
    const specialists = activeAgents.filter((a) => a.role === 'specialist');

    // Capability-based routing for active specialists only
    const routed: string[] = [];

    // Academic queries → Scholar (always active)
    if (/\b(homework|assignment|explain|academic|project|exam|study|learn)\b/i.test(message)) {
      const scholar = specialists.find((s) => s.id === 'scholar');
      if (scholar) routed.push('scholar');
    }

    // Research queries → Oracle (frozen, will not execute)
    if (/\b(research|verify|source|citation|fact-?check|evidence)\b/i.test(message)) {
      const oracle = specialists.find((s) => s.id === 'oracle');
      if (oracle && this.registry.isActive(oracle.id)) routed.push('oracle');
    }

    // Productivity queries → Coach (frozen, will not execute)
    if (/\b(plan|schedule|goal|priority|organize|productivity|time management)\b/i.test(message)) {
      const coach = specialists.find((s) => s.id === 'coach');
      if (coach && this.registry.isActive(coach.id)) routed.push('coach');
    }

    // If no specialists matched, default to Scholar
    if (routed.length === 0) {
      routed.push('scholar');
    }

    return routed;
  }
}
