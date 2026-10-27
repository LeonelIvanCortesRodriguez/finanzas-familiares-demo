# Design system: Finanzas Familiares Demo

## Visual theme

The kitchen-table check. Picture an evening at home: a laptop next to a printed statement, a pen ticking each line, two lines struck out with a note in the margin, and one total circled because it does not match. The product is that pen. Petrol ink means "the system checked this"; terracotta means "a person has to look".

Physical scene: one person, evening lamp light, reviewing the month before making a family decision. That person needs calm figures and an unmissable exception, which favors a light theme by default. Dark is a separate low-light design, not an inversion.

Color strategy: **restrained** in the product (two meaningful hues), **drenched** in the social preview (a petrol field with a white statement strip).

## Mark and wordmark

- **Mark:** a reconciliation tick. A short petrol horizontal rule (a statement line) with a tick rising from its right end; a small terracotta dot sits beside the tick, the one line that still needs a person. Square format, no container. At 16px the dot is dropped.
- **Wordmark:** "Finanzas Familiares" in Atkinson Hyperlegible Next 700, with "Demo" set in the same face at 400 and in `--ink-2`, so it is always present and never shouts.

## Color tokens

OKLCH. `scripts/contrast-check.mjs` reads this table and tests every named pair in both themes; `npm run test:contrast` fails on any pair below its minimum, and the retained output is `docs/CONTRAST_CHECK.txt`.

| Role | Light | Dark | Meaning (stable) |
| --- | --- | --- | --- |
| `--bg` | `0.975 0.004 215` | `0.20 0.02 220` | Page |
| `--surface` | `1 0 0` | `0.24 0.022 220` | Statement sheet |
| `--ink` | `0.24 0.035 220` | `0.95 0.008 215` | Text and figures |
| `--ink-2` | `0.42 0.03 220` | `0.80 0.015 215` | Secondary text, excluded rows |
| `--line` | `0.64 0.02 215` | `0.56 0.02 215` | Rules and borders |
| `--calc` | `0.42 0.07 205` | `0.80 0.08 200` | Checked or calculated by the system |
| `--calc-soft` | `0.94 0.02 205` | `0.30 0.04 205` | Background for checked regions |
| `--person` | `0.48 0.13 40` | `0.78 0.11 45` | Needs a person: hold, review, unknown category |
| `--person-soft` | `0.94 0.03 45` | `0.30 0.05 45` | Background for the held region |
| `--on-calc` | `1 0 0` | `0.20 0.02 220` | Text on a calc-filled button |
| `--rail` | `0.30 0.045 215` | `0.16 0.02 220` | Navigation rail and social-preview field |
| `--rail-ink` | `0.97 0.006 215` | `0.95 0.008 215` | Text on the rail |

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
- The five-card KPI strip with numbered markers (01 to 05) is removed. Routine totals become one compact line under the flow; the hold keeps the visual weight.
- Statement reconciliation spans the full content width so all seven columns stay visible from 840px up; the items a person must resolve follow as a responsive grid of cards.
- The desktop navigation rail stays, recolored to `--ink` on `--surface` with a petrol current-item marker (a full background tint, no side stripe). Numbered labels are dropped.
- At 390px the rail becomes a top bar and the ledger table stacks with labels. Amounts never wrap.
- Prose 65ch; tables up to 1100px; gutters 24px desktop, 16px mobile.

## Diagram language

- **Primary flow:** `source records → validation and reconciliation → exceptions → usable view`, as four regions joined by labeled connectors. Counts come from `processImport` at build time: 52 → 49 accepted (2 duplicates, 1 invalid set aside) → 1 statement held, 1 category to review → figures shown with the hold beside them.
- The exceptions region is the only terracotta region in the figure.
- A second small figure, "who calculates, who confirms", splits each check into a petrol column and a terracotta column.
- SVG with `<title>` and `<desc>`, text equivalent directly below.

## Media treatment

- **README hero:** `docs/brand/hero-light.png` and `hero-dark.png` through `<picture>`, rendered at 1280 × 700 CSS pixels and 1.5× density, about 190KB each. They show the wordmark, the headline "Check every line before trusting the totals.", a statement strip built from real sample rows (three accepted, SYN-049 struck as a duplicate, SYN-051 circled for a category, SYN-052 struck as invalid, and the STATEMENT-02 hold), and the four-step flow with engine counts.
- **Social preview:** `docs/brand/social-preview.png`, 1280 × 640 on the deep petrol rail color with the same statement strip; text sits at least 64px inside the edges.
- **Demonstration:** `docs/brand/demo.gif` (960px, about 320KB) and `demo.mp4`: five captioned stills of the running demo, from the held statement to the audit-trail section. The caption bar is added for the recording only. The README wraps the GIF in `<picture>` with a `prefers-reduced-motion` source that shows the first frame instead.
- **Product views:** three annotated captures shown at 1:1 beside numbered notes: held items, the import flow, and the 390px phone layout.
- Everything is generated by `design/render.mjs` from the fixed-seed sample and the running demo.

## Motion

- The demo does not animate. State is shown by shape, label, and position, and nothing waits on a transition to become visible.
- In-page links scroll smoothly; `prefers-reduced-motion: reduce` turns that off.

## Do

- Keep calculated and confirmed visibly different on every surface.
- Write the fictional boundary next to figures.
- Use the mono face for every amount column.

## Don't

- Navy, gold, gradient cards, credit-card shapes, coins, piggy banks, or growth arrows.
- Forest green (it now belongs to nobody, and it overlapped Local AI Workcell).
- Cream or parchment backgrounds.
- Red for excluded rows, side-stripe alerts, or equal-weight KPI tiles.
