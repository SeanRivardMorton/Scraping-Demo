import { Page } from "puppeteer";

export const HUB_SPOT_CHAT = "#hubspot-messages-iframe-container";

export const hasHubSpotChat = async (page: Page) => {
  const hubSpotChat = await page.$(HUB_SPOT_CHAT);

  return !!hubSpotChat;
};
