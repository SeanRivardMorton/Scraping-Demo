import { BASE_PATH } from "../constants";
import { writeFileAsync } from "../crawler/helpers";
import { ParsedHTML, parseHTML, readFile } from "./parseHTML";
import * as fs from "fs";
import * as path from "path";

// 6 is a nice round number
export const CHUNK_SIZE = 6;

const chunkFiles = (arr: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
};

const process = async (arr: any[], fn: any) => {
  return await Promise.all(arr.map(fn));
};

const findCompanyChatProviders = async (search?: string) => {
  const localFiles = await readDirectory();

  const filtered = localFiles.filter((file: string) =>
    search ? file.includes(search) : true
  );

  // chunk the files into batches, so we can move faster
  // than one at a time, but not run out of memory.
  const chunks = chunkFiles(filtered, CHUNK_SIZE);

  const allData: ParsedHTML[] = [];

  let chunkCount = 0;
  for (const chunk of chunks) {
    await process(chunk, async (file: string) => {
      const html = await readFile(`${BASE_PATH}/${file}`);
      const parsed = await parseHTML(html, file);
      allData.push(parsed);
      chunkCount++;
      console.log(`** Chunk ${chunkCount} of ${filtered.length} completed.`);
    });
  }

  console.log(allData);

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
