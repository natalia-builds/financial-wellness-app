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
| Rates and their sources | `src/data/` |
| User-facing wording | `src/text/en.ts` |
| Colors and the library connection | `src/layouts/Base.astro` and `src/styles/theme.css` |
| Shared form and table styles | `src/styles/tools.css` |

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

## Design System

The Design System describes the site and doesn't control it. Changing it doesn't change the site. When the site's look changes, change the code through a pull request, then update the Design System to match. Mockups built from it still have to pass the accessibility rules before they're merged.

## Switching to the fallback color scheme

The site uses Option C, teal and marigold. Option B, calm blue, is the approved fallback ([Issue #19](https://github.com/natalia-builds/financial-wellness-app/issues/19)). All the options are compared on the [color scheme canvas](https://claude.ai/artifact/N1N4Tg3J1A4fmDh6jcyZ36) (private).

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

These values passed the contrast rules in `CLAUDE.md`. The error colors stay the same in both schemes.

To switch:

1. On a new branch, replace the values in `src/layouts/Base.astro`, in both the light and dark blocks.
2. Check all three pages in a browser at a 375px phone width and in dark mode. Include keyboard focus in the header, an error in a field, and the "Your rate" row.
3. Merge through a pull request, then update the Design System and the color scheme decision in the [concept brief](concept-brief.md).

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
