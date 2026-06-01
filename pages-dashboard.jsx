/* ============================================================
   PennyWise — Dashboard page
   ============================================================ */
(function () {
  const { useMemo } = window.React;
  const PW = window.PW, UI = window.UI, Icon = window.Icon, IconTile = window.IconTile;

  function MoverRow({ asset, period, currency, go }) {
    const g = PW.gainForPeriod(asset, period);
    const ch = PW.changePctForPeriod(asset, period);
    const tint = window.CLASS_TINT[asset.type];
    return (
      <button className="mover" onClick={() => go("class", { type: asset.type })}>
        <IconTile name={asset.icon} size={38} tint={tint} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{asset.name}</div>
          <div className="tiny muted">{PW.CLASSES[asset.type].label}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <UI.Delta value={g} currency={currency} mode="money" />
          <div className="tiny"><UI.Delta value={ch} mode="pct" /></div>
        </div>
      </button>
    );
  }

  function ClassCard({ g, period, currency, total, go }) {
    const ch = g.gain / (g.value - g.gain || 1) * 100;
    const alloc = (g.value / total) * 100;
    const spark = useMemo(() => {
      const fake = { value: g.value, m: ch / (PW.PERIODS[period].factor || 1) };
      return UI.assetSpark(fake, 16);
    }, [g.value, ch, period]);
    return (
      <button className="class-card" onClick={() => go("class", { type: g.id })}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <IconTile name={g.icon} size={40} tint={window.CLASS_TINT[g.id]} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{g.label}</div>
            <div className="tiny muted">{g.count} holding{g.count > 1 ? "s" : ""}</div>
          </div>
          <Icon name="chevronRight" size={16} style={{ color: "var(--ink-300)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 14 }}>
          <div>
            <div className="tnum" style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em" }}>{PW.fmt(g.value, currency)}</div>
            <div style={{ marginTop: 3 }}><UI.Pill value={ch} /></div>
          </div>
          <UI.Sparkline series={spark} color={g.hex} w={84} h={36} />
        </div>
        <div className="alloc-bar"><span style={{ width: alloc + "%", background: g.color }} /></div>
        <div className="tiny muted" style={{ marginTop: 6 }}>{alloc.toFixed(1)}% of net worth</div>
      </button>
    );
  }

  function HeroStat({ total, gain, gainPct, period, currency }) {
    return (
      <div className="hero-stat">
        <div className="section-eyebrow">Total Net Worth</div>
        <div className="nw-number tnum">{PW.fmt(total, currency)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <UI.Pill value={gainPct} />
          <span className="muted" style={{ fontWeight: 600 }}>
            <UI.Delta value={gain} currency={currency} mode="money" /> <span className="muted" style={{ fontWeight: 500 }}>this {PW.PERIODS[period].label}</span>
          </span>
        </div>
      </div>
    );
  }

  function Legend({ segments, total, currency, active, setActive, go }) {
    return (
      <div className="legend">
        {segments.map((s) => {
          const alloc = (s.value / total) * 100;
          return (
            <button key={s.id} className={"legend-row" + (active === s.id ? " on" : "")}
              onMouseEnter={() => setActive(s.id)} onMouseLeave={() => setActive(null)}
              onClick={() => go("class", { type: s.id })}>
              <UI.Dot color={s.color} />
              <span style={{ flex: 1, textAlign: "left", fontWeight: 600 }}>{s.label}</span>
              <span className="tnum muted" style={{ fontWeight: 600, fontSize: 13 }}>{alloc.toFixed(0)}%</span>
              <span className="tnum" style={{ fontWeight: 600, fontSize: 13, minWidth: 64, textAlign: "right" }}>{PW.fmt(s.value, currency, { compact: true })}</span>
            </button>
          );
        })}
      </div>
    );
  }

  function Dashboard(ctx) {
    const { assets, period, setPeriod, currency, go, t } = ctx;
    const { useState } = window.React;
    const [active, setActive] = useState(null);

    const total = PW.totalValue(assets);
    const gain = PW.periodGain(assets, period);
    const prevTotal = total - gain;
    const gainPct = prevTotal ? (gain / prevTotal) * 100 : 0;
    const classes = PW.byClass(assets, period);
    const segments = classes.map((g) => ({ id: g.id, label: g.label, value: g.value, color: g.color }));
    const sparkSeries = useMemo(() => PW.history(total, 26), [total]);

    const sorted = [...assets].map((a) => ({ a, g: PW.gainForPeriod(a, period) }));
    const gainers = sorted.filter((x) => x.g > 0).sort((p, q) => q.g - p.g).slice(0, 3).map((x) => x.a);
    const losers = sorted.filter((x) => x.g < 0).sort((p, q) => p.g - q.g).slice(0, 2).map((x) => x.a);
    const topMover = gainers[0];

    const hero = t.hero || "split";
    const donutSize = hero === "donut" ? 256 : 210;

    const donutCenter = (
      <div>
        <div className="section-eyebrow" style={{ fontSize: 10.5 }}>{active ? PW.CLASSES[active].label : "Net Worth"}</div>
        <div className="tnum" style={{ fontSize: hero === "donut" ? 28 : 23, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 2 }}>
          {active ? PW.fmt(segments.find((s) => s.id === active).value, currency, { compact: true }) : PW.fmt(total, currency, { compact: true })}
        </div>
        {active ? (
          <div className="tiny muted" style={{ marginTop: 2 }}>{((segments.find((s) => s.id === active).value / total) * 100).toFixed(1)}% of total</div>
        ) : (
          <div style={{ marginTop: 5 }}><UI.Pill value={gainPct} /></div>
        )}
      </div>
    );

    const isEmpty = assets.length === 0;

    if (isEmpty) {
      return (
        <div className="page-enter">
          <div className="dash-empty">
            <div className="dash-empty-hero card card-pad">
              <div className="dash-empty-icon">
                <Icon name="trends" size={32} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 8px" }}>Your portfolio is empty</h2>
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 28px" }}>
                Add your first asset to start tracking your net worth. You can track stocks, crypto, real estate, gold, cash, and more.
              </p>
              <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 15 }} onClick={() => go("add")}>
                <Icon name="plus" size={17} /> Add your first asset
              </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 24 }}>
              {[
                { icon: "shield", title: "100% private", desc: "All data lives in your browser. Nothing is sent anywhere." },
                { icon: "chart", title: "Track everything", desc: "9 asset classes — from stocks to real estate to crypto." },
                { icon: "sparkle", title: "Instant insights", desc: "Net worth, allocation, trends, and top movers at a glance." },
              ].map((f) => (
                <div key={f.title} className="card card-pad" style={{ textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--green-50)", color: "var(--green-700)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                    <Icon name={f.icon} size={20} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>{f.title}</div>
                  <div className="tiny muted" style={{ lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="page-enter">
        <div className="insight">
          <Icon name="sparkle" size={16} style={{ color: "var(--orange-600)" }} />
          {gain >= 0 ? (
            <span>You're up <strong className="tnum">{PW.fmt(gain, currency)}</strong> this {PW.PERIODS[period].label}{topMover ? <> — led by <strong>{topMover.name}</strong>.</> : "."}</span>
          ) : (
            <span>Net worth dipped <strong className="tnum">{PW.fmt(Math.abs(gain), currency)}</strong> this {PW.PERIODS[period].label}. Long-term trend stays up.</span>
          )}
          <span style={{ marginLeft: "auto" }}><UI.PeriodToggle value={period} onChange={setPeriod} /></span>
        </div>

        <div className={"card card-pad hero hero-" + hero}>
          {hero === "split" && (
            <>
              <div className="hero-left">
                <HeroStat total={total} gain={gain} gainPct={gainPct} period={period} currency={currency} />
                <div style={{ marginTop: 20 }}>
                  <UI.AreaChart series={sparkSeries} labels={null} currency={currency} height={140} showAxis={false} />
                </div>
                <div className="cost-row">
                  <div><span className="muted tiny">Invested</span><div className="tnum" style={{ fontWeight: 700, fontSize: 16 }}>{PW.fmt(PW.totalCost(assets), currency, { compact: true })}</div></div>
                  <div><span className="muted tiny">Total gain</span><div className="tnum" style={{ fontWeight: 700, fontSize: 16, color: "var(--gain)" }}>{PW.fmt(total - PW.totalCost(assets), currency, { compact: true })}</div></div>
                  <div><span className="muted tiny">Classes</span><div className="tnum" style={{ fontWeight: 700, fontSize: 16 }}>{classes.length}</div></div>
                </div>
              </div>
              <div className="hero-right">
                <UI.Donut segments={segments} size={donutSize} thickness={26} activeId={active} onHover={setActive}>{donutCenter}</UI.Donut>
                <Legend segments={segments} total={total} currency={currency} active={active} setActive={setActive} go={go} />
              </div>
            </>
          )}

          {hero === "centered" && (
            <div className="hero-centered">
              <HeroStat total={total} gain={gain} gainPct={gainPct} period={period} currency={currency} />
              <div className="hero-centered-grid">
                <UI.Donut segments={segments} size={210} thickness={24} activeId={active} onHover={setActive}>{donutCenter}</UI.Donut>
                <Legend segments={segments} total={total} currency={currency} active={active} setActive={setActive} go={go} />
              </div>
            </div>
          )}

          {hero === "donut" && (
            <>
              <UI.Donut segments={segments} size={donutSize} thickness={32} activeId={active} onHover={setActive}>{donutCenter}</UI.Donut>
              <div className="hero-right">
                <HeroStat total={total} gain={gain} gainPct={gainPct} period={period} currency={currency} />
                <Legend segments={segments} total={total} currency={currency} active={active} setActive={setActive} go={go} />
              </div>
            </>
          )}
        </div>

        <div className="grid movers-grid">
          <div className="card card-pad">
            <div className="card-head"><div className="card-title">Top gainers</div><span className="tiny muted">this {PW.PERIODS[period].label}</span></div>
            <div className="movers-list">
              {gainers.length ? gainers.map((a) => <MoverRow key={a.id} asset={a} period={period} currency={currency} go={go} />) : <div className="tiny muted" style={{ padding: 8 }}>No gainers this period.</div>}
            </div>
          </div>
          <div className="card card-pad">
            <div className="card-head"><div className="card-title">Watch</div><span className="tiny muted">softening</span></div>
            <div className="movers-list">
              {losers.length ? losers.map((a) => <MoverRow key={a.id} asset={a} period={period} currency={currency} go={go} />) : (
                <div className="empty" style={{ padding: "24px 8px" }}>
                  <IconTile name="leaf" size={40} tint="green" />
                  <div style={{ fontWeight: 600, marginTop: 10, color: "var(--ink-700)" }}>Everything's up</div>
                  <div className="tiny">No holdings lost value this {PW.PERIODS[period].label}.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="section-head">
          <div>
            <div className="section-eyebrow">Where your money lives</div>
            <h2 className="section-h2">Asset classes</h2>
          </div>
          <button className="btn btn-ghost" onClick={() => go("holdings")}>View all holdings <Icon name="chevronRight" size={15} /></button>
        </div>
        <div className="grid class-grid">
          {classes.map((g) => <ClassCard key={g.id} g={g} period={period} currency={currency} total={total} go={go} />)}
          <button className="class-card add-card" onClick={() => go("add")}>
            <div className="add-plus"><Icon name="plus" size={22} /></div>
            <div style={{ fontWeight: 600 }}>Add an asset</div>
            <div className="tiny muted">Track anything — your net worth updates instantly.</div>
          </button>
        </div>
      </div>
    );
  }

  window.PAGES = window.PAGES || {};
  window.PAGES.Dashboard = Dashboard;
})();
