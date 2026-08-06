/**
 * UNIBUD Intelligence Registry
 *
 * Canonical source of truth for every intelligence in the platform.
 * Each intelligence declares its identity, mission, responsibilities,
 * inputs, outputs, dependencies, consumers, events, permissions,
 * restrictions, failure behaviour, fallback strategy, and metrics.
 *
 * No intelligence may assume a responsibility not listed here.
 * No intelligence may communicate directly with students except Bud.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type IntelligenceId =
  | "bud"
  | "spark"
  | "oracle"
  | "orbit"
  | "lens"
  | "artist";

export type IntelligenceEvent = {
  /** Event name in format `<intelligence>:<verb>` */
  name: string;
  /** Whether this intelligence publishes or subscribes to this event */
  direction: "publishes" | "subscribes";
  /** Human-readable description of when the event fires */
  description: string;
};

export type ApiContract = {
  method: string;
  input: string;
  output: string;
  description: string;
};

export type DataContract = {
  name: string;
  schema: string;
  description: string;
};

export interface IntelligenceDefinition {
  id: IntelligenceId;
  name: string;
  version: string;

  // Identity
  purpose: string;
  mission: string;
  vision: string;

  // Responsibilities
  primaryResponsibility: string;
  responsibilities: string[];

  // Goals
  goals: string[];

  // I/O
  inputs: string[];
  outputs: string[];

  // Workflow
  workflow: string[];

  // Collaboration
  dependencies: IntelligenceId[];
  consumers: IntelligenceId[];

  // Governance
  owner: string;
  permissions: string[];
  restrictions: string[];

  // Events
  events: IntelligenceEvent[];

  // Contracts
  apiContracts: ApiContract[];
  dataContracts: DataContract[];

  // Operations
  failureBehaviour: string;
  fallbackStrategy: string;

  // Observability
  metrics: string[];

  // Roadmap
  futureExpansion: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Intelligence Definitions
// ─────────────────────────────────────────────────────────────────────────────

const BUD: IntelligenceDefinition = {
  id: "bud",
  name: "Bud",
  version: "1.0.0",

  purpose: "The only visible AI companion every student interacts with.",
  mission:
    "Deliver warm, natural, intelligent conversations that help students learn, " +
    "navigate, and grow — by orchestrating all other intelligences invisibly.",
  vision:
    "Every student has a knowledgeable companion who knows their goals, their " +
    "campus, and their needs — and always responds as one coherent voice.",

  primaryResponsibility: "Communication, teaching, guidance, and coaching.",
  responsibilities: [
    "Receive all student messages and requests",
    "Understand student intent",
    "Delegate work to appropriate intelligences",
    "Combine results from all intelligences",
    "Deliver a single, natural, coherent response",
    "Maintain conversational context and memory",
    "Coach, guide, and encourage students",
    "Never expose internal intelligence names or processes",
  ],

  goals: [
    "Be the sole conversational interface for students",
    "Reduce student friction to zero",
    "Ensure every response feels personal and contextual",
    "Maintain trust through accuracy and honesty",
  ],

  inputs: [
    "Student message (text, voice)",
    "Screen context (current page, entities visible)",
    "Conversation history",
    "Session metadata",
  ],
  outputs: [
    "Single unified natural-language response",
    "Suggested follow-up actions",
    "Proactive nudges and briefings",
  ],

  workflow: [
    "1. Receive student message",
    "2. Understand intent via Spark",
    "3. Delegate to Oracle, Orbit, Lens, or Artist as needed",
    "4. Spark assembles combined response",
    "5. Bud delivers response in its voice",
    "6. Bud stores interaction in memory via Spark",
  ],

  dependencies: ["spark"],
  consumers: [],

  owner: "Platform Core Team",
  permissions: [
    "read:conversation_history",
    "write:conversation_history",
    "invoke:spark",
    "invoke:notifications",
  ],
  restrictions: [
    "Must never perform research directly",
    "Must never generate recommendations directly",
    "Must never run search directly",
    "Must never expose internal agent names to students",
    "Must route all substantive work through Spark",
  ],

  events: [
    {
      name: "bud:request",
      direction: "publishes",
      description: "Fired when Bud delegates a task to the intelligence layer",
    },
    {
      name: "bud:response_delivered",
      direction: "publishes",
      description: "Fired when Bud delivers a response to the student",
    },
    {
      name: "spark:assemble",
      direction: "subscribes",
      description: "Bud receives Spark-assembled responses for delivery",
    },
  ],

  apiContracts: [
    {
      method: "respond(message, session)",
      input: "{ message: string; session: BudSession }",
      output: "Promise<BudResponse>",
      description: "Main entry point — accepts student message, returns response",
    },
    {
      method: "transcript(sessionId, limit?)",
      input: "{ sessionId: string; limit?: number }",
      output: "ConversationTurn[]",
      description: "Returns conversation history for a session",
    },
  ],

  dataContracts: [
    {
      name: "BudResponse",
      schema: "{ message: string; sessionId: string; trace: BudTrace }",
      description: "Response returned to student",
    },
    {
      name: "BudSession",
      schema: "{ userId: string; sessionId: string; screenContext: ScreenContext }",
      description: "Session state passed to every Bud call",
    },
  ],

  failureBehaviour:
    "If Spark is unavailable, Bud responds with a warm acknowledgment and queues the request. " +
    "If the queue exceeds 30 seconds, Bud informs the student of a temporary issue.",
  fallbackStrategy:
    "Use cached context and last known memory to provide a best-effort response. " +
    "Never fabricate information. Acknowledge limitations honestly.",

  metrics: [
    "response_latency_p50",
    "response_latency_p95",
    "delegation_success_rate",
    "conversation_satisfaction_score",
    "memory_hit_rate",
    "proactive_nudge_engagement_rate",
  ],

  futureExpansion: [
    "Voice-native conversation mode",
    "Multi-modal input (images, documents)",
    "Proactive life-event detection",
    "Peer learning facilitation",
    "Emotional intelligence signals",
  ],
};

const SPARK: IntelligenceDefinition = {
  id: "spark",
  name: "Spark",
  version: "1.0.0",

  purpose: "The internal cognitive engine of the platform.",
  mission:
    "Organise knowledge, reason over context, plan multi-step tasks, orchestrate " +
    "memory, normalise data, and assemble responses — entirely behind the scenes.",
  vision:
    "A platform where every intelligence operates coherently because Spark maintains " +
    "the shared understanding of every student, every context, and every interaction.",

  primaryResponsibility:
    "Knowledge organisation, reasoning, planning, memory orchestration, data " +
    "normalisation, context preparation, and response assembly.",
  responsibilities: [
    "Receive delegated tasks from Bud",
    "Route tasks to appropriate domain agents",
    "Execute domain agents in parallel",
    "Aggregate and normalise agent outputs",
    "Reason over combined outputs",
    "Plan multi-step workflows when needed",
    "Store and retrieve student memory",
    "Prepare context for LLM calls",
    "Assemble final responses for Bud",
    "Never communicate directly with students",
  ],

  goals: [
    "Make every Bud response contextually accurate",
    "Maintain coherent long-term student memory",
    "Reduce redundant LLM calls through intelligent caching",
    "Ensure all domain knowledge is reachable",
  ],

  inputs: [
    "Delegated request from Bud (message + context)",
    "Domain agent outputs",
    "Oracle research results",
    "Orbit live intelligence",
    "Lens search results",
    "Artist creation outputs",
  ],
  outputs: [
    "Assembled response text for Bud",
    "Structured reasoning trace",
    "Updated memory records",
    "Planning tasks",
  ],

  workflow: [
    "1. Receive task from Bud via bus event",
    "2. Classify intent → select domain agents",
    "3. Execute domain agents in parallel (max 3)",
    "4. Request research from Oracle if needed",
    "5. Request live data from Orbit if needed",
    "6. Request search from Lens if needed",
    "7. Request visuals from Artist if needed",
    "8. Reason over all gathered outputs",
    "9. Assemble final response",
    "10. Return assembled response to Bud via bus event",
    "11. Store interaction in memory",
  ],

  dependencies: ["oracle", "orbit", "lens", "artist"],
  consumers: ["bud"],

  owner: "Platform Core Team",
  permissions: [
    "invoke:oracle",
    "invoke:orbit",
    "invoke:lens",
    "invoke:artist",
    "read:memory",
    "write:memory",
    "read:knowledge",
    "invoke:llm",
  ],
  restrictions: [
    "Must never communicate directly with students",
    "Must never expose internal agent names externally",
    "Must route all external research through Oracle",
    "Must route all live data through Orbit",
    "Must route all search through Lens",
    "Must route all visual creation through Artist",
  ],

  events: [
    {
      name: "spark:assemble",
      direction: "publishes",
      description: "Fired when Spark has assembled a response for Bud",
    },
    {
      name: "spark:memory_updated",
      direction: "publishes",
      description: "Fired when Spark writes a new memory record",
    },
    {
      name: "bud:request",
      direction: "subscribes",
      description: "Spark receives Bud's delegated tasks",
    },
    {
      name: "oracle:result",
      direction: "subscribes",
      description: "Spark receives Oracle's research results",
    },
    {
      name: "orbit:pulse",
      direction: "subscribes",
      description: "Spark receives Orbit live intelligence updates",
    },
    {
      name: "lens:results",
      direction: "subscribes",
      description: "Spark receives Lens search results",
    },
    {
      name: "artist:asset",
      direction: "subscribes",
      description: "Spark receives Artist-created assets",
    },
  ],

  apiContracts: [
    {
      method: "createSpark(config?)",
      input: "SparkConfig",
      output: "Spark",
      description: "Factory — creates and configures a Spark instance",
    },
  ],

  dataContracts: [
    {
      name: "SparkManifest",
      schema: "{ name, version, build, capabilities, registeredModules, providers }",
      description: "Declares Spark's capabilities at runtime",
    },
  ],

  failureBehaviour:
    "If a domain agent fails, Spark continues with remaining agents and notes the gap. " +
    "If Oracle is unreachable, Spark uses cached knowledge. " +
    "If Spark itself is unreachable, Bud uses its fallback strategy.",
  fallbackStrategy:
    "Degrade gracefully: skip failed agents, use cached memory, return best available response.",

  metrics: [
    "agent_execution_latency_p50",
    "agent_execution_latency_p95",
    "parallel_agent_throughput",
    "memory_write_rate",
    "memory_read_hit_rate",
    "reasoning_confidence_avg",
    "assembly_success_rate",
  ],

  futureExpansion: [
    "Cross-student anonymised learning patterns",
    "Predictive context pre-loading",
    "Autonomous background reasoning tasks",
    "Multi-turn planning with checkpoints",
    "Real-time personalisation signals",
  ],
};

const ORACLE: IntelligenceDefinition = {
  id: "oracle",
  name: "Oracle",
  version: "1.0.0",

  purpose: "The research and knowledge discovery engine of the platform.",
  mission:
    "Research any topic, discover knowledge from academic and web sources, " +
    "verify facts, and return structured research to Spark — never directly " +
    "to students.",
  vision:
    "Every student benefits from deep, verified, well-sourced information " +
    "without ever having to leave the platform or question accuracy.",

  primaryResponsibility:
    "Research, knowledge discovery, verification, academic sources, web knowledge, and fact validation.",
  responsibilities: [
    "Conduct deep research on any topic",
    "Discover knowledge from academic sources",
    "Retrieve and validate web knowledge",
    "Perform fact verification",
    "Return structured research objects to Spark",
    "Never communicate research directly to students",
    "Cite all sources accurately",
  ],

  goals: [
    "Provide the most accurate and well-sourced information available",
    "Validate claims before returning them to Spark",
    "Cover academic, professional, and general knowledge domains",
    "Minimise hallucination through structured retrieval",
  ],

  inputs: [
    "Research request from Spark (topic, depth, sources)",
    "Fact-check request from Spark (claim to verify)",
    "Source preference hints (academic, web, campus)",
  ],
  outputs: [
    "Structured research object (findings, sources, confidence)",
    "Fact-check result (verified, refuted, uncertain)",
    "Source citations (author, title, url, date)",
  ],

  workflow: [
    "1. Receive research request from Spark via bus event",
    "2. Classify request type (general, academic, factual)",
    "3. Query appropriate knowledge sources",
    "4. Validate findings against multiple sources",
    "5. Assemble structured research object",
    "6. Return to Spark via `oracle:result` event",
  ],

  dependencies: [],
  consumers: ["spark"],

  owner: "Platform Core Team",
  permissions: [
    "invoke:web_search",
    "invoke:academic_search",
    "invoke:llm",
    "read:knowledge_base",
  ],
  restrictions: [
    "Must never communicate directly with students",
    "Must always cite sources",
    "Must return results to Spark only",
    "Must not fabricate academic sources",
    "Must flag low-confidence findings clearly",
  ],

  events: [
    {
      name: "oracle:research",
      direction: "subscribes",
      description: "Oracle receives a research request from Spark",
    },
    {
      name: "oracle:result",
      direction: "publishes",
      description: "Oracle returns structured research to Spark",
    },
    {
      name: "oracle:fact_check",
      direction: "subscribes",
      description: "Oracle receives a fact-check request from Spark",
    },
    {
      name: "oracle:fact_checked",
      direction: "publishes",
      description: "Oracle returns fact-check result to Spark",
    },
  ],

  apiContracts: [
    {
      method: "research(request)",
      input: "OracleResearchRequest",
      output: "Promise<OracleResearchResult>",
      description: "Main research endpoint — accepts topic, returns structured findings",
    },
    {
      method: "factCheck(claim)",
      input: "{ claim: string; context?: string }",
      output: "Promise<OracleFactCheckResult>",
      description: "Verifies a claim, returns verdict and evidence",
    },
  ],

  dataContracts: [
    {
      name: "OracleResearchResult",
      schema:
        "{ topic: string; findings: string[]; sources: OracleSource[]; confidence: number; timestamp: string }",
      description: "Structured research returned to Spark",
    },
    {
      name: "OracleSource",
      schema: "{ title: string; url?: string; author?: string; date?: string; type: 'academic'|'web'|'campus' }",
      description: "A single cited source within a research result",
    },
    {
      name: "OracleFactCheckResult",
      schema: "{ claim: string; verdict: 'verified'|'refuted'|'uncertain'; evidence: string[]; confidence: number }",
      description: "Fact-check verdict returned to Spark",
    },
  ],

  failureBehaviour:
    "If a knowledge source is unreachable, Oracle attempts remaining sources. " +
    "If all sources fail, Oracle returns an empty result with confidence=0.",
  fallbackStrategy:
    "Return cached research from the last successful query on the same topic. " +
    "Flag stale results clearly in the response object.",

  metrics: [
    "research_latency_p50",
    "research_latency_p95",
    "source_retrieval_success_rate",
    "fact_check_accuracy",
    "citation_completeness_rate",
    "confidence_score_distribution",
  ],

  futureExpansion: [
    "Real-time academic database integration",
    "Peer-reviewed paper summarisation",
    "Research graph construction",
    "Cross-domain knowledge synthesis",
    "Automated bibliography generation",
  ],
};

const ORBIT: IntelligenceDefinition = {
  id: "orbit",
  name: "Orbit",
  version: "1.0.0",

  purpose: "The live intelligence and monitoring engine of the platform.",
  mission:
    "Continuously monitor campus updates, education news, technology trends, " +
    "scholarships, competitions, research, AI, global news, and trending topics — " +
    "and return live intelligence to Spark and platform products.",
  vision:
    "Students are always aware of what matters to them, in real time, without " +
    "having to search or browse — because Orbit watches the world for them.",

  primaryResponsibility:
    "Continuous monitoring of campus, education, technology, scholarships, " +
    "competitions, research, AI, global news, and trending topics.",
  responsibilities: [
    "Monitor campus announcement feeds",
    "Track education and scholarship opportunities",
    "Monitor technology and AI news",
    "Track global news and trending topics",
    "Aggregate and normalise live intelligence",
    "Push live updates to Spark and Square",
    "Maintain category-filtered intelligence streams",
    "Surface time-sensitive alerts",
  ],

  goals: [
    "Keep students informed without requiring active searching",
    "Deliver relevant intelligence to each product in real time",
    "Filter noise and surface what matters",
    "Support scholarship and competition discovery",
  ],

  inputs: [
    "Orbit category subscriptions (student preferences)",
    "Campus RSS/API feeds",
    "External news APIs",
    "Trending topic signals",
    "Scholarship and competition databases",
  ],
  outputs: [
    "Orbit pulse events (categorised live intelligence)",
    "Trending topic lists per category",
    "Time-sensitive alerts",
    "Feed items for Square",
  ],

  workflow: [
    "1. Subscribe to configured intelligence sources on boot",
    "2. Poll or stream new content at configured intervals",
    "3. Normalise content to OrbitItem schema",
    "4. Classify content by category",
    "5. Filter duplicates and low-quality content",
    "6. Publish `orbit:pulse` event for each batch of new items",
    "7. Maintain rolling cache of recent items per category",
  ],

  dependencies: [],
  consumers: ["spark", "square"],

  owner: "Platform Core Team",
  permissions: [
    "read:external_feeds",
    "read:campus_announcements",
    "write:orbit_cache",
    "publish:orbit_pulse",
  ],
  restrictions: [
    "Must never communicate directly with students",
    "Must not fabricate news or events",
    "Must attribute all content to its source",
    "Must respect content copyright and attribution requirements",
    "Must not store personally identifiable intelligence",
  ],

  events: [
    {
      name: "orbit:pulse",
      direction: "publishes",
      description: "Fired when Orbit has new live intelligence items to share",
    },
    {
      name: "orbit:alert",
      direction: "publishes",
      description: "Fired for time-sensitive campus or global alerts",
    },
    {
      name: "orbit:subscribe",
      direction: "subscribes",
      description: "Orbit receives category subscription requests from Spark or Square",
    },
  ],

  apiContracts: [
    {
      method: "getLatest(categories, limit?)",
      input: "{ categories: OrbitCategory[]; limit?: number }",
      output: "Promise<OrbitItem[]>",
      description: "Returns the latest intelligence items for given categories",
    },
    {
      method: "getTrending(category?)",
      input: "{ category?: OrbitCategory }",
      output: "Promise<OrbitTrendItem[]>",
      description: "Returns currently trending topics",
    },
    {
      method: "subscribe(categories, callback)",
      input: "{ categories: OrbitCategory[]; callback: (items: OrbitItem[]) => void }",
      output: "() => void (unsubscribe function)",
      description: "Subscribe to live Orbit updates for given categories",
    },
  ],

  dataContracts: [
    {
      name: "OrbitItem",
      schema:
        "{ id: string; title: string; summary: string; source: string; sourceUrl?: string; " +
        "category: OrbitCategory; publishedAt: string; imageUrl?: string; tags: string[] }",
      description: "A single live intelligence item",
    },
    {
      name: "OrbitCategory",
      schema:
        "'campus' | 'education' | 'technology' | 'scholarships' | 'competitions' | " +
        "'research' | 'ai' | 'global_news' | 'trending'",
      description: "Intelligence category Orbit monitors",
    },
  ],

  failureBehaviour:
    "If a source is unreachable, Orbit continues monitoring remaining sources. " +
    "If all sources fail, Orbit returns cached items with a staleness flag.",
  fallbackStrategy:
    "Serve cached items from the last successful fetch. " +
    "Clearly mark items as potentially stale. " +
    "Retry failed sources with exponential backoff.",

  metrics: [
    "items_processed_per_minute",
    "source_availability_rate",
    "category_freshness_p50",
    "alert_delivery_latency",
    "duplicate_filter_rate",
    "subscriber_count_per_category",
  ],

  futureExpansion: [
    "University-specific feed integrations",
    "Student-personalised intelligence streams",
    "Sentiment analysis on campus news",
    "Predictive event detection",
    "Competition deadline tracking",
  ],
};

const LENS: IntelligenceDefinition = {
  id: "lens",
  name: "Lens",
  version: "1.0.0",

  purpose: "The universal search intelligence of the platform.",
  mission:
    "Find anything on the platform or the web — instantly, intelligently, " +
    "and across every surface — then return structured results to Spark.",
  vision:
    "No student ever fails to find what they are looking for on UNIBUD.",

  primaryResponsibility: "Universal search across all platform surfaces and the web.",
  responsibilities: [
    "Search the platform (communities, courses, library, files, notes)",
    "Search media (videos, podcasts, images, documents)",
    "Search people (students, mentors, faculty)",
    "Search campus data (events, clubs, buildings)",
    "Search knowledge (articles, policies, FAQs)",
    "Delegate web search to Oracle",
    "Return ranked, structured search results to Spark",
    "Support semantic and keyword search modes",
  ],

  goals: [
    "Return relevant results in under 200ms for platform search",
    "Support natural-language queries",
    "Rank results by relevance and student context",
    "Surface the most useful result first",
  ],

  inputs: [
    "Search query from Spark (text, filters, scope)",
    "Student context (current screen, recent activity)",
    "Search scope (platform, web, or both)",
  ],
  outputs: [
    "Ranked search results with titles, snippets, and deep links",
    "Entity results (course, person, community, etc.)",
    "Search metadata (total count, query interpretation)",
  ],

  workflow: [
    "1. Receive search request from Spark via bus event",
    "2. Parse query → extract intent, filters, and scope",
    "3. Execute platform search in parallel with web search (if scoped)",
    "4. Rank results by relevance + student context",
    "5. Return structured results via `lens:results` event",
  ],

  dependencies: ["oracle"],
  consumers: ["spark"],

  owner: "Platform Core Team",
  permissions: [
    "read:communities",
    "read:courses",
    "read:library",
    "read:notes",
    "read:media",
    "read:people",
    "read:campus",
    "read:knowledge",
    "invoke:oracle",
  ],
  restrictions: [
    "Must never communicate directly with students",
    "Must never modify platform data",
    "Must respect content privacy settings",
    "Must not return private user data to unauthorised requests",
    "Web search must route through Oracle only",
  ],

  events: [
    {
      name: "lens:search",
      direction: "subscribes",
      description: "Lens receives a search request from Spark",
    },
    {
      name: "lens:results",
      direction: "publishes",
      description: "Lens returns ranked search results to Spark",
    },
  ],

  apiContracts: [
    {
      method: "search(query, options?)",
      input: "{ query: string; scope?: LensScope; filters?: LensFilters; limit?: number }",
      output: "Promise<LensSearchResult>",
      description: "Universal search — returns ranked results across requested scope",
    },
    {
      method: "suggest(prefix)",
      input: "{ prefix: string }",
      output: "Promise<string[]>",
      description: "Autocomplete suggestions for search input",
    },
  ],

  dataContracts: [
    {
      name: "LensSearchResult",
      schema:
        "{ query: string; results: LensResult[]; totalCount: number; interpretedAs?: string }",
      description: "Top-level search response",
    },
    {
      name: "LensResult",
      schema:
        "{ id: string; type: LensResultType; title: string; snippet: string; " +
        "imageUrl?: string; deepLink: string; score: number; source: 'platform'|'web' }",
      description: "A single search result",
    },
    {
      name: "LensScope",
      schema:
        "'all' | 'platform' | 'web' | 'communities' | 'courses' | 'library' | " +
        "'people' | 'media' | 'campus' | 'knowledge'",
      description: "Search scope specifier",
    },
  ],

  failureBehaviour:
    "If platform search fails, attempt cached index. " +
    "If Oracle (web search) is unreachable, return platform-only results with a note.",
  fallbackStrategy:
    "Return keyword-matched results from local index when semantic search is unavailable. " +
    "Never return empty results without a helpful message.",

  metrics: [
    "search_latency_p50",
    "search_latency_p95",
    "result_click_through_rate",
    "zero_result_rate",
    "query_parse_accuracy",
    "semantic_vs_keyword_ratio",
  ],

  futureExpansion: [
    "Visual search (search by image)",
    "Voice search",
    "Search within documents and PDFs",
    "Cross-campus search federation",
    "Search history and saved searches",
  ],
};

const ARTIST: IntelligenceDefinition = {
  id: "artist",
  name: "The Artist",
  version: "1.0.0",

  purpose: "The visual and creative intelligence of the platform.",
  mission:
    "Create diagrams, illustrations, animations, visual explanations, educational " +
    "graphics, creator assets, brand assets, and UI assets — supporting Bud and " +
    "platform products without ever teaching directly.",
  vision:
    "Every complex idea on UNIBUD has a beautiful visual explanation. " +
    "Every creator has the tools to produce professional-quality assets.",

  primaryResponsibility:
    "Visual creation for education, communication, and platform products.",
  responsibilities: [
    "Generate diagrams and flowcharts for complex topics",
    "Create illustrations for educational content",
    "Produce animations and motion graphics",
    "Generate visual explanations of academic concepts",
    "Create educational graphics for Library and Creator Studio",
    "Produce creator assets (thumbnails, banners, overlays)",
    "Generate brand assets for communities and organisations",
    "Create UI assets for platform products",
    "Never teach or explain concepts directly",
  ],

  goals: [
    "Make complex concepts visually understandable",
    "Support content creators with high-quality AI-generated assets",
    "Maintain brand consistency across platform visuals",
    "Enable visual communication between students",
  ],

  inputs: [
    "Visual creation request from Bud or Spark (type, subject, style)",
    "Creator brief from Creator Studio",
    "Brand guidelines for community or organisation",
    "Academic concept from Library or Spark",
  ],
  outputs: [
    "Generated image asset (PNG, SVG, WebP)",
    "Generated animation (GIF, WebM, Lottie)",
    "Generated diagram (Mermaid, SVG)",
    "Asset metadata (dimensions, format, alt text)",
  ],

  workflow: [
    "1. Receive creation request via `artist:create` event",
    "2. Parse request type and style requirements",
    "3. Select appropriate generation strategy (diagram, illustration, animation)",
    "4. Generate asset",
    "5. Return asset via `artist:asset` event with metadata",
  ],

  dependencies: [],
  consumers: ["bud", "spark"],

  owner: "Platform Core Team",
  permissions: [
    "invoke:image_generation",
    "invoke:diagram_renderer",
    "read:brand_guidelines",
    "write:media_store",
  ],
  restrictions: [
    "Must never communicate directly with students",
    "Must never teach or explain concepts in text",
    "Must not generate content that violates platform content policy",
    "Must not reproduce copyrighted characters or logos without authorisation",
    "Must always include accessibility alt text with generated assets",
  ],

  events: [
    {
      name: "artist:create",
      direction: "subscribes",
      description: "Artist receives a visual creation request",
    },
    {
      name: "artist:asset",
      direction: "publishes",
      description: "Artist returns created asset to Spark or Bud",
    },
  ],

  apiContracts: [
    {
      method: "create(request)",
      input: "ArtistCreateRequest",
      output: "Promise<ArtistAsset>",
      description: "Main creation endpoint — accepts request, returns generated asset",
    },
    {
      method: "diagram(spec)",
      input: "{ type: DiagramType; content: string; style?: DiagramStyle }",
      output: "Promise<ArtistAsset>",
      description: "Generates a diagram from a spec (e.g. Mermaid syntax or topic description)",
    },
  ],

  dataContracts: [
    {
      name: "ArtistCreateRequest",
      schema:
        "{ type: ArtistCreationType; subject: string; style?: string; " +
        "dimensions?: { width: number; height: number }; format?: 'png'|'svg'|'webp'|'gif' }",
      description: "Visual creation request",
    },
    {
      name: "ArtistAsset",
      schema:
        "{ url: string; format: string; width: number; height: number; " +
        "altText: string; generatedAt: string; requestId: string }",
      description: "Created visual asset",
    },
    {
      name: "ArtistCreationType",
      schema:
        "'diagram' | 'illustration' | 'animation' | 'visual_explanation' | " +
        "'educational_graphic' | 'creator_asset' | 'brand_asset' | 'ui_asset'",
      description: "Type of visual asset to create",
    },
  ],

  failureBehaviour:
    "If image generation is unavailable, return a structured diagram as SVG fallback. " +
    "If all generation methods fail, return an error with a descriptive message.",
  fallbackStrategy:
    "For diagrams, fall back to Mermaid text rendering in the UI. " +
    "For illustrations, return a contextual placeholder with alt text. " +
    "Never block Bud's response waiting for an asset — deliver the asset asynchronously.",

  metrics: [
    "asset_generation_latency_p50",
    "asset_generation_latency_p95",
    "generation_success_rate",
    "creator_asset_usage_rate",
    "educational_graphic_request_rate",
    "fallback_invocation_rate",
  ],

  futureExpansion: [
    "Video generation for educational summaries",
    "Personalised infographic generation",
    "Interactive diagram editor",
    "Brand kit management per community",
    "AR/VR asset generation",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

export const INTELLIGENCE_REGISTRY: Record<IntelligenceId, IntelligenceDefinition> = {
  bud: BUD,
  spark: SPARK,
  oracle: ORACLE,
  orbit: ORBIT,
  lens: LENS,
  artist: ARTIST,
};

export const ALL_INTELLIGENCES = Object.values(INTELLIGENCE_REGISTRY);

/**
 * Look up an intelligence definition by ID.
 * Returns undefined if the ID is not registered.
 */
export function getIntelligence(id: IntelligenceId): IntelligenceDefinition {
  return INTELLIGENCE_REGISTRY[id];
}

/**
 * Returns the intelligences that `id` depends on.
 */
export function getDependencies(id: IntelligenceId): IntelligenceDefinition[] {
  return getIntelligence(id).dependencies.map((dep) => INTELLIGENCE_REGISTRY[dep]);
}

/**
 * Returns the intelligences that consume `id`.
 */
export function getConsumers(id: IntelligenceId): IntelligenceDefinition[] {
  return getIntelligence(id).consumers.map((c) => INTELLIGENCE_REGISTRY[c]);
}

/**
 * Returns all events published by `id`.
 */
export function getPublishedEvents(id: IntelligenceId): IntelligenceEvent[] {
  return getIntelligence(id).events.filter((e) => e.direction === "publishes");
}

/**
 * Returns all events subscribed to by `id`.
 */
export function getSubscribedEvents(id: IntelligenceId): IntelligenceEvent[] {
  return getIntelligence(id).events.filter((e) => e.direction === "subscribes");
}
