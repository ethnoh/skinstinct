import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const standalone = path.join(process.cwd(), ".next", "standalone");
if (!existsSync(path.join(standalone, "server.js")))
  throw new Error("Build the standalone server first.");
mkdirSync(path.join(standalone, ".next"), { recursive: true });
cpSync(path.join(process.cwd(), "public"), path.join(standalone, "public"), { recursive: true });
cpSync(path.join(process.cwd(), ".next", "static"), path.join(standalone, ".next", "static"), {
  recursive: true,
});
console.log("Prepared standalone server with public and static assets.");
