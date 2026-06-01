/* ============================================================
   PennyWise — App shell, routing, persistence
   ============================================================ */
(function () {
  const { useState, useEffect, useRef } = window.React;
  const PW = window.PW, Icon = window.Icon, PAGES = window.PAGES;

  const LS = {
    get(k, fb) { try { const v = localStorage.getItem("pw_" + k); return v == null ? fb : JSON.parse(v); } catch { return fb; } },
    set(k, v) { try { localStorage.setItem("pw_" + k, JSON.stringify(v)); } catch {} },
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "holdings", label: "Holdings", icon: "holdings" },
    { id: "trends", label: "Trends", icon: "trends" },
    { id: "allocation", label: "Allocation", icon: "allocation" },
  ];

  const TITLES = {
    dashboard: { t: "Overview", c: "Your wealth at a glance" },
    holdings: { t: "Holdings", c: "Every asset you track" },
    trends: { t: "Trends", c: "How your net worth is growing" },
    allocation: { t: "Allocation", c: "Where your money lives" },
    settings: { t: "Settings", c: "Currency, language & data" },
    add: { t: "Add asset", c: "Grow your portfolio" },
    class: { t: "", c: "" },
  };

  function getInitials(name) {
    if (!name) return "PW";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function App() {
    const [heroLayout, setHeroLayout] = useState(() => LS.get("heroLayout", "split"));
    const [onboarded, setOnboarded] = useState(() => LS.get("onboarded", false));
    const [userName, setUserName] = useState(() => LS.get("userName", ""));
    const [assets, setAssets] = useState(() => LS.get("assets", []));
    const [page, setPage] = useState(() => LS.get("page", "dashboard"));
    const [params, setParams] = useState({});
    const [editing, setEditing] = useState(null);
    const [period, setPeriod] = useState(() => LS.get("period", "M"));
    const [currency, setCurrency] = useState(() => LS.get("currency", "USD"));
    const [lang, setLang] = useState(() => LS.get("lang", "en"));
    const contentRef = useRef(null);

    useEffect(() => LS.set("assets", assets), [assets]);
    useEffect(() => LS.set("period", period), [period]);
    useEffect(() => LS.set("currency", currency), [currency]);
    useEffect(() => LS.set("lang", lang), [lang]);
    useEffect(() => LS.set("heroLayout", heroLayout), [heroLayout]);
    useEffect(() => LS.set("onboarded", onboarded), [onboarded]);
    useEffect(() => LS.set("userName", userName), [userName]);
    useEffect(() => { if (page !== "add" && page !== "class") LS.set("page", page); }, [page]);

    function go(p, pr = {}) {
      if (p !== "add") setEditing(null);
      setParams(pr); setPage(p);
      if (contentRef.current) contentRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    }
    function onEdit(asset) { setEditing(asset); setParams({}); setPage("add"); window.scrollTo(0, 0); }

    function onboardingDone(name) {
      setUserName(name);
      setOnboarded(true);
      setPage("dashboard");
    }

    if (!onboarded) {
      return React.createElement(PAGES.Onboarding, {
        currency, setCurrency, setAssets, onboardingDone,
      });
    }

    const t = { hero: heroLayout, accent: "#c2410c" };
    const ctx = { assets, setAssets, page, params, editing, period, setPeriod, currency, setCurrency, lang, setLang, go, onEdit, t };

    const PAGE_MAP = {
      dashboard: PAGES.Dashboard, holdings: PAGES.Holdings, trends: PAGES.Trends,
      allocation: PAGES.Allocation, settings: PAGES.Settings, add: PAGES.AddAsset, class: PAGES.ClassDetail,
    };
    const PageComp = PAGE_MAP[page] || PAGES.Dashboard;
    const Body = window.React.createElement(PageComp, { key: page + ":" + (params.type || params.presetType || (editing && editing.id) || ""), ...ctx });

    const title = page === "class" ? (PW.CLASSES[params.type]?.label || "Holdings") : TITLES[page]?.t;
    const crumb = page === "class" ? "Holdings" : TITLES[page]?.c;
    const total = PW.totalValue(assets);
    const initials = getInitials(userName);
    const displayName = userName || "User";
    const firstName = userName ? userName.split(" ")[0] : "User";

    return (
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark"><Icon name="trends" size={20} /></span>
            <span className="brand-name">Penny<span className="pw-w">Wise</span></span>
          </div>
          <nav className="nav">
            {NAV.map((n) => (
              <button key={n.id} className={"nav-item" + ((page === n.id || (page === "class" && n.id === "holdings")) ? " active" : "")} onClick={() => go(n.id)}>
                <Icon name={n.icon} size={19} />{n.label}
              </button>
            ))}
            <div className="nav-label">Account</div>
            <button className={"nav-item" + (page === "settings" ? " active" : "")} onClick={() => go("settings")}>
              <Icon name="settings" size={19} />Settings
            </button>
          </nav>

          <div className="net-mini">
            <div className="tiny muted">Net worth</div>
            <div className="tnum" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>{PW.fmt(total, currency, { compact: true })}</div>
          </div>

          <div className="sidebar-foot">
            <button className="user-chip" onClick={() => go("settings")}>
              <span className="avatar">{initials}</span>
              <span className="user-meta"><span className="nm">{displayName}</span><span className="sub">Personal</span></span>
            </button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <div>
              <div className="crumb">{crumb}</div>
              <h1>{title}</h1>
            </div>
            <div className="topbar-actions">
              <div className="sel"><select value={lang} onChange={(e) => setLang(e.target.value)} title="Language">
                <option value="en">EN</option>
                <option value="hi" disabled>हि (soon)</option>
                <option value="es" disabled>ES (soon)</option>
              </select></div>
              <div className="sel"><select value={currency} onChange={(e) => setCurrency(e.target.value)} title="Currency">
                {Object.values(PW.CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select></div>
              {page !== "add" && <button className="btn btn-accent" onClick={() => go("add")}><Icon name="plus" size={17} /> Add asset</button>}
            </div>
          </header>
          <main className="content" ref={contentRef}>{Body}</main>
        </div>
      </div>
    );
  }

  window.PennyWiseApp = App;
})();
