/**
 * Discord Webhook Client
 * Sends memory profiling data to Discord channel via webhook
 */
import type { MemorySnapshot, MemoryTrend } from './memory-profiler';

type DiscordEmbed = {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
  };
};

type DiscordWebhookPayload = {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
};

export class DiscordWebhook {
  private readonly webhookUrl: string | null;
  private readonly enabled: boolean;

  constructor() {
    this.webhookUrl =
      'https://discord.com/api/webhooks/1445814262546169908/xhC8e1etburfK9Uqj5Y6RgKiTwWT6bLB9LvIsSKdBoaFKiC1mKthtxq0rl1mbNyLiBkr';
    this.enabled = !!this.webhookUrl;
  }

  /**
   * Check if Discord webhook is configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send a memory snapshot to Discord
   */
  async sendSnapshot(snapshot: MemorySnapshot, label?: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const embed: DiscordEmbed = {
        title: `📊 Memory Snapshot${label ? ` - ${label}` : ''}`,
        color: this.getColorForMemory(snapshot.nodejs.heapUsed),
        fields: [
          {
            name: '📈 Node.js Memory',
            value: [
              `**Heap Used:** ${snapshot.nodejs.heapUsed.toFixed(2)}MB / ${snapshot.nodejs.heapTotal.toFixed(2)}MB`,
              `**RSS:** ${snapshot.nodejs.rss.toFixed(2)}MB`,
              `**External:** ${snapshot.nodejs.external.toFixed(2)}MB`,
              `**ArrayBuffers:** ${snapshot.nodejs.arrayBuffers.toFixed(2)}MB`,
            ].join('\n'),
            inline: false,
          },
        ],
        timestamp: new Date(snapshot.timestamp).toISOString(),
        footer: {
          text: `Cycle ${snapshot.cycle}`,
        },
      };

      if (snapshot.browser) {
        embed.fields!.push({
          name: '🌐 Browser Metrics',
          value: [
            `**Pages:** ${snapshot.browser.pageCount}`,
            `**Contexts:** ${snapshot.browser.contextCount}`,
            snapshot.browser.openPages.length > 0
              ? `**Open URLs:** ${snapshot.browser.openPages.length}`
              : '',
          ]
            .filter(Boolean)
            .join('\n'),
          inline: false,
        });
      }

      await this.sendWebhook({ embeds: [embed] });
    } catch (error) {
      // Silently fail - don't crash the worker if Discord is down
      console.warn('⚠️ Failed to send snapshot to Discord:', error);
    }
  }

  /**
   * Send memory trend analysis to Discord
   */
  async sendAnalysis(trend: MemoryTrend, recentSnapshots: MemorySnapshot[]): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const color = this.getColorForTrend(trend.trend);
      const trendEmoji =
        trend.trend === 'increasing' ? '📈' : trend.trend === 'decreasing' ? '📉' : '➡️';

      const embed: DiscordEmbed = {
        title: `${trendEmoji} Memory Leak Analysis`,
        description: `**Trend:** ${trend.trend.toUpperCase()}`,
        color,
        fields: [
          {
            name: '📊 Memory Changes',
            value: [
              `**Heap Used:** ${trend.heapUsedDelta > 0 ? '+' : ''}${trend.heapUsedDelta.toFixed(2)}MB`,
              `**Heap Total:** ${trend.heapTotalDelta > 0 ? '+' : ''}${trend.heapTotalDelta.toFixed(2)}MB`,
              `**RSS:** ${trend.rssDelta > 0 ? '+' : ''}${trend.rssDelta.toFixed(2)}MB`,
              `**External:** ${trend.externalDelta > 0 ? '+' : ''}${trend.externalDelta.toFixed(2)}MB`,
              `**Browser Pages:** ${trend.pageCountDelta > 0 ? '+' : ''}${trend.pageCountDelta}`,
              `**Browser Contexts:** ${trend.contextCountDelta > 0 ? '+' : ''}${trend.contextCountDelta}`,
            ].join('\n'),
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `Cycle ${trend.cycle}`,
        },
      };

      // Add potential issues
      const issues: string[] = [];
      if (trend.heapUsedDelta > 20) {
        issues.push('⚠️ Significant heap growth - possible JavaScript object leak');
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
      if (trend.contextCountDelta > 0) {
        issues.push('🚨 Browser contexts accumulating - contexts not being closed properly');
      }

      if (issues.length > 0) {
        embed.fields!.push({
          name: '🚨 Potential Issues',
          value: issues.join('\n'),
          inline: false,
        });
      } else {
        embed.fields!.push({
          name: '✅ Status',
          value: 'No obvious memory leaks detected',
          inline: false,
        });
      }

      // Add recent snapshot summary
      if (recentSnapshots.length > 0) {
        const recent = recentSnapshots.slice(-5);
        const summary = recent
          .map(
            (snap) =>
              `Cycle ${snap.cycle}: Heap=${snap.nodejs.heapUsed.toFixed(1)}MB, RSS=${snap.nodejs.rss.toFixed(1)}MB, Pages=${snap.browser?.pageCount || 0}`
          )
          .join('\n');

        embed.fields!.push({
          name: '📋 Recent Snapshots',
          value: `\`\`\`${summary}\`\`\``,
          inline: false,
        });
      }

      await this.sendWebhook({ embeds: [embed] });
    } catch (error) {
      console.warn('⚠️ Failed to send analysis to Discord:', error);
    }
  }

  /**
   * Send a simple text message to Discord
   */
  async sendMessage(content: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await this.sendWebhook({ content });
    } catch (error) {
      console.warn('⚠️ Failed to send message to Discord:', error);
    }
  }

  /**
   * Get color code based on memory usage
   */
  private getColorForMemory(heapUsed: number): number {
    if (heapUsed > 500) {
      return 0xff0000; // Red - high memory
    }
    if (heapUsed > 300) {
      return 0xffaa00; // Orange - medium-high
    }
    if (heapUsed > 200) {
      return 0xffff00; // Yellow - medium
    }
    return 0x00ff00; // Green - low
  }

  /**
   * Get color code based on trend
   */
  private getColorForTrend(trend: 'increasing' | 'stable' | 'decreasing'): number {
    switch (trend) {
      case 'increasing':
        return 0xff0000; // Red
      case 'decreasing':
        return 0x00ff00; // Green
      default:
        return 0xffff00; // Yellow
    }
  }

  /**
   * Send webhook payload to Discord
   */
  private async sendWebhook(payload: DiscordWebhookPayload): Promise<void> {
    if (!this.webhookUrl) {
      return;
    }

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      throw new Error(`Discord webhook failed: ${response.status} ${text}`);
    }
  }
}
