# Financial Wellness App: Concept Brief

*Draft v0.1, prepared by Natalia*

## Vision

A free, open-source tool that meets people wherever they are financially. It connects people in crisis to help available today, teaches the basics as they stabilize, and supports them as they build long-term financial security.

## Problem

People facing financial insecurity often don't know which public resources they qualify for, and the information is scattered across agencies with different rules and applications. People who are more stable still lack simple, trustworthy, non-commercial tools to learn planning basics. Most existing financial apps are built to sell products, not to serve people with the least.

## Principles

- **Free and open source.** No revenue model, ads, or data monetization.
- **Enter at any level.** Users start at the tier that fits them, with no forced sequence.
- **Encourage the climb.** As people stabilize, the tool gently invites them toward the next tier.
- **Dignity first.** Language and design never shame or patronize.
- **Privacy by default.** Collect only what's needed, and let users stay anonymous wherever possible.
- **Accessible to everyone.** Everything we build meets WCAG 2.2 Level AA.

## Target Users

- **Tier 1:** Multnomah County residents experiencing financial insecurity, such as housing instability, food insecurity, job loss, or utility shutoff risk.
- **Tier 2:** People who are meeting basic needs but want to build skills in budgeting, debt, saving, and credit.
- **Tier 3:** People ready to plan ahead, with goals like emergency funds, retirement, homeownership, and building wealth.

## The Three Tiers

### Tier 1: Connect to Resources

A guided intake that matches users to the government, county, and nonprofit programs they're likely eligible for (food, housing, utilities, healthcare, cash assistance), with clear next steps and application links.

### Tier 2: Financial Basics

Short, plain-language lessons paired with simple calculators for budgeting, debt payoff, savings goals, and understanding credit.

### Tier 3: Build Your Future

Tools for setting and tracking long-term goals: emergency fund, retirement basics, homebuying readiness, and investing fundamentals. This tier is educational: it defines investment types, explains concepts, and shares general best practices for planning ahead. It never tells someone what to invest in, and never recommends specific investments, products, or companies.

## Progression and Motivation

Progress is framed as personal milestones rather than points or streaks, for example "rent covered this month" or "first $100 saved." A visual progress path shows where the user is and what the next step could be. Invitations to the next tier appear when they make sense for the user, and nothing is ever gated.

## Pilot Scope

- **Geography:** Multnomah County, Oregon, for Tier 1 in Phase 2; Phase 1 tools are not location-specific
- **Focus:** Phase 1 builds Tier 2 and Tier 3 (education, calculators, and goal tools), which don't depend on agency partnerships and can serve anyone. Phase 2 adds Tier 1 resource matching for Multnomah County.
- **Potential partners:** 211info, Multnomah County Department of County Human Services, local nonprofits and credit unions

## Success Measures (Draft)

### Phase 1

- Share of people who answer yes to "Was this helpful?" after a lesson or calculator
- Anonymous usage counts, such as lessons finished and calculators used (totals only, with nothing tied to a person)
- Share of people who say, in an optional anonymous question, that they've moved on to a new goal

### Phase 2

- Number of users matched to at least one resource
- Share of users who report applying for or receiving a resource
- User-reported financial confidence over time

## Decisions

- **Platform:** The pilot will be a mobile-friendly website. ([Issue #5](https://github.com/natalia-builds/financial-wellness-app/issues/5))
- **User data:** Phase 1 will store no user data on a server, with no accounts. Anything saved stays in the person's own browser. Review before Phase 2. ([Issue #7](https://github.com/natalia-builds/financial-wellness-app/issues/7))
- **Languages:** The project will support English only for the time being. Review before Phase 2. ([Issue #6](https://github.com/natalia-builds/financial-wellness-app/issues/6))
- **Measuring progress:** Phase 1 will not track individuals. It will rely on anonymous totals and optional questions, including asking people directly whether they've moved on to a new goal.
- **Tier 3 boundary:** Tier 3 is education, not financial advice. It defines investment types and shares general best practices for planning for retirement, labeled as general guidance rather than personal advice. It never tells someone what to invest in, and never recommends specific investments, products, or companies. Calculators work with the person's own numbers, and the tool states clearly that it is educational. Have a qualified person review the wording before launch. This replaces the earlier education-only boundary, because people planning for retirement also need clear general guidance on how to start.
- **Components:** New interactive components come from [Accessible Astro Components](https://github.com/incluud/accessible-astro-components), which is built for Astro, adds no dependencies, and focuses on accessibility. Existing plain HTML stays where it works. A library doesn't guarantee accessibility, so each component is still tested against WCAG 2.2 Level AA.
- **Tools show, people choose:** The Tier 3 boundary also applies to Tier 2. Tools show what happens with the person's own numbers and don't pick an option for them, as the debt and savings tool does.
- **Color scheme:** The site uses fresher teal (Option A). Calm blue (Option B) is the approved fallback, and [Operations](operations.md) holds its values and the steps to switch. ([Issue #19](https://github.com/natalia-builds/financial-wellness-app/issues/19))
- **Home page tools:** Tools appear as clickable cards with an icon and a description, in a single list. Grouping them under goal-based headings is planned for a future milestone, once there are enough tools to fill the groups. ([Issue #29](https://github.com/natalia-builds/financial-wellness-app/issues/29))
- **Hosting:** The site is built with Astro and hosted on Cloudflare Pages, which publishes `main` automatically. A Postgres database can be added later if the user data decision changes.
- **Rate upkeep:** A monthly routine checks published rates against their sources and proposes changes in a pull request. A person reviews and merges every update. See [Operations](operations.md).

## Open Questions

- How will resource and eligibility data be sourced and kept current (partnership vs. self-maintained)? ([Issue #3](https://github.com/natalia-builds/financial-wellness-app/issues/3))
- Who maintains the project long term (volunteers, a fiscal sponsor, a nonprofit)? ([Issue #4](https://github.com/natalia-builds/financial-wellness-app/issues/4))

## Tier 1 Data Notes (Planning, Not Decided)

The monthly rate check could grow into Tier 1, but the stakes are much higher. A slightly old interest rate is a small error, while wrongly telling someone in crisis that they qualify for help, or sending them to a closed office, can really hurt them. These notes feed into [Issue #3](https://github.com/natalia-builds/financial-wellness-app/issues/3):

- Give each program its own record, with its source, effective date, and when a person last verified it.
- Let automation flag that a source changed, and leave the rule change to a person, because eligibility rules need human judgment.
- Show or hide information based on how recently it was verified, so stale details can't pass as current.
- Look at partners first. 211info and county agencies may already maintain this data, and reusing it would likely be more accurate than monitoring many web pages.

## Current Status

As of November 2026, Phase 1 has started and the [site is live](https://financial-wellness-app.pages.dev).

- **Built:** two tools, [how a credit score affects what you pay](https://financial-wellness-app.pages.dev/credit-score-and-interest/) and [paying down debt or building savings](https://financial-wellness-app.pages.dev/debt-or-emergency-fund/).
- **Why these first:** conversations with many people about finance basics pointed to these two topics, so building started without a separate round of validation interviews.
- **Not built yet:** the Phase 1 success measures ([Issue #23](https://github.com/natalia-builds/financial-wellness-app/issues/23)), lessons, goal tools, and Tier 1.
- **Before sharing widely:** the launch checks in [Issue #16](https://github.com/natalia-builds/financial-wellness-app/issues/16), including a qualified review of the wording.

## Next Steps

- Finish the launch checks ([Issue #16](https://github.com/natalia-builds/financial-wellness-app/issues/16))
- Build the Phase 1 success measures ([Issue #23](https://github.com/natalia-builds/financial-wellness-app/issues/23))
- Continue Phase 1 work, starting with the ideas in [Issue #20](https://github.com/natalia-builds/financial-wellness-app/issues/20) and [Issue #21](https://github.com/natalia-builds/financial-wellness-app/issues/21)
- Group the home page tools by goal once there are enough tools ([Issue #29](https://github.com/natalia-builds/financial-wellness-app/issues/29))
- Validate the concept with potential partners and users
- Map the Tier 1 resource landscape in Multnomah County for Phase 2
- Begin early Tier 1 partner conversations in parallel with Phase 1
