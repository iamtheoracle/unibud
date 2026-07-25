/**
 * Public Spark SDK.
 *
 * Consumers should only ever import from here:
 *
 *   import { createSpark } from "@/lib/spark";
 *
 * Never import from spark/core/*, spark/memory/*, etc. directly —
 * those paths are internal implementation detail and may change.
 */
import { Container } from "./container";
import { TOKENS, tokenLabel } from "./tokens";
import { EventBus } from "./events";
import { MiddlewarePipeline, type Middleware } from "./middleware";
import { PluginManager, type SparkPlugin } from "./plugins";
import { ProviderRegistry } from "./providers/registry";
import type { AIProvider } from "./providers/types";
import {
  SPARK_CAPABILITIES,
  SPARK_BUILD,
  SPARK_VERSION,
  type SparkManifest,
} from "./manifest";
import type { SparkHealthReport, SparkMetrics } from "./types";
import { LocalIdentityService } from "./core/identity/local";
import { LocalReasoningService } from "./core/reasoning/local";
import { LocalPlanningService } from "./core/planning/local";
import { InMemoryMemoryService } from "./memory/local";
import { LocalContextService } from "./context/local";
import { LocalKnowledgeService } from "./knowledge/local";
import { LocalSearchService } from "./intelligence/search/local";
import { LocalRecommendationsService } from "./intelligence/recommendations/local";
import { LocalOrganizationService } from "./intelligence/organization/local";
import { LocalPersonalizationService } from "./intelligence/personalization/local";
import { LocalWritingService } from "./intelligence/writing/local";
import { LocalTranslationService } from "./intelligence/translation/local";
import { LocalSummariesService } from "./intelligence/summaries/local";
import { LocalPrivacyService } from "./trust/privacy/local";
import { LocalSecurityService } from "./trust/security/local";
import { LocalAutomationService } from "./automation/local";
import { LocalLearningService } from "./learning/local";
import { LocalNotificationEngineService } from "./notifications/local";
import type { NotificationEngineService } from "./notifications/interface";
import { registerDefaultRules } from "./notifications/rules";
import type { IdentityService } from "./core/identity/interface";
import type { ReasoningService } from "./core/reasoning/interface";
import type { PlanningService } from "./core/planning/interface";
import type { MemoryService } from "./memory/interface";
import type { ContextService } from "./context/interface";
import type { KnowledgeService } from "./knowledge/interface";
import type { SearchService } from "./intelligence/search/interface";
import type { RecommendationsService } from "./intelligence/recommendations/interface";
import type { OrganizationService } from "./intelligence/organization/interface";
import type { PersonalizationService } from "./intelligence/personalization/interface";
import type { WritingService } from "./intelligence/writing/interface";
import type { TranslationService } from "./intelligence/translation/interface";
import type { SummariesService } from "./intelligence/summaries/interface";
import type { PrivacyService } from "./trust/privacy/interface";
import type { SecurityService } from "./trust/security/interface";
import type { AutomationService } from "./automation/interface";
import type { LearningService } from "./learning/interface";

export class Spark {
  readonly events = new EventBus();
  readonly middleware = new MiddlewarePipeline();
  private readonly container = new Container();
  private readonly providerRegistry = new ProviderRegistry();
  private readonly plugins = new PluginManager();
  private readonly startedAt = Date.now();
  private initialized = false;
  private readonly warnings: string[] = [];

  constructor() {
    this.registerCoreServices();
  }

  // ---------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------
  async initialize(): Promise<void> {
    if (this.initialized) return;
    // Eagerly resolve every registered service once so configuration
    // errors surface immediately rather than on first use.
    for (const token of this.container.registeredTokens()) {
      this.container.resolve(token);
    }
    this.initialized = true;
    this.events.emit("spark.initialized", { at: new Date().toISOString() });
  }

  async shutdown(): Promise<void> {
    this.events.emit("spark.shutdown", { at: new Date().toISOString() });
    this.events.clear();
    this.middleware.clear();
    this.initialized = false;
  }

  async reset(): Promise<void> {
    this.container.reset();
    this.registerCoreServices();
    this.initialized = false;
  }

  // ---------------------------------------------------------------------
  // Providers & plugins
  // ---------------------------------------------------------------------
  registerProvider(provider: AIProvider, makeDefault = false): void {
    this.providerRegistry.register(provider, makeDefault);
  }

  registerPlugin(plugin: SparkPlugin): void {
    this.plugins.register(plugin, {
      container: this.container,
      providers: this.providerRegistry,
      middleware: this.middleware,
      events: this.events,
    });
  }

  use(middleware: Middleware): void {
    this.middleware.use(middleware);
  }

  // ---------------------------------------------------------------------
  // Introspection
  // ---------------------------------------------------------------------
  version(): string {
    return SPARK_VERSION;
  }

  modules(): string[] {
    return this.container.registeredTokens().map(tokenLabel);
  }

  capabilities(): readonly string[] {
    return SPARK_CAPABILITIES;
  }

  manifest(): SparkManifest {
    return {
      name: "Spark",
      version: SPARK_VERSION,
      build: SPARK_BUILD,
      capabilities: SPARK_CAPABILITIES,
      registeredModules: this.container.registeredTokens().map(tokenLabel),
      providers: this.providerRegistry.list(),
    };
  }

  health(): SparkHealthReport {
    const diagnostics: string[] = [];
    const providers = this.providerRegistry.list();
    if (!providers.some((p) => p.available)) {
      this.warnings.push(
        "No AI provider is currently available besides the mock provider."
      );
    }
    diagnostics.push(
      `${this.container.resolvedTokens().length}/${
        this.container.registeredTokens().length
      } services resolved.`
    );

    const status: SparkHealthReport["status"] = this.initialized
      ? "healthy"
      : "degraded";
    return {
      status,
      initialized: this.initialized,
      loadedModules: this.container.resolvedTokens().map(tokenLabel),
      registeredProviders: providers,
      diagnostics,
      warnings: [...new Set(this.warnings)],
      uptimeMs: Date.now() - this.startedAt,
      checkedAt: new Date().toISOString(),
    };
  }

  metrics(): SparkMetrics {
    const events = this.events.recentEvents(500);
    return {
      requestCounts: {},
      executionTimesMs: {},
      cacheHits: 0,
      cacheMisses: 0,
      memorySize: this.memory.size(),
      eventsEmitted: events.length,
    };
  }

  // ---------------------------------------------------------------------
  // Service accessors — this is the actual public surface products use
  // ---------------------------------------------------------------------
  get identity(): IdentityService {
    return this.container.resolve(TOKENS.Identity);
  }
  get reasoning(): ReasoningService {
    return this.container.resolve(TOKENS.Reasoning);
  }
  get planning(): PlanningService {
    return this.container.resolve(TOKENS.Planning);
  }
  get memory(): MemoryService {
    return this.container.resolve(TOKENS.Memory);
  }
  get context(): ContextService {
    return this.container.resolve(TOKENS.Context);
  }
  get knowledge(): KnowledgeService {
    return this.container.resolve(TOKENS.Knowledge);
  }
  get search(): SearchService {
    return this.container.resolve(TOKENS.Search);
  }
  get recommendations(): RecommendationsService {
    return this.container.resolve(TOKENS.Recommendations);
  }
  get organization(): OrganizationService {
    return this.container.resolve(TOKENS.Organization);
  }
  get personalization(): PersonalizationService {
    return this.container.resolve(TOKENS.Personalization);
  }
  get writing(): WritingService {
    return this.container.resolve(TOKENS.Writing);
  }
  get translation(): TranslationService {
    return this.container.resolve(TOKENS.Translation);
  }
  get summaries(): SummariesService {
    return this.container.resolve(TOKENS.Summaries);
  }
  get privacy(): PrivacyService {
    return this.container.resolve(TOKENS.Privacy);
  }
  get security(): SecurityService {
    return this.container.resolve(TOKENS.Security);
  }
  get automation(): AutomationService {
    return this.container.resolve(TOKENS.Automation);
  }
  get learning(): LearningService {
    return this.container.resolve(TOKENS.Learning);
  }
  get notifications(): NotificationEngineService {
    return this.container.resolve(TOKENS.Notifications);
  }

  // ---------------------------------------------------------------------
  // Internal wiring
  // ---------------------------------------------------------------------
  private registerCoreServices(): void {
    this.container.registerValue(TOKENS.ProviderRegistry, this.providerRegistry);
    this.container.register(TOKENS.Identity, () => new LocalIdentityService());
    this.container.register(
      TOKENS.Reasoning,
      () => new LocalReasoningService(this.providerRegistry)
    );
    this.container.register(TOKENS.Planning, () => new LocalPlanningService());
    this.container.register(TOKENS.Memory, () => new InMemoryMemoryService());
    this.container.register(TOKENS.Context, () => new LocalContextService());
    this.container.register(TOKENS.Knowledge, () => new LocalKnowledgeService());
    // Search depends on Knowledge only — Search -> Knowledge, not Memory,
    // to keep the dependency graph shallow as Spark grows.
    this.container.register(
      TOKENS.Search,
      (c) => new LocalSearchService(c.resolve(TOKENS.Knowledge))
    );
    this.container.register(
      TOKENS.Recommendations,
      () => new LocalRecommendationsService()
    );
    this.container.register(
      TOKENS.Organization,
      () => new LocalOrganizationService()
    );
    this.container.register(
      TOKENS.Personalization,
      () => new LocalPersonalizationService()
    );
    this.container.register(
      TOKENS.Writing,
      () => new LocalWritingService(this.providerRegistry)
    );
    this.container.register(
      TOKENS.Translation,
      () => new LocalTranslationService(this.providerRegistry)
    );
    this.container.register(TOKENS.Summaries, () => new LocalSummariesService());
    this.container.register(TOKENS.Privacy, () => new LocalPrivacyService());
    this.container.register(TOKENS.Security, () => new LocalSecurityService());
    this.container.register(TOKENS.Automation, () => new LocalAutomationService());
    this.container.register(TOKENS.Learning, () => new LocalLearningService());
    this.container.register(TOKENS.Notifications, () => {
      const engine = new LocalNotificationEngineService();
      engine.setEventBus(this.events);
      registerDefaultRules(engine);
      return engine;
    });
  }
}

/**
 * Factory for a new, fully independent Spark instance. Each call
 * produces its own container/providers/events/middleware — instances
 * never share state.
 */
export function createSpark(): Spark {
  return new Spark();
}

// Re-export types consumers are expected to use.
export type { AIProvider } from "./providers/types";
export type { SparkPlugin, SparkPluginContext } from "./plugins";
export type { Middleware } from "./middleware";
export type { SparkManifest } from "./manifest";
export type { SparkHealthReport, SparkMetrics } from "./types";
export { loggingMiddleware } from "./middleware";
export { MockProvider } from "./providers/mock";
export { OpenAIProvider } from "./providers/openai";
export { AnthropicProvider } from "./providers/anthropic";
export { GeminiProvider } from "./providers/gemini";
export { LocalModelProvider } from "./providers/local";