# Product

## Register

product

## Users

Operations leaders and reviewers evaluating whether a household-finance import is usable. A hiring director also needs to understand the control philosophy quickly. All visible records are fictional.

## Product Purpose

Make import acceptance, statement reconciliation, category review, and source-to-output explanation visible in one synthetic control desk. The first action is to inspect the held statement and decide what source evidence is needed to resolve its MX$7.31 mismatch.

## Five-second question

Which figures are usable, what is held, why, and who must review it next?

## First decision

Open the reconciliation hold and inspect the source facts before treating the held statement as reconciled.

## Verified evidence

`data/synthetic-sample.csv` and `data/controls.json` are fixed-seed synthetic inputs. `src/engine.mjs` derives acceptance, calculations, category states, and reconciliation; tests and verification compare the committed fixture to the generator. The export is a sample audit trail, not a complete record of every original rejected row.

## Limitations and prohibited claims

This is a separate public illustration of selected ideas from the private Finanzas Familiares project. It does not reproduce the private application, data, multi-bank pipeline, or deployment. Accepted transaction rows may still have a category requiring review. A statement-level reconciliation HOLD does not remove its accepted rows from dashboard calculations. Historical gold intake and categorization are not claimed as finished private features.

## Brand Personality

Calm, exact, and accountable. An exception should be impossible to miss, while accepted figures remain clearly scoped.

## Anti-references

Avoid a five-card KPI strip with equal emphasis, tiny table text, rainbow charts, a ledger that looks final despite a held statement, and finance imagery implying a real account.

## Design Principles

1. Lead with the exception and required review action.
2. Separate accepted transaction facts from category review and statement reconciliation.
3. Derive displayed counts and money from the fixture, never from page copy.
4. Keep the synthetic boundary visible beside the financial figures.

## Accessibility & Inclusion

Target WCAG AA, visible keyboard focus, 44px primary targets, readable 16px body text, labeled diagram and text equivalent, no color-only status, reduced motion, and no horizontal overflow from 390px through desktop widths.
