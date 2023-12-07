import { ChatProvider } from "../constants";

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { crawler } from "../crawler/crawler";
import { DRIFT_CHAT_SELECTOR } from "../crawler/selectors/drift";
import { SALESFORCE_CHAT_SELECTOR } from "../crawler/selectors/salesforce";

export const readFile = async (filePath: string) => {
  try {
    const html = await fs.promises.readFile(
      path.join(path.resolve(), filePath),
      "utf8"
    );
    return html;
  } catch (err) {
    console.error(err);
    return "";
  }
};

const getMetaData = (html: string) => {
  const $ = cheerio.load(html);
  const companyName = $("title").text();
  const companyUrl = $("link[rel='canonical']").attr("href");
  return { companyName, companyUrl };
};

const containsKeywords = (html: string, selector: string) => {
  const $ = cheerio.load(html);
  let hasKeyword = false;

  // embedded links should live in here.
  $("script").each((_, elem) => {
    const html = $(elem).html();
    if (html && html.includes(selector)) {
      hasKeyword = true;
    }
  });

  // sometimes the script tag is in the body.
  $("body").each((_, elem) => {
    const html = $(elem).html();
    if (html && html.includes(selector)) {
      hasKeyword = true;
    }
  });

  $("head").each((_, elem) => {
    const html = $(elem).html();
    if (html && html.includes(selector)) {
      hasKeyword = true;
    }
  });

  return hasKeyword;
};

const prefixWithHttps = (url: string) =>
  url.includes("http") ? url : `https://${url}`;

export const parseHTML = async (html: string, fileName: string) => {
  const hasDriftCached = containsKeywords(html, DRIFT_CHAT_SELECTOR);
  const hasSalesForceCached = containsKeywords(html, SALESFORCE_CHAT_SELECTOR);

  const metaData = getMetaData(html);
  // some companies don't have a title tag, so we'll use the file name instead.
  const companyName = metaData.companyName || fileName.split(".")[0];
  const companyUrl =
    metaData.companyUrl || prefixWithHttps(fileName.split(".")[0] + ".com");

  console.log("** Company Name: ", companyName);
  console.log("** Company Url: ", companyUrl);
  console.log(" ");

  const { hasDrift, hasSalesForce, hasLiveChatInc, hasHubSpot } =
    (!hasDriftCached || !hasSalesForceCached) && companyUrl
      ? await crawler(companyUrl, fileName)
      : {
          hasDrift: false,
          hasSalesForce: false,
          hasLiveChatInc: false,
          hasHubSpot: false,
        };

  const definitelyHasDrift = hasDriftCached || hasDrift || false;
  const definitelyHasSalesForce = hasSalesForceCached || hasSalesForce || false;

  console.log("**");
  console.log("** Drift Chat: ", !!definitelyHasDrift ? "✅" : "❌");
  console.log("** Sales Force Chat: ", !!definitelyHasSalesForce ? "✅" : "❌");
  console.log("** Live Chat Inc Chat: ", !!hasLiveChatInc ? "✅" : "❌");
  console.log("** Hub Spot Chat: ", !!hasHubSpot ? "✅" : "❌");
  console.log("**");

  // depending on interpretation of the requirements, this might not be needed.
  const chatProvider =
    definitelyHasDrift && hasSalesForce
      ? ChatProvider.Both
      : definitelyHasDrift
      ? ChatProvider.Drift
      : hasSalesForce
      ? ChatProvider.SalesForce
      : ChatProvider.None;

  return {
    companyName: companyName || fileName,
    hasDrift: definitelyHasDrift,
    hasSalesForce,
    hasLiveChatInc,
    hasHubSpot,
    chatProvider,
  };
};
