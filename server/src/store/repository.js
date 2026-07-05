import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { memoryStore } from './memoryStore.js';
import { isMongoConnected } from '../config/database.js';

/**
 * The repository is the single source of truth the rest of the app talks
 * to. It transparently routes reads/writes to MongoDB when connected, or
 * to the in-memory store otherwise, so controllers and socket handlers
 * never need to branch on which backend is active.
 */
export const repository = {
  async createConversation(payload) {
    if (isMongoConnected()) {
      const doc = await Conversation.create(payload);
      return doc.toObject();
    }
    return memoryStore.createConversation(payload);
  },

  async listConversations() {
    if (isMongoConnected()) {
      const docs = await Conversation.find().sort({ lastMessageAt: -1 }).lean();
      return docs;
    }
    return memoryStore.listConversations();
  },

  async getConversation(id) {
    if (isMongoConnected()) {
      const doc = await Conversation.findById(id).lean();
      return doc;
    }
    return memoryStore.getConversation(id);
  },

  async updateConversationStatus(id, status) {
    if (isMongoConnected()) {
      const doc = await Conversation.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      ).lean();
      return doc;
    }
    return memoryStore.updateConversationStatus(id, status);
  },

  async markRead(id) {
    if (isMongoConnected()) {
      const doc = await Conversation.findByIdAndUpdate(
        id,
        { unreadForAgent: false },
        { new: true },
      ).lean();
      return doc;
    }
    return memoryStore.markRead(id);
  },

  async addMessage(payload) {
    if (isMongoConnected()) {
      const convo = await Conversation.findById(payload.conversationId);
      if (!convo) {
        return null;
      }
      const message = await Message.create(payload);
      convo.lastMessageAt = message.createdAt;
      convo.lastMessagePreview = payload.text.slice(0, 120);
      convo.unreadForAgent = payload.sender === 'customer';
      await convo.save();
      return message.toObject();
    }
    return memoryStore.addMessage(payload);
  },

  async listMessages(conversationId) {
    if (isMongoConnected()) {
      const docs = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
      return docs;
    }
    return memoryStore.listMessages(conversationId);
  },
};
