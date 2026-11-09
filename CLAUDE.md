# Financial Wellness App

A free, open-source tool that meets people wherever they are financially. See `docs/concept-brief.md` for the vision, principles, and decisions. Treat it as the source of truth. See `docs/operations.md` for how the project runs: publishing, the monthly rate check, the Design System, and where things live.

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

- **Education, not advice:** define investment types, explain concepts, and show results using the person's own numbers. General best practices are fine when labeled as general guidance, not personal advice. Never tell someone what to invest in, and never recommend specific investments, products, or companies. Tools don't pick an option for the person.
- **Dignity first:** use plain language that never shames or patronizes. Avoid industry labels such as "subprime" in user-facing text.
- **Privacy by default:** Phase 1 stores no user data on a server, with no accounts. Don't add tracking of individuals.
- **Sourced numbers:** never invent rates or statistics. Keep them in `src/data/` with a named source, date, and period.
- **Wording:** user-facing text lives in `src/text/en.ts`, separate from code.
- **Components:** use `accessible-astro-components` for interactive components. Use plain HTML for simple elements such as tables and links. Before writing a custom component, check the library and say why it doesn't fit. Add the package when something first uses it, and test each component against the accessibility rules above.
- **Library quirks:** `Input` has no number type, so use its text type with `inputmode="decimal"` and read values with `parseUserNumber`. `Input` also ignores a passed `aria-describedby`, so add hints from the page script and keep its `-validation` id in the list. There is no Select, so use a plain `select`. Library variables need bridging in `src/styles/theme.css`, or components use the library's purple. `Card` loads a placeholder from an outside site unless `img` is set, so always set it, and keep cards inside `.tool-list` so they get the overrides in `src/styles/cards.css`.

## Workflow

- Never commit directly to `main`. Use a short-lived branch and a pull request, and keep each pull request to one purpose.
- Run `npm test` and `npm run build` before every commit. Money math needs automated tests.
- Check changes in a browser, not only with tests. Test the awkward inputs, a 375px phone width, and dark mode.
- Before opening a pull request that changes anything on a page, run the [accessibility checks](docs/accessibility-checks.md) on every page it touches, and list the results by WCAG criterion in the pull request.
- Before a change that could affect existing pages, measure them first, then compare afterward.
- Check money results against a separate calculation. Make sure a result can't look better than it is, such as savings shown without the debt still owed.
- Never commit secrets. Keep them in `.env`, which Git ignores. This repository is public.
- After merging, confirm the change on the live site.

## Keeping knowledge

Anything that matters must end up in the repository or on GitHub, because new sessions start with no memory of earlier ones.

- Keep this file short. Link to details instead of copying them.
- Update the brief in the same pull request as a change that alters a decision. Record why in the Issue or pull request.
- Keep open work in GitHub Issues, assigned to a milestone for its roadmap stage and labeled "ready to build" or "needs a detailed plan" when it is build work. What comes next is the earliest open milestone. See [Operations](docs/operations.md).
- Give each fact one home, and mark replaced decisions as replaced.

## Explaining the work

The maintainer studied computer science and is getting back into hands-on coding through this project. Explain each step and command in plain language before running it, including why teams work this way.
