/**
 * Conversation Service — Conversation History
 *
 * Owns all conversation lifecycle. Bud never stores conversation history —
 * it delegates here.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

class ConversationService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('ConversationService initialized');
  }

  /** Create a new conversation. */
  async create({ userId, title, context = {} }) {
    try {
      const conv = await base44.entities.BudConversation.create({
        user_id: userId,
        title: title || 'New Conversation',
        context,
        messages: [],
        status: 'active',
      });
      eventBus.publish({ type: 'conversation.created', category: 'lifecycle', payload: { conversationId: conv.id, userId } });
      return conv;
    } catch (e) {
      logger.error('Conversation create failed', { error: e.message });
      return null;
    }
  }

  /** Append a message to a conversation. */
  async append({ conversationId, role, content, metadata = {} }) {
    try {
      const conv = await base44.entities.BudConversation.get(conversationId);
      if (!conv) return null;
      const messages = [...(conv.messages || []), { role, content, timestamp: new Date().toISOString(), ...metadata }];
      const updated = await base44.entities.BudConversation.update(conversationId, { messages, last_message: content });
      eventBus.publish({
        type: 'conversation.message_appended',
        category: 'lifecycle',
        payload: { conversationId, role },
      });
      return updated;
    } catch (e) {
      logger.error('Conversation append failed', { error: e.message });
      return null;
    }
  }

  /** Get conversation history. */
  async getHistory(conversationId, limit = 50) {
    try {
      const conv = await base44.entities.BudConversation.get(conversationId);
      if (!conv) return [];
      return (conv.messages || []).slice(-limit);
    } catch (e) {
      logger.error('Conversation getHistory failed', { error: e.message });
      return [];
    }
  }

  /** List conversations for a user. */
  async list(userId, limit = 20) {
    try {
      return await base44.entities.BudConversation.filter({ user_id: userId }, '-updated_date', limit);
    } catch (e) {
      logger.error('Conversation list failed', { error: e.message });
      return [];
    }
  }

  get ready() { return this._ready; }
}

export const conversationService = new ConversationService();
export default conversationService;