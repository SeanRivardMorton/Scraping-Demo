import { BASE_PATH } from "../constants";
import { writeFileAsync } from "../crawler/helpers";
import { parseHTML, readFile } from "./parseHTML";
import * as fs from "fs";
import * as path from "path";

const findCompanyChatProviders = async (search?: string) => {
  const localFiles = await readDirectory();

  const filtered = localFiles.filter((file: string) =>
    search ? file.includes(search) : true
  );

  const allData = [];
  let companyCount = 0;

  // split the files of filtered into two arraya

  // iterate over files in data directory
  for (const file of filtered) {
    console.log(" ");
    console.log("------------ Crawling: ", file, "--------------");

    const html = await readFile(`${BASE_PATH}/${file}`);
    const parsed = await parseHTML(html, file);
    allData.push(parsed);

    companyCount += 1;
    console.log(`** ${companyCount} of ${filtered.length} companies crawled`);
  }

  const driftCount = allData.filter((data) => data.hasDrift).length;
  const salesForceCount = allData.filter((data) => data.hasSalesForce).length;
  const liveChatIncCount = allData.filter((data) => data.hasLiveChatInc).length;
  const hubSpotCount = allData.filter((data) => data.hasHubSpot).length;

  const data = await {
    allData,
    total: allData.length,
    driftCount,
    salesForceCount,
    liveChatIncCount,
    hubSpotCount,
  };

  writeFileAsync(`result-${search}.json`, JSON.stringify(data));

  console.log("------------ Results: ", search, "--------------");
  console.log("** Total: ", data.total);
  console.log("** Drift: ", data.driftCount);
  console.log("** SalesForce: ", data.salesForceCount);
  console.log("** LiveChatInc: ", data.liveChatIncCount);
  console.log("** HubSpot: ", data.hubSpotCount);

  return data;
};

const readDirectory = async () => {
  const directoryPath = path.join(path.resolve(), BASE_PATH);

  const files = await fs.promises
    .readdir(directoryPath, "utf8")
    .catch((err: Error) => {
      console.error(err);
      return [];
    });

  return files;
};

export default findCompanyChatProviders;
