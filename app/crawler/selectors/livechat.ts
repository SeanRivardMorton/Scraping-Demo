import { Page } from "puppeteer";
export const LIVE_CHAT_SELECTOR = "#chat-widget-container";
export const hasLiveChatIncChat = async (page: Page) => {
  const liveChat = await page.$(LIVE_CHAT_SELECTOR);

  return !!liveChat;
};
