/**
 * Policy Registry — Governance Policies
 *
 * Authoritative governance policies. Guardian evaluates actions against
 * these policies. Default security model: DENY unless explicitly granted.
 */

import { logger } from '../logger';

const DEFAULT_POLICIES = [
  // Identity policies
  { policy_id: 'identity.read_self', action: 'identity:read:self', default: 'allow', description: 'Users can read their own identity' },
  { policy_id: 'identity.read_other', action: 'identity:read:other', default: 'deny', description: 'Users cannot read other users\' identity (admin only)' },
  { policy_id: 'identity.update_self', action: 'identity:update:self', default: 'allow', description: 'Users can update their own profile' },

  // Memory policies
  { policy_id: 'memory.recall_own', action: 'memory:recall:own', default: 'allow', description: 'Users can recall their own memories' },
  { policy_id: 'memory.recall_other', action: 'memory:recall:other', default: 'deny', description: 'Users cannot recall other users\' memories' },
  { policy_id: 'memory.store_own', action: 'memory:store:own', default: 'allow', description: 'Users can store their own memories' },
  { policy_id: 'memory.forget_own', action: 'memory:forget:own', default: 'allow', description: 'Users can delete their own memories' },

  // Conversation policies
  { policy_id: 'conversation.read_own', action: 'conversation:read:own', default: 'allow', description: 'Users can read their own conversations' },
  { policy_id: 'conversation.read_other', action: 'conversation:read:other', default: 'deny', description: 'Users cannot read other users\' conversations' },

  // Knowledge policies
  { policy_id: 'knowledge.search', action: 'knowledge:search', default: 'allow', description: 'Users can search knowledge' },
  { policy_id: 'knowledge.retrieve', action: 'knowledge:retrieve', default: 'allow', description: 'Users can retrieve knowledge resources' },

  // Notification policies
  { policy_id: 'notification.dispatch_own', action: 'notification:dispatch:own', default: 'allow', description: 'System can dispatch notifications to users' },
  { policy_id: 'notification.broadcast', action: 'notification:broadcast', default: 'deny', description: 'Only admins can broadcast (system routes through Guardian)' },

  // Model/LLM policies
  { policy_id: 'model.invoke', action: 'model:invoke', default: 'allow', description: 'Authenticated users can invoke LLM' },

  // Executive policies
  { policy_id: 'executive.action', action: 'executive:action', default: 'deny', description: 'Executive actions require authority code verification' },
  { policy_id: 'executive.view', action: 'executive:view', default: 'deny', description: 'Executive views require admin role' },

  // File policies
  { policy_id: 'file.upload', action: 'file:upload', default: 'allow', description: 'Authenticated users can upload files' },
  { policy_id: 'file.delete_own', action: 'file:delete:own', default: 'allow', description: 'Users can delete their own files' },
];

class PolicyRegistry {
  constructor() { this._policies = new Map(); this._ready = false; }

  async init() {
    for (const policy of DEFAULT_POLICIES) this._policies.set(policy.policy_id, policy);
    this._ready = true;
    logger.info('PolicyRegistry initialized', { policyCount: this._policies.size, defaultModel: 'DENY unless explicitly granted' });
  }

  register(policyDef) { this._policies.set(policyDef.policy_id, policyDef); }
  get(policyId) { return this._policies.get(policyId) || null; }
  list() { return Array.from(this._policies.values()); }

  /** Evaluate if an action is permitted. Default: DENY. */
  evaluate(action, context = {}) {
    const policy = Array.from(this._policies.values()).find((p) => p.action === action);
    if (!policy) return { allowed: false, reason: 'No policy found — defaulting to DENY' };

    // Admin override: admins can do everything except broadcast without explicit policy
    if (context.role === 'admin' && policy.action !== 'notification:broadcast') {
      return { allowed: true, reason: 'Admin override', policy: policy.policy_id };
    }

    return {
      allowed: policy.default === 'allow',
      reason: policy.description,
      policy: policy.policy_id,
    };
  }

  get ready() { return this._ready; }
}

export const policyRegistry = new PolicyRegistry();
export default policyRegistry;