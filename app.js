import { processImport, exportView } from "./src/engine.mjs";

const $ = (selector) => document.querySelector(selector);
const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(cents / 100);
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
let current = null;

// Status glyphs: shape carries the meaning, color repeats it (see DESIGN.md, status language).
const glyph = {
  accepted: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><path class="g-tick" d="M4 10.5l4 4 8-9"/></svg>',
  excluded: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><path class="g-cross" d="M5 5l10 10M15 5L5 15"/></svg>',
  review: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><circle class="g-hold" cx="10" cy="10" r="7.5"/></svg>',
  hold: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><circle class="g-hold" cx="10" cy="10" r="7.5"/><circle class="g-hold-dot" cx="10" cy="10" r="2.5"/></svg>',
  source: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><path class="g-source" d="M4 2h8l4 4v12H4z M12 2v4h4"/></svg>',
  derived: '<svg class="glyph" viewBox="0 0 20 20" aria-hidden="true"><circle class="g-derived" cx="10" cy="10" r="7.5"/><path class="g-derived" d="M6.5 8.5h7M6.5 11.5h7"/></svg>'
};
const tag = (kind, label) => `<span class="tag tag-${kind}">${glyph[kind]}${escape(label)}</span>`;
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

function counts(result) {
  const exceptions = result.manualReview.exceptions;
  const statements = result.derived.reconciliation;
  return {
    sourceRows: result.derived.metrics.sourceRows,
    acceptedRows: result.derived.metrics.acceptedRows,
    duplicates: exceptions.filter((item) => item.kind === "DUPLICATE").length,
    invalid: exceptions.filter((item) => item.kind === "VALIDATION").length,
    categoryReview: exceptions.filter((item) => item.kind === "CATEGORY").length,
    statements: statements.length,
    reconciled: statements.filter((item) => item.state === "PASS").length,
    held: result.manualReview.heldStatements
  };
}

function renderDecision(result) {
  const c = counts(result);
  const primaryHold = c.held[0];
  const difference = primaryHold ? money(Math.abs(primaryHold.differenceCents)) : "";

  $("#hero-title").textContent = primaryHold ? `One statement is held for ${difference}.` : "All sample statements reconcile.";
  $("#heroConclusion").textContent = `A fictional household bank export, ${c.sourceRows} rows checked before anyone trusts the totals: ${c.acceptedRows} accepted, ${plural(c.duplicates, "duplicate", "duplicates")} and ${plural(c.invalid, "invalid row", "invalid rows")} set aside. The figures below use the accepted rows, and the held statement stays in front of a person until someone resolves it.`;
  $("#holdHeadline").textContent = primaryHold ? `${primaryHold.statementId}: the closing balance does not match` : "No statement is held";
  $("#holdExplanation").textContent = primaryHold
    ? `Declared and calculated closings differ by ${difference}. Check the source closing and the rows behind it before resolving the hold. The system makes no automatic correction.`
    : "The sample statements match their calculated closings. Category and validation items are reviewed separately.";
  $("#heroState").dataset.state = primaryHold ? "hold" : "pass";

  const setAside = c.duplicates + c.invalid;
  $("#importFlow").innerHTML = `<figcaption class="visually-hidden">Import check: ${c.sourceRows} source rows; ${c.acceptedRows} accepted and ${setAside} set aside; ${c.statements} statements checked, ${c.reconciled} reconciled and ${c.held.length} held; ${result.derived.metrics.reviewItems} items for a person; figures calculated from the accepted rows.</figcaption>
    <ol class="flow-steps">
      <li class="flow-step"><span class="flow-label">Source records</span><strong>${c.sourceRows}</strong><span>fictional rows in ${c.statements} statements</span>${tag("source", "Source facts")}</li>
      <li class="flow-step"><span class="flow-label">Validation and reconciliation</span><strong>${c.acceptedRows}</strong><span>rows accepted</span>
        <ul class="flow-detail"><li>${glyph.excluded}${plural(c.duplicates, "duplicate", "duplicates")} set aside</li><li>${glyph.excluded}${plural(c.invalid, "malformed amount", "malformed amounts")} set aside</li><li>${glyph.accepted}${c.reconciled} of ${c.statements} statements reconcile</li></ul></li>
      <li class="flow-step flow-exceptions"><span class="flow-label">Exceptions for a person</span><strong>${result.derived.metrics.reviewItems}</strong><span>${c.held.length ? `items, including a ${escape(difference)} hold` : "items to confirm"}</span>
        <ul class="flow-detail"><li>${glyph.hold}${plural(c.held.length, "closing balance", "closing balances")} held</li><li>${glyph.review}${plural(c.categoryReview, "category", "categories")} to assign</li><li>${glyph.excluded}${plural(setAside, "set-aside row", "set-aside rows")} to confirm</li></ul></li>
      <li class="flow-step"><span class="flow-label">Usable financial view</span><strong>${c.acceptedRows}</strong><span>rows feed cash flow and budget</span>${tag("derived", "Calculated")}</li>
    </ol>
    <p class="flow-note">A statement hold questions that statement's closing balance. It does not remove its accepted rows from the calculated figures.</p>`;
}

function renderMetrics(result) {
  const m = result.derived.metrics;
  const gap = m.budgetCents - m.budgetSpentCents;
  $("#metrics").innerHTML = `${glyph.accepted.replace('class="glyph"', 'class="glyph glyph-derived"')}<span>Calculated from ${m.acceptedRows} accepted rows: net movement <strong>${escape(money(m.netCents))}</strong> · budget headroom <strong>${escape(money(gap))}</strong> · <strong>${m.reconciledStatements} of ${result.derived.reconciliation.length}</strong> statements reconciled</span>`;
}

function renderCashflow(result) {
  const max = Math.max(...result.derived.cashflow.flatMap((x) => [x.inflowCents, x.outflowCents]));
  $("#cashflowBars").innerHTML = result.derived.cashflow.map((item) => {
    const credit = Math.round(item.inflowCents / max * 100);
    const debit = Math.round(item.outflowCents / max * 100);
    return `<div class="month-row"><span class="month-label">${escape(item.month)}</span><div class="bars" role="img" aria-label="${escape(item.month)}: inflow ${escape(money(item.inflowCents))}, outflow ${escape(money(item.outflowCents))}"><span class="bar bar-credit" style="width:${credit}%"></span><span class="bar bar-debit" style="width:${debit}%"></span></div><span class="bar-value num">${escape(money(item.netCents))}</span></div>`;
  }).join("") + `<div class="chart-legend"><span><i class="credit"></i>Inflow</span><span><i class="debit"></i>Outflow</span><span>Right column: net</span></div>`;
}

function renderBudget(result) {
  $("#budgetBars").innerHTML = result.derived.budget.map((item) => {
    const ratio = Math.min(100, Math.round(item.actualCents / item.budgetCents * 100));
    const over = item.state === "OVER";
    return `<div class="budget-row"><span class="budget-name">${escape(item.category)}${over ? ` ${tag("review", "Over")}` : ""}</span><div class="budget-track" role="img" aria-label="${escape(item.category)}: spent ${escape(money(item.actualCents))} of ${escape(money(item.budgetCents))}${over ? ", over budget" : ""}"><div class="budget-fill ${over ? "over" : ""}" style="width:${ratio}%"></div></div><span class="budget-value num"><strong>${escape(money(item.actualCents))}</strong> of ${escape(money(item.budgetCents))}</span></div>`;
  }).join("");
}

function renderControls(result) {
  $("#reconRows").innerHTML = result.derived.reconciliation.map((item) => {
    const status = item.state === "PASS" ? tag("accepted", "Matches") : tag("hold", "Held");
    return `<tr class="${item.state === "HOLD" ? "row-hold" : ""}"><th scope="row">${escape(item.statementId)}</th><td class="num">${escape(money(item.openingCents))}</td><td class="num">${escape(money(item.movementCents))}</td><td class="num">${escape(money(item.calculatedClosingCents))}</td><td class="num">${escape(money(item.declaredClosingCents))}</td><td class="num">${escape(money(item.differenceCents))}</td><td>${status}</td></tr>`;
  }).join("");
  const held = result.manualReview.heldStatements.map((item) => ({ rowId: item.statementId, kind: "RECONCILIATION", reason: `Declared closing differs from the calculated closing by ${money(item.differenceCents)}.` }));
  const rows = [...held, ...result.manualReview.exceptions];
  const describe = {
    RECONCILIATION: ["hold", "Statement held", "exception-hold"],
    CATEGORY: ["review", "Category needed", "exception-review"],
    DUPLICATE: ["excluded", "Set aside: duplicate", "exception-excluded"],
    VALIDATION: ["excluded", "Set aside: invalid", "exception-excluded"]
  };
  $("#exceptionRows").innerHTML = rows.length ? rows.map((item) => {
    const [kind, label, className] = describe[item.kind];
    return `<div class="exception ${className}"><div class="exception-top"><strong class="exception-id">${escape(item.rowId)}</strong>${tag(kind, label)}</div><p>${escape(item.reason)}</p></div>`;
  }).join("") : `<p class="empty">No manual review items.</p>`;
}

function renderLedger() {
  if (!current) return;
  const query = $("#ledgerSearch").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const rows = current.accepted.filter((item) => (category === "all" || item.category === category) && [item.id, item.description, item.statementId].some((value) => value.toLowerCase().includes(query)));
  $("#ledgerCount").textContent = `${rows.length} of ${current.accepted.length} accepted rows shown`;
  $("#ledgerRows").innerHTML = rows.length ? rows.map((item) => {
    const needsPerson = item.categoryState === "MANUAL_REVIEW";
    return `<tr class="${needsPerson ? "row-review" : ""}"><td data-label="Source ID"><strong>${escape(item.id)}</strong></td><td data-label="Date">${escape(item.date)}</td><td data-label="Label" class="description">${escape(item.description)}</td><td data-label="Statement">${escape(item.statementId)}</td><td data-label="Direction">${escape(item.direction)}</td><td data-label="Amount" class="num">${escape(money(item.signedCents))}</td><td data-label="Category">${needsPerson ? tag("review", "Needs a person") : `<strong>${escape(item.category)}</strong>`}<small>${escape(item.ruleId || "No rule matched")}</small></td></tr>`;
  }).join("") : `<tr><td colspan="7" class="empty-cell">No rows match these filters. Clear the search or choose another category.</td></tr>`;
}

function renderAudit(result) {
  const selected = [...result.auditTrail.filter((event) => event.state === "HOLD" || event.state === "MANUAL_REVIEW"), ...result.auditTrail.filter((event) => event.step === "RECONCILE")].slice(0, 6);
  $("#auditRows").innerHTML = selected.map((event) => `<li><strong>${escape(event.rowId)} · ${escape(event.step)} · ${escape(event.state)}</strong><span>${escape(event.basis)}</span></li>`).join("");
}

async function runImport() {
  $("#runImport").disabled = true;
  $("#loadedState").textContent = "Validating the fictional sample…";
  try {
    const [csvResponse, controlResponse] = await Promise.all([fetch("data/synthetic-sample.csv"), fetch("data/controls.json")]);
    if (!csvResponse.ok || !controlResponse.ok) throw new Error("Sample files were not found. Run npm run generate.");
    const csv = await csvResponse.text(), controls = await controlResponse.json();
    current = processImport(csv, controls);
    renderDecision(current); renderMetrics(current); renderCashflow(current); renderBudget(current); renderControls(current); renderAudit(current);
    const categories = [...new Set(current.accepted.map((item) => item.category))].sort();
    $("#categoryFilter").innerHTML = `<option value="all">All categories</option>` + categories.map((item) => `<option value="${escape(item)}">${escape(item)}</option>`).join("");
    $("#ledgerSearch").disabled = false; $("#categoryFilter").disabled = false; $("#exportJson").disabled = false;
    renderLedger();
    $("#loadedState").textContent = `Checked just now: ${current.derived.metrics.acceptedRows} accepted · ${current.derived.metrics.reviewItems} items for a person`;
  } catch (error) {
    $("#loadedState").textContent = "Import stopped";
    $("#hero-title").textContent = "The fictional import could not be verified.";
    $("#heroConclusion").textContent = error.message;
    $("#holdHeadline").textContent = "No decision available";
    $("#holdExplanation").textContent = "Restore the committed sample files, then rerun the import.";
    $("#importFlow").innerHTML = `<figcaption role="alert">Import flow unavailable: ${escape(error.message)}</figcaption>`;
    $("#metrics").innerHTML = `<span role="alert">${escape(error.message)}</span>`;
  } finally { $("#runImport").disabled = false; }
}

function downloadAudit() {
  if (!current) return;
  const content = JSON.stringify(exportView(current), null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = "ff-synthetic-audit-packet.json";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("#runImport").addEventListener("click", runImport);
$("#exportJson").addEventListener("click", downloadAudit);
$("#ledgerSearch").addEventListener("input", renderLedger);
$("#categoryFilter").addEventListener("change", renderLedger);
runImport();
