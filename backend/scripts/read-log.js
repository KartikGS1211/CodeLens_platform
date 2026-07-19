import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, "../test-results.log");
const outputPath = path.resolve(__dirname, "../test-results-utf8.txt");

if (fs.existsSync(inputPath)) {
  const content = fs.readFileSync(inputPath, "utf16le");
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(
    "Converted to UTF-8 successfully. Size:",
    fs.statSync(outputPath).size,
  );
} else {
  console.log("No test-results.log file found");
}
