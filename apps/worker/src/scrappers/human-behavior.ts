/**
 * Human Behavior Simulation for Playwright
 * Simulates realistic human browsing patterns to avoid bot detection
 * Based on research from cloudflare-bypass and best practices
 */
import type { Page } from 'playwright';

/**
 * Random delay between min and max milliseconds
 */
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Simulate realistic mouse movement with Bezier curves
 * Humans don't move in straight lines
 */
async function humanMouseMove(
  page: Page,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): Promise<void> {
  const steps = Math.floor(Math.random() * 10) + 10; // 10-20 steps
  const stepDelay = Math.random() * 10 + 5; // 5-15ms per step

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Bezier curve with random control points for natural movement
    const cp1x = fromX + (toX - fromX) * 0.25 + (Math.random() - 0.5) * 50;
    const cp1y = fromY + (toY - fromY) * 0.25 + (Math.random() - 0.5) * 50;
    const cp2x = fromX + (toX - fromX) * 0.75 + (Math.random() - 0.5) * 50;
    const cp2y = fromY + (toY - fromY) * 0.75 + (Math.random() - 0.5) * 50;

    const x =
      (1 - t) ** 3 * fromX +
      3 * (1 - t) ** 2 * t * cp1x +
      3 * (1 - t) * t ** 2 * cp2x +
      t ** 3 * toX;
    const y =
      (1 - t) ** 3 * fromY +
      3 * (1 - t) ** 2 * t * cp1y +
      3 * (1 - t) * t ** 2 * cp2y +
      t ** 3 * toY;

    try {
      await page.mouse.move(Math.round(x), Math.round(y));
      await new Promise((resolve) => setTimeout(resolve, stepDelay));
    } catch {
      // Ignore errors - mouse might be out of bounds
    }
  }
}

/**
 * Simulate reading behavior - humans scroll up and down while reading
 */
async function simulateReading(page: Page): Promise<void> {
  try {
    const viewport = page.viewportSize();
    if (!viewport) return;

    // Scroll down slowly (like reading)
    const scrollDownAmount = Math.floor(Math.random() * 300) + 200;
    await page.mouse.wheel(0, scrollDownAmount);
    await randomDelay(800, 1500);

    // Sometimes scroll back up a bit (re-reading)
    if (Math.random() > 0.5) {
      const scrollUpAmount = Math.floor(Math.random() * 150) + 50;
      await page.mouse.wheel(0, -scrollUpAmount);
      await randomDelay(500, 1000);
    }

    // Scroll down more
    const moreScroll = Math.floor(Math.random() * 200) + 100;
    await page.mouse.wheel(0, moreScroll);
    await randomDelay(1000, 2000);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Simulate idle mouse movements - humans move mouse even when not clicking
 */
async function simulateIdleMovements(page: Page): Promise<void> {
  try {
    const viewport = page.viewportSize();
    if (!viewport) return;

    const currentX = viewport.width / 2;
    const currentY = viewport.height / 2;

    // Make 2-4 small random movements
    const movements = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < movements; i++) {
      const targetX = currentX + (Math.random() - 0.5) * 200;
      const targetY = currentY + (Math.random() - 0.5) * 200;
      await humanMouseMove(page, currentX, currentY, targetX, targetY);
      await randomDelay(200, 500);
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Simulate human-like page interaction
 * Combines multiple behaviors to mimic real user activity
 */
export async function simulateHumanBehavior(page: Page): Promise<void> {
  try {
    // 1. Initial random mouse movement (humans don't stay still)
    await simulateIdleMovements(page);
    await randomDelay(300, 600);

    // 2. Simulate reading behavior (scrolling)
    await simulateReading(page);

    // 3. More idle movements
    await simulateIdleMovements(page);
    await randomDelay(500, 1000);
  } catch (error) {
    // Best effort - don't fail if behavior simulation fails
    console.warn('⚠️ Could not simulate human behavior:', error);
  }
}

/**
 * Simulate human behavior before navigation
 * Makes it look like user is thinking/deciding before clicking
 */
export async function simulatePreNavigationBehavior(page: Page): Promise<void> {
  try {
    // Small random movements before navigating
    await simulateIdleMovements(page);
    await randomDelay(1000, 2000); // Think time before clicking
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Simulate human behavior after page load
 * More extensive behavior to establish "human presence"
 */
export async function simulatePostLoadBehavior(page: Page): Promise<void> {
  try {
    // Wait a bit - humans don't immediately interact
    await randomDelay(500, 1000);

    // Extensive reading simulation
    await simulateReading(page);

    // More idle movements
    await simulateIdleMovements(page);

    // Final pause - like reading the page
    await randomDelay(1000, 2000);
  } catch (error) {
    // Ignore errors
  }
}

