import { repository } from '../store/repository.js';
import { sanitizeFields } from '../utils/sanitize.js';
import {
  createConversationSchema,
  sendMessageSchema,
  updateStatusSchema,
  typingSchema,
  validate,
} from '../validators/schemas.js';
import { logger } from '../utils/logger.js';

const AGENT_ROOM = 'agents';

function conversationRoom(id) {
  return `conversation:${id}`;
}

/**
 * Wires up all Socket.io events for the real-time chat system.
 *
 * Rooms:
 *  - "agents": every connected staff console joins this room and receives
 *    conversation-level events (new conversation, status changes, list
 *    updates) so the dashboard stays live without polling.
 *  - "conversation:<id>": both the customer widget and any agent viewing
 *    that specific thread join this room to receive messages and typing
 *    indicators scoped to that conversation.
 */
export function registerChatSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('agent:join', () => {
      socket.join(AGENT_ROOM);
      socket.data.role = 'agent';
    });

    socket.on('conversation:join', async (payload, callback) => {
      try {
        const conversationId = String(payload?.conversationId || '');
        if (!conversationId) {
          return callback?.({ success: false, error: 'conversationId is required.' });
        }
        const conversation = await repository.getConversation(conversationId);
        if (!conversation) {
          return callback?.({ success: false, error: 'Conversation not found.' });
        }
        socket.join(conversationRoom(conversationId));
        const messages = await repository.listMessages(conversationId);
        callback?.({ success: true, conversation, messages });
      } catch (error) {
        logger.error(`conversation:join failed — ${error.message}`);
        callback?.({ success: false, error: 'Unable to join conversation.' });
      }
    });

    socket.on('conversation:create', async (payload, callback) => {
      const { success, data, errors } = validate(createConversationSchema, payload);
      if (!success) {
        return callback?.({ success: false, errors });
      }

      try {
        const clean = sanitizeFields(data, ['customerName', 'deviceType', 'issueSummary']);
        const conversation = await repository.createConversation(clean);
        socket.join(conversationRoom(conversation._id.toString()));

        io.to(AGENT_ROOM).emit('conversation:new', conversation);
        callback?.({ success: true, conversation });
        logger.info(`New conversation created: ${conversation._id}`);
      } catch (error) {
        logger.error(`conversation:create failed — ${error.message}`);
        callback?.({ success: false, errors: { form: 'Server error. Please try again.' } });
      }
    });

    socket.on('message:send', async (payload, callback) => {
      const { success, data, errors } = validate(sendMessageSchema, payload);
      if (!success) {
        return callback?.({ success: false, errors });
      }

      try {
        const clean = sanitizeFields(data, ['text', 'senderName']);
        const message = await repository.addMessage(clean);
        if (!message) {
          return callback?.({
            success: false,
            errors: { form: 'Conversation no longer exists.' },
          });
        }

        const conversation = await repository.getConversation(clean.conversationId);
        const room = conversationRoom(clean.conversationId);

        io.to(room).emit('message:new', message);
        io.to(AGENT_ROOM).emit('conversation:updated', conversation);

        callback?.({ success: true, message });
      } catch (error) {
        logger.error(`message:send failed — ${error.message}`);
        callback?.({ success: false, errors: { form: 'Server error. Please try again.' } });
      }
    });

    socket.on('conversation:status', async (payload, callback) => {
      const { success, data, errors } = validate(updateStatusSchema, payload);
      if (!success) {
        return callback?.({ success: false, errors });
      }

      try {
        const conversation = await repository.updateConversationStatus(
          data.conversationId,
          data.status,
        );
        if (!conversation) {
          return callback?.({ success: false, errors: { form: 'Conversation not found.' } });
        }

        io.to(AGENT_ROOM).emit('conversation:updated', conversation);
        io.to(conversationRoom(data.conversationId)).emit('conversation:updated', conversation);
        callback?.({ success: true, conversation });
      } catch (error) {
        logger.error(`conversation:status failed — ${error.message}`);
        callback?.({ success: false, errors: { form: 'Server error. Please try again.' } });
      }
    });

    socket.on('conversation:read', async (payload) => {
      const conversationId = String(payload?.conversationId || '');
      if (!conversationId) {
        return;
      }
      try {
        const conversation = await repository.markRead(conversationId);
        if (conversation) {
          io.to(AGENT_ROOM).emit('conversation:updated', conversation);
        }
      } catch (error) {
        logger.error(`conversation:read failed — ${error.message}`);
      }
    });

    socket.on('typing:update', (payload) => {
      const { success, data } = validate(typingSchema, payload);
      if (!success) {
        return;
      }
      socket.to(conversationRoom(data.conversationId)).emit('typing:update', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}
