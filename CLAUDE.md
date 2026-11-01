# Financial Wellness App

A free, open-source tool that meets people wherever they are financially. See `docs/concept-brief.md` for the vision, principles, and decisions. Treat it as the source of truth.

## Accessibility

Everything we build must meet **WCAG 2.2 Level AA**. This applies to every page, tool, and change, not only new features.

- Use real HTML elements (`button`, `label`, `table`) before adding custom behavior.
- Everything must work with a keyboard alone, with a visible focus indicator.
- Give every form field a label. Link error messages to the field and mark it with `aria-invalid`.
- Announce content that changes on the page, such as results and errors, to screen readers.
- Keep text contrast at 4.5:1 or higher, and 3:1 or higher for large text and interface parts. Check light and dark modes.
- Never use color alone to show meaning.
- Check every page at a 375px phone width, with no sideways page scrolling.
- Automated checks catch only some problems. Say what has and hasn't been tested, and don't claim a page is fully compliant unless it has had a full review.

## Working principles

- **Education only:** explain concepts and show results using the person's own numbers. Never say what someone should do, and never recommend specific investments, products, or companies.
- **Dignity first:** use plain language that never shames or patronizes. Avoid industry labels such as "subprime" in user-facing text.
- **Privacy by default:** Phase 1 stores no user data on a server, with no accounts. Don't add tracking of individuals.
- **Sourced numbers:** never invent rates or statistics. Keep them in `src/data/` with a named source, date, and period.
- **Wording:** user-facing text lives in `src/text/en.ts`, separate from code.

## Workflow

- Never commit directly to `main`. Use a short-lived branch and a pull request, and keep each pull request to one purpose.
- Run `npm test` and `npm run build` before every commit. Money math needs automated tests.
- Check changes in a browser, not only with tests.
- Never commit secrets. Keep them in `.env`, which Git ignores.

## Explaining the work

The maintainer is learning to code through this project. Explain each step and command in plain language before running it, including why teams work this way.
