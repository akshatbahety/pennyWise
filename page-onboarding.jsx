/* ============================================================
   PennyWise — Onboarding flow for new users
   Steps: Welcome → Profile → Add first assets → Done
   ============================================================ */
(function () {
  const { useState, useMemo } = window.React;
  const PW = window.PW, UI = window.UI, Icon = window.Icon, IconTile = window.IconTile;

  const QUICK_ASSETS = [
    { name: "Stocks",        type: "stocks",     icon: "trending",  placeholder: "e.g. NVIDIA, Apple" },
    { name: "Mutual Funds",  type: "mutual",     icon: "layers",    placeholder: "e.g. Vanguard Total Mkt" },
    { name: "ETFs",          type: "etf",        icon: "basket",    placeholder: "e.g. VOO, QQQ" },
    { name: "Crypto",        type: "crypto",     icon: "bitcoin",   placeholder: "e.g. Bitcoin, Ethereum" },
    { name: "Real Estate",   type: "realestate", icon: "house",     placeholder: "e.g. Primary Residence" },
    { name: "Gold",          type: "gold",       icon: "goldbar",   placeholder: "e.g. Physical Gold" },
    { name: "Cash & Savings",type: "cash",       icon: "vault",     placeholder: "e.g. High-Yield Savings" },
    { name: "Alternatives",  type: "alt",        icon: "rocket",    placeholder: "e.g. Startup Equity" },
  ];

  const DEFAULT_M = { stocks: 2.4, mutual: 2.0, etf: 2.6, crypto: 7.5, gold: 2.2, silver: 1.6, realestate: 0.5, cash: 0.3, alt: 1.0 };

  function StepDots({ current, total }) {
    return (
      <div className="ob-dots">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={"ob-dot" + (i === current ? " active" : i < current ? " done" : "")} />
        ))}
      </div>
    );
  }

  function WelcomeStep({ onNext }) {
    return (
      <div className="ob-center">
        <div className="ob-logo">
          <span className="brand-mark" style={{ width: 56, height: 56, borderRadius: 16 }}>
            <Icon name="trends" size={28} />
          </span>
        </div>
        <h1 className="ob-title">Welcome to Penny<span style={{ color: "var(--orange-600)" }}>Wise</span></h1>
        <p className="ob-subtitle">Your wealth, at a glance. Track your entire net worth across stocks, crypto, real estate, and more — all in one calm, private dashboard.</p>
        <div className="ob-features">
          <div className="ob-feature">
            <div className="ob-feature-icon"><Icon name="shield" size={20} /></div>
            <div>
              <div className="ob-feature-title">100% private</div>
              <div className="ob-feature-desc">All data stays in your browser. Nothing leaves your device.</div>
            </div>
          </div>
          <div className="ob-feature">
            <div className="ob-feature-icon"><Icon name="chart" size={20} /></div>
            <div>
              <div className="ob-feature-title">9 asset classes</div>
              <div className="ob-feature-desc">Stocks, crypto, real estate, gold, cash, and more.</div>
            </div>
          </div>
          <div className="ob-feature">
            <div className="ob-feature-icon"><Icon name="sparkle" size={20} /></div>
            <div>
              <div className="ob-feature-title">Instant insights</div>
              <div className="ob-feature-desc">See your net worth, allocation, and trends in seconds.</div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary ob-cta" onClick={onNext}>
          Get started <Icon name="chevronRight" size={16} />
        </button>
      </div>
    );
  }

  function ProfileStep({ name, setName, currency, setCurrency, onNext, onBack }) {
    return (
      <div className="ob-center">
        <div className="ob-step-header">
          <div className="section-eyebrow">Step 1 of 3</div>
          <h2 className="ob-step-title">Tell us about yourself</h2>
          <p className="ob-step-desc">We'll personalize your dashboard. This stays on your device.</p>
        </div>

        <div className="ob-form">
          <label className="field">
            <span className="field-label">Your name</span>
            <input className="inp" placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>

          <label className="field">
            <span className="field-label">Preferred currency</span>
            <div className="seg-pick">
              {Object.values(PW.CURRENCIES).map((c) => (
                <button key={c.code} className={"seg-opt" + (currency === c.code ? " on" : "")} onClick={() => setCurrency(c.code)}>
                  <span className="cur-sym">{c.symbol}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.code}</div>
                    <div className="tiny muted">{c.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="ob-nav">
          <button className="btn btn-ghost" onClick={onBack}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} /> Back</button>
          <button className="btn btn-primary" onClick={onNext} disabled={!name.trim()}>
            Continue <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>
    );
  }

  function QuickAddRow({ entry, currency, value, onValue }) {
    const cur = PW.CURRENCIES[currency];
    const tint = window.CLASS_TINT[entry.type] || "green";
    return (
      <div className="ob-asset-row">
        <IconTile name={entry.icon} size={40} tint={tint} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.name}</div>
          <div className="tiny muted">{entry.placeholder}</div>
        </div>
        <div className="inp-money ob-value-input">
          <span>{cur.symbol}</span>
          <input className="inp" type="number" placeholder="0" value={value} onChange={(e) => onValue(e.target.value)} />
        </div>
      </div>
    );
  }

  function AssetsStep({ currency, quickValues, setQuickValues, onNext, onBack }) {
    const filled = Object.values(quickValues).filter((v) => parseFloat(v) > 0).length;
    const cur = PW.CURRENCIES[currency];
    const total = Object.entries(quickValues).reduce((sum, [type, val]) => {
      const v = parseFloat(val) || 0;
      return sum + v / cur.rate;
    }, 0);

    function setVal(type, val) {
      setQuickValues((prev) => ({ ...prev, [type]: val }));
    }

    return (
      <div className="ob-center ob-wide">
        <div className="ob-step-header">
          <div className="section-eyebrow">Step 2 of 3</div>
          <h2 className="ob-step-title">Add your assets</h2>
          <p className="ob-step-desc">Enter approximate values for each asset class you hold. You can add individual holdings and exact details later.</p>
        </div>

        <div className="ob-assets-list">
          {QUICK_ASSETS.map((entry) => (
            <QuickAddRow key={entry.type} entry={entry} currency={currency} value={quickValues[entry.type] || ""} onValue={(v) => setVal(entry.type, v)} />
          ))}
        </div>

        {total > 0 && (
          <div className="ob-total-bar">
            <span className="muted" style={{ fontWeight: 600 }}>Estimated net worth</span>
            <span className="tnum" style={{ fontWeight: 700, fontSize: 20 }}>{PW.fmt(total, currency)}</span>
          </div>
        )}

        <div className="ob-nav">
          <button className="btn btn-ghost" onClick={onBack}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} /> Back</button>
          <button className="btn btn-primary" onClick={onNext}>
            {filled > 0 ? "Continue" : "Skip for now"} <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>
    );
  }

  function DoneStep({ name, assetCount, total, currency, onFinish }) {
    return (
      <div className="ob-center">
        <div className="ob-done-icon">
          <Icon name="check" size={32} />
        </div>
        <h2 className="ob-step-title">You're all set{name ? ", " + name.split(" ")[0] : ""}!</h2>
        {total > 0 ? (
          <p className="ob-step-desc">
            We've added {assetCount} asset{assetCount !== 1 ? "s" : ""} worth <strong className="tnum">{PW.fmt(total, currency)}</strong> to your portfolio. You can refine details, add individual holdings, and track changes over time.
          </p>
        ) : (
          <p className="ob-step-desc">
            Your dashboard is ready. Add your first asset anytime to start tracking your net worth.
          </p>
        )}
        <button className="btn btn-primary ob-cta" onClick={onFinish}>
          Open your dashboard <Icon name="chevronRight" size={16} />
        </button>
      </div>
    );
  }

  function Onboarding(ctx) {
    const { setCurrency, currency, setAssets, onboardingDone } = ctx;
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [quickValues, setQuickValues] = useState({});

    function buildAssets() {
      const cur = PW.CURRENCIES[currency];
      const assets = [];
      for (const entry of QUICK_ASSETS) {
        const raw = parseFloat(quickValues[entry.type]) || 0;
        if (raw <= 0) continue;
        const valueUSD = raw / cur.rate;
        assets.push({
          id: PW.newId(),
          name: entry.name,
          type: entry.type,
          icon: entry.icon,
          symbol: null,
          units: null,
          value: valueUSD,
          cost: valueUSD,
          m: DEFAULT_M[entry.type] || 1.0,
        });
      }
      return assets;
    }

    function finish() {
      const assets = buildAssets();
      setAssets(assets);
      onboardingDone(name.trim());
    }

    const assets = useMemo(buildAssets, [quickValues, currency]);
    const total = PW.totalValue(assets);

    return (
      <div className="ob-wrap">
        <div className="ob-container">
          {step > 0 && step < 3 && <StepDots current={step - 1} total={3} />}
          {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
          {step === 1 && <ProfileStep name={name} setName={setName} currency={currency} setCurrency={setCurrency} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <AssetsStep currency={currency} quickValues={quickValues} setQuickValues={setQuickValues} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <DoneStep name={name} assetCount={assets.length} total={total} currency={currency} onFinish={finish} />}
        </div>
      </div>
    );
  }

  window.PAGES = window.PAGES || {};
  window.PAGES.Onboarding = Onboarding;
})();
