import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

export const exportCSV = (data: any, fileName: string) => {
  const csv = Papa.unparse(Array.isArray(data) ? data : [data]);

  // Define where to save
  const dir = path.join(process.cwd(), "src", "model", "celiver", "dataset");

  // Create folder if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(dir, `${fileName}.csv`);

  // Write the file
  fs.writeFileSync(filePath, csv);

  return filePath;
};

export const removeCSV = async (filePath: string) => {
  await fs.promises.unlink(filePath);
};

export const readCSV = (filePath: string) => {
  // 1. Read the file content as a string
  const fileContent = fs.readFileSync(filePath, "utf8");

  // 2. Parse it
  const result = Papa.parse(fileContent, {
    header: true, // Converts rows into objects using the first line as keys
    skipEmptyLines: true, // Prevents errors from trailing newlines
    dynamicTyping: true, // Automatically converts "1.23" to a number
  });

  return result.data; // This is your array of objects
};
