// ─── Oracle Kernel Interface ──────────────────────────────────────────────────
// Minimal interface for module registration with the Oracle Kernel.
// Oracle is domain-agnostic infrastructure — it knows nothing about education.

export interface IModule {
  name: string;
  version: string;
  initialize(oracle: IOracle): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IOracle {
  registerModule(module: IModule): void;
  getModule(name: string): IModule | undefined;
  emit(event: IOracleEvent): void;
  execute(command: IOracleCommand): Promise<unknown>;
  logger: IOracleLogger;
}

export interface IOracleEvent {
  id: string;
  source: string;
  type: string;
  payload: unknown;
  timestamp: Date;
}

export interface IOracleCommand {
  id: string;
  source: string;
  action: string;
  payload: unknown;
}

export interface IOracleLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}
