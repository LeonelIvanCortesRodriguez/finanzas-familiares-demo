# Product

## Register

product

## Surface registers

The default register above governs the control-desk application (`index.html`, `app.js`, `styles.css`). Work on that surface loads Impeccable's product reference (`reference/product.md`).

The README hero, GitHub social preview, demonstration recordings, and any portfolio landing page are brand surfaces. Work on those loads the brand reference (`reference/brand.md`), and brand permissions (committed or drenched color, display type, art direction) apply only there. Brand surfaces still keep every claim and evidence boundary in this file.

## Product promise

A fictional household bank export, checked line by line: the demo shows which figures can be relied on and keeps every duplicate, bad row, and unbalanced statement in front of a person until it is resolved.

The demo processes only its bundled, fixed-seed sample. It has no upload or import from real accounts, and no presentation surface may imply one.

## Users

A household member who keeps the family's books and wants to know whether this month's numbers can be trusted. Also the operations or finance leader who reviews Leonel's work and asks a sharper question: does this system know the difference between a figure it calculated and a figure someone confirmed? All visible data is fictional.

## Problem

A finance dashboard looks settled even when the import underneath it contains repeated rows, a malformed amount, or a statement whose closing balance does not match. Most tools either hide those problems or quietly "fix" them. Either way the person reading the totals cannot tell what is safe to use.

## How the workflow runs

`source records → validation and reconciliation → exceptions → usable financial view`

On the bundled fictional pack: 52 source rows arrive. 49 are accepted, 2 duplicates and 1 malformed amount are excluded. Of two statements, one reconciles and one is held for a MX$7.31 difference. One accepted row still needs a category from a person. Those numbers must always be read from `processImport` output, never typed by hand.

## Who calculates, who confirms

| The system calculates | A person confirms |
| --- | --- |
| Date and integer-cent validation | Whether an excluded row was really invalid |
| Duplicate fingerprints | Whether a held duplicate is a true repeat |
| Category from named keyword rules | Any category the rules could not assign |
| Calculated statement closing | Why a declared closing does not match, and what to do about it |
| Cash flow and budget variance from accepted rows | Whether the figures are fit for a decision |

The system never invents a correction.

## Boundaries the presentation must keep visible

- **Fictional data.** Every record, label, and amount is generated from seed `20261026`. No bank, account, workbook, or private Finanzas Familiares record is connected or copied.
- **Privacy.** No upload, no network import, local server bound to `127.0.0.1`, privacy scan in `npm run verify`.
- **Scope.** This is a separate public illustration of control ideas from Leonel's private Finanzas Familiares project. Private-project stages (multi-bank intake, household history and reversal, historical gold intake, categorization) are not claimed as complete.

## Evidence status

- **Implemented and tested:** validation, duplicate holding, category rules, reconciliation, the review queue, and the audit-trail export. Tests use planted defects; the mutation check proves balance, duplicate, and amount defects are caught.
- **Inferred, not claimed:** usefulness for real household data.
- **Unsupported, never claim:** financial advice, a trained categorizer, production readiness, real users.

## Leonel's contribution

Leonel set the product goal and the control requirements: source-to-output traceability, explicit review states, and a control view an operations leader can read quickly. Coding agents helped implement this public demonstration. Its logic and fixtures were written for this repository.

## Five-second test

A reader should leave the first screen knowing: "It checks household financial records before showing totals. It flags what a person must review. The data is fictional, and I can open the demo."

## Brand personality

Careful, plain-spoken, domestic. A trusted friend who is good with money and checks the statement against the receipts before saying a word. Calm about the normal case, unmistakable about the exception.

## Anti-references

- Standard fintech: navy and gold, glossy cards, credit-card mockups, upward-arrow growth charts.
- The former forest-green identity, which now overlaps Local AI Workcell.
- Banking-app imitation, or anything implying a real institution or account.
- Equal KPI strips that give a held statement the same weight as a routine total.
- Stock photos of families, piggy banks, or coins.

## Design principles

1. **The exception leads.** A held statement outranks every routine total.
2. **Calculated and confirmed look different.** A reader can tell at a glance who stands behind each figure.
3. **Excluded rows stay visible.** They are struck through with a reason, never deleted from view.
4. **The fictional boundary travels with the numbers.** It sits beside the figures, not in a footer.

## Accessibility & inclusion

WCAG 2.2 AA in both themes. Amounts must be unambiguous: hyperlegible figures, tabular alignment, explicit sign and currency. Body text at least 16px. Status uses shape and label as well as color. Labeled diagram with text equivalent, visible focus, 44px primary targets, reduced motion, and no horizontal overflow from 390px through desktop widths.
