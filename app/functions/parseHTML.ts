import {
  ChatProvider,
  DRIFT_EMBED_KEYWORD,
  SALESFORCE_EMBED_KEYWORD,
} from "../constants";

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { crawler } from "./crawler";

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
  return { companyName };
};

const containsKeywords = (html: string, keyword: string) => {
  const $ = cheerio.load(html);
  let hasKeyword = false;

  // embedded links should live in here.
  $("script").each((_, elem) => {
    const html = $(elem).html();
    if (html && html.includes(keyword)) {
      hasKeyword = true;
    }
  });

  // sometimes the script tag is in the body.
  $("body").each((_, elem) => {
    const html = $(elem).html();
    if (html && html.includes(keyword)) {
      hasKeyword = true;
    }
  });

  $("head").each((_, elem) => {
    const html = $(elem).html();
    if (html && html.includes(keyword)) {
      hasKeyword = true;
    }
  });

  return hasKeyword;
};

export const parseHTML = async (html: string, fileName: string) => {
  const hasDrift = containsKeywords(html, DRIFT_EMBED_KEYWORD);
  const hasSalesForce = containsKeywords(html, SALESFORCE_EMBED_KEYWORD);
  // some companies don't have a title tag, so we'll use the file name instead.
  const companyName = getMetaData(html).companyName || fileName.split(".")[0];

  const crawled = await crawler("https://syndigo.com/");
  console.log(crawled);

  // depending on interpretation of the requirements, this might not be needed.
  const chatProvider =
    hasDrift && hasSalesForce
      ? ChatProvider.Both
      : hasDrift
      ? ChatProvider.Drift
      : hasSalesForce
      ? ChatProvider.SalesForce
      : ChatProvider.None;

  return {
    companyName: companyName || fileName,
    hasDrift,
    hasSalesForce,
    chatProvider,
  };
};
