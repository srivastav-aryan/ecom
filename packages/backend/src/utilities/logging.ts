import { createStream } from "rotating-file-stream";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logStream = createStream("access.log", {
  path: path.join(__dirname, "..", "logs"),
  interval: "1d",
  maxSize: "10M",
  compress: "gzip",
});
