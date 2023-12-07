import puppeteer from "puppeteer-extra";
import { createCursor } from "ghost-cursor";
import { PuppeteerLaunchOptions, Page } from "puppeteer";
import {
  acceptCookies,
  simulateNormalMovement,
  writeFileAsync,
} from "./helpers";
import { hasDriftChat } from "./selectors/drift";
import { hasSalesForceChat } from "./selectors/salesforce";
import { hasLiveChatIncChat } from "./selectors/livechat";
import { hasHubSpotChat } from "./selectors/hubspot";

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const browserConfig: PuppeteerLaunchOptions = {
  headless: "new",
  defaultViewport: {
    width: 1080,
    height: 1024,
  },
};

// useful for debugging concurrent tasks
const errorLogger = (prefix: string) => (message: string) => {
  console.error(prefix, message);
};

export const crawler = async (
  url: string,
  fileName: string
): Promise<{
  hasDrift: boolean;
  hasSalesForce: boolean;
  hasLiveChatInc: boolean;
  hasHubSpot: boolean;
}> => {
  const logger = errorLogger(`CRAWLER ERROR: ${url}`);
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 5000,
    });
  } catch (e) {
    console.log("!! Page not loaded.");
    console.log(e);
    return {
      hasDrift: false,
      hasSalesForce: false,
      hasLiveChatInc: false,
      hasHubSpot: false,
    };
  }

  const cursor = createCursor(page);

  // Some websites require accepted cookie before they will load the chat.
  await simulateNormalMovement(page, cursor, logger);

  const [tmpa, tmpb, tmpc, tmpbd] = await Promise.all([
    hasDriftChat(page),
    hasSalesForceChat(page),
    hasLiveChatIncChat(page),
    hasHubSpotChat(page),
  ]);

  //   Check if drift is installed at page load.
  if (tmpa || tmpb || tmpc || tmpbd) {
    await browser.close();
    return {
      hasDrift: tmpa,
      hasSalesForce: tmpb,
      hasLiveChatInc: tmpc,
      hasHubSpot: tmpbd,
    };
  }

  // If a cookie dialog appears, click accept if possible.
  await acceptCookies(page, cursor);

  // after checking cookies, and simulating normal movement, check for drift again.
  const [hasDrift, hasSalesForce, hasLiveChatInc, hasHubSpot] =
    await Promise.all([
      hasDriftChat(page),
      hasSalesForceChat(page),
      hasLiveChatIncChat(page),
      hasHubSpotChat(page),
    ]);

  // get html
  const html = await page.content();
  writeFileAsync(fileName, html);
  await browser.close();
  return { hasDrift, hasSalesForce, hasLiveChatInc, hasHubSpot };
};
