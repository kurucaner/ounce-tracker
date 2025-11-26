import pino from 'pino';
import { delay } from '@shared';
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
  private isRunning = false;
  private readonly DELAY_BETWEEN_RUNS_MS = 1000; // 1 second delay between runs

  /**
   * Recursively run scrape-all-dealers
   * When the function completes, it immediately calls itself again
   */
  async runScraperLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await scrapeAllDealers();
        logger.info('✅ Scraping completed. Starting next run...');
      } catch (error) {
        logger.error({ error }, 'Error during scraping, will retry immediately');
      }

      // Small delay before next run (only if still running)
      if (this.isRunning) {
        await delay(this.DELAY_BETWEEN_RUNS_MS);
      }
    }
  }

  /**
   * Start the worker application
   */
  async start(): Promise<void> {
    logger.info('🚀 Starting Worker Application...');
    this.isRunning = true;

    // Start recursive scraping loop
    await this.runScraperLoop();
  }

  /**
   * Gracefully shutdown the worker
   */
  async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down Worker Application...');
    this.isRunning = false;
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
    logger.error({ reason, promise }, 'Unhandled rejection - logging but continuing');
    // Don't exit - log and continue to prevent worker crashes
    // The error is already logged, and the scraper loop will continue
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

console.log('init');
