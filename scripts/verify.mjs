import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSample } from "../src/sample.mjs";
import { processImport } from "../src/engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sample = generateSample();
const csv = fs.readFileSync(path.join(root, "data", "synthetic-sample.csv"), "utf8");
const controlText = fs.readFileSync(path.join(root, "data", "controls.json"), "utf8");
if (csv !== sample.csv || controlText !== JSON.stringify(sample.controls, null, 2) + "\n") throw new Error("Committed fixture differs from fixed-seed generator");
const result = processImport(csv, JSON.parse(controlText));
if (result.sourceFacts.rowCount !== 52 || result.derived.metrics.acceptedRows !== 49 || result.derived.metrics.reconciledStatements !== 1 || result.derived.metrics.reviewItems !== 5) throw new Error("Synthetic control totals changed");
for (const file of ["index.html", "styles.css", "app.js", "README.md", "LICENSE", "SECURITY.md", "THIRD_PARTY_NOTICES.md", "docs/brand/hero-light.png", "docs/brand/hero-dark.png", "docs/brand/social-preview.png", "docs/brand/demo.gif", "assets/fonts/AtkinsonHyperlegibleNext.woff2", "assets/fonts/AtkinsonHyperlegibleNext-OFL.txt"]) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing release file: ${file}`);
}
console.log("VERIFY_OK rows=52 accepted=49 review=5 reconciled=1/2");
