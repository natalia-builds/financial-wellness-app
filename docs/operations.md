# Operations

How the project runs day to day. For what it is and why, see the [concept brief](concept-brief.md). For rules, see `CLAUDE.md`.

## Where things live

| What | Where |
| --- | --- |
| Live site | <https://financial-wellness-app.pages.dev> |
| Code and history | <https://github.com/natalia-builds/financial-wellness-app> |
| Open work and checks | [GitHub Issues](https://github.com/natalia-builds/financial-wellness-app/issues), with launch checks in [Issue #16](https://github.com/natalia-builds/financial-wellness-app/issues/16) |
| Design System (private) | <https://claude.ai/artifact/1ptfPFQa6QSyvikzTUZLBe> |
| Monthly rate check routine (private) | <https://claude.ai/code/routines/trig_01N3Z9JKpjoyj4QHCZ9MXGJn> |
| Visit and answer counts (private login) | GoatCounter dashboard: <https://fin-wellness.goatcounter.com>. How counting works is under "Counting visits" below |
| Visits dashboard (private) | <https://claude.ai/artifact/GqEUQG8VuTJEmasNdgaFop>, a snapshot refreshed on request. See "The visits dashboard" below |
| Rates and their sources | `src/data/` |
| User-facing wording | `src/text/en.ts` |
| Colors and the library connection | `src/layouts/Base.astro` and `src/styles/theme.css` |
| Shared form and table styles | `src/styles/tools.css` |
| Favicon | `public/favicon.svg`, with PNG copies beside it |
| Tool card icons | `public/icons/`, from [Lucide](https://lucide.dev) with its license beside them |
| Tool card styles | `src/styles/cards.css` |
| The list of tools and their groups | `src/lib/tools.ts`, used by the home page and the tools page. Add a new tool here, with its wording in `src/text/en.ts` |

## Publishing

Cloudflare Pages publishes `main` automatically, usually within a minute of a merge. Anything merged goes public, so review before merging.

- Every pull request gets its own test address from Cloudflare. Find it in the pull request's checks, or use `https://<branch-name>.financial-wellness-app.pages.dev`, with any `/` in the branch name written as `-`. Anyone with the link can open it.
- `main` is protected: changes must go through a pull request, for everyone, and force pushes and deletion are blocked. Zero approvals are required, because GitHub doesn't let people approve their own pull requests. Raise this when there are collaborators.

## Monthly rate check

A Claude Code routine runs in the cloud on the 1st of each month at 16:00 UTC, which is 8am Pacific in standard time and 9am in daylight time.

It reads the Experian, Federal Reserve, and FDIC sources, compares them with `src/data/`, and opens a pull request with any changes and new "Last checked" dates. It never merges. If it can't read any source, it comments on Issue #16 instead.

**Your part each month:** open the pull request, look at the old and new values, spot-check the source links when a rate changed, and merge it. A pull request with no rate changes is normal, because it keeps "Last checked" true.

**If a source is added or changed:**

- Add the site to the allowed domains in the routine's Default environment, or the routine can't reach it.
- Update the routine's instructions, including its sanity limits.

**Keep the routine's access small.** It reads public web pages, so it should reach only this repository and its listed sources. Creating a routine attached the account's connected services automatically, including Google Drive and Granola. They were removed on purpose. Check that `mcp_connections` stays empty after any change to the routine.

## Counting visits

The site counts anonymous totals with [GoatCounter](https://www.goatcounter.com/) ([Issue #23](https://github.com/natalia-builds/financial-wellness-app/issues/23)). It sets no cookies, and nothing a person types is ever sent.

- **What is counted:** page visits, and these events: `helpful/<tool>/yes|no`, `goal/<tool>/yes|not-yet`, and `used/<tool>`. `<tool>` is the tool's `key` in `src/lib/tools.ts`, so a new tool needs no new counting code. It does need `<Feedback tool="…" />` under its results, and `createUsedReporter('…')` in its page script.
- **Where the code is:** `src/lib/count.ts` (event names and safe sending, with tests), `src/lib/analytics.ts` (the GoatCounter address and the live hostname), `src/components/Feedback.astro` (the two questions), and `public/goatcounter.js`.
- **Live site only:** counting runs only on `financial-wellness-app.pages.dev`. Local and Cloudflare preview addresses load nothing and send nothing. If the site gets its own domain, add it in `src/lib/analytics.ts` and in GoatCounter's site settings.
- **The script is a copy:** `public/goatcounter.js` is GoatCounter's `count.js` exactly as published in [its repository](https://github.com/arp242/goatcounter) at commit `478f026eb9deacb9378a46b96db72e11e9f20557` (April 7, 2026), under the ISC license shown in its first lines. Keep that header. To update it, replace the file with a newer commit's `public/count.js` and record the commit here. GoatCounter promises its `/count` address stays compatible, so an old copy keeps working.
- **Skip your own visits:** open any page of the live site with `#toggle-goatcounter` added to the address. GoatCounter then ignores that browser. This is the one case where it saves anything in a browser, and only because you asked.
- **Blocked is fine:** if an ad blocker stops counting, the questions still work and the thank-you still shows. Those answers just aren't counted.

### The visits dashboard

A friendlier view of the same totals, as a private Claude artifact (linked above). It's a snapshot, not live: it shows the numbers as of its last refresh, with the date.

- **The key:** in GoatCounter, open your username, then API, and create a key with only the "Read statistics" permission. Save it in `.env` as `GOATCOUNTER_API_TOKEN=...`. Git ignores `.env`, so the key never reaches this public repository. Never put it in the dashboard or paste it into a chat.
- **Refreshing:** ask Claude to update the visits dashboard. It runs `node scripts/goatcounter-snapshot.mjs`, which reads the key from `.env`, asks GoatCounter for the totals since counting started, and prints them as one file of anonymous totals. Claude then uploads that file to the dashboard. The script reads the GoatCounter address from `src/lib/analytics.ts` and the tools from `src/lib/tools.ts`, so a new tool needs no change to it.
- **Reading the numbers:** GoatCounter counts visitors, not clicks or visits. Someone who answers "Yes" and then "No" counts once for each. With only a few answers, percentages can look better than they are, so the dashboard shows counts beside them.

## Design System

The Design System describes the site and doesn't control it. Changing it doesn't change the site. When the site's look changes, change the code through a pull request, then update the Design System to match. Mockups built from it still have to pass the accessibility rules before they're merged.

## Switching to the fallback color scheme

The site uses Option A, fresher teal. Option B, calm blue, is the approved fallback ([Issue #19](https://github.com/natalia-builds/financial-wellness-app/issues/19)). All the options are compared on the [color scheme canvas](https://claude.ai/artifact/N1N4Tg3J1A4fmDh6jcyZ36) (private).

Switching only means changing color values, because the header, focus rings, and highlighted row all read from these variables. This was tested by loading Option B's values into the running credit score tool in light and dark, with no other code changes.

| Variable | Light | Dark |
| --- | --- | --- |
| `--background` | `#faf8f3` | `#12181f` |
| `--surface` | `#ffffff` | `#1b232d` |
| `--text` | `#1c2b3a` | `#edf1f5` |
| `--muted` | `#4f5f6f` | `#adb8c4` |
| `--border` | `#d8dadb` | `#3a4552` |
| `--accent` | `#1d5a99` | `#8cc4ff` |
| `--highlight` | `#e0edf9` | `#1f3550` |
| `--band` | `#1d4f86` | `#1b3350` |
| `--band-text` | `#ffffff` | `#eaf3fc` |
| `--band-link` | `#ffffff` | `#eaf3fc` |

These values passed the contrast rules in `CLAUDE.md`. The error colors stay the same in both schemes.

To switch:

1. On a new branch, replace the values in `src/layouts/Base.astro`, in both the light and dark blocks.
2. Change the favicon's `#00695a` to `#1d5a99` in `public/favicon.svg`. Remake `favicon-32.png` at 32px and `apple-touch-icon.png` at 180px with square corners and no transparency, because iOS rounds the corners itself. Change the same color in each file in `public/icons/`.
3. Check all three pages in a browser at a 375px phone width and in dark mode. Include keyboard focus in the header, an error in a field, and the "Your rate" row.
4. Merge through a pull request, then update the Design System and the color scheme decision in the [concept brief](concept-brief.md).

## Running it locally

```bash
npm install      # download the packages the project needs
npm run dev      # start a private preview at http://localhost:4321
npm test         # run the automated tests
npm run build    # build the finished website
```

Node.js and the GitHub CLI are installed in `~/.local`, and `~/.local/bin` is on the terminal's path.

## Starting a Claude Code session

- Open the session in the `financial-wellness-app` folder, so `CLAUDE.md` loads automatically.
- Keep one conversation to one task.
- Start by pointing at what's relevant, such as the brief and an Issue.
- Before ending, ask whether everything important is written down.
