import app from './app';
import { config } from './config';
import prisma from './utils/prisma';

const server = app.listen(config.port, () => {
  console.log(`🚀 ERP Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    console.log('Http server closed.');
    await prisma.$disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
