import { Page } from "puppeteer";
export const SALESFORCE_CHAT_SELECTOR = ".embeddedServiceHelpButton";
export const hasSalesForceChat = async (page: Page) => {
  const salesForce = await page.$(SALESFORCE_CHAT_SELECTOR);

  return !!salesForce;
};
