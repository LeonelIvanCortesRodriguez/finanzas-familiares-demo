import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Reads the OKLCH token table in DESIGN.md and checks every named pair with the WCAG 2.x formula.
// `--write` refreshes docs/CONTRAST_CHECK.txt; without it the retained report must match.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(root, "docs", "CONTRAST_CHECK.txt");

// [foreground, background, minimum]. 4.5 = normal text, 3 = non-text UI and graphics.
const pairs = [
  ["ink", "bg", 4.5], ["ink", "surface", 4.5],
  ["ink-2", "bg", 4.5], ["ink-2", "surface", 4.5],
  ["calc", "bg", 4.5], ["calc", "surface", 4.5], ["calc", "calc-soft", 4.5],
  ["on-calc", "calc", 4.5],
  ["person", "bg", 4.5], ["person", "surface", 4.5], ["person", "person-soft", 4.5],
  ["line", "bg", 3], ["line", "surface", 3],
  ["calc", "bg", 3, "focus ring"]
];

function readTokens() {
  const text = fs.readFileSync(path.join(root, "DESIGN.md"), "utf8");
  const tokens = { light: {}, dark: {} };
  for (const match of text.matchAll(/^\| `--([a-z0-9-]+)` \| `([\d. ]+)` \| `([\d. ]+)` \|/gm)) {
    tokens.light[match[1]] = match[2].trim().split(/\s+/).map(Number);
    tokens.dark[match[1]] = match[3].trim().split(/\s+/).map(Number);
  }
  return tokens;
}

function luminance([L, C, h]) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const r = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

const ratio = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const tokens = readTokens();
const lines = ["Contrast check: WCAG 2.x relative luminance from DESIGN.md OKLCH tokens", ""];
let failures = 0;
for (const theme of ["light", "dark"]) {
  for (const [fg, bg, min, note] of pairs) {
    const a = tokens[theme][fg];
    const b = tokens[theme][bg];
    if (!a || !b) throw new Error(`DESIGN.md is missing --${a ? bg : fg} for ${theme}`);
    const value = ratio(a, b);
    if (value < min) failures++;
    lines.push(`${value >= min ? "PASS" : "FAIL"} ${theme} --${fg} on --${bg} ${value.toFixed(2)}:1 (minimum ${min}:1${note ? `, ${note}` : ""})`);
  }
}
const report = `${lines.join("\n")}\n`;

if (process.argv.includes("--write")) fs.writeFileSync(reportPath, report);
else if (!fs.existsSync(reportPath) || fs.readFileSync(reportPath, "utf8").replace(/\r\n/g, "\n") !== report) {
  console.error("docs/CONTRAST_CHECK.txt is missing or stale; run node scripts/contrast-check.mjs --write");
  process.exit(1);
}
if (failures) {
  console.error(report);
  console.error(`CONTRAST_CHECK_FAILED pairs=${failures}`);
  process.exit(1);
}
console.log(`CONTRAST_CHECK_OK pairs=${pairs.length * 2}`);
