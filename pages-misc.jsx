/* ============================================================
   PennyWise — Trends, Allocation, Settings
   ============================================================ */
(function () {
  const { useState, useMemo } = window.React;
  const PW = window.PW, UI = window.UI, Icon = window.Icon, IconTile = window.IconTile;

  function Trends(ctx) {
    const { assets, period, setPeriod, currency } = ctx;
    const total = PW.totalValue(assets);
    const cost = PW.totalCost(assets);
    const nPoints = { W: 14, M: 26, Q: 24, Y: 20 }[period] || 26;
    const series = useMemo(() => PW.history(total, nPoints), [total, nPoints]);
    const labels = useMemo(() => window.PAGES.buildLabels(nPoints), [nPoints]);
    const start = series[0], end = series[series.length - 1];
    const change = end - start;
    const changePct = (change / start) * 100;

    const buckets = Math.min(12, nPoints);
    const contrib = useMemo(() => {
      const out = [];
      for (let i = 0; i < buckets; i++) {
        const t = i / (buckets - 1);
        out.push(total * 0.012 * (0.6 + t * 0.9) * (1 + (i % 3 === 0 ? 0.4 : 0)));
      }
      return out;
    }, [total, buckets]);
    const maxContrib = Math.max(...contrib);

    return (
      <div className="page-enter">
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div className="card-head" style={{ marginBottom: 14 }}>
            <div>
              <div className="section-eyebrow">Net worth over time</div>
              <div className="tnum" style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em" }}>{PW.fmt(end, currency)}</div>
            </div>
            <UI.PeriodToggle value={period} onChange={setPeriod} />
          </div>
          <UI.AreaChart series={series} labels={labels} currency={currency} height={280} fillId="trendfill" />
          <div className="stat-strip">
            <Stat label="Period start" value={PW.fmt(start, currency, { compact: true })} />
            <Stat label="Net change" value={PW.fmt(Math.abs(change), currency, { compact: true })} delta={changePct} />
            <Stat label="Invested capital" value={PW.fmt(cost, currency, { compact: true })} />
            <Stat label="Market gain" value={PW.fmt(total - cost, currency, { compact: true })} positive />
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
          <div className="card card-pad">
            <div className="card-head"><div className="card-title">Contributions</div><span className="tiny muted">est. added capital per period</span></div>
            <div className="bars" style={{ marginTop: 18 }}>
              {contrib.map((c, i) => (
                <div key={i} className="bar-col">
                  <div className="bar" style={{ height: (c / maxContrib) * 100 + "%" }} title={PW.fmt(c, currency)} />
                </div>
              ))}
            </div>
            <div className="tiny muted" style={{ marginTop: 12, textAlign: "center" }}>Consistent contributions are the biggest lever on long-term net worth.</div>
          </div>
          <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
            <div className="growth-hero">
              <div className="section-eyebrow">Growth since period start</div>
              <div className="tnum" style={{ fontSize: 30, fontWeight: 700, color: change >= 0 ? "var(--gain)" : "var(--loss)" }}>{PW.pct(changePct)}</div>
            </div>
            <div className="kv"><span className="muted">Return on invested</span><span className="tnum" style={{ fontWeight: 700 }}>{PW.pct((total - cost) / cost * 100)}</span></div>
            <div className="kv"><span className="muted">Best class</span><span style={{ fontWeight: 600 }}>{bestClass(assets, period)}</span></div>
            <div className="kv"><span className="muted">Diversification</span><span style={{ fontWeight: 600 }}>{PW.byClass(assets, period).length} classes</span></div>
          </div>
        </div>
      </div>
    );
  }

  function Stat({ label, value, delta, positive }) {
    return (
      <div className="stat">
        <div className="tiny muted">{label}</div>
        <div className="tnum" style={{ fontSize: 18, fontWeight: 700, color: positive ? "var(--gain)" : "var(--ink-900)" }}>{value}</div>
        {delta != null && <UI.Delta value={delta} mode="pct" className="tiny" />}
      </div>
    );
  }

  function bestClass(assets, period) {
    const cs = PW.byClass(assets, period).map((g) => ({ g, pct: g.gain / (g.value - g.gain || 1) * 100 }));
    cs.sort((a, b) => b.pct - a.pct);
    return cs[0] ? cs[0].g.label : "—";
  }

  function Allocation(ctx) {
    const { assets, period, currency, go } = ctx;
    const [active, setActive] = useState(null);
    const total = PW.totalValue(assets);
    const classes = PW.byClass(assets, period);
    const segments = classes.map((g) => ({ id: g.id, label: g.label, value: g.value, color: g.color }));

    return (
      <div className="page-enter">
        <div className="grid" style={{ gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "center", marginBottom: 24 }}>
          <div className="card card-pad" style={{ display: "grid", placeItems: "center" }}>
            <UI.Donut segments={segments} size={250} thickness={34} activeId={active} onHover={setActive}>
              <div>
                <div className="section-eyebrow" style={{ fontSize: 10.5 }}>{active ? PW.CLASSES[active].label : "Allocated"}</div>
                <div className="tnum" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{active ? ((segments.find((s) => s.id === active).value / total) * 100).toFixed(1) + "%" : PW.fmt(total, currency, { compact: true })}</div>
              </div>
            </UI.Donut>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead><tr><th>Asset class</th><th className="num">Allocation</th><th className="num">Value</th><th className="num">This {PW.PERIODS[period].label}</th></tr></thead>
              <tbody>
                {classes.map((g) => {
                  const alloc = (g.value / total) * 100;
                  const ch = g.gain / (g.value - g.gain || 1) * 100;
                  return (
                    <tr key={g.id} className="clickable" onMouseEnter={() => setActive(g.id)} onMouseLeave={() => setActive(null)} onClick={() => go("class", { type: g.id })}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><UI.Dot color={g.color} /><span style={{ fontWeight: 600 }}>{g.label}</span></div></td>
                      <td className="num">
                        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
                          <div className="mini-bar"><span style={{ width: alloc + "%", background: g.color }} /></div>
                          <span className="tnum" style={{ fontWeight: 600, minWidth: 42, textAlign: "right" }}>{alloc.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="num tnum" style={{ fontWeight: 600 }}>{PW.fmt(g.value, currency, { compact: true })}</td>
                      <td className="num"><UI.Delta value={ch} mode="pct" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-head"><div><div className="section-eyebrow">Diversification</div><h2 className="section-h2">Concentration check</h2></div></div>
        <div className="grid class-grid">
          {concentration(classes, total).map((c) => (
            <div key={c.id} className="card card-pad" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <IconTile name={c.note === "ok" ? "shield" : "info"} size={40} tint={c.note === "ok" ? "green" : "orange"} />
              <div>
                <div style={{ fontWeight: 600 }}>{c.label}</div>
                <div className="tiny muted">{c.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function concentration(classes, total) {
    const top = [...classes].sort((a, b) => b.value - a.value)[0];
    const topPct = top ? (top.value / total) * 100 : 0;
    const out = [];
    out.push(topPct > 45
      ? { id: "conc", label: "Concentration", msg: `${top.label} is ${topPct.toFixed(0)}% of net worth — consider rebalancing.`, note: "warn" }
      : { id: "conc", label: "Balanced core", msg: `Largest class (${top.label}) is a healthy ${topPct.toFixed(0)}%.`, note: "ok" });
    const liquid = classes.filter((c) => ["stocks", "etf", "mutual", "cash", "crypto"].includes(c.id)).reduce((s, c) => s + c.value, 0);
    const liqPct = (liquid / total) * 100;
    out.push({ id: "liq", label: "Liquidity", msg: `${liqPct.toFixed(0)}% of wealth is in liquid assets.`, note: liqPct > 30 ? "ok" : "warn" });
    out.push({ id: "div", label: "Spread", msg: `Diversified across ${classes.length} asset classes.`, note: classes.length >= 4 ? "ok" : "warn" });
    return out;
  }

  function Settings(ctx) {
    const { currency, setCurrency, lang, setLang } = ctx;
    return (
      <div className="page-enter" style={{ maxWidth: 720 }}>
        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Display</div>
          <div className="tiny muted" style={{ marginBottom: 18 }}>How figures and labels appear across PennyWise.</div>

          <div className="set-row">
            <div><div style={{ fontWeight: 600 }}>Currency</div><div className="tiny muted">All values convert instantly. Base data is held in USD.</div></div>
            <div className="seg-pick">
              {Object.values(PW.CURRENCIES).map((c) => (
                <button key={c.code} className={"seg-opt" + (currency === c.code ? " on" : "")} onClick={() => setCurrency(c.code)}>
                  <span className="cur-sym">{c.symbol}</span>
                  <div style={{ textAlign: "left" }}><div style={{ fontWeight: 600 }}>{c.code}</div><div className="tiny muted">{c.name}</div></div>
                  {currency === c.code && <Icon name="check" size={16} style={{ color: "var(--green-700)", marginLeft: "auto" }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="set-row">
            <div><div style={{ fontWeight: 600 }}>Language</div><div className="tiny muted">More languages coming soon.</div></div>
            <div className="sel" style={{ minWidth: 200 }}>
              <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ width: "100%" }}>
                <option value="en">English</option>
                <option value="hi" disabled>हिन्दी (soon)</option>
                <option value="es" disabled>Español (soon)</option>
                <option value="zh" disabled>中文 (soon)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 4 }}>About your data</div>
          <div className="tiny muted" style={{ marginBottom: 14 }}>Everything you add lives privately in your browser.</div>
          <div className="kv"><span className="muted">Tracking cadence</span><span style={{ fontWeight: 600 }}>Weekly → Yearly</span></div>
          <div className="kv"><span className="muted">Base currency</span><span style={{ fontWeight: 600 }}>USD</span></div>
          <div className="kv"><span className="muted">Storage</span><span className="pill flat">Local (browser)</span></div>
        </div>
      </div>
    );
  }

  window.PAGES = window.PAGES || {};
  Object.assign(window.PAGES, { Trends, Allocation, Settings });
})();
