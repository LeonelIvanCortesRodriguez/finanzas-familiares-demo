import test from "node:test";
import assert from "node:assert/strict";
import { generateSample } from "../src/sample.mjs";
import { amountToCents, classify, exportView, parseCsv, processImport } from "../src/engine.mjs";

const sample = generateSample();
const result = processImport(sample.csv, sample.controls);

test("fixed seed produces identical fictional source", () => {
  assert.deepEqual(generateSample(), sample);
  assert.equal(sample.controls.synthetic, true);
  assert.equal(parseCsv(sample.csv).length, 52);
});
test("CSV quoting and header contract", () => {
  const csv = 'id,statementId,date,description,direction,amount\n"SYN-001","STATEMENT-01","2026-01-01","Demo ""quoted"", fixture","debit","1.25"\n';
  assert.equal(parseCsv(csv)[0].description, 'Demo "quoted", fixture');
  assert.throws(() => parseCsv("wrong,header\na,b"), /header/);
});
test("integer cents and date validation hold malformed rows", () => {
  assert.equal(amountToCents("14.05"), 1405);
  assert.equal(amountToCents("14.999"), null);
  assert.equal(result.manualReview.exceptions.filter((x) => x.kind === "VALIDATION").length, 1);
  const invalidDate = sample.csv.replace("2026-01-03", "2026-02-30");
  assert.ok(processImport(invalidDate, sample.controls).manualReview.exceptions.some((x) => x.reason === "Date is invalid"));
});
test("rule explanation and uncategorized review stay separate", () => {
  assert.equal(classify(" fixture grocer ").ruleId, "CAT-03");
  assert.equal(classify("unknown fixture").category, "Uncategorized");
  assert.equal(result.manualReview.exceptions.filter((x) => x.kind === "CATEGORY").length, 1);
  assert.ok(result.accepted.every((x) => x.categoryState === "DERIVED" || x.categoryState === "MANUAL_REVIEW"));
});
test("duplicates are held and excluded from totals", () => {
  assert.equal(result.manualReview.exceptions.filter((x) => x.kind === "DUPLICATE").length, 2);
  assert.equal(result.derived.metrics.acceptedRows, 49);
});
test("reconciliation exposes exact synthetic difference", () => {
  const [first, second] = result.derived.reconciliation;
  assert.equal(first.differenceCents, 0);
  assert.equal(first.state, "PASS");
  assert.equal(second.differenceCents, 731);
  assert.equal(second.state, "HOLD");
});
test("cash flow and budget trace to accepted cents", () => {
  const m = result.derived.metrics;
  assert.equal(m.inflowCents - m.outflowCents, m.netCents);
  assert.equal(result.derived.cashflow.reduce((sum, x) => sum + x.netCents, 0), m.netCents);
  assert.equal(result.derived.budget.reduce((sum, x) => sum + x.actualCents, 0), m.budgetSpentCents);
});
test("export keeps source, derived, review, and audit boundaries", () => {
  const packet = exportView(result);
  assert.equal(packet.schema, "ff-synthetic-demo-v1");
  assert.equal(packet.sourceFacts.rowCount, 52);
  assert.equal(packet.manualReview.heldStatements.length, 1);
  assert.ok(packet.auditTrail.some((event) => event.step === "RECONCILE"));
});
