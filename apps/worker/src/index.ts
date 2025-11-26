import pino from 'pino';
import { scrapeAllDealers } from './scrape-all-dealers';

const logger = pino({
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  process.exit(0);
});

// Log unhandled errors but don't crash
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

// Start scraping
logger.info('🚀 Starting worker...');
scrapeAllDealers().catch((error) => {
  logger.error({ error }, 'Fatal error in scraper');
  process.exit(1);
});
