import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  agentAccessCode: process.env.AGENT_ACCESS_CODE || 'repair-shop-staff',
};

export const isProduction = env.nodeEnv === 'production';
