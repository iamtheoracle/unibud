/**
 * Spark Service: Execution substrate.
 * Executes plans created by Orbit.
 * Validates agents and enforces execution contracts.
 */

import { AgentRegistry } from '../registry/AgentRegistry';

export interface ExecutionPlan {
  agentIds: string[];
  prompt: string;
  context: any;
  studentId: string;
}

export interface ExecutionResult {
  results: Record<string, string>;
  errors: Record<string, string>;
}

export class SparkService {
  private registry: AgentRegistry;
  private executionMap: Map<string, (prompt: string, context: any) => Promise<string>> = new Map();

  constructor(registry: AgentRegistry) {
    this.registry = registry;
    // Register execution handlers for active specialists
    this.registerExecutor('scholar', this.executeScholar.bind(this));
  }

  /**
   * Register an executor for a specialist.
   * This is the execution contract — only registered executors can run.
   */
  registerExecutor(
    agentId: string,
    executor: (prompt: string, context: any) => Promise<string>
  ): void {
    this.executionMap.set(agentId, executor);
  }

  /**
   * Execute a plan created by Orbit.
   * Validates all agents before execution.
   * Returns structured results/errors.
   */
  async executePlan(plan: ExecutionPlan): Promise<ExecutionResult> {
    const results: Record<string, string> = {};
    const errors: Record<string, string> = {};

    for (const agentId of plan.agentIds) {
      // 1. Check agent exists
      const agent = this.registry.get(agentId);
      if (!agent) {
        errors[agentId] = `Agent "${agentId}" does not exist`;
        continue;
      }

      // 2. Check agent is active (reject frozen agents)
      if (!this.registry.isActive(agentId)) {
        errors[agentId] = `Agent "${agentId}" is not active (status: ${agent.status})`;
        continue;
      }

      // 3. Check execution handler exists
      const executor = this.executionMap.get(agentId);
      if (!executor) {
        errors[agentId] = `No execution handler available for agent "${agentId}"`;
        continue;
      }

      // 4. Execute agent
      try {
        results[agentId] = await executor(plan.prompt, plan.context);
      } catch (error: any) {
        errors[agentId] = error?.message || 'Unknown execution error';
      }
    }

    return { results, errors };
  }

  /**
   * Scholar execution handler.
   * Performs academic reasoning and analysis.
   */
  private async executeScholar(prompt: string, context: any): Promise<string> {
    // In a real implementation, this would call the provider abstraction
    // For now, return a placeholder
    return `Scholar response to: "${prompt.substring(0, 50)}..."`;
  }
}
