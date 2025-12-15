/**
 * Discord Webhook Client
 * Sends memory profiling data to Discord channel via webhook
 */

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

const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1445814262546169908/xhC8e1etburfK9Uqj5Y6RgKiTwWT6bLB9LvIsSKdBoaFKiC1mKthtxq0rl1mbNyLiBkr';

export class DiscordWebhook {
  /**
   * Send a simple text message to Discord
   */
  async sendMessage(content: string): Promise<void> {
    try {
      await this.sendWebhook({ content });
    } catch (error) {
      console.warn('⚠️ Failed to send message to Discord:', error);
    }
  }

  /**
   * Send webhook payload to Discord
   */
  private async sendWebhook(payload: DiscordWebhookPayload): Promise<void> {
    const response = await fetch(WEBHOOK_URL, {
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
