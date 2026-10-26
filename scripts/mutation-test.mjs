import { generateSample } from "../src/sample.mjs";
import { processImport } from "../src/engine.mjs";

const { csv, controls } = generateSample();
const baseline = processImport(csv, controls);
if (baseline.derived.reconciliation[0].state !== "PASS") throw new Error("Baseline must reconcile before mutation");
const tampered = structuredClone(controls);
tampered.statements[0].closingCents += 1;
if (processImport(csv, tampered).derived.reconciliation[0].state !== "HOLD") throw new Error("MUTATION_FAIL closing-balance change escaped");
if (baseline.manualReview.exceptions.filter((x) => x.kind === "DUPLICATE").length !== 2) throw new Error("MUTATION_FAIL duplicate fixtures escaped");
const rows = csv.split("\n");
rows[1] = rows[1].replace(/"\d+\.\d{2}"$/, '"invalid"');
if (!processImport(rows.join("\n"), controls).manualReview.exceptions.some((x) => x.kind === "VALIDATION" && x.rowId === "SYN-001")) throw new Error("MUTATION_FAIL invalid amount escaped");
console.log("MUTATION_OK balance, duplicate, and amount defects detected");
