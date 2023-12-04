import { BASE_PATH } from "../constants";
import { parseHTML, readFile } from "./parseHTML";
import * as fs from "fs";
import * as path from "path";

const findCompanyChatProviders = async (search?: string) => {
  const localFiles = await readDirectory();

  const filtered = localFiles.filter((file: string) =>
    search ? file.includes(search) : true
  );

  const allData = Promise.all(
    filtered.map(async (file: string) => {
      const html = await readFile(`${BASE_PATH}/${file}`);
      return await parseHTML(html, file);
    })
  );

  return await allData;
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
