import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const defaultChromeFlags = ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking'];

async function closeChromeViaCdp(port) {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const session = await browser.newBrowserCDPSession();
  try {
    await session.send('Browser.close');
  } catch {
    // Browser.close commonly closes the transport before the response arrives.
  }
}

async function waitForChromeToExit(port, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/version`);
    } catch {
      return;
    }
    await delay(50);
  }
  throw new Error(`Chrome debugging endpoint did not close on port ${port}`);
}

export async function runColdLighthouseAudit({
  launchChrome,
  audit,
  closeChrome = closeChromeViaCdp,
  waitForChromeToExit: waitForExit = waitForChromeToExit,
}) {
  const chrome = await launchChrome({ chromeFlags: defaultChromeFlags });
  try {
    return await audit(chrome.port);
  } finally {
    let gracefulCloseError;
    try {
      await closeChrome(chrome.port);
      await waitForExit(chrome.port);
    } catch (error) {
      gracefulCloseError = error;
    }
    try {
      chrome.kill();
    } catch (killError) {
      if (gracefulCloseError) throw new AggregateError([gracefulCloseError, killError], 'Chrome graceful and forced cleanup both failed');
      throw killError;
    }
  }
}
