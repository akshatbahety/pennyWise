/* ============================================================
   PennyWise — Add / Edit asset (with icon picker)
   ============================================================ */
(function () {
  const { useState, useMemo } = window.React;
  const PW = window.PW, UI = window.UI, Icon = window.Icon, IconTile = window.IconTile;

  const DEFAULT_M = { stocks: 2.4, mutual: 2.0, etf: 2.6, crypto: 7.5, gold: 2.2, silver: 1.6, realestate: 0.5, cash: 0.3, alt: 1.0 };
  const TINTS = ["orange", "green", "gold", "clay", "slate", "violet"];

  function Field({ label, hint, children }) {
    return (
      <label className="field">
        <span className="field-label">{label}{hint && <span className="field-hint"> · {hint}</span>}</span>
        {children}
      </label>
    );
  }

  function IconPicker({ value, tint, onPick, onTint }) {
    const [q, setQ] = useState("");
    const groups = window.ICON_PICKER;
    const filtered = groups.map((g) => ({
      ...g,
      names: g.names.filter((n) => !q || n.includes(q.toLowerCase())),
    })).filter((g) => g.names.length);
    return (
      <div className="picker">
        <div className="picker-head">
          <div className="search-box sm">
            <Icon name="search" size={15} style={{ color: "var(--ink-400)" }} />
            <input placeholder="Search icons…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="tint-swatches">
            {TINTS.map((tn) => (
              <button key={tn} className={"tint-sw t-" + tn + (tint === tn ? " on" : "")} onClick={() => onTint(tn)} title={tn} />
            ))}
          </div>
        </div>
        <div className="picker-scroll">
          {filtered.map((g) => (
            <div key={g.group} className="picker-group">
              <div className="picker-group-label">{g.group}</div>
              <div className="picker-grid">
                {g.names.map((n) => (
                  <button key={n} className={"picker-cell" + (value === n ? " on" : "")} onClick={() => onPick(n)}>
                    <IconTile name={n} size={42} tint={tint} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!filtered.length && <div className="tiny muted" style={{ padding: 16, textAlign: "center" }}>No icons match "{q}".</div>}
        </div>
      </div>
    );
  }

  function AddAsset(ctx) {
    const { assets, setAssets, currency, go, editing, params } = ctx;
    const isEdit = !!editing;
    const cur = PW.CURRENCIES[currency];

    const [form, setForm] = useState(() => editing ? {
      name: editing.name, type: editing.type, symbol: editing.symbol || "",
      units: editing.units || "", value: Math.round(editing.value * cur.rate),
      cost: Math.round(editing.cost * cur.rate), icon: editing.icon,
      tint: window.CLASS_TINT[editing.type] || "orange",
    } : {
      name: "", type: params?.presetType || "stocks", symbol: "", units: "",
      value: "", cost: "", icon: PW.CLASSES[params?.presetType || "stocks"].icon,
      tint: window.CLASS_TINT[params?.presetType || "stocks"] || "orange",
    });

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    function chooseClass(type) {
      setForm((f) => ({
        ...f, type,
        icon: (f.icon === PW.CLASSES[f.type].icon || !f.icon) ? PW.CLASSES[type].icon : f.icon,
        tint: window.CLASS_TINT[type] || "orange",
      }));
    }

    const valueUSD = (parseFloat(form.value) || 0) / cur.rate;
    const costUSD = (parseFloat(form.cost) || 0) / cur.rate || valueUSD;
    const gain = valueUSD - costUSD;
    const gainPct = costUSD ? (gain / costUSD) * 100 : 0;
    const valid = form.name.trim() && parseFloat(form.value) > 0;

    function save() {
      if (!valid) return;
      const base = {
        name: form.name.trim(), type: form.type,
        symbol: form.symbol.trim() || null,
        units: form.units ? parseFloat(form.units) : null,
        value: valueUSD, cost: costUSD || valueUSD,
        icon: form.icon, m: editing ? editing.m : DEFAULT_M[form.type] ?? 1.5,
      };
      if (isEdit) {
        setAssets((arr) => arr.map((a) => a.id === editing.id ? { ...a, ...base } : a));
      } else {
        setAssets((arr) => [...arr, { id: PW.newId(), ...base }]);
      }
      go(isEdit ? "class" : "dashboard", isEdit ? { type: form.type } : {});
    }

    function remove() {
      setAssets((arr) => arr.filter((a) => a.id !== editing.id));
      go("holdings");
    }

    return (
      <div className="page-enter add-wrap">
        <button className="back-link" onClick={() => go(isEdit ? "holdings" : "dashboard")}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} /> {isEdit ? "Holdings" : "Dashboard"}</button>

        <div className="add-grid">
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 16 }}>Details</div>

            <Field label="What are you tracking?">
              <input className="inp" placeholder="e.g. NVIDIA, Bitcoin, Rental Condo" value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus />
            </Field>

            <Field label="Asset class">
              <div className="class-pick">
                {PW.CLASS_ORDER.map((id) => (
                  <button key={id} className={"class-opt" + (form.type === id ? " on" : "")} onClick={() => chooseClass(id)}>
                    <UI.Dot color={PW.CLASSES[id].color} size={8} />{PW.CLASSES[id].label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="field-row">
              <Field label="Ticker / symbol" hint="optional"><input className="inp" placeholder="NVDA" value={form.symbol} onChange={(e) => set("symbol", e.target.value.toUpperCase())} /></Field>
              <Field label="Units / quantity" hint="optional"><input className="inp" type="number" placeholder="0" value={form.units} onChange={(e) => set("units", e.target.value)} /></Field>
            </div>

            <div className="field-row">
              <Field label={"Current value (" + cur.code + ")"}>
                <div className="inp-money"><span>{cur.symbol}</span><input className="inp" type="number" placeholder="0" value={form.value} onChange={(e) => set("value", e.target.value)} /></div>
              </Field>
              <Field label={"Invested (" + cur.code + ")"} hint="optional">
                <div className="inp-money"><span>{cur.symbol}</span><input className="inp" type="number" placeholder="0" value={form.cost} onChange={(e) => set("cost", e.target.value)} /></div>
              </Field>
            </div>

            <div className="add-actions">
              {isEdit && <button className="btn btn-subtle" style={{ color: "var(--loss)" }} onClick={remove}><Icon name="trash" size={16} /> Delete</button>}
              <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => go(isEdit ? "holdings" : "dashboard")}>Cancel</button>
                <button className={"btn btn-primary" + (valid ? "" : " disabled")} onClick={save} disabled={!valid}><Icon name="check" size={16} /> {isEdit ? "Save changes" : "Add to portfolio"}</button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card card-pad">
              <div className="card-title" style={{ marginBottom: 4 }}>Pick an icon</div>
              <div className="tiny muted" style={{ marginBottom: 14 }}>Make it yours — choose a glyph and color.</div>
              <IconPicker value={form.icon} tint={form.tint} onPick={(n) => set("icon", n)} onTint={(tn) => set("tint", tn)} />
            </div>

            <div className="card card-pad preview-card">
              <div className="section-eyebrow" style={{ marginBottom: 12 }}>Live preview</div>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <IconTile name={form.icon} size={46} tint={form.tint} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{form.name || "New asset"}</div>
                  <div className="tiny muted">{form.symbol ? <span className="mono">{form.symbol}</span> : PW.CLASSES[form.type].label}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="tnum" style={{ fontWeight: 700, fontSize: 16 }}>{PW.fmt(valueUSD, currency)}</div>
                  {costUSD > 0 && valueUSD !== costUSD && <div className="tiny"><UI.Delta value={gainPct} mode="pct" /></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  window.PAGES = window.PAGES || {};
  window.PAGES.AddAsset = AddAsset;
})();
