import fs from "fs";
import puppeteer from "puppeteer";

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while (checkCounts++ <= maxChecks) {
    let html = await page.content();
    let currentHTMLSize = html.length;

    let bodyHTMLSize = await page.evaluate(
      () => document.body.innerHTML.length
    );

    console.log(
      "last: ",
      lastHTMLSize,
      " <> curr: ",
      currentHTMLSize,
      " body html size: ",
      bodyHTMLSize
    );

    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered fully..");
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }
};

export const crawler = async (url: string) => {
  console.log("---- CRAWLING -----", url);
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1080,
      height: 1024,
    },
  });
  const page = await browser.newPage();
  console.log("set page, going to ", url);

  // Navigate the page to a URL
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("At URL");

  await waitTillHTMLRendered(page);

  const html = await page.content();

  await page.mouse.move(100, 100);
  await page.mouse.move(500, 900);
  //   await page.waitForNavigation();
  //   await page.waitForSelector(".page-body", { timeout: 5_000 });

  //   const hasDrift = await page.$("[#drift-frame-chat]");
  //   console.log(hasDrift);
  fs.writeFile(`test`, html, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });

  await browser.close();
  return "s";
};
