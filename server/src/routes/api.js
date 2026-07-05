import { Router } from 'express';
import { repository } from '../store/repository.js';
import { env } from '../config/env.js';
import { isMongoConnected } from '../config/database.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    storage: isMongoConnected() ? 'mongodb' : 'in-memory',
    time: new Date().toISOString(),
  });
});

apiRouter.get('/conversations', async (_req, res, next) => {
  try {
    const conversations = await repository.listConversations();
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/conversations/:id', async (req, res, next) => {
  try {
    const conversation = await repository.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/conversations/:id/messages', async (req, res, next) => {
  try {
    const conversation = await repository.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    const messages = await repository.listMessages(req.params.id);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

/**
 * Staff-only endpoint to verify the agent access code without exposing it
 * to the client bundle. Intentionally does not issue a long-lived session
 * token — this is a lightweight gate suitable for an internal tool, not a
 * full auth system.
 */
apiRouter.post('/agent/verify', (req, res) => {
  const { code } = req.body || {};
  const isValid = typeof code === 'string' && code === env.agentAccessCode;
  res.json({ valid: isValid });
});
