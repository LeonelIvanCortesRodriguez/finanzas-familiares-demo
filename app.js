import { processImport, exportView } from "./src/engine.mjs";

const $ = (selector) => document.querySelector(selector);
const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(cents / 100);
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
let current = null;

function metric(label, value, note, index, tone = "") {
  return `<article class="metric ${tone}"><div class="metric-top"><span class="metric-label">${escape(label)}</span><span class="metric-index">0${index}</span></div><div class="metric-value">${escape(value)}</div><div class="metric-note">${escape(note)}</div></article>`;
}

function renderMetrics(result) {
  const m = result.derived.metrics;
  const gap = m.budgetCents - m.budgetSpentCents;
  $("#metrics").innerHTML = [
    metric("Net movement", money(m.netCents), "Accepted credits less accepted debits", 1),
    metric("Rows accepted", String(m.acceptedRows), `${m.sourceRows} fictional source rows imported`, 2),
    metric("Reconciled", `${m.reconciledStatements} / ${result.derived.reconciliation.length}`, "Declared versus calculated closing", 3, "warn"),
    metric("Review queue", String(m.reviewItems).padStart(2, "0"), "Row issues plus held statements", 4, "danger"),
    metric("Budget headroom", money(gap), "Six planned categories, three months", 5, gap < 0 ? "danger" : "")
  ].join("");
}

function renderDecision(result) {
  const { sourceRows, acceptedRows } = result.derived.metrics;
  const exceptions = result.manualReview.exceptions;
  const duplicates = exceptions.filter((item) => item.kind === "DUPLICATE").length;
  const invalid = exceptions.filter((item) => item.kind === "VALIDATION").length;
  const categoryReview = exceptions.filter((item) => item.kind === "CATEGORY").length;
  const statements = result.derived.reconciliation;
  const reconciled = statements.filter((item) => item.state === "PASS").length;
  const held = result.manualReview.heldStatements;
  const primaryHold = held[0];
  const difference = primaryHold ? money(Math.abs(primaryHold.differenceCents)) : "";

  $("#hero-title").textContent = primaryHold
    ? `One statement is held for ${difference}.`
    : "All sample statements reconcile.";
  $("#heroConclusion").textContent = `${sourceRows} fictional rows → ${acceptedRows} accepted; ${duplicates} duplicates and ${invalid} invalid row excluded. Accepted rows feed the figures, including the held statement.`;
  $("#holdHeadline").textContent = primaryHold
    ? `${primaryHold.statementId}: closing balance needs review`
    : "No statement reconciliation hold";
  $("#holdExplanation").textContent = primaryHold
    ? `${difference} separates declared and calculated closing. Check source closing and row evidence before resolving the HOLD; no automatic correction is made.`
    : "The sample statements match their calculated closings. Review row-level category and validation items separately.";
  $("#heroState").dataset.state = primaryHold ? "hold" : "pass";

  $("#heroMicroFlow").innerHTML = `<div><span>Rows</span><strong>${sourceRows} → ${acceptedRows}</strong><small>accepted into figures</small></div>
    <div><span>Statements</span><strong>${statements.length} → ${held.length}</strong><small>${held.length === 1 ? "closing HOLD" : "closing HOLDs"}</small></div>`;
  $("#heroMicroFlow").setAttribute("aria-label", `${sourceRows} source rows to ${acceptedRows} accepted; ${statements.length} statements checked, ${held.length} closing holds`);

  $("#importFlow").innerHTML = `<figcaption>Two control gates, ${held.length} unresolved closing ${held.length === 1 ? "balance" : "balances"}</figcaption>
    <div class="flow-track" aria-label="Row acceptance">
      <div class="flow-node"><strong>${sourceRows}</strong><span>source rows</span></div><span class="flow-arrow" aria-hidden="true">→</span>
      <div class="flow-node accepted"><strong>${acceptedRows}</strong><span>accepted into figures</span></div>
      <div class="flow-split"><span>${duplicates} duplicates excluded</span><span>${invalid} invalid excluded</span></div>
    </div>
    <div class="flow-track" aria-label="Statement reconciliation">
      <div class="flow-node"><strong>${statements.length}</strong><span>statements checked</span></div><span class="flow-arrow" aria-hidden="true">→</span>
      <div class="flow-node accepted"><strong>${reconciled}</strong><span>reconciled</span></div>
      <div class="flow-node ${held.length ? "held" : "accepted"}"><strong>${held.length}</strong><span>${held.length ? `HOLD · ${escape(difference)}` : "held"}</span></div>
    </div>
    <p class="flow-note">${categoryReview} accepted row${categoryReview === 1 ? " has" : "s have"} an unresolved category. A statement HOLD is a separate balance review and does not remove its accepted rows from calculated figures.</p>`;
}

function renderCashflow(result) {
  const max = Math.max(...result.derived.cashflow.flatMap((x) => [x.inflowCents, x.outflowCents]));
  $("#cashflowBars").innerHTML = result.derived.cashflow.map((item) => {
    const credit = Math.round(item.inflowCents / max * 100);
    const debit = Math.round(item.outflowCents / max * 100);
    return `<div class="month-row"><span class="month-label">${escape(item.month.slice(-2))} / 26</span><div><div class="bar-track" aria-label="${escape(item.month)} inflow ${escape(money(item.inflowCents))}, outflow ${escape(money(item.outflowCents))}"><span class="bar-credit" style="width:${credit / 2}%"></span><span class="bar-debit" style="width:${debit / 2}%"></span></div></div><span class="bar-value">${escape(money(item.netCents))}</span></div>`;
  }).join("") + `<div class="chart-legend"><span><i class="credit"></i> Inflow</span><span><i class="debit"></i> Outflow</span><span>Right: net</span></div>`;
}

function renderBudget(result) {
  $("#budgetBars").innerHTML = result.derived.budget.map((item) => {
    const ratio = Math.min(100, Math.round(item.actualCents / item.budgetCents * 100));
    return `<div class="budget-row"><span class="budget-name">${escape(item.category)}</span><div class="budget-track" aria-label="${escape(item.category)} spent ${escape(money(item.actualCents))} of ${escape(money(item.budgetCents))}"><div class="budget-fill ${item.state === "OVER" ? "over" : ""}" style="width:${ratio}%"></div></div><span class="budget-value"><strong>${escape(money(item.actualCents))}</strong> of ${escape(money(item.budgetCents))}</span></div>`;
  }).join("");
}

function renderControls(result) {
  $("#reconRows").innerHTML = result.derived.reconciliation.map((item) => `<tr><td><strong>${escape(item.statementId)}</strong></td><td class="num">${escape(money(item.openingCents))}</td><td class="num">${escape(money(item.movementCents))}</td><td class="num">${escape(money(item.declaredClosingCents))}</td><td class="num">${escape(money(item.differenceCents))}</td><td><span class="state-pill ${item.state === "PASS" ? "state-pass" : "state-hold"}">${escape(item.state)}</span></td></tr>`).join("");
  const exceptions = [...result.manualReview.exceptions, ...result.manualReview.heldStatements.map((item) => ({ rowId: item.statementId, kind: "RECONCILIATION", state: "HOLD", reason: `Declared close differs by ${money(item.differenceCents)}.` }))];
  $("#exceptionRows").innerHTML = exceptions.length ? exceptions.map((item) => `<div class="exception ${item.kind === "VALIDATION" ? "invalid" : ""}"><div class="exception-top"><strong>${escape(item.rowId)} · ${escape(item.kind)}</strong><span class="state-pill ${item.state === "REVIEW" ? "state-review" : "state-invalid"}">${escape(item.state)}</span></div><p>${escape(item.reason)}</p></div>`).join("") : `<p class="empty">No manual review items.</p>`;
}

function renderLedger() {
  if (!current) return;
  const query = $("#ledgerSearch").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const rows = current.accepted.filter((item) => (category === "all" || item.category === category) && [item.id, item.description, item.statementId].some((value) => value.toLowerCase().includes(query)));
  $("#ledgerCount").textContent = `${rows.length} of ${current.accepted.length} accepted rows shown`;
  $("#ledgerRows").innerHTML = rows.length ? rows.map((item) => `<tr><td data-label="Source ID"><strong>${escape(item.id)}</strong><small>Source</small></td><td data-label="Date">${escape(item.date)}</td><td data-label="Label" class="description">${escape(item.description)}</td><td data-label="Statement">${escape(item.statementId)}</td><td data-label="Direction">${escape(item.direction)}</td><td data-label="Amount" class="num">${escape(money(item.signedCents))}</td><td data-label="Category"><strong>${escape(item.category)}</strong><small>${escape(item.ruleId || "Manual review")} · ${escape(item.categoryState)}</small></td></tr>`).join("") : `<tr><td colspan="7" class="empty-cell">No rows match these filters. Clear the search or choose another category.</td></tr>`;
}

function renderAudit(result) {
  const selected = [...result.auditTrail.filter((event) => event.state === "HOLD" || event.state === "MANUAL_REVIEW"), ...result.auditTrail.filter((event) => event.step === "RECONCILE")].slice(0, 6);
  $("#auditRows").innerHTML = selected.map((event) => `<li><strong>${escape(event.rowId)} · ${escape(event.step)} · ${escape(event.state)}</strong>${escape(event.basis)}</li>`).join("");
}

async function runImport() {
  $("#runImport").disabled = true;
  $("#loadedState").textContent = "Validating fictional sample…";
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
    $("#loadedState").textContent = `${current.derived.metrics.acceptedRows} accepted · ${current.derived.metrics.reviewItems} review items`;
  } catch (error) {
    $("#loadedState").textContent = "Import stopped";
    $("#hero-title").textContent = "The fictional import could not be verified.";
    $("#heroConclusion").textContent = escape(error.message);
    $("#holdHeadline").textContent = "No decision available";
    $("#holdExplanation").textContent = "Restore the committed sample files, then rerun the import.";
    $("#importFlow").innerHTML = `<figcaption role="alert">Import flow unavailable: ${escape(error.message)}</figcaption>`;
    $("#metrics").innerHTML = `<p class="empty" role="alert">${escape(error.message)}</p>`;
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
