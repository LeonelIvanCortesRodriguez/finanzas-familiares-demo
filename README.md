# Finanzas Familiares Demo

A small control desk for turning a fictional statement import into an explainable household-finance view. It separates the rows supplied by the sample, calculations made from accepted rows, and items a person must resolve.

![Desktop dashboard showing fictional financial controls](docs/images/dashboard-desktop.png)

## The operating problem

A dashboard can look settled even when an import contains duplicates, malformed values, or a closing balance that does not reconcile. This demonstration keeps those exceptions visible beside the cash-flow and budget views. It shows the limit of each figure instead of silently correcting the source.

Leonel set the product goal and control requirements: source-to-output traceability, explicit review states, and a dashboard an operations leader can inspect quickly. Coding agents helped implement this separate public demonstration. Its logic and fictional fixtures were created for this repository; the private Finanzas Familiares application and its records were not copied.

## Five-minute review

1. Run `npm run start` and open `http://127.0.0.1:4174`.
2. Inspect the synthetic import result at the top. The source has 52 rows; 49 are accepted. The review queue shows two duplicates, one malformed amount, one uncategorized row, and one held statement reconciliation.
3. Compare **Cash flow** and **Budget** with the accepted ledger. Search a sample row, then open **Controls** to see why a source line or statement is held.
4. Use **Export audit packet** to inspect `sourceFacts`, `derived`, `manualReview`, and `auditTrail` as separate JSON fields.
5. Run `npm run verify` and `npm run build` for the proof commands and deterministic release package.

## Run and verify

Requires Node.js 20+ and Python 3.10+ for ZIP packaging. No paid API, database, login, or package install is needed.

```powershell
npm run start
npm run verify
npm run build
```

The sample is committed so the app works immediately. `npm run generate` recreates its CSV and controls from seed `20261026`; `node scripts/verify.mjs` checks that the committed files still match the generator. The local server binds to `127.0.0.1` only. Tests use Node's built-in test runner and intentionally planted data defects. The build writes `release/finanzas-familiares-demo.zip` and `release/CONTENT_INVENTORY.sha256`.

## Workflow and evidence

`src/sample.mjs` generates 48 valid baseline rows, two repeated rows, one valid uncategorized row, and one malformed amount. `src/engine.mjs` validates dates and integer cents, normalizes labels, applies named category rules, holds duplicate fingerprints, and calculates each statement's closing from accepted rows. One fictional statement reconciles; the other has an intentional `7.31` difference. The dashboard does not invent a correction.

The sample uses generic labels and statement aliases. Source balances, generated CSV rows, and budget limits are marked as **source facts**. Categories, cash flow, budget variance, and calculated closings are **derived**. Validation holds, duplicates, unknown categories, and reconciliation differences remain in **manual review**. The JSON export includes row-level rule explanations and an audit trail.

## Privacy and provenance

Every record, date, label, and amount in this repository is fictional. There is no connection to a bank, household account, employer, private workbook, production database, OCR corpus, or the private FF application. The interface imports only its bundled synthetic sample; it has no arbitrary document upload. No third-party runtime code or external font is shipped. See [SECURITY.md](SECURITY.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Limits

The fixed-seed dataset and keyword rules demonstrate control flow, not financial advice, a trained categorizer, or production readiness. Reconciliation differences and category holds require human resolution. Leonel licenses this demonstration under MIT; see [LICENSE](LICENSE). A public repository, hosting, and any LinkedIn use require separate authorization.
