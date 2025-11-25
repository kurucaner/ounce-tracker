import pino from 'pino';
import { delay } from '@shared';
import { ScraperScheduler } from './scheduler';
import { scrapeAllDealers } from './scrape-all-dealers';

/**
 * Initialize logger
 */
const logger = pino({
  transport:
    process.env.NODE_ENV == 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
});

/**
 * Worker application entry point
 */
class WorkerApp {
  private readonly scheduler: ScraperScheduler;

  private isRunning = false;

  constructor() {
    this.scheduler = new ScraperScheduler(logger);
  }

  /**
   * Start the worker application
   */
  async start(): Promise<void> {
    logger.info('🚀 Starting Worker Application...');

    this.isRunning = true;

    // Start the scheduler
    this.scheduler.start();

    // Schedule scrape-all-dealers every 5 minutes
    this.scheduler.scheduleJob(
      'scrape-all-dealers',
      60 * 30000, // 30 minutes
      async () => {
        await scrapeAllDealers();
      }
    );

    await scrapeAllDealers();

    // Keep the worker alive
    await this.keepAlive();
  }

  /**
   * Keep the worker process alive
   */
  private async keepAlive(): Promise<void> {
    while (this.isRunning) {
      await delay(10000); // Check every 10 seconds
    }
  }

  /**
   * Gracefully shutdown the worker
   */
  async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down Worker Application...');

    this.isRunning = false;
    this.scheduler.stop();

    logger.info('✅ Worker Application shut down successfully');
    process.exit(0);
  }
}

/**
 * Main execution
 */
const main = async (): Promise<void> => {
  const app = new WorkerApp();

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received');
    await app.shutdown();
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT signal received');
    await app.shutdown();
  });

  process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled rejection');
    process.exit(1);
  });

  try {
    await app.start();
  } catch (error) {
    logger.error({ error }, 'Failed to start worker application');
    process.exit(1);
  }
};

// Start the application
main();
