/**
 * Send contact form submission to Discord webhook
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
};

type DiscordWebhookPayload = {
  embeds?: DiscordEmbed[];
  username?: string;
};

const webhookUrl =
  'https://discord.com/api/webhooks/1446243974938366165/G24oCStwriNqr06c7UIG3TdEMlwj4keATBGp2z9q2UdJYQ3ZYXeHDH1qx4rB0S16ZIUt';

export async function sendContactFormToDiscord(data: {
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return;
  }

  try {
    const embed: DiscordEmbed = {
      title: '📧 New Contact Form Submission',
      color: 0x00ff00, // Green
      fields: [
        {
          name: '📧 Email',
          value: data.email,
          inline: false,
        },
        {
          name: '📌 Subject',
          value: data.subject,
          inline: false,
        },
        {
          name: '💬 Message',
          value: data.message.length > 1000 ? `${data.message.slice(0, 1000)}...` : data.message,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    const payload: DiscordWebhookPayload = {
      embeds: [embed],
      username: 'OunceTracker Contact Form',
    };

    const response = await fetch(webhookUrl, {
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
  } catch (error) {
    // Log but don't throw - we don't want to fail the contact form if Discord is down
    console.error('Failed to send contact form to Discord:', error);
  }
}
