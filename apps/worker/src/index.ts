import pino from 'pino';
import { delay } from '@shared';
import { ScraperScheduler } from './scheduler';
import { PriceUpdateWorker } from './workers/price-update';
import { DealerScraperWorker } from './workers/dealer-scraper';
import { scrapeAllDealers } from './scrape-all-dealers';

/**
 * Initialize logger
 */
const logger = pino({
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

/**
 * Worker application entry point
 */
class WorkerApp {
  private scheduler: ScraperScheduler;
  private priceUpdateWorker: PriceUpdateWorker;
  private dealerScraperWorker: DealerScraperWorker;
  private isRunning = false;

  constructor() {
    this.scheduler = new ScraperScheduler(logger);
    this.priceUpdateWorker = new PriceUpdateWorker(logger);
    this.dealerScraperWorker = new DealerScraperWorker(logger);
  }

  /**
   * Start the worker application
   */
  async start(): Promise<void> {
    logger.info('🚀 Starting Worker Application...');

    this.isRunning = true;

    // Initialize workers
    await this.priceUpdateWorker.initialize();
    await this.dealerScraperWorker.initialize();

    // Start the scheduler
    this.scheduler.start();

    // Schedule price updates every 5 minutes
    this.scheduler.scheduleJob(
      'price-update',
      5 * 60 * 1000, // 5 minutes
      async () => {
        await this.priceUpdateWorker.execute();
      }
    );

    // Schedule dealer scraping every 15 minutes
    this.scheduler.scheduleJob(
      'dealer-scraper',
      15 * 60 * 1000, // 15 minutes
      async () => {
        await this.dealerScraperWorker.execute();
      }
    );

    // Schedule scrape-all-dealers every 5 minutes
    this.scheduler.scheduleJob(
      'scrape-all-dealers',
      60 * 5000, // 5 minutes
      async () => {
        await scrapeAllDealers();
      }
    );

    logger.info(`
📊 Worker Application Started Successfully!
🕐 Price Updates: Every 5 minutes
🛒 Dealer Scraping: Every 15 minutes
🔄 Scrape All Dealers: Every 5 minutes
📚 Environment: ${process.env.NODE_ENV || 'development'}
    `);

    // Run initial jobs immediately
    logger.info('⚡ Running initial jobs...');
    await this.priceUpdateWorker.execute();
    await delay(2000);
    await this.dealerScraperWorker.execute();
    await delay(2000);
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

    await this.priceUpdateWorker.cleanup();
    await this.dealerScraperWorker.cleanup();

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

  // Handle uncaught errors
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
