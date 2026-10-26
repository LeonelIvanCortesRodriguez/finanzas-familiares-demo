import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSample } from "../src/sample.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = path.join(root, "data");
const sample = generateSample();
fs.mkdirSync(data, { recursive: true });
fs.writeFileSync(path.join(data, "synthetic-sample.csv"), sample.csv);
fs.writeFileSync(path.join(data, "controls.json"), JSON.stringify(sample.controls, null, 2) + "\n");
console.log("GENERATE_OK seed=20261026 rows=52 fictional=true");
