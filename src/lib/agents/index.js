/**
 * Domain Agent Compatibility Shim
 *
 * The domain agents (academic, campus, social, productivity, career,
 * marketplace, media, search, knowledge, security, developer) have been
 * migrated to `src/lib/spark/agents/` as Spark sub-agents.
 *
 * This file re-exports everything from the original location so that all
 * existing imports continue to work without modification.
 *
 * DO NOT delete this file. It is the migration bridge.
 * When all consumers have updated their imports, this file can be removed.
 */

export {
  DOMAIN_AGENTS,
  GENERAL_AGENT,
  getAgentById,
  getGeneralAgent,
  getAllAgentIds,
} from "./domainRegistry";
