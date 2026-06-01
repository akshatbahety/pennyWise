# PennyWise — Wealth, at a glance

A polished, minimal financial management web app for high-income professionals tracking net worth across multiple asset classes. Built with React 18 (via CDN + Babel in-browser transpilation) as a single-page static app.

## Project overview

PennyWise helps users understand their net worth in under 10 seconds. It tracks stocks, mutual funds, ETFs, crypto, gold, silver, real estate, cash, and alternative investments. The design philosophy is "wealth building as a fun exercise" — calm, personal, never overwhelming.

**Target user:** High-income AI professionals with global portfolios ($3M+ net worth).

## Tech stack

- **React 18** loaded via CDN (`unpkg.com/react@18.3.1`)
- **Babel Standalone** for in-browser JSX transpilation
- **No build step** — open `PennyWise.html` directly or serve with any static server
- **LocalStorage** for state persistence (assets, currency, period, page)
- **Fonts:** Hanken Grotesk (sans) + IBM Plex Mono (monospace) via Google Fonts

## Running locally

Serve the project directory with any static file server:

```sh
npx serve -l 3456
# Then open http://localhost:3456/PennyWise.html
```

Or use VS Code Live Server, Python's `http.server`, etc. The app won't work via `file://` due to Babel's cross-origin script loading.

## File structure

```
PennyWise.html        — Entry point. Loads React/Babel CDN, then all scripts in order.
styles.css            — Complete design system: CSS variables, layout, components, pages.
data.js               — Data model, sample portfolio (16 assets), currency helpers, calc functions.
icons.jsx             — 30+ line icons (24x24 SVG), Icon component, IconTile (tinted square), picker catalog.
components.jsx        — Shared UI: Delta, Pill, PeriodToggle, Donut chart, AreaChart, Sparkline, Dot.
pages-dashboard.jsx   — Dashboard page: hero (3 layouts), movers, asset class cards.
pages-holdings.jsx    — Holdings table + ClassDetail drill-down page.
pages-misc.jsx        — Trends, Allocation, Settings pages.
page-addasset.jsx     — Add/Edit asset form with icon picker + live preview.
app.jsx               — App shell: sidebar, topbar, routing, localStorage persistence.
```

## Script load order (matters!)

Scripts must load in this order (defined in `PennyWise.html`):
1. `data.js` (plain JS, exposes `window.PW`)
2. `icons.jsx` (exposes `window.Icon`, `window.IconTile`, `window.ICON_PICKER`, `window.CLASS_TINT`)
3. `components.jsx` (exposes `window.UI`)
4. `pages-dashboard.jsx` (adds to `window.PAGES`)
5. `pages-holdings.jsx` (adds to `window.PAGES`)
6. `pages-misc.jsx` (adds to `window.PAGES`)
7. `page-addasset.jsx` (adds to `window.PAGES`)
8. `app.jsx` (exposes `window.PennyWiseApp`)

Each file is an IIFE that attaches to `window`. Order matters because later files depend on earlier ones.

## Design system

**Colors:**
- Primary: Green (`--green-600: #1f7d57` through `--green-900: #0f3d2b`)
- Accent: Burnt orange (`--orange-600: #c2410c`, `--orange-500: #db6520`)
- Neutrals: Warm paper tones (`--bg: #f4f3ee`, `--surface: #ffffff`)
- Semantic: `--gain: #1f7d57` (green), `--loss: #c14b32` (red)
- Each asset class has a dedicated color variable (`--c-stocks`, `--c-crypto`, etc.)

**Typography:**
- Sans: Hanken Grotesk (weights 400–800)
- Mono: IBM Plex Mono (weights 400–600)
- Tabular nums class: `.tnum`

**Spacing/Radius:**
- `--r-sm: 8px`, `--r-md: 12px`, `--r-lg: 16px`, `--r-xl: 22px`
- Three shadow levels: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

## Pages & features

### Dashboard
- **Insight line:** Natural language summary ("You're up $99K this 1M — led by NVIDIA")
- **Hero card:** 3 layout variants (split, centered, donut) — controlled by `heroLayout` state
- **Donut chart:** Interactive allocation visualization with hover-to-highlight
- **Movers:** Top gainers + watch (softening) cards
- **Asset class cards:** Per-class value, change pill, sparkline, allocation bar

### Holdings
- Search by name or ticker
- Filter chips by asset class (with count badges)
- Table: icon, name/ticker/units, sparkline trend, invested, value, period change, all-time return
- Click any row → opens edit form

### Class Detail
- Drill-down from Holdings or Dashboard class cards
- Area chart for the class, stats panel (holdings count, invested, all-time gain, period change)
- Holdings table filtered to that class

### Trends
- Net worth area chart over time (responsive to W/M/Q/Y period)
- Stat strip: period start, net change, invested capital, market gain
- Contribution bar chart
- Growth summary: ROI, best class, diversification count

### Allocation
- Large donut chart + allocation table with mini bars
- Concentration check: balanced core, liquidity, spread health cards

### Add/Edit Asset
- Asset class picker (9 classes)
- Fields: name, ticker (optional), units (optional), value, invested (optional)
- Icon picker: 30+ icons in 6 groups, 6 color tints (orange/green/gold/clay/slate/violet)
- Live preview card updates as you type
- Edit mode: pre-fills form, adds delete button
- Save → recalculates net worth, returns to dashboard (add) or class detail (edit)

### Settings
- Currency toggle: USD / INR (live conversion with ₹ crore/lakh formatting)
- Language selector: English (Hindi, Spanish, Chinese placeholders)
- Data info: tracking cadence, base currency, storage type

## Data model

All monetary values stored in USD. Currency conversion happens at display time.

```js
// Asset shape
{
  id: "a1",
  name: "NVIDIA",
  type: "stocks",        // one of CLASS_ORDER
  icon: "chip",          // icon name from icons.jsx
  symbol: "NVDA",        // optional ticker
  units: 1200,           // optional quantity
  value: 384000,         // current value in USD
  cost: 150000,          // invested amount in USD
  m: 8.4,                // monthly change % (canonical trend)
}
```

Period changes are derived from `m` using multipliers: W=0.24x, M=1x, Q=2.85x, Y=9.6x.

## Currencies

```js
USD: { symbol: "$",  rate: 1,    locale: "en-US" }
INR: { symbol: "₹", rate: 83.4, locale: "en-IN" }  // static placeholder rate
```

INR uses lakh/crore compact formatting. Adding more currencies: add to `CURRENCIES` in `data.js` and they auto-appear in settings + topbar dropdown.

## Sample portfolio

16 assets across 9 classes, modeled as a high-income AI professional:
- Stocks: NVIDIA ($384K), Apple ($92K), ASML ($58K)
- Mutual Funds: Vanguard Total Mkt ($305K), Fidelity Contrafund ($138K)
- ETFs: VOO ($272K), QQQ ($146K)
- Crypto: Bitcoin ($235K), Ethereum ($92K)
- Gold: Physical Gold ($84K)
- Silver: Silver Bullion ($21K)
- Real Estate: Primary Residence ($980K), Rental Condo ($380K)
- Cash: High-Yield Savings ($118K), Checking ($32K)
- Alternatives: Startup Equity SAFE ($175K)
- **Total: ~$3.51M**

## Key conventions

- All components are IIFEs exposing to `window` (no module system)
- Pages are React components receiving a `ctx` object with all app state + navigation helpers
- Navigation: `go(pageId, params)` — no URL routing, state-based
- Each page renders as a proper React component (own fiber) via `React.createElement(PageComp, { key, ...ctx })`
- Charts (Donut, AreaChart, Sparkline) are pure SVG, no chart library
- Responsive: sidebar collapses below 768px, grids reflow below 1100px

## Origin

Design exported from Claude Design (claude.ai/design) and implemented as a complete working app. The design was iterated through conversation to achieve a calm, modern fintech aesthetic with green + burnt orange palette.
