export const SPARK_VERSION = "0.1.0";
export const SPARK_BUILD = "dev";

export const SPARK_CAPABILITIES = [
  "identity",
  "reasoning",
  "planning",
  "memory",
  "context",
  "knowledge",
  "search",
  "recommendations",
  "organization",
  "personalization",
  "writing",
  "translation",
  "summaries",
  "privacy",
  "security",
  "automation",
  "learning",
] as const;

export type SparkCapability = (typeof SPARK_CAPABILITIES)[number];

export interface SparkManifest {
  name: string;
  version: string;
  build: string;
  capabilities: readonly SparkCapability[];
  registeredModules: string[];
  providers: Array<{ name: string; available: boolean; isDefault: boolean }>;
}
