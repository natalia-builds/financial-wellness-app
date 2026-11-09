---
name: next
description: Start a session on this project. Reads the brief and operations doc, checks GitHub for the earliest open milestone, open pull requests, and launch-check notes, then recommends what to work on next and waits for a go-ahead. Use when Natalia types /next or asks where to pick up.
disable-model-invocation: true
---

# Pick up where the project left off

The goal is a short, accurate briefing and one recommended next step. Read before suggesting anything, and change nothing in this skill: no edits, branches, labels, or comments until the maintainer says which work to start.

## 1. Read the project's own docs

`CLAUDE.md` is already loaded. Also read:

- `docs/concept-brief.md`: the vision, decisions, Current Status, and the Phase 1 Roadmap (the order of work and why)
- `docs/operations.md`: how work is planned, built, and reviewed, and the session-start guide

## 2. Check what's happening on GitHub

Run these with the `gh` command in `natalia-builds/financial-wellness-app`:

- **Milestones:** `gh api 'repos/natalia-builds/financial-wellness-app/milestones?state=open' -q '.[] | "\(.title): \(.closed_issues) done, \(.open_issues) open"' | sort` shows each one's progress. Numbered milestones run in order. Phase 2 comes after them.
- **The earliest open milestone's Issues:** `gh issue list --milestone "<title>" --state open --json number,title,labels`. Note which are labeled "ready to build" and which "needs a detailed plan."
- **Open pull requests:** `gh pr list --state open`. Unfinished or unreviewed work comes before anything new.
- **Launch checks:** the open items and the most recent comments on Issue #16, since some checks wait on outside people.
- **Open work outside a milestone:** `gh issue list --state open --search "no:milestone"`. Mention it only if it bears on what's next.

## 3. Recommend one next step

Pick it in this order:

1. An open pull request that needs review or fixes
2. A "ready to build" Issue in the earliest open milestone
3. A "needs a detailed plan" Issue in the earliest open milestone, to plan
4. If the earliest milestone only waits on outside people (such as the screen reader and wording reviews in Issue #16), the first Issue in the next milestone, as the roadmap allows

## 4. Report, then wait

Keep the briefing short and in plain language:

- **Where things stand:** one or two lines, with each milestone's progress (for example "Core of Tier 2: 3 of 4 done")
- **Recommended next step:** the Issue or PR with its link, and why it comes next
- **Other options:** one or two at most
- **Anything stale:** if a doc or the README contradicts GitHub, such as a shipped tool missing from the README, say so

Then ask which to start. Planning follows the Plan step in `docs/operations.md`. Building one Issue follows its Build step, on a new branch.
