/**
 * Memory Profiler - Diagnostic tool to identify memory leaks
 * Tracks memory usage across different dimensions to pinpoint leak sources
 */
import type { Browser, Page } from 'playwright';
import { DiscordWebhook } from './discord-webhook';

export type MemorySnapshot = {
  timestamp: number;
  cycle: number;
  nodejs: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers: number;
  };
  browser?: {
    pageCount: number;
    contextCount: number;
    openPages: string[];
  };
  operations?: {
    beforeScrape?: number;
    afterScrape?: number;
    afterCleanup?: number;
    afterPageRecreate?: number;
  };
};

export type MemoryTrend = {
  cycle: number;
  heapUsedDelta: number;
  heapTotalDelta: number;
  externalDelta: number;
  rssDelta: number;
  pageCountDelta: number;
  trend: 'increasing' | 'stable' | 'decreasing';
};

export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];
  private cycleCount = 0;
  private readonly discord: DiscordWebhook;

  constructor() {
    this.discord = new DiscordWebhook();
  }

  /**
   * Take a detailed memory snapshot
   */
  async takeSnapshot(browser?: Browser, label?: string): Promise<MemorySnapshot> {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      cycle: this.cycleCount,
      nodejs: {
        heapUsed: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((usage.external / 1024 / 1024) * 100) / 100,
        rss: Math.round((usage.rss / 1024 / 1024) * 100) / 100,
        arrayBuffers: Math.round((usage.arrayBuffers / 1024 / 1024) * 100) / 100,
      },
    };

    // Get browser metrics if available
    if (browser) {
      try {
        const contexts = browser.contexts();
        const allPages: Page[] = [];
        const openPageUrls: string[] = [];

        for (const context of contexts) {
          const pages = context.pages();
          allPages.push(...pages);

          for (const page of pages) {
            try {
              const url = page.url();
              if (url && url !== 'about:blank') {
                openPageUrls.push(url);
              }
            } catch {
              // Page might be closed
            }
          }
        }

        snapshot.browser = {
          pageCount: allPages.length,
          contextCount: contexts.length,
          openPages: openPageUrls.slice(0, 10), // Limit to first 10 for readability
        };
      } catch (error) {
        console.warn('⚠️ Could not get browser metrics:', error);
      }
    }

    this.snapshots.push(snapshot);

    // Log snapshot
    const logParts = [
      `📊 Memory Snapshot [Cycle ${this.cycleCount}]${label ? ` - ${label}` : ''}:`,
      `   Heap: ${snapshot.nodejs.heapUsed}MB / ${snapshot.nodejs.heapTotal}MB`,
      `   RSS: ${snapshot.nodejs.rss}MB`,
      `   External: ${snapshot.nodejs.external}MB`,
      `   ArrayBuffers: ${snapshot.nodejs.arrayBuffers}MB`,
    ];

    if (snapshot.browser) {
      logParts.push(
        `   Browser Pages: ${snapshot.browser.pageCount}`,
        `   Browser Contexts: ${snapshot.browser.contextCount}`
      );
      if (snapshot.browser.openPages.length > 0) {
        logParts.push(`   Open Page URLs: ${snapshot.browser.openPages.length} (showing first 10)`);
      }
    }

    console.info(logParts.join('\n'));

    return snapshot;
  }

  /**
   * Calculate memory trend between last N snapshots
   */
  calculateTrend(snapshotCount = 5): MemoryTrend | null {
    if (this.snapshots.length < 2) {
      return null;
    }

    const recent = this.snapshots.slice(-snapshotCount);
    const first = recent[0]!;
    const last = recent[recent.length - 1]!;

    const heapUsedDelta = last.nodejs.heapUsed - first.nodejs.heapUsed;
    const heapTotalDelta = last.nodejs.heapTotal - first.nodejs.heapTotal;
    const externalDelta = last.nodejs.external - first.nodejs.external;
    const rssDelta = last.nodejs.rss - first.nodejs.rss;

    const pageCountDelta = (last.browser?.pageCount || 0) - (first.browser?.pageCount || 0);

    // Determine trend
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (heapUsedDelta > 10) {
      trend = 'increasing';
    } else if (heapUsedDelta < -5) {
      trend = 'decreasing';
    }

    return {
      cycle: last.cycle,
      heapUsedDelta,
      heapTotalDelta,
      externalDelta,
      rssDelta,
      pageCountDelta,
      trend,
    };
  }

  /**
   * Get detailed analysis of memory growth
   */
  async getAnalysis(): Promise<string> {
    if (this.snapshots.length < 3) {
      return '⚠️ Not enough snapshots for analysis (need at least 3)';
    }

    const trend = this.calculateTrend(10);
    if (!trend) {
      return '⚠️ Could not calculate trend';
    }

    const analysis: string[] = [];
    analysis.push('\n' + '='.repeat(60));
    analysis.push('🔍 MEMORY LEAK ANALYSIS');
    analysis.push('='.repeat(60));

    analysis.push(`\n📈 Trend: ${trend.trend.toUpperCase()}`);
    analysis.push(
      `   Heap Used: ${trend.heapUsedDelta > 0 ? '+' : ''}${trend.heapUsedDelta.toFixed(2)}MB`
    );
    analysis.push(
      `   Heap Total: ${trend.heapTotalDelta > 0 ? '+' : ''}${trend.heapTotalDelta.toFixed(2)}MB`
    );
    analysis.push(`   RSS: ${trend.rssDelta > 0 ? '+' : ''}${trend.rssDelta.toFixed(2)}MB`);
    analysis.push(
      `   External: ${trend.externalDelta > 0 ? '+' : ''}${trend.externalDelta.toFixed(2)}MB`
    );
    analysis.push(
      `   Browser Pages: ${trend.pageCountDelta > 0 ? '+' : ''}${trend.pageCountDelta}`
    );

    // Identify potential issues
    const issues: string[] = [];
    if (trend.heapUsedDelta > 20) {
      issues.push('⚠️ Significant heap growth detected - possible JavaScript object leak');
    }
    if (trend.externalDelta > 20) {
      issues.push('⚠️ External memory growing - possible browser process leak');
    }
    if (trend.rssDelta > 50) {
      issues.push('⚠️ RSS growing significantly - overall process memory leak');
    }
    if (trend.pageCountDelta > 0) {
      issues.push('⚠️ Browser pages accumulating - pages not being closed properly');
    }

    if (issues.length > 0) {
      analysis.push('\n🚨 Potential Issues:');
      issues.forEach((issue) => analysis.push(`   ${issue}`));
    } else {
      analysis.push('\n✅ No obvious memory leaks detected in recent cycles');
    }

    // Show last few snapshots
    analysis.push('\n📊 Recent Snapshots:');
    const recent = this.snapshots.slice(-5);
    recent.forEach((snap) => {
      analysis.push(
        `   Cycle ${snap.cycle}: Heap=${snap.nodejs.heapUsed}MB, RSS=${snap.nodejs.rss}MB, Pages=${snap.browser?.pageCount || 0}`
      );
    });

    analysis.push('='.repeat(60) + '\n');

    const analysisText = analysis.join('\n');

    // Send to Discord if enabled
    if (trend) {
      await this.discord.sendAnalysis(trend, this.snapshots.slice(-10));
    }

    return analysisText;
  }

  /**
   * Get browser storage information for a page
   */
  async getPageStorageInfo(page: Page): Promise<{
    localStorage: number;
    sessionStorage: number;
    cookies: number;
  }> {
    try {
      const storageInfo = await page.evaluate(() => {
        let localStorageSize = 0;
        let sessionStorageSize = 0;

        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              localStorageSize += key.length + (localStorage.getItem(key)?.length || 0);
            }
          }
        } catch {
          // Ignore
        }

        try {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
              sessionStorageSize += key.length + (sessionStorage.getItem(key)?.length || 0);
            }
          }
        } catch {
          // Ignore
        }

        return {
          localStorage: localStorageSize,
          sessionStorage: sessionStorageSize,
        };
      });

      const context = page.context();
      const cookies = await context.cookies();

      return {
        localStorage: storageInfo.localStorage,
        sessionStorage: storageInfo.sessionStorage,
        cookies: cookies.length,
      };
    } catch {
      return {
        localStorage: 0,
        sessionStorage: 0,
        cookies: 0,
      };
    }
  }

  /**
   * Increment cycle counter
   */
  incrementCycle(): void {
    this.cycleCount++;
  }

  /**
   * Get all snapshots (for export/analysis)
   */
  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Clear old snapshots to prevent profiler itself from leaking
   */
  clearOldSnapshots(keepLast = 100): void {
    if (this.snapshots.length > keepLast) {
      this.snapshots = this.snapshots.slice(-keepLast);
    }
  }
}
