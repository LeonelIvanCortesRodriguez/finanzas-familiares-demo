import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const omitted = new Set([".git", "node_modules", "release", "test-results"]);
const forbiddenHidden = "." + "private";
const binary = /\.(png|jpe?g|webp|gif|ico|zip)$/i;
const findings = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (omitted.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full).replaceAll("\\", "/");
    if (entry.name.toLowerCase() === forbiddenHidden || /\.(?:pdf|db|sqlite|pem|key)$/i.test(entry.name)) findings.push(`${relative}: forbidden file name`);
    if (entry.isDirectory()) walk(full);
    else if (!binary.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      if (/[A-Za-z]:\\Users\\[^\\\s]+/.test(content)) findings.push(`${relative}: local user path`);
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) findings.push(`${relative}: private key`);
      if (/\b(?:ghp|github_pat|xox[baprs])-[-A-Za-z0-9_]{16,}\b/.test(content)) findings.push(`${relative}: credential-like token`);
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(content)) findings.push(`${relative}: email address`);
    }
  }
}
walk(root);
if (findings.length) throw new Error(`PRIVACY_SCAN_FAIL\n${findings.join("\n")}`);
console.log("PRIVACY_SCAN_OK public code and fictional fixtures only");
