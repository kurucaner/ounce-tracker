import type { Logger } from 'pino';

interface ScheduledJob {
  name: string;
  interval: number;
  handler: () => Promise<void>;
  timerId?: Timer;
  lastRun?: Date;
  isRunning: boolean;
}

/**
 * Simple job scheduler for background tasks
 */
export class ScraperScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private isRunning = false;

  constructor(private logger: Logger) {}

  /**
   * Schedule a new job
   */
  scheduleJob(name: string, intervalMs: number, handler: () => Promise<void>): void {
    if (this.jobs.has(name)) {
      this.logger.warn(`Job ${name} is already scheduled, skipping`);
      return;
    }

    const job: ScheduledJob = {
      name,
      interval: intervalMs,
      handler,
      isRunning: false,
    };

    this.jobs.set(name, job);
    this.logger.info(`Scheduled job: ${name} (interval: ${intervalMs}ms)`);

    if (this.isRunning) {
      this.startJob(job);
    }
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      this.logger.warn('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Scheduler started');

    // Start all scheduled jobs
    for (const job of this.jobs.values()) {
      this.startJob(job);
    }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.logger.info('Stopping scheduler...');

    // Clear all job timers
    for (const job of this.jobs.values()) {
      if (job.timerId) {
        clearInterval(job.timerId);
        job.timerId = undefined;
      }
    }

    this.logger.info('Scheduler stopped');
  }

  /**
   * Start a specific job
   */
  private startJob(job: ScheduledJob): void {
    const runJob = async () => {
      if (job.isRunning) {
        this.logger.warn(`Job ${job.name} is still running, skipping this iteration`);
        return;
      }

      job.isRunning = true;
      const startTime = Date.now();

      try {
        this.logger.info(`Starting job: ${job.name}`);
        await job.handler();
        job.lastRun = new Date();
        const duration = Date.now() - startTime;
        this.logger.info(`Completed job: ${job.name} (duration: ${duration}ms)`);
      } catch (error) {
        this.logger.error({ error, job: job.name }, `Job ${job.name} failed`);
      } finally {
        job.isRunning = false;
      }
    };

    job.timerId = setInterval(runJob, job.interval);
  }

  /**
   * Get job status
   */
  getJobStatus(name: string): ScheduledJob | undefined {
    return this.jobs.get(name);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }
}

