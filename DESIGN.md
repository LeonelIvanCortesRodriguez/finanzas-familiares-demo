# Design system

## Direction

An exception-first financial control sheet. Keep the existing forest/neutral identity and restrained serif headings. The first viewport gives the held reconciliation more weight than routine totals; a compact flow explains how imported rows become accepted or excluded.

## Typography and density

Use Arial/system sans for controls and Georgia for editorial headings only. Body text is normally at least 16px, support text at least 14px, and 12px only for nonessential metadata. Table cells must remain legible at desktop and stack with labels on mobile. Limit prose to 55–80 characters per line.

## Tokens and states

Maintain independent light and dark tokens for paper, surface, ink, line, primary action, and semantic status. Forest is the operating accent; amber means review/hold; red means invalid source input; blue means source fact. Each status includes its name and reason. Meet AA contrast for normal text and controls in both themes.

## Spacing and layout

Preserve a compact navigation rail on desktop, but allow the main report to dominate. Use fewer, larger regions with clear hierarchy instead of equal KPI cards or nested panels. The hold occupies a prominent region in the first viewport. At 390px, the rail becomes a simple reachable top navigation and all panels stack without overflow.

## Information graphic

The import flow is derived from `processImport` results: imported rows to accepted/duplicate/invalid, then statements to pass/hold. Labels explain that accepted rows with category review remain accepted and that a statement hold affects reconciliation status, not transaction inclusion. Give the graphic an accessible name and adjacent text equivalent.

## Motion and interaction

Use motion only for state changes. Honor reduced motion and keep all content readable with animations disabled. Primary action buttons have clear verbs and at least 44px height. Focus is visible and the held exception is reachable by keyboard.

## Responsive behavior and rejected patterns

Check 1440x900, 1366x768, 1024x768, and 390x844 in both themes. Reject tiny labels, repeated eyebrow strips, equal-weight KPIs, side-stripe alerts, fake terminal cues, and any wording that implies live financial data.
