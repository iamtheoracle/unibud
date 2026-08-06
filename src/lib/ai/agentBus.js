/**
 * AgentBus — AI-to-AI Communication
 *
 * Provides structured, auditable messaging between AI agents.
 * All inter-agent communication flows through the AgentBus, never
 * through direct method calls or shared state.
 *
 * Message flow:
 *   Sender → AgentBus → EventBus (publication) → Subscriber(s)
 *
 * Rules:
 *   1. Agents may only send messages they are authorized to send.
 *   2. Messages are logged with sender, recipient, and correlationId.
 *   3. Wildcard subscriptions are supported ('#' for all messages).
 *   4. Message history is bounded (last 500 messages retained).
 */

import { logger } from "@/lib/runtime/logger";
import { eventBus } from "@/lib/runtime/eventBus";

const MAX_HISTORY = 500;

class AgentBus {
  constructor() {
    /** Map<channel, Set<handler>> */
    this._channels = new Map();
    /** Bounded message history for observability */
    this._history = [];
  }

  /**
   * Subscribe an agent to a message channel.
   *
   * Channel format:  "sender.recipient"  e.g. "spark.bud"
   *                  "sender.*"          all messages from sender
   *                  "#"                 all messages
   *
   * Returns an unsubscribe function.
   */
  subscribe(channel, handler) {
    if (!this._channels.has(channel)) {
      this._channels.set(channel, new Set());
    }
    this._channels.get(channel).add(handler);
    return () => this._channels.get(channel)?.delete(handler);
  }

  /**
   * Send a message from one agent to another.
   *
   * @param {string} from        - sender agent id
   * @param {string} to          - recipient agent id (or '*' for broadcast)
   * @param {string} type        - message type (e.g. 'request', 'result', 'event')
   * @param {object} payload     - message payload
   * @param {string} [correlationId] - optional correlation id for tracing
   */
  send(from, to, type, payload = {}, correlationId = null) {
    const message = {
      id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      from,
      to,
      type,
      payload,
      correlationId,
      sentAt: new Date().toISOString(),
    };

    // Append to bounded history
    this._history.push(message);
    if (this._history.length > MAX_HISTORY) this._history.shift();

    // Publish to runtime event bus for observability
    eventBus.publish({
      type: `agent.message.${type}`,
      category: "agent_communication",
      correlationId,
      payload: { from, to, messageType: type, messageId: message.id },
    });

    logger.debug("AgentBus: message sent", { from, to, type, messageId: message.id });

    // Deliver to subscribers
    this._deliver(message);

    return message;
  }

  /**
   * Request-response pattern.
   * Sends a message and returns a Promise that resolves when a reply arrives,
   * or rejects after the timeout.
   *
   * @param {string} from
   * @param {string} to
   * @param {object} payload
   * @param {number} [timeoutMs=5000]
   */
  request(from, to, payload = {}, timeoutMs = 5000) {
    const correlationId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error(`AgentBus: request timed out (from=${from} to=${to} correlationId=${correlationId})`));
      }, timeoutMs);

      const unsubscribe = this.subscribe(`${to}.${from}`, (msg) => {
        if (msg.correlationId !== correlationId) return;
        clearTimeout(timer);
        unsubscribe();
        resolve(msg);
      });

      this.send(from, to, "request", payload, correlationId);
    });
  }

  /**
   * Reply to a request.
   *
   * @param {object} originalMessage - the message being replied to
   * @param {object} payload         - reply payload
   */
  reply(originalMessage, payload = {}) {
    return this.send(
      originalMessage.to,
      originalMessage.from,
      "reply",
      payload,
      originalMessage.correlationId
    );
  }

  /**
   * Broadcast a message to all agents.
   *
   * @param {string} from
   * @param {string} type
   * @param {object} payload
   */
  broadcast(from, type, payload = {}) {
    return this.send(from, "*", type, payload);
  }

  /**
   * Get recent messages, optionally filtered by sender or recipient.
   *
   * @param {{ from?: string, to?: string, limit?: number }} [filter]
   */
  history(filter = {}) {
    let messages = this._history;
    if (filter.from) messages = messages.filter((m) => m.from === filter.from);
    if (filter.to) messages = messages.filter((m) => m.to === filter.to || m.to === "*");
    return messages.slice(-(filter.limit || 50));
  }

  // Internal delivery — matches channels in order of specificity
  _deliver(message) {
    const channels = [
      `${message.from}.${message.to}`, // exact: sender.recipient
      `${message.from}.*`,             // sender wildcard
      "#",                             // all messages
    ];
    for (const channel of channels) {
      const handlers = this._channels.get(channel);
      if (!handlers) continue;
      for (const handler of handlers) {
        try {
          handler(message);
        } catch (e) {
          logger.error("AgentBus: subscriber error", {
            channel,
            messageId: message.id,
            error: e.message,
          });
        }
      }
    }
  }
}

export const agentBus = new AgentBus();
export default agentBus;
