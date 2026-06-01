/* ============================================================
   PennyWise — Holdings list + Asset Class detail
   ============================================================ */
(function () {
  const { useState, useMemo } = window.React;
  const PW = window.PW, UI = window.UI, Icon = window.Icon, IconTile = window.IconTile;

  function HoldingRow({ a, period, currency, go, onEdit }) {
    const g = PW.gainForPeriod(a, period);
    const ch = PW.changePctForPeriod(a, period);
    const totalGain = a.value - a.cost;
    const totalPct = a.cost ? (totalGain / a.cost) * 100 : 0;
    const spark = useMemo(() => UI.assetSpark(a, 16), [a.value, a.m]);
    return (
      <tr className="clickable" onClick={() => onEdit(a)}>
        <td>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconTile name={a.icon} size={40} tint={window.CLASS_TINT[a.type]} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
              <div className="tiny muted">{a.symbol ? <span className="mono">{a.symbol}</span> : PW.CLASSES[a.type].label}{a.units ? <span> · {a.units.toLocaleString()} units</span> : null}</div>
            </div>
          </div>
        </td>
        <td className="num"><UI.Sparkline series={spark} color="auto" w={80} h={30} /></td>
        <td className="num tnum">{PW.fmt(a.cost, currency, { compact: true })}</td>
        <td className="num tnum" style={{ fontWeight: 600 }}>{PW.fmt(a.value, currency)}</td>
        <td className="num"><div><UI.Delta value={ch} mode="pct" /></div><div className="tiny"><UI.Delta value={g} currency={currency} mode="money" /></div></td>
        <td className="num"><UI.Delta value={totalPct} mode="pct" /></td>
      </tr>
    );
  }

  function HoldingsTable({ assets, period, currency, go, onEdit, title }) {
    return (
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{title || "Holding"}</th>
              <th className="num">Trend</th>
              <th className="num">Invested</th>
              <th className="num">Value</th>
              <th className="num">Period</th>
              <th className="num">All-time</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => <HoldingRow key={a.id} a={a} period={period} currency={currency} go={go} onEdit={onEdit} />)}
          </tbody>
        </table>
      </div>
    );
  }

  function Holdings(ctx) {
    const { assets, period, currency, go, onEdit } = ctx;
    const [q, setQ] = useState("");
    const [filter, setFilter] = useState("all");
    const total = PW.totalValue(assets);
    const classes = PW.byClass(assets, period);

    const filtered = assets.filter((a) => {
      if (filter !== "all" && a.type !== filter) return false;
      if (q && !(a.name.toLowerCase().includes(q.toLowerCase()) || (a.symbol || "").toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });

    return (
      <div className="page-enter">
        <div className="toolbar">
          <div className="search-box">
            <Icon name="search" size={17} style={{ color: "var(--ink-400)" }} />
            <input placeholder="Search holdings or tickers…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="chips">
            <button className={"chip" + (filter === "all" ? " on" : "")} onClick={() => setFilter("all")}>All <span className="chip-n">{assets.length}</span></button>
            {classes.map((c) => (
              <button key={c.id} className={"chip" + (filter === c.id ? " on" : "")} onClick={() => setFilter(c.id)}>
                <UI.Dot color={c.color} size={8} />{c.label}<span className="chip-n">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
        {filtered.length ? (
          <HoldingsTable assets={filtered} period={period} currency={currency} go={go} onEdit={onEdit} />
        ) : (
          <div className="card card-pad empty">
            <IconTile name="search" size={48} tint="slate" />
            <div style={{ fontWeight: 600, marginTop: 12, color: "var(--ink-700)" }}>No holdings match</div>
            <div className="tiny">Try a different search or filter.</div>
          </div>
        )}
      </div>
    );
  }

  function ClassDetail(ctx) {
    const { assets, period, currency, go, onEdit, params } = ctx;
    const type = params.type;
    const meta = PW.CLASSES[type];
    const list = assets.filter((a) => a.type === type);
    const value = list.reduce((s, a) => s + a.value, 0);
    const cost = list.reduce((s, a) => s + a.cost, 0);
    const gain = list.reduce((s, a) => s + PW.gainForPeriod(a, period), 0);
    const gainPct = (value - gain) ? (gain / (value - gain)) * 100 : 0;
    const totalGain = value - cost;
    const totalPct = cost ? (totalGain / cost) * 100 : 0;
    const grandTotal = PW.totalValue(assets);
    const series = useMemo(() => PW.history(value, 26), [value]);
    const labels = useMemo(() => buildLabels(26), []);

    return (
      <div className="page-enter">
        <button className="back-link" onClick={() => go("holdings")}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} /> All holdings</button>
        <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginBottom: 20 }}>
          <div className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <IconTile name={meta.icon} size={52} tint={window.CLASS_TINT[type]} />
              <div>
                <div className="section-eyebrow">{meta.label}</div>
                <div className="tnum" style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{PW.fmt(value, currency)}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <UI.Pill value={gainPct} />
                <div className="tiny muted" style={{ marginTop: 4 }}>{((value / grandTotal) * 100).toFixed(1)}% of net worth</div>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <UI.AreaChart series={series} labels={labels} currency={currency} height={180} color={meta.hex} fillId={"cd" + type} />
            </div>
          </div>
          <div className="card card-pad" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <div className="kv"><span className="muted">Holdings</span><span className="tnum" style={{ fontWeight: 700 }}>{list.length}</span></div>
            <div className="kv"><span className="muted">Invested</span><span className="tnum" style={{ fontWeight: 700 }}>{PW.fmt(cost, currency)}</span></div>
            <div className="kv"><span className="muted">All-time gain</span><span className="tnum" style={{ fontWeight: 700, color: totalGain >= 0 ? "var(--gain)" : "var(--loss)" }}>{PW.fmt(totalGain, currency)} <UI.Delta value={totalPct} mode="pct" /></span></div>
            <div className="kv"><span className="muted">This {PW.PERIODS[period].label}</span><span className="tnum" style={{ fontWeight: 700 }}><UI.Delta value={gain} currency={currency} mode="money" /></span></div>
            <button className="btn btn-accent" style={{ marginTop: 6, justifyContent: "center" }} onClick={() => go("add", { presetType: type })}><Icon name="plus" size={16} /> Add to {meta.label}</button>
          </div>
        </div>
        <HoldingsTable assets={list} period={period} currency={currency} go={go} onEdit={onEdit} title={meta.label + " holdings"} />
      </div>
    );
  }

  function buildLabels(n) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const out = []; const now = new Date(2026, 5, 1);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - Math.round(i * (12 / (n - 1))), 1);
      out.push(months[d.getMonth()] + " '" + String(d.getFullYear()).slice(2));
    }
    return out;
  }

  window.PAGES = window.PAGES || {};
  window.PAGES.Holdings = Holdings;
  window.PAGES.ClassDetail = ClassDetail;
  window.PAGES.buildLabels = buildLabels;
})();
