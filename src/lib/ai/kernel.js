import { logger as runtimeLogger } from "@/lib/runtime/logger";
import { eventBus } from "@/lib/runtime/eventBus";
import { bootRegistries, registries } from "@/lib/runtime/registries";
import { bootServices, services } from "@/lib/runtime/services";
import { bootKernel } from "@/lib/runtime/kernel";

const COMPONENT_REGISTRY = [
	{
		id: "bud",
		name: "Bud",
		category: "companion",
		version: "1.0.0",
		dependencies: ["oracle", "memory", "knowledge", "telemetry"],
		capabilities: ["conversation", "personality", "transcript"],
		permissions: ["model:invoke"],
	},
	{
		id: "spark",
		name: "Spark",
		category: "intelligence",
		version: "1.0.0",
		dependencies: ["model", "prompt", "memory", "knowledge", "telemetry"],
		capabilities: ["reasoning", "knowledge", "summaries", "writing"],
		permissions: ["model:invoke"],
	},
];

function cloneMetadata(definition) {
	return {
		...definition,
		capabilities: [...(definition.capabilities || [])],
		dependencies: [...(definition.dependencies || [])],
		permissions: [...(definition.permissions || [])],
	};
}

class AIKernel {
	constructor() {
		this._ready = false;
		this._bootstrapping = null;
		this._components = new Map();
		this._subscriptions = new Map();
		this._health = new Map();
		this._config = new Map();
		this._context = new Map();
		this._metrics = new Map();
		this._integrations = null;
		this._logger = runtimeLogger.child({ subsystem: "ai-kernel" });
	}

	get ready() {
		return this._ready;
	}

	get registry() {
		return this._components;
	}

	get context() {
		return this._context;
	}

	get services() {
		return services;
	}

	get eventBus() {
		return eventBus;
	}

	get logger() {
		return this._logger;
	}

	get metrics() {
		return this._metrics;
	}

	get telemetry() {
		return services.telemetry;
	}

	get healthMonitor() {
		return {
			check: (componentId) => this.health(componentId),
			list: () => this.listHealth(),
		};
	}

	async boot() {
		if (this._ready) return this._integrations;
		if (this._bootstrapping) return this._bootstrapping;

		this._bootstrapping = (async () => {
			await bootRegistries();
			await bootServices();
			this._integrations = await bootKernel();

			for (const definition of COMPONENT_REGISTRY) {
				this.register(cloneMetadata(definition));
			}

			this._ready = true;
			this._logger.info("AI Kernel booted", { components: this._components.size });
			return this._integrations;
		})();

		try {
			return await this._bootstrapping;
		} finally {
			this._bootstrapping = null;
		}
	}

	register(definition) {
		const component = {
			...cloneMetadata(definition),
			lifecycle: definition.lifecycle || "registered",
			status: definition.status || "registered",
			events: definition.events ? [...definition.events] : [],
			errors: definition.errors ? [...definition.errors] : [],
			restarts: definition.restarts || 0,
			startedAt: definition.startedAt || null,
			stoppedAt: definition.stoppedAt || null,
		};
		this._components.set(component.id, component);
		registries.ai?.register?.({
			agent_id: component.id,
			name: component.name,
			role: component.category,
			version: component.version,
			focus: `${component.name} kernel integration`,
			enabled: true,
		});
		eventBus.publish({
			type: "ai.registered",
			category: "lifecycle",
			payload: { aiId: component.id, name: component.name, category: component.category },
		});
		return component;
	}

	async initializeComponent(componentId, options = {}) {
		await this.boot();
		const component = this._require(componentId);
		if (component.lifecycle === "ready") return component;

		this._setLifecycle(componentId, "initializing");
		this._config.set(componentId, { ...(options.config || {}) });
		this._context.set(componentId, { ...(options.context || {}) });

		const unsubscribe = eventBus.on("*", (event) => {
			if (event.payload?.aiId && event.payload.aiId !== componentId) return;
			const current = this._components.get(componentId);
			if (!current) return;
			current.events.push(event.type);
		});
		this._subscriptions.set(componentId, unsubscribe);

		const healthy = await this._checkDependencies(component);
		this._health.set(componentId, healthy);

		this._setLifecycle(componentId, healthy.status === "healthy" ? "ready" : "degraded");
		this._recordMetric(componentId, "initializations", 1);

		eventBus.publish({
			type: "ai.initialized",
			category: "lifecycle",
			payload: { aiId: componentId, dependencies: component.dependencies },
		});

		return this._components.get(componentId);
	}

	async restartComponent(componentId, options = {}) {
		const component = this._require(componentId);
		component.restarts += 1;
		await this.stopComponent(componentId);
		return this.initializeComponent(componentId, {
			config: options.config || this._config.get(componentId),
			context: options.context || this._context.get(componentId),
		});
	}

	async stopComponent(componentId) {
		const component = this._require(componentId);
		const unsubscribe = this._subscriptions.get(componentId);
		if (unsubscribe) unsubscribe();
		this._subscriptions.delete(componentId);
		this._setLifecycle(componentId, "stopped");
		component.stoppedAt = new Date().toISOString();
		eventBus.publish({
			type: "ai.stopped",
			category: "lifecycle",
			payload: { aiId: componentId },
		});
		return component;
	}

	configure(componentId, config = {}) {
		this._require(componentId);
		const next = { ...(this._config.get(componentId) || {}), ...config };
		this._config.set(componentId, next);
		return next;
	}

	updateContext(componentId, context = {}) {
		this._require(componentId);
		const next = { ...(this._context.get(componentId) || {}), ...context };
		this._context.set(componentId, next);
		return next;
	}

	health(componentId) {
		return this._health.get(componentId) || { status: "unknown" };
	}

	listHealth() {
		return Array.from(this._health.entries()).map(([id, health]) => ({ id, ...health }));
	}

	describe(componentId) {
		const component = this._require(componentId);
		return {
			...component,
			config: this._config.get(componentId) || {},
			context: this._context.get(componentId) || {},
			health: this.health(componentId),
			metrics: this._metrics.get(componentId) || {},
		};
	}

	listComponents() {
		return Array.from(this._components.keys()).map((componentId) => this.describe(componentId));
	}

	_recordMetric(componentId, metric, value) {
		const metrics = this._metrics.get(componentId) || {};
		metrics[metric] = (metrics[metric] || 0) + value;
		metrics.lastUpdatedAt = new Date().toISOString();
		this._metrics.set(componentId, metrics);
	}

	async _checkDependencies(component) {
		const missing = [];
		const unresolved = [];
		for (const dependency of component.dependencies || []) {
			if (services[dependency]) {
				if (!services[dependency].ready) unresolved.push(dependency);
				continue;
			}
			if (this._integrations?.[dependency]) {
				if (!this._integrations[dependency].ready) unresolved.push(dependency);
				continue;
			}
			missing.push(dependency);
		}

		const status = missing.length || unresolved.length ? "degraded" : "healthy";
		const result = {
			status,
			missing,
			unresolved,
			checkedAt: new Date().toISOString(),
		};
		if (status !== "healthy") {
			this._logger.warn("AI dependency check degraded", {
				aiId: component.id,
				missing,
				unresolved,
			});
		}
		return result;
	}

	_setLifecycle(componentId, lifecycle) {
		const component = this._require(componentId);
		component.lifecycle = lifecycle;
		component.status = lifecycle;
		if (lifecycle === "ready") component.startedAt = new Date().toISOString();
	}

	_require(componentId) {
		const component = this._components.get(componentId);
		if (!component) throw new Error(`Unknown AI component: ${componentId}`);
		return component;
	}
}

export const aiKernel = new AIKernel();
export default aiKernel;
