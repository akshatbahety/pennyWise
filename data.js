/* ============================================================
   PennyWise — data model, sample portfolio, helpers
   Base currency = USD. All `value`/`cost` stored in USD.
   ============================================================ */
(function () {
  // ---- Asset class metadata ----
  const CLASSES = {
    stocks:     { id: "stocks",     label: "Stocks",        color: "var(--c-stocks)",     hex: "#1f7d57", icon: "trending" },
    mutual:     { id: "mutual",     label: "Mutual Funds",  color: "var(--c-mutual)",     hex: "#4ca383", icon: "layers" },
    etf:        { id: "etf",        label: "ETFs",          color: "var(--c-etf)",        hex: "#7cb8a0", icon: "basket" },
    crypto:     { id: "crypto",     label: "Crypto",        color: "var(--c-crypto)",     hex: "#db6520", icon: "bitcoin" },
    gold:       { id: "gold",       label: "Gold",          color: "var(--c-gold)",       hex: "#c79a2e", icon: "goldbar" },
    silver:     { id: "silver",     label: "Silver",        color: "var(--c-silver)",     hex: "#9aa6a0", icon: "coins" },
    realestate: { id: "realestate", label: "Real Estate",   color: "var(--c-realestate)", hex: "#b3582f", icon: "building" },
    cash:       { id: "cash",       label: "Cash & Savings",color: "var(--c-cash)",       hex: "#6f8a7c", icon: "wallet" },
    alt:        { id: "alt",        label: "Alternatives",  color: "var(--c-alt)",        hex: "#8a6db0", icon: "rocket" },
  };
  const CLASS_ORDER = ["stocks", "mutual", "etf", "crypto", "gold", "silver", "realestate", "cash", "alt"];

  // Period multipliers applied to a stored monthly change to derive W/M/Q/Y.
  const PERIODS = {
    W: { label: "1W", factor: 0.24 },
    M: { label: "1M", factor: 1.0 },
    Q: { label: "1Q", factor: 2.85 },
    Y: { label: "1Y", factor: 9.6 },
  };

  // ---- Sample portfolio (high-income AI professional, global) ----
  let nextId = 1;
  const A = (o) => ({ id: "a" + nextId++, units: null, symbol: null, ...o });

  const SEED = [
    A({ name: "NVIDIA",            type: "stocks", icon: "chip",      symbol: "NVDA",  units: 1200, value: 384000, cost: 150000, m: 8.4 }),
    A({ name: "Apple",             type: "stocks", icon: "apple",     symbol: "AAPL",  units: 420,  value: 92000,  cost: 61000,  m: 2.1 }),
    A({ name: "ASML Holding",      type: "stocks", icon: "chip",      symbol: "ASML",  units: 58,   value: 58000,  cost: 51000,  m: -1.2 }),
    A({ name: "Vanguard Total Mkt",type: "mutual", icon: "layers",    symbol: "VTSAX", value: 305000, cost: 238000, m: 3.0 }),
    A({ name: "Fidelity Contrafund",type: "mutual",icon: "compass",   symbol: "FCNTX", value: 138000, cost: 110000, m: 2.4 }),
    A({ name: "Vanguard S&P 500",  type: "etf",    icon: "basket",    symbol: "VOO",   value: 272000, cost: 201000, m: 2.8 }),
    A({ name: "Invesco QQQ",       type: "etf",    icon: "chart",     symbol: "QQQ",   value: 146000, cost: 112000, m: 3.6 }),
    A({ name: "Bitcoin",           type: "crypto", icon: "bitcoin",   symbol: "BTC",   units: 3.1,  value: 235000, cost: 88000,  m: 12.5 }),
    A({ name: "Ethereum",          type: "crypto", icon: "ethereum",  symbol: "ETH",   units: 26,   value: 92000,  cost: 60000,  m: 9.2 }),
    A({ name: "Physical Gold",     type: "gold",   icon: "goldbar",   symbol: null,    units: 1.2,  value: 84000,  cost: 62000,  m: 4.1 }),
    A({ name: "Silver Bullion",    type: "silver", icon: "coins",     symbol: null,    units: 600,  value: 21000,  cost: 18000,  m: 1.8 }),
    A({ name: "Primary Residence", type: "realestate", icon: "house", symbol: null,    value: 980000, cost: 720000, m: 0.4 }),
    A({ name: "Rental Condo",      type: "realestate", icon: "building", symbol: null, value: 380000, cost: 300000, m: 0.6 }),
    A({ name: "High-Yield Savings",type: "cash",   icon: "vault",     symbol: null,    value: 118000, cost: 118000, m: 0.35 }),
    A({ name: "Checking",          type: "cash",   icon: "wallet",    symbol: null,    value: 32000,  cost: 32000,  m: 0.0 }),
    A({ name: "Startup Equity (SAFE)", type: "alt", icon: "rocket",   symbol: null,    value: 175000, cost: 100000, m: 0.0 }),
  ];

  // ---- Currency ----
  const CURRENCIES = {
    USD: { code: "USD", symbol: "$",  rate: 1,     locale: "en-US", name: "US Dollar" },
    INR: { code: "INR", symbol: "₹", rate: 83.4, locale: "en-IN", name: "Indian Rupee" },
  };

  function fmt(usd, cur, opts = {}) {
    const c = CURRENCIES[cur] || CURRENCIES.USD;
    const v = usd * c.rate;
    const { compact = false, decimals } = opts;
    if (compact) {
      return c.symbol + compactNum(v, c.locale);
    }
    const d = decimals != null ? decimals : 0;
    return c.symbol + v.toLocaleString(c.locale, { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function compactNum(v, locale) {
    const abs = Math.abs(v);
    if (locale === "en-IN") {
      if (abs >= 1e7) return (v / 1e7).toFixed(2).replace(/\.00$/, "") + " Cr";
      if (abs >= 1e5) return (v / 1e5).toFixed(2).replace(/\.00$/, "") + " L";
      if (abs >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
      return Math.round(v).toLocaleString(locale);
    }
    if (abs >= 1e9) return (v / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
    if (abs >= 1e6) return (v / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
    if (abs >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return Math.round(v).toLocaleString(locale);
  }

  function pct(n, decimals = 1) {
    const s = n > 0 ? "+" : "";
    return s + n.toFixed(decimals) + "%";
  }

  function changePctForPeriod(asset, period) {
    return (asset.m || 0) * (PERIODS[period]?.factor ?? 1);
  }
  function prevValue(asset, period) {
    const ch = changePctForPeriod(asset, period) / 100;
    return asset.value / (1 + ch);
  }
  function gainForPeriod(asset, period) {
    return asset.value - prevValue(asset, period);
  }

  function totalValue(assets) {
    return assets.reduce((s, a) => s + a.value, 0);
  }
  function totalCost(assets) {
    return assets.reduce((s, a) => s + a.cost, 0);
  }
  function periodGain(assets, period) {
    return assets.reduce((s, a) => s + gainForPeriod(a, period), 0);
  }

  function byClass(assets, period) {
    const map = {};
    for (const id of CLASS_ORDER) map[id] = { ...CLASSES[id], value: 0, cost: 0, gain: 0, count: 0, assets: [] };
    for (const a of assets) {
      const g = map[a.type];
      if (!g) continue;
      g.value += a.value; g.cost += a.cost;
      g.gain += period ? gainForPeriod(a, period) : 0;
      g.count++; g.assets.push(a);
    }
    return CLASS_ORDER.map((id) => map[id]).filter((g) => g.count > 0);
  }

  function history(total, points) {
    const seedWobble = [0, -0.6, 0.4, -0.3, 0.9, 0.2, -0.5, 0.7, 1.1, -0.2, 0.5, 1.3, 0.8, -0.4, 0.6, 1.0, 1.4, 0.9, 1.6, 1.2, 2.0, 1.7, 2.4, 2.1];
    const out = [];
    const startFactor = 0.66;
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const base = startFactor + (1 - startFactor) * (Math.pow(t, 1.35));
      const wob = (seedWobble[i % seedWobble.length] / 100) * 0.5;
      out.push(total * (base + wob * (1 - t * 0.5)));
    }
    out[out.length - 1] = total;
    return out;
  }

  window.PW = {
    CLASSES, CLASS_ORDER, PERIODS, CURRENCIES, SEED,
    fmt, compactNum, pct,
    changePctForPeriod, prevValue, gainForPeriod,
    totalValue, totalCost, periodGain, byClass, history,
    newId: () => "a" + nextId++,
  };
})();
