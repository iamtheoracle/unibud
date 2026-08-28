/**
 * Central registry for all UNIBUD agents.
 * Defines roles, capabilities, permissions, and status (active/frozen).
 * Frozen agents are registered but cannot be executed.
 */

export type AgentStatus = 'active' | 'frozen';
export type AgentRole = 'specialist' | 'guardian' | 'orchestrator' | 'product_assistant' | 'substrate';

export interface Agent {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  systemInstructions: string;
  capabilities: string[];
  permissions: string[];
  contextRequirements: string[];
  memoryAccess: boolean;
  modelConfig: { provider: string; model?: string };
  status: AgentStatus;
}

export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  constructor() {
    // Core execution agents (ACTIVE)
    this.register({
      id: 'bud',
      name: 'Bud',
      description: 'User-facing AI assistant',
      role: 'product_assistant',
      systemInstructions: 'You are Bud, the friendly AI assistant for students. Be helpful, encouraging, and clear.',
      capabilities: ['conversation', 'orchestration_delegation'],
      permissions: ['read:student', 'delegate:orbit'],
      contextRequirements: ['student_id', 'history'],
      memoryAccess: true,
      modelConfig: { provider: 'openai' },
      status: 'active',
    });

    this.register({
      id: 'orbit',
      name: 'Orbit',
      description: 'Orchestration and routing authority',
      role: 'orchestrator',
      systemInstructions: 'You are Orbit, the orchestration authority. Route requests to appropriate specialists and coordinate results.',
      capabilities: ['orchestration', 'routing', 'coordination'],
      permissions: ['execute:agents', 'delegate:spark'],
      contextRequirements: ['request', 'student_id'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'active',
    });

    this.register({
      id: 'guardian',
      name: 'Guardian',
      description: 'Safety, security, and policy enforcement',
      role: 'guardian',
      systemInstructions: 'You are Guardian, enforcing safety policies and protecting user data.',
      capabilities: ['safety', 'authorization', 'policy_enforcement'],
      permissions: ['block:requests', 'audit:access'],
      contextRequirements: ['request', 'student_id'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'active',
    });

    this.register({
      id: 'spark',
      name: 'Spark',
      description: 'Execution substrate and coordinator',
      role: 'substrate',
      systemInstructions: 'You are Spark, the execution substrate. Execute approved plans and return structured results.',
      capabilities: ['execution', 'coordination'],
      permissions: ['execute:active_specialists'],
      contextRequirements: [],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'active',
    });

    // Initial active specialist
    this.register({
      id: 'scholar',
      name: 'Scholar',
      description: 'Academic intelligence and reasoning',
      role: 'specialist',
      systemInstructions: 'You are Scholar, an academic specialist. Provide accurate, concise academic reasoning and explanations.',
      capabilities: ['academic', 'explanation', 'analysis'],
      permissions: ['read:academic_context'],
      contextRequirements: ['assignments', 'academic_level'],
      memoryAccess: true,
      modelConfig: { provider: 'openai' },
      status: 'active',
    });

    // Frozen specialists (registered but not executable until activated)
    this.register({
      id: 'coach',
      name: 'Coach',
      description: 'Productivity and planning assistance',
      role: 'specialist',
      systemInstructions: 'You are Coach, helping students with productivity, planning, and goal management.',
      capabilities: ['productivity', 'planning', 'goal_setting'],
      permissions: ['read:plans', 'write:plans'],
      contextRequirements: ['goals', 'calendar'],
      memoryAccess: true,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'oracle',
      name: 'Oracle',
      description: 'Research and verification specialist',
      role: 'specialist',
      systemInstructions: 'You are Oracle, specializing in research and fact verification. Never fabricate citations or sources.',
      capabilities: ['research', 'verification', 'citation'],
      permissions: ['read:web_search'],
      contextRequirements: ['query'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'vision',
      name: 'Vision',
      description: 'Visual understanding and analysis',
      role: 'specialist',
      systemInstructions: 'You are Vision, interpreting and analyzing visual content.',
      capabilities: ['visual_analysis', 'image_understanding'],
      permissions: ['read:images'],
      contextRequirements: ['image_data'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'creator',
      name: 'Creator',
      description: 'Content generation and creative writing',
      role: 'specialist',
      systemInstructions: 'You are Creator, helping with content generation, essays, and creative writing.',
      capabilities: ['content_generation', 'writing', 'creativity'],
      permissions: ['write:content'],
      contextRequirements: ['creative_direction'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'voice',
      name: 'Voice',
      description: 'Audio and speech processing',
      role: 'specialist',
      systemInstructions: 'You are Voice, handling audio transcription and speech synthesis.',
      capabilities: ['audio_processing', 'speech_synthesis'],
      permissions: ['read:audio', 'write:audio'],
      contextRequirements: ['voice_input'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'navigator',
      name: 'Navigator',
      description: 'Action execution and navigation',
      role: 'specialist',
      systemInstructions: 'You are Navigator, executing actions and navigating the student through workflows.',
      capabilities: ['action_execution', 'navigation'],
      permissions: ['execute:actions'],
      contextRequirements: ['current_location', 'workflow_state'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'architect',
      name: 'Architect',
      description: 'System design and structuring',
      role: 'specialist',
      systemInstructions: 'You are Architect, helping design and structure systems and workflows.',
      capabilities: ['design', 'architecture', 'structuring'],
      permissions: ['read:design'],
      contextRequirements: ['specs', 'requirements'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'artist',
      name: 'Artist',
      description: 'Visual design and aesthetics',
      role: 'specialist',
      systemInstructions: 'You are Artist, assisting with visual design, aesthetics, and style.',
      capabilities: ['visual_design', 'aesthetics'],
      permissions: ['read:style'],
      contextRequirements: ['visual_direction'],
      memoryAccess: false,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'community',
      name: 'Community',
      description: 'Community and social intelligence',
      role: 'specialist',
      systemInstructions: 'You are Community, facilitating community interactions and social connections.',
      capabilities: ['social', 'community_management'],
      permissions: ['read:community', 'write:community'],
      contextRequirements: ['group_context'],
      memoryAccess: true,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'pulse',
      name: 'Pulse',
      description: 'Analytics and insights',
      role: 'specialist',
      systemInstructions: 'You are Pulse, providing analytics, insights, and performance metrics.',
      capabilities: ['analytics', 'insights', 'metrics'],
      permissions: ['read:analytics'],
      contextRequirements: ['performance_data'],
      memoryAccess: true,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });

    this.register({
      id: 'atlas',
      name: 'Atlas',
      description: 'Information retrieval and navigation',
      role: 'specialist',
      systemInstructions: 'You are Atlas, helping navigate information, search, and discovery.',
      capabilities: ['retrieval', 'search', 'navigation'],
      permissions: ['read:data'],
      contextRequirements: ['search_query'],
      memoryAccess: true,
      modelConfig: { provider: 'openai' },
      status: 'frozen',
    });
  }

  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getActive(id: string): Agent | undefined {
    const agent = this.agents.get(id);
    return agent?.status === 'active' ? agent : undefined;
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter((a) => a.status === 'active');
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  isActive(id: string): boolean {
    const agent = this.agents.get(id);
    return agent?.status === 'active';
  }
}
