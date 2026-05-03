import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const indexPath = join(distDir, "index.html");
const assetsDir = join(distDir, "assets");

if (!existsSync(indexPath)) {
  console.error("Smoke check failed: dist/index.html was not found.");
  process.exit(1);
}

if (!existsSync(assetsDir) || readdirSync(assetsDir).length === 0) {
  console.error("Smoke check failed: dist/assets is missing or empty.");
  process.exit(1);
}

const indexHtml = readFileSync(indexPath, "utf8");
if (!indexHtml.includes("/ramadan-tracker/assets/")) {
  console.error(
    "Smoke check failed: built asset paths do not use the GitHub Pages base path."
  );
  process.exit(1);
}

console.log("Static build smoke check passed.");
