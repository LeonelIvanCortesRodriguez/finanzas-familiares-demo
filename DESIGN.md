# Design system: Finanzas Familiares Demo

## Visual theme

The kitchen-table check. Picture an evening at home: a laptop next to a printed statement, a pen ticking each line, two lines struck out with a note in the margin, and one total circled because it does not match. The product is that pen. Petrol ink means "the system checked this"; terracotta means "a person has to look".

Physical scene: one person, evening lamp light, reviewing the month before making a family decision. That person needs calm figures and an unmissable exception, which favors a light theme by default. Dark is a separate low-light design, not an inversion.

Color strategy: **restrained** in the product (two meaningful hues), **drenched** in the social preview (a petrol field with a white statement strip).

## Mark and wordmark

- **Mark:** a reconciliation tick. A short petrol horizontal rule (a statement line) with a tick rising from its right end; a small terracotta dot sits beside the tick, the one line that still needs a person. Square format, no container. At 16px the dot is dropped.
- **Wordmark:** "Finanzas Familiares" in Atkinson Hyperlegible Next 700, with "Demo" set in the same face at 400 and in `--ink-2`, so it is always present and never shouts.

## Color tokens

OKLCH. Measured contrast in brackets.

| Role | Light | Dark | Meaning (stable) |
| --- | --- | --- | --- |
| `--bg` | `0.975 0.004 215` | `0.20 0.02 220` | Page |
| `--surface` | `1 0 0` | `0.24 0.022 220` | Statement sheet |
| `--ink` | `0.24 0.035 220` [15.2:1] | `0.95 0.008 215` [15.6:1] | Text and figures |
| `--ink-2` | `0.42 0.03 220` [7.8:1] | `0.80 0.015 215` [8.8:1] | Secondary text, excluded rows |
| `--line` | `0.66 0.02 215` [3.1:1] | `0.56 0.02 215` [3.6:1] | Rules and borders |
| `--calc` | `0.42 0.07 205` [8.2:1] | `0.80 0.08 200` [9.0:1] | Checked or calculated by the system |
| `--calc-soft` | `0.94 0.02 205` | `0.30 0.04 205` | Background for checked regions (calc text on it 6.9:1 / 7.4:1) |
| `--person` | `0.48 0.13 40` [6.9:1] | `0.78 0.11 45` [7.9:1] | Needs a person: hold, review, unknown category |
| `--person-soft` | `0.94 0.03 45` | `0.30 0.05 45` | Background for the held region (person text on it 5.8:1 / 6.7:1) |

The former forest green, amber, red, and blue are retired. Invalid rows no longer get red: an excluded row is struck through in `--ink-2` with its reason, because a person confirms exclusions too. Two hues, two meanings.

## Status language

| Status | Shape | Text |
| --- | --- | --- |
| Accepted | Petrol tick | Accepted |
| Source fact | Document corner (folded square) outline | Source |
| Derived | Equals sign in a circle | Calculated |
| Excluded | Row struck through, cross at line start | Duplicate · Invalid amount |
| Needs review | Terracotta open circle around the value | Needs a person |
| Statement HOLD | Terracotta ring with the difference written inside the region | Held · MX$7.31 difference |

## Typography

- **Atkinson Hyperlegible Next** (OFL) for all text. Its distinct letterforms keep 1, l, and I apart and 0 and O apart, which matters when someone is checking amounts. Body 17px, line-height 1.55.
- **Atkinson Hyperlegible Mono** (OFL) for amounts in tables and the ledger, so cents align. Amounts always carry sign and currency: `−MX$1,240.00`.
- Scale 14 / 17 / 21 / 26 / 33 / 42 / 54px (1.25 ratio). Hero clamp(2.25rem, 5vw, 3.4rem), letter-spacing -0.01em, `text-wrap: balance`.
- Georgia and the serif headings are retired; the identity no longer leans on an editorial serif.
- The live page self-hosts Latin woff2 subsets of both families. Nothing loads from a third-party font service, which keeps the README's privacy statement true.

## Layout

- First fold, in order: wordmark plus promise, the flow figure, the held statement as the largest region, and the "fictional data, no bank connection" boundary placed directly beside the figures.
- The current five-card KPI strip with numbered markers (01 to 05) is removed. Routine totals become one compact line under the hold; the hold keeps the visual weight.
- The desktop navigation rail stays, recolored to `--ink` on `--surface` with a petrol current-item marker (a full background tint, no side stripe). Numbered labels are dropped.
- At 390px the rail becomes a top bar and the ledger table stacks with labels. Amounts never wrap.
- Prose 65ch; tables up to 1100px; gutters 24px desktop, 16px mobile.

## Diagram language

- **Primary flow:** `source records → validation and reconciliation → exceptions → usable view`, as four regions joined by labeled connectors. Counts come from `processImport` at build time: 52 → 49 accepted (2 duplicates, 1 invalid set aside) → 1 statement held, 1 category to review → figures shown with the hold beside them.
- The exceptions region is the only terracotta region in the figure.
- A second small figure, "who calculates, who confirms", splits each check into a petrol column and a terracotta column.
- SVG with `<title>` and `<desc>`, text equivalent directly below.

## Media treatment

- **README hero:** light and dark PNGs through `<picture>`: wordmark, promise, and the flow figure with a statement strip in which two rows are struck and one total is circled.
- **Social preview:** 1280 × 640 on a petrol field; a white statement strip runs across with ticks, two struck rows, and the terracotta hold; wordmark and promise at left. The words "Fictional data" appear on the strip itself.
- **Demonstration:** one complete job in 10 to 15 seconds: open the held statement, compare declared and calculated closing, see the rows behind it, export the audit trail. GIF for README (under 2.5MB, 960px), MP4 for Pages.
- **Product views:** three annotated captures (overview with hold, controls view, exported audit JSON with `sourceFacts`, `derived`, and `manualReview` labeled). Annotations sit outside the capture.

## Motion

- Only on state change: the hold region draws its ring once (300ms, ease-out-quart) when the statement is opened; struck rows draw their line left to right (200ms).
- Reduced motion shows the final state immediately. Everything is visible without JavaScript-driven reveals.

## Do

- Keep calculated and confirmed visibly different on every surface.
- Write the fictional boundary next to figures.
- Use the mono face for every amount column.

## Don't

- Navy, gold, gradient cards, credit-card shapes, coins, piggy banks, or growth arrows.
- Forest green (it now belongs to nobody, and it overlapped Local AI Workcell).
- Cream or parchment backgrounds.
- Red for excluded rows, side-stripe alerts, or equal-weight KPI tiles.
