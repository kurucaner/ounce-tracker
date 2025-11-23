import type { Browser, Page } from 'playwright';

/**
 * Safely close browser with timeout to prevent hanging.
 * Closes all pages first (best practice) before closing the browser.
 */
export async function safeCloseBrowser(browser: Browser | null | undefined): Promise<void> {
  if (!browser) {
    return;
  }

  try {
    // Close all pages first - this prevents browser.close() from waiting
    // for ongoing network requests, JavaScript execution, or WebSocket connections
    const contexts = browser.contexts();
    const allPages: Page[] = [];
    for (const context of contexts) {
      allPages.push(...context.pages());
    }

    await Promise.allSettled(
      allPages.map((page: Page) =>
        Promise.race([
          page.close(),
          new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 1000); // 1 second timeout per page
          }),
        ])
      )
    );

    // Now close the browser with timeout protection
    await Promise.race([
      browser.close(),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('⚠️  Browser close timeout, continuing anyway');
          resolve();
        }, 3000); // 3 second timeout
      }),
    ]);
  } catch (closeError) {
    // Ignore close errors - browser might already be closed or in bad state
    // This is expected when browser is in a bad state after timeout
    if (closeError instanceof Error && !closeError.message.includes('Target closed')) {
      // Only log unexpected errors
      console.warn(`⚠️  Browser close warning: ${closeError.message}`);
    }
  }
}
