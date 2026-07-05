import { randomUUID } from 'crypto';

/**
 * A minimal in-memory data store that mirrors the subset of MongoDB
 * behaviour this app needs. It lets the entire application run and be
 * demoed without any external database, while the Mongoose-backed
 * repository (see repository.js) provides the real persistence path when
 * MONGODB_URI is configured and reachable.
 */
class MemoryStore {
  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
  }

  reset() {
    this.conversations.clear();
    this.messages.clear();
  }

  createConversation({ customerName, deviceType, issueSummary }) {
    const now = new Date();
    const conversation = {
      _id: randomUUID(),
      customerName,
      deviceType,
      issueSummary,
      status: 'open',
      lastMessageAt: now,
      lastMessagePreview: '',
      unreadForAgent: true,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(conversation._id, conversation);
    return { ...conversation };
  }

  listConversations() {
    return [...this.conversations.values()].sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );
  }

  getConversation(id) {
    const convo = this.conversations.get(id);
    return convo ? { ...convo } : null;
  }

  updateConversationStatus(id, status) {
    const convo = this.conversations.get(id);
    if (!convo) {
      return null;
    }
    convo.status = status;
    convo.updatedAt = new Date();
    return { ...convo };
  }

  markRead(id) {
    const convo = this.conversations.get(id);
    if (!convo) {
      return null;
    }
    convo.unreadForAgent = false;
    return { ...convo };
  }

  addMessage({ conversationId, sender, senderName, text }) {
    const convo = this.conversations.get(conversationId);
    if (!convo) {
      return null;
    }
    const now = new Date();
    const message = {
      _id: randomUUID(),
      conversationId,
      sender,
      senderName,
      text,
      createdAt: now,
      updatedAt: now,
    };

    const list = this.messages.get(conversationId) || [];
    list.push(message);
    this.messages.set(conversationId, list);

    convo.lastMessageAt = now;
    convo.lastMessagePreview = text.slice(0, 120);
    convo.unreadForAgent = sender === 'customer';
    convo.updatedAt = now;

    return { ...message };
  }

  listMessages(conversationId) {
    return (this.messages.get(conversationId) || []).map((m) => ({ ...m }));
  }
}

export const memoryStore = new MemoryStore();
