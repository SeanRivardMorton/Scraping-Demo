import { Page } from "puppeteer";
import { delay } from "../helpers";

export const DRIFT_CHAT_SELECTOR = "#drift-frame-chat";

export const hasDriftChat = async (page: Page) => {
  const driftChat = await page.$(DRIFT_CHAT_SELECTOR);

  return !!driftChat;
};
