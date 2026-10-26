const rules = [
  { id: "CAT-01", category: "Income", pattern: /SALARY|FREELANCE/ },
  { id: "CAT-02", category: "Housing", pattern: /RENT/ },
  { id: "CAT-03", category: "Groceries", pattern: /GROCER/ },
  { id: "CAT-04", category: "Mobility", pattern: /TRANSIT/ },
  { id: "CAT-05", category: "Utilities", pattern: /UTILITY/ },
  { id: "CAT-06", category: "Health", pattern: /HEALTH/ },
  { id: "CAT-07", category: "Dining", pattern: /CAFE/ }
];

export function parseCsv(text) {
  const lines = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); if (row.some((value) => value !== "")) lines.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  row.push(cell); if (row.some((value) => value !== "")) lines.push(row);
  const expected = ["id", "statementId", "date", "description", "direction", "amount"];
  if (JSON.stringify(lines.shift()) !== JSON.stringify(expected)) throw new Error("CSV header does not match the public sample contract");
  return lines.map((values, index) => {
    if (values.length !== expected.length) throw new Error(`CSV line ${index + 2} has ${values.length} cells`);
    return Object.fromEntries(expected.map((key, column) => [key, values[column]]));
  });
}

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() + 1 === month && parsed.getUTCDate() === day;
};

export function amountToCents(value) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [major, minor = ""] = value.split(".");
  const cents = Number(major) * 100 + Number(minor.padEnd(2, "0") || 0);
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 100000000 ? cents : null;
}

export function classify(description) {
  const normalized = description.trim().replace(/\s+/g, " ").toUpperCase();
  const match = rules.find((rule) => rule.pattern.test(normalized));
  return match
    ? { category: match.category, ruleId: match.id, explanation: `${match.id} matched a public sample keyword.` }
    : { category: "Uncategorized", ruleId: null, explanation: "No rule matched; a person must review this category." };
}

function validate(raw, knownStatements) {
  if (!/^SYN-\d{3}$/.test(raw.id)) return "Sample row ID is invalid";
  if (!knownStatements.has(raw.statementId)) return "Statement alias is unknown";
  if (!validDate(raw.date)) return "Date is invalid";
  if (!raw.description.trim()) return "Description is missing";
  if (!["credit", "debit"].includes(raw.direction)) return "Direction is invalid";
  if (amountToCents(raw.amount) === null) return "Amount is invalid";
  return null;
}

export function processImport(csv, controls) {
  if (controls?.synthetic !== true || !Array.isArray(controls.statements)) throw new Error("Synthetic controls are required");
  const sourceRows = parseCsv(csv);
  const knownStatements = new Set(controls.statements.map((statement) => statement.id));
  const accepted = [], exceptions = [], auditTrail = [], fingerprints = new Set(), ids = new Set();
  for (const [index, raw] of sourceRows.entries()) {
    const reason = validate(raw, knownStatements) || (ids.has(raw.id) ? "Sample row ID is repeated" : null);
    ids.add(raw.id);
    if (reason) {
      exceptions.push({ rowId: raw.id || `LINE-${index + 2}`, kind: "VALIDATION", state: "HOLD", reason });
      auditTrail.push({ rowId: raw.id, step: "VALIDATE", state: "HOLD", basis: reason });
      continue;
    }
    const cents = amountToCents(raw.amount);
    const description = raw.description.trim().replace(/\s+/g, " ");
    const fingerprint = [raw.statementId, raw.date, raw.direction, cents, description.toUpperCase()].join("|");
    if (fingerprints.has(fingerprint)) {
      exceptions.push({ rowId: raw.id, kind: "DUPLICATE", state: "HOLD", reason: "Same statement, date, direction, amount, and normalized description." });
      auditTrail.push({ rowId: raw.id, step: "DEDUPLICATE", state: "HOLD", basis: "Exact normalized fingerprint already accepted." });
      continue;
    }
    fingerprints.add(fingerprint);
    const assigned = classify(description);
    const record = { id: raw.id, statementId: raw.statementId, date: raw.date, description, direction: raw.direction,
      cents, signedCents: raw.direction === "credit" ? cents : -cents,
      category: assigned.category, ruleId: assigned.ruleId, categoryExplanation: assigned.explanation,
      sourceState: "SOURCE", categoryState: assigned.ruleId ? "DERIVED" : "MANUAL_REVIEW" };
    accepted.push(record);
    auditTrail.push({ rowId: raw.id, step: "IMPORT", state: "ACCEPTED", basis: "Validated source row and unique normalized fingerprint." });
    auditTrail.push({ rowId: raw.id, step: "CATEGORIZE", state: assigned.ruleId ? "DERIVED" : "MANUAL_REVIEW", basis: assigned.explanation });
    if (!assigned.ruleId) exceptions.push({ rowId: raw.id, kind: "CATEGORY", state: "REVIEW", reason: assigned.explanation });
  }

  const reconciliation = controls.statements.map((statement) => {
    const movementCents = accepted.filter((row) => row.statementId === statement.id).reduce((sum, row) => sum + row.signedCents, 0);
    const calculatedClosingCents = statement.openingCents + movementCents;
    const differenceCents = statement.closingCents - calculatedClosingCents;
    const state = differenceCents === 0 ? "PASS" : "HOLD";
    auditTrail.push({ rowId: statement.id, step: "RECONCILE", state, basis: `Declared closing less calculated closing: ${differenceCents} cents.` });
    return { statementId: statement.id, openingCents: statement.openingCents, movementCents,
      calculatedClosingCents, declaredClosingCents: statement.closingCents, differenceCents, state };
  });
  const budget = Object.entries(controls.budgetsCents).map(([category, budgetCents]) => {
    const actualCents = accepted.filter((row) => row.direction === "debit" && row.category === category).reduce((sum, row) => sum + row.cents, 0);
    return { category, budgetCents, actualCents, varianceCents: budgetCents - actualCents, state: actualCents <= budgetCents ? "WITHIN" : "OVER" };
  });
  const cashflow = ["2026-01", "2026-02", "2026-03"].map((month) => {
    const rows = accepted.filter((row) => row.date.startsWith(month));
    const inflowCents = rows.filter((row) => row.direction === "credit").reduce((sum, row) => sum + row.cents, 0);
    const outflowCents = rows.filter((row) => row.direction === "debit").reduce((sum, row) => sum + row.cents, 0);
    return { month, inflowCents, outflowCents, netCents: inflowCents - outflowCents };
  });
  const metrics = {
    sourceRows: sourceRows.length, acceptedRows: accepted.length,
    inflowCents: cashflow.reduce((sum, month) => sum + month.inflowCents, 0),
    outflowCents: cashflow.reduce((sum, month) => sum + month.outflowCents, 0),
    netCents: cashflow.reduce((sum, month) => sum + month.netCents, 0),
    budgetCents: budget.reduce((sum, item) => sum + item.budgetCents, 0),
    budgetSpentCents: budget.reduce((sum, item) => sum + item.actualCents, 0),
    reviewItems: exceptions.length + reconciliation.filter((statement) => statement.state === "HOLD").length,
    reconciledStatements: reconciliation.filter((statement) => statement.state === "PASS").length
  };
  return {
    sourceFacts: { synthetic: true, seed: controls.seed, period: controls.period, sourceLabel: controls.sourceLabel,
      rowCount: sourceRows.length, statements: controls.statements, budgetsCents: controls.budgetsCents },
    accepted, derived: { metrics, budget, cashflow, reconciliation },
    manualReview: { exceptions, heldStatements: reconciliation.filter((statement) => statement.state === "HOLD") },
    auditTrail
  };
}

export function exportView(result) {
  return { schema: "ff-synthetic-demo-v1", sourceFacts: result.sourceFacts, accepted: result.accepted,
    derived: result.derived, manualReview: result.manualReview, auditTrail: result.auditTrail };
}
