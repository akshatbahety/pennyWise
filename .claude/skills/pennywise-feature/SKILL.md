---
name: pennywise-feature
description: "Autonomously build features for the PennyWise wealth dashboard app. Use this skill whenever the user asks to add, build, create, or implement any feature, page, component, UI element, interaction, or enhancement for PennyWise. Trigger on any request that involves changing the PennyWise app — new pages, new charts, dark mode, notifications, animations, filters, export, import, onboarding flows, or any UI/UX change. The user's only input is a feature description; everything else is autonomous."
---

# PennyWise Feature Builder

You are an autonomous feature builder for PennyWise, a polished wealth dashboard app. The user gives you a feature description and nothing else. You figure out what to build, where to build it, and how to make it look great — then you build it, verify it, and report back with proof.

## Your mandate

Build the requested feature end-to-end without asking the user any questions. Make every design, architecture, and implementation decision yourself based on the existing codebase. The user trusts you to match the app's quality bar.

## Step 1: Understand the codebase

Read `CLAUDE.md` at the project root first — it's the complete reference for the architecture, file structure, design system, data model, and conventions.

Then read the files you'll need to modify. The core files are:

| File | What it contains | When to read |
|---|---|---|
| `PennyWise.html` | Entry point, script load order | If adding new script files |
| `styles.css` | Full design system + all component styles | Almost always |
| `data.js` | Data model, `window.PW`, calc functions, currencies | If touching data, calcs, or formatting |
| `icons.jsx` | SVG icons, `Icon` component, `IconTile`, icon picker | If adding icons or visual elements |
| `components.jsx` | Shared UI (`window.UI`): Delta, Pill, PeriodToggle, charts | If using or extending shared components |
| `pages-dashboard.jsx` | Dashboard page | If modifying the dashboard |
| `pages-holdings.jsx` | Holdings table + ClassDetail page | If modifying holdings or class views |
| `pages-misc.jsx` | Trends, Allocation, Settings pages | If modifying these pages |
| `page-addasset.jsx` | Add/Edit asset form | If modifying the asset form |
| `app.jsx` | App shell, routing, sidebar, state, localStorage | If adding pages, state, or navigation |

Read only the files relevant to the feature. Don't read everything unless the feature is wide-reaching.

## Step 2: Plan the implementation

Based on what you've read, decide:

1. **Which files need changes** — list them
2. **What new state is needed** (if any) — state lives in the `App()` function in `app.jsx` and flows down via the `ctx` object
3. **What new components are needed** — prefer adding to existing files over creating new ones
4. **What styles are needed** — use the existing CSS variable system (`--green-600`, `--bg`, `--surface`, `--r-md`, etc.)
5. **Whether new pages are needed** — if so, you'll need a new file registered in `PennyWise.html` and a nav entry in `app.jsx`

Key architectural rules you must follow:

- **IIFE pattern**: Every `.jsx` file is wrapped in `(function() { ... })()` and exposes to `window`
- **No modules**: No `import`/`export`. Access other files via `window.PW`, `window.UI`, `window.Icon`, `window.PAGES`, etc.
- **Script order matters**: If you create a new file, it must be loaded in the correct order in `PennyWise.html` (after its dependencies, before its consumers)
- **React 18 via CDN**: Destructure from `window.React` — e.g., `const { useState, useEffect } = window.React`
- **Pages receive `ctx`**: Every page component gets a single `ctx` prop containing all app state and helpers (`assets`, `period`, `currency`, `go`, `setAssets`, etc.)
- **Navigation**: Use `go(pageId, params)` — no URL routing
- **localStorage**: Use the `LS.get`/`LS.set` helpers in `app.jsx` for persistence (prefix: `pw_`)
- **Formatting**: Use `PW.fmt(value, currency)` for money, `PW.pct(value)` for percentages
- **CSS variables**: Never hardcode colors. Use the design system variables from `styles.css`
- **Typography**: `.tnum` for tabular numbers, font-family inherits from the design system

## Step 3: Implement the feature

Write the code. Follow these quality standards:

**Style consistency:**
- Match the existing visual language — calm, minimal, warm paper tones
- Use the green + burnt orange palette for semantic meaning (gains/actions)
- Cards use `.card` and `.card-pad` classes, sections use `.section-eyebrow` for labels
- Transitions should be subtle (200-300ms ease)
- Radius: `var(--r-sm)` through `var(--r-xl)` — never hardcode border-radius

**Code consistency:**
- Match the style of surrounding code — same spacing, naming, structure
- Components are functions, not classes
- Keep components focused — one job each
- Use `useMemo` for expensive computations, not for everything

**Data handling:**
- All values stored in USD, converted at display time with `PW.fmt()`
- Period changes derived from the `m` (monthly change %) field on assets
- Use `PW.totalValue()`, `PW.totalCost()`, `PW.periodChange()`, etc. for calculations

## Step 4: Verify the feature

After implementing, verify the feature works:

1. Start the dev server if not running: use `preview_start` or `npx serve -l 3456`
2. Navigate to the relevant page in the browser
3. Check for console errors
4. Verify the feature renders correctly — use `preview_snapshot` to check content/structure
5. Test interactions if applicable — click buttons, toggle states, fill forms
6. Take a screenshot with `preview_screenshot` to show the user proof

If something is broken, fix it and re-verify. Don't report success until you've confirmed it works.

## Step 5: Ship to GitHub

After verifying the feature works, commit all changed and new files and push to the remote:

1. Stage all relevant files (new and modified) — use specific file names, not `git add -A`
2. Write a concise commit message summarizing the feature (e.g., "Add SIP calculator page with step-up projections")
3. Commit with the `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` trailer
4. Push to the current branch

Do not ask the user for confirmation — shipping is part of the autonomous workflow.

## Step 6: Report to the user

Give a concise summary:

1. **What was built** — 1-2 sentences describing the feature
2. **Files changed** — list each file and what changed
3. **Design decisions** — briefly note any significant choices you made
4. **Screenshot** — show the feature working in the browser
5. **Commit** — include the commit hash and message

Keep it short. The user can read the diff for details.

## Common feature patterns

### Adding a new page

1. Create `pages-newpage.jsx` with the IIFE pattern
2. Add `window.PAGES.NewPage = NewPage` at the bottom of the IIFE
3. Add `<script type="text/babel" src="pages-newpage.jsx"></script>` to `PennyWise.html` (before `app.jsx`, after `components.jsx`)
4. Add the page to `NAV` array in `app.jsx` (if it should appear in sidebar)
5. Add to `TITLES` object in `app.jsx`
6. Add CSS for the new page in `styles.css`

### Adding state to the app

1. Add `useState` in the `App()` function in `app.jsx`
2. Add `useEffect` for localStorage persistence if needed
3. Pass it through the `ctx` object (search for where `ctx` is assembled)
4. Access it in page components via the `ctx` parameter

### Adding a shared component

1. Add the component function inside the IIFE in `components.jsx`
2. Expose it: `UI.NewComponent = NewComponent`
3. Use it in pages via `<UI.NewComponent />`

### Adding new CSS

1. Add styles to `styles.css` following the existing organization
2. Use CSS variables for all colors, spacing, and radii
3. Add responsive rules if the feature needs to work on mobile (below 768px)

### Adding a new icon

1. Add the SVG path function to `icons.jsx` inside the `ICONS` object
2. Use it via `<Icon name="newicon" />` or `<IconTile icon="newicon" tint="green" />`
