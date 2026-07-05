import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { registerChatSocket } from './sockets/chatSocket.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);

  const allowedOrigins = env.clientOrigin.split(',').map((o) => o.trim());
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  registerChatSocket(io);

  httpServer.listen(env.port, () => {
    logger.info(`Chat Support server listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

bootstrap().catch((error) => {
  console.error('[FATAL] Failed to start server:', error);
  process.exit(1);
});
