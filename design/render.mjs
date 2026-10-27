// Build README, social, and demo assets from the fixed-seed sample and the running demo.
// Needs Chrome or Edge, FFmpeg on PATH, playwright-core (devDependency), and `npm run start` in another terminal.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { processImport } from "../src/engine.mjs";

const { chromium } = createRequire(import.meta.url)("playwright-core");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const build = path.join(root, "design", "build");
const frames = path.join(build, "frames");
const out = path.join(root, "docs", "brand");
const demoUrl = process.env.DEMO_URL || "http://127.0.0.1:4174/";
for (const dir of [build, out]) fs.mkdirSync(dir, { recursive: true });
fs.rmSync(frames, { recursive: true, force: true });
fs.mkdirSync(frames, { recursive: true });

const result = processImport(fs.readFileSync(path.join(root, "data", "synthetic-sample.csv"), "utf8"),
  JSON.parse(fs.readFileSync(path.join(root, "data", "controls.json"), "utf8")));
const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(cents / 100);
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const rawRows = Object.fromEntries(fs.readFileSync(path.join(root, "data", "synthetic-sample.csv"), "utf8").trim().split(/\r?\n/).slice(1)
  .map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, ""))).map((cells) => [cells[0], cells]));
const m = result.derived.metrics;
const held = result.manualReview.heldStatements[0];
const exceptions = result.manualReview.exceptions;
const setAside = exceptions.filter((item) => item.kind !== "CATEGORY").length;

const glyph = {
  accepted: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><path class="g-tick" d="M4 10.5l4 4 8-9"/></svg>',
  excluded: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><path class="g-cross" d="M5 5l10 10M15 5L5 15"/></svg>',
  review: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><circle class="g-hold" cx="10" cy="10" r="7.5"/></svg>',
  hold: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><circle class="g-hold" cx="10" cy="10" r="7.5"/><circle class="g-hold-dot" cx="10" cy="10" r="2.5"/></svg>'
};
const mark = '<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><path class="mark-line" d="M6 33h22"/><path class="mark-tick" d="M24 28l6 6 12-19"/><circle class="mark-dot" cx="12" cy="20" r="4"/></svg>';
const page = (title, css, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(title)}</title>
<link rel="stylesheet" href="../../styles.css"><style>body{margin:0}.canvas{position:relative;overflow:hidden;background:var(--bg)}${css}</style></head><body>${body}</body></html>`;

// The statement strip: real rows from the sample, in the order a person would check them.
function strip() {
  const row = (id, state, note) => {
    const accepted = result.accepted.find((item) => item.id === id);
    const raw = rawRows[id];
    const amount = accepted ? money(accepted.signedCents) : raw[5] === "invalid" ? "invalid" : `−${money(Math.round(Number(raw[5]) * 100))}`;
    return `<li class="srow srow-${state}">${glyph[state]}<span class="sid">${escape(id)}</span><span class="slabel">${escape(raw[3])}</span><span class="samt">${escape(amount)}</span>${note ? `<span class="snote">${escape(note)}</span>` : ""}</li>`;
  };
  return `<div class="strip"><p class="strip-head"><span>Fictional import · ${m.sourceRows} rows</span><span>seed 20261026</span></p><ol>
${row("SYN-009", "accepted")}${row("SYN-010", "accepted")}${row("SYN-011", "accepted")}
${row("SYN-049", "excluded", "duplicate")}${row("SYN-051", "review", "category needed")}${row("SYN-052", "excluded", "invalid amount")}
</ol><p class="strip-close">${glyph.hold}<span><b>${escape(held.statementId)}</b><span class="close-line">declared ${escape(money(held.declaredClosingCents))}</span><span class="close-line">calculated ${escape(money(held.calculatedClosingCents))}</span></span><span class="held">held · ${escape(money(held.differenceCents))}</span></p></div>`;
}
const stripCss = `
.strip { border: 1.5px solid var(--line); border-radius: 8px; background: var(--surface); padding: 18px 22px 16px; }
.strip-head { display: flex; justify-content: space-between; margin: 0 0 8px; font: 700 15px/1 var(--mono); color: var(--ink-2); }
.strip ol { margin: 0; padding: 0; list-style: none; }
.srow { display: grid; grid-template-columns: 22px 92px 1fr auto; gap: 10px; align-items: center; min-height: 44px; border-bottom: 1px solid var(--hairline); font-size: 18px; }
.sid, .samt { font: 600 17px/1 var(--mono); font-variant-numeric: tabular-nums; }
.samt { text-align: right; }
.srow-excluded .sid, .srow-excluded .slabel, .srow-excluded .samt { color: var(--ink-2); text-decoration: line-through; text-decoration-thickness: 2px; }
.snote { grid-column: 3 / -1; margin: -10px 0 8px; font-size: 15px; font-weight: 700; color: var(--ink-2); }
.srow-review .snote, .srow-review .slabel { color: var(--person); }
.srow-review .samt { outline: 2px solid var(--person); outline-offset: 4px; border-radius: 50%; }
.strip-close { display: grid; grid-template-columns: 22px 1fr auto; gap: 10px; align-items: center; margin: 12px 0 0; padding: 12px 14px; border: 2px solid var(--person); border-radius: 8px; background: var(--person-soft); font-size: 17px; }
.strip-close b { display: block; font-family: var(--mono); }
.close-line { display: block; font-family: var(--mono); font-variant-numeric: tabular-nums; }
.held { font: 700 18px/1 var(--mono); color: var(--person); }
`;

function flowStrip(compact) {
  const step = (label, value, sub, cls = "") => `<li class="fs ${cls}"><span>${label}</span><strong>${value}</strong><small>${sub}</small></li>`;
  return `<ol class="fstrip ${compact ? "compact" : ""}">${step("Source records", m.sourceRows, "fictional rows")}${step("Checked", m.acceptedRows, `accepted · ${setAside} set aside`)}${step("Exceptions", m.reviewItems, "for a person", "fs-person")}${step("Usable view", m.acceptedRows, "rows feed the figures", "fs-calc")}</ol>`;
}
const flowCss = `
.fstrip { display: grid; grid-template-columns: repeat(4, 1fr); margin: 0; padding: 0; list-style: none; }
.fs { position: relative; display: grid; gap: 2px; padding: 14px 18px; border: 1.5px solid var(--line); background: var(--surface); }
.fs + .fs { border-left: 0; }
.fs:not(:last-child)::after { content: "→"; position: absolute; right: -14px; top: 50%; transform: translateY(-50%); z-index: 1; font-size: 24px; font-weight: 700; background: var(--bg); line-height: 1; padding: 2px 0; }
.fs span { font-size: 15px; font-weight: 700; color: var(--ink-2); }
.fs strong { font: 700 34px/1.05 var(--mono); }
.fs small { font-size: 15px; }
.fs-person { background: var(--person-soft); border-color: var(--person); }
.fs-person strong { color: var(--person); }
.fs-calc strong { color: var(--calc); }
`;

const hero = page("Finanzas Familiares hero", `${stripCss}${flowCss}
.canvas { width: 1280px; height: 700px; padding: 38px 44px; display: grid; grid-template-columns: 560px 1fr; grid-template-rows: auto 1fr auto; gap: 18px 44px; }
.id { grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; }
.id .mark { width: 46px; height: 46px; color: var(--ink); }
.id .wordmark { font-size: 27px; }
.copy h1 { max-width: 15ch; margin: 18px 0 16px; font-size: 50px; }
.copy p { margin: 0; font-size: 21px; color: var(--ink-2); }
.copy .bound { margin-top: 18px; font-size: 17px; }
.fstrip { grid-column: 1 / -1; }
`, `<div class="canvas"><div class="id">${mark}<span class="wordmark">Finanzas Familiares <span>Demo</span></span></div>
<div class="copy"><h1>Check every line before trusting the totals.</h1><p>A fictional household bank export, checked line by line. Duplicates, bad rows, and an unbalanced statement stay in front of a person until someone resolves them.</p><p class="bound">Fictional data · no upload · no bank connection</p></div>
${strip()}${flowStrip()}</div>`);

const social = page("Finanzas Familiares social preview", `${stripCss}
.canvas { width: 1280px; height: 640px; padding: 64px 72px; display: grid; grid-template-columns: 1fr 560px; gap: 56px; align-items: center; background: var(--rail); color: var(--rail-ink); }
.id { display: flex; align-items: center; gap: 14px; margin-bottom: 34px; }
.id .mark { width: 54px; height: 54px; color: var(--rail-ink); }
.id .wordmark { font-size: 30px; }
h1 { max-width: 14ch; margin: 0 0 20px; font-size: 54px; line-height: 1.05; }
p.sub { margin: 0; font-size: 22px; opacity: .92; }
.strip { color: var(--ink); }
`, `<div class="canvas"><div><div class="id">${mark}<span class="wordmark">Finanzas Familiares <span>Demo</span></span></div>
<h1>Check every line before trusting the totals.</h1><p class="sub">Fictional data · reconciliation · review queue</p></div>${strip()}</div>`);

const views = [
  ["view-flow", "cap-flow.png", 860, "Every figure says where it came from",
    [`${m.sourceRows} source rows become ${m.acceptedRows} accepted rows; ${setAside} are set aside, never silently dropped.`,
      "The exceptions column is the only terracotta region: those items need a person.",
      "The calculated totals sit under the flow and name the rows they come from."]],
  ["view-held", "cap-held.png", 860, "What was held, and why",
    [`${held.statementId} shows calculated and declared closings side by side; the ${money(held.differenceCents)} difference is not corrected.`,
      "Set-aside rows are struck through with their reason. The missing category is circled, not guessed.",
      "Shape and label carry each status, so color is never the only cue."]],
  ["view-mobile", "cap-mobile.png", 390, "The same decision on a phone",
    ["At 390px the hold and its action come right after the promise and the fictional-data boundary.",
      "Amounts use a hyperlegible monospace face so cents line up and digits can't be confused.",
      "Navigation collapses; nothing scrolls sideways."]]
];
const viewPage = ([, capture, width, title, notes]) => page(title, `
.canvas { width: ${width + 540}px; display: grid; grid-template-columns: ${width}px 1fr; gap: 56px; padding: 48px; align-items: start; }
.shot { display: block; width: ${width}px; border: 1.5px solid var(--line); border-radius: 6px; }
.id { display: flex; align-items: center; gap: 12px; }
.id .mark { width: 36px; height: 36px; color: var(--ink); }
.id .wordmark { font-size: 21px; }
h2 { margin: 28px 0 22px; font-size: 32px; }
ol { margin: 0; padding: 0; list-style: none; counter-reset: n; }
li { counter-increment: n; display: grid; grid-template-columns: 34px 1fr; gap: 12px; margin: 0 0 18px; font-size: 20px; line-height: 1.45; color: var(--ink-2); }
li::before { content: counter(n); display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--ink); color: var(--bg); font: 700 15px/1 var(--mono); }
.foot { margin-top: 24px; font-size: 15px; color: var(--ink-2); }
`, `<div class="canvas"><img class="shot" src="${capture}" alt=""><div><div class="id">${mark}<span class="wordmark">Finanzas Familiares <span>Demo</span></span></div>
<h2>${escape(title)}</h2><ol>${notes.map((note) => `<li>${escape(note)}</li>`).join("")}</ol><p class="foot">Captured from the running demo · fictional data</p></div></div>`);

fs.writeFileSync(path.join(build, "hero.html"), hero);
fs.writeFileSync(path.join(build, "social.html"), social);
for (const view of views) fs.writeFileSync(path.join(build, `${view[0]}.html`), viewPage(view));

const executablePath = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((candidate) => fs.existsSync(candidate));
const browser = await chromium.launch({ executablePath });
async function open(target, { width, height, scheme = "light", scale = 1 }) {
  const tab = await browser.newPage({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: scale, reducedMotion: "reduce" });
  await tab.goto(target.startsWith("http") ? target : pathToFileURL(target).href, { waitUntil: "networkidle" });
  await tab.evaluate(() => document.fonts.ready);
  return tab;
}

// Captures of the running demo, taken at the width they are shown.
let tab = await open(demoUrl, { width: 900, height: 1000, scale: 2 });
await tab.locator(".flow-section").screenshot({ path: path.join(build, "cap-flow.png") });
await tab.locator("#controls").screenshot({ path: path.join(build, "cap-held.png") });
await tab.close();
tab = await open(demoUrl, { width: 390, height: 844, scale: 2 });
await tab.screenshot({ path: path.join(build, "cap-mobile.png") });
await tab.close();

for (const scheme of ["light", "dark"]) {
  tab = await open(path.join(build, "hero.html"), { width: 1280, height: 700, scheme, scale: 1.5 });
  await tab.screenshot({ path: path.join(out, `hero-${scheme}.png`) });
  await tab.close();
}
tab = await open(path.join(build, "social.html"), { width: 1280, height: 640 });
await tab.screenshot({ path: path.join(out, "social-preview.png") });
await tab.close();
for (const [name] of views) {
  tab = await open(path.join(build, `${name}.html`), { width: 1240, height: 600, scale: 1.5 });
  await tab.locator(".canvas").screenshot({ path: path.join(out, `${name}.png`) });
  await tab.close();
}

// Demo: one complete job in the real interface, with a caption bar added for the recording only.
tab = await open(demoUrl, { width: 1280, height: 800 });
const caption = async (text) => tab.evaluate((value) => {
  let bar = document.getElementById("rec-caption");
  if (!bar) {
    bar = document.createElement("div"); bar.id = "rec-caption";
    bar.style.cssText = "position:fixed;left:24px;right:24px;bottom:20px;z-index:99;padding:14px 18px;border-radius:8px;background:var(--ink);color:var(--bg);font:700 19px/1.35 var(--sans)";
    document.body.append(bar);
  }
  bar.textContent = value;
}, text);
const list = [];
let frame = 0;
const shoot = async (seconds) => {
  const file = `f${String(frame++).padStart(2, "0")}.png`;
  await tab.screenshot({ path: path.join(frames, file) });
  list.push(`file '${file}'`, `duration ${seconds}`);
};
await caption(`1 · The import is checked first: ${m.sourceRows} rows, ${m.acceptedRows} accepted, one statement held.`); await shoot(2.6);
await tab.click(".primary-button"); await tab.evaluate(() => document.getElementById("controls").scrollIntoView({ block: "start" }));
await caption(`2 · ${held.statementId}: calculated ${money(held.calculatedClosingCents)}, declared ${money(held.declaredClosingCents)}. Nothing is auto-corrected.`); await shoot(2.8);
await tab.evaluate(() => document.querySelector("#exceptionRows").scrollIntoView({ block: "center" }));
await caption("3 · Every set-aside row keeps its reason. The missing category waits for a person."); await shoot(2.6);
await tab.evaluate(() => document.getElementById("ledger").scrollIntoView({ block: "start" }));
await tab.fill("#ledgerSearch", "SYN-051");
await caption("4 · Trace the open item to its source row in the accepted ledger."); await shoot(2.4);
await tab.fill("#ledgerSearch", "");
await tab.evaluate(() => document.getElementById("evidence").scrollIntoView({ block: "start" }));
await caption("5 · The audit trail keeps source facts, calculated figures, and manual review apart. Export it as JSON."); await shoot(3.2);
list.push(`file 'f${String(frame - 1).padStart(2, "0")}.png'`);
fs.copyFileSync(path.join(frames, "f00.png"), path.join(out, "demo-poster.png"));
await tab.close();
await browser.close();

fs.writeFileSync(path.join(frames, "list.txt"), `${list.join("\n")}\n`);
const ffmpeg = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit", cwd: frames });
ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-vf",
  "fps=6,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none",
  "-loop", "0", path.join(out, "demo.gif")]);
ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "20", "-movflags", "+faststart", "-an", path.join(out, "demo.mp4")]);
for (const file of fs.readdirSync(out).sort()) console.log(`${file} ${(fs.statSync(path.join(out, file)).size / 1024).toFixed(0)}KB`);
console.log(`RENDER_OK frames=${frame}`);
