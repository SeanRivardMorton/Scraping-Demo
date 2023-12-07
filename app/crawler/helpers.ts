import { GhostCursor } from "ghost-cursor";
import { Page } from "puppeteer";

const path = require("path");
const fs = require("fs").promises;

// cookie accepting logic could use some work.
const ACCEPT_TEXT = [
  "accept",
  "accept all",
  "accept all cookies",
  "allow cookies",
];

export const delay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

export const acceptCookies = async (page: Page, cursor: GhostCursor) => {
  const buttons = await page.$$("button");

  let allowAllButton = [];
  // print all the innerText for each button
  for (const button of buttons) {
    const text = await page.evaluate((el) => el.innerText, button);
    // only accepting required cookies might not trigger the chat.
    // so we need to use the most affirmative button.
    if (ACCEPT_TEXT.find((word) => text.trim().toLowerCase() === word)) {
      allowAllButton.push(button);
    }
  }

  // get the id of the allowAllButton;
  const acceptCookieButton = await page.evaluate((el) => {
    // hopefully they've used an ID to identify the accept button
    if (el?.id) return "#" + el?.id;
    // ..maybe they've used a className instead?
    if (el?.className) return "." + el?.className.replace(/ /g, ".");
    // can't find the button, so return null
    return null;
  }, allowAllButton[0]);

  if (!acceptCookieButton) {
    console.log("** Accepting Cookies: ❌");
    return;
  }

  try {
    await page.waitForSelector(acceptCookieButton);
    await cursor.click(acceptCookieButton);
  } catch (e) {
    console.log("!! Cookie not Clicked.");
    console.log(e);
  }
  console.log("** Accepting Cookies: ✅");
};

export const simulateNormalMovement = async (
  page: Page,
  cursor: GhostCursor,
  logger: (message: string) => void,
  target = "body"
) => {
  try {
    await page.waitForSelector(target, { timeout: 500 });
    await cursor.move(target);
  } catch (e) {
    logger(`Couldn't find ${target} on page`);
  }
};

const relativePath = "../results/";
const filePath = path.join(__dirname, relativePath);

export const writeFileAsync = async (path: string, data: string) => {
  // remove characters that don't belong in a filepath
  const cleanPath = path.replace(/[^a-zA-Z0-9.]/g, "");
  try {
    await fs.writeFile(filePath + cleanPath, data);
    console.log("File written successfully");
  } catch (error) {
    console.error("Error writing file:", error);
  }
};
