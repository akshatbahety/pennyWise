/* ============================================================
   PennyWise — SIP Calculator
   ============================================================ */
(function () {
  const { useState, useMemo } = window.React;
  const PW = window.PW, UI = window.UI, Icon = window.Icon;

  const AMOUNT_PRESETS = [5000, 10000, 25000, 50000];
  const YEAR_PRESETS = [5, 10, 15, 20, 25];

  function calcSIP(monthly, annualRate, years, stepUpPct) {
    const months = years * 12;
    const monthlyRate = annualRate / 100 / 12;
    const dataPoints = [];
    let totalInvested = 0;
    let totalValue = 0;
    let currentSIP = monthly;

    for (let m = 1; m <= months; m++) {
      if (stepUpPct > 0 && m > 1 && (m - 1) % 12 === 0) {
        currentSIP = currentSIP * (1 + stepUpPct / 100);
      }
      totalInvested += currentSIP;
      totalValue = (totalValue + currentSIP) * (1 + monthlyRate);

      if (m % Math.max(1, Math.floor(months / 60)) === 0 || m === months) {
        dataPoints.push({ month: m, invested: totalInvested, value: totalValue });
      }
    }

    return {
      totalInvested,
      totalValue,
      totalReturns: totalValue - totalInvested,
      dataPoints,
    };
  }

  function SIPCalculator(ctx) {
    const { currency } = ctx;

    const [monthly, setMonthly] = useState(10000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);
    const [stepUp, setStepUp] = useState(false);
    const [stepUpPct, setStepUpPct] = useState(10);

    const result = useMemo(
      () => calcSIP(monthly, rate, years, stepUp ? stepUpPct : 0),
      [monthly, rate, years, stepUp, stepUpPct]
    );

    const chartSeries = useMemo(() => result.dataPoints.map((d) => d.value), [result]);
    const investedSeries = useMemo(() => result.dataPoints.map((d) => d.invested), [result]);
    const chartLabels = useMemo(
      () => result.dataPoints.map((d) => {
        const y = Math.floor(d.month / 12);
        const m = d.month % 12;
        if (m === 0) return y + "Y";
        return y > 0 ? y + "Y" + m + "M" : m + "M";
      }),
      [result]
    );

    const donutSegments = [
      { id: "invested", value: result.totalInvested, color: "var(--green-600)" },
      { id: "returns", value: Math.max(0, result.totalReturns), color: "var(--orange-500)" },
    ];
    const returnsPct = result.totalInvested > 0
      ? ((result.totalReturns / result.totalInvested) * 100).toFixed(0)
      : "0";

    function handleAmountChange(e) {
      const v = parseFloat(e.target.value.replace(/,/g, ""));
      if (!isNaN(v) && v >= 0) setMonthly(v);
      else if (e.target.value === "") setMonthly(0);
    }

    function handleRateChange(e) {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v >= 0 && v <= 50) setRate(v);
      else if (e.target.value === "") setRate(0);
    }

    function handleYearsChange(e) {
      const v = parseInt(e.target.value);
      if (!isNaN(v) && v >= 1 && v <= 40) setYears(v);
      else if (e.target.value === "") setYears(1);
    }

    function handleStepUpPctChange(e) {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v >= 0 && v <= 50) setStepUpPct(v);
      else if (e.target.value === "") setStepUpPct(0);
    }

    const curSymbol = PW.CURRENCIES[currency]?.symbol || "$";

    return (
      <div className="page-enter">
        <div className="sip-layout">
          {/* Left: Inputs */}
          <div className="card card-pad sip-inputs">
            <div className="card-title" style={{ marginBottom: 4 }}>Configure your SIP</div>
            <div className="tiny muted" style={{ marginBottom: 22 }}>Adjust the parameters to see how your investment grows over time.</div>

            {/* Monthly amount */}
            <div className="field">
              <div className="field-label">Monthly investment</div>
              <div className="inp-money">
                <span>{curSymbol}</span>
                <input
                  className="inp tnum"
                  type="text"
                  value={monthly.toLocaleString()}
                  onChange={handleAmountChange}
                />
              </div>
              <div className="sip-presets">
                {AMOUNT_PRESETS.map((a) => (
                  <button
                    key={a}
                    className={"sip-preset-btn" + (monthly === a ? " on" : "")}
                    onClick={() => setMonthly(a)}
                  >
                    {curSymbol}{a >= 1000 ? (a / 1000) + "K" : a}
                  </button>
                ))}
              </div>
            </div>

            {/* Annual return */}
            <div className="field">
              <div className="field-label">Expected annual return</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  className="sip-slider"
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                />
                <div className="sip-rate-badge tnum">{rate}%</div>
              </div>
            </div>

            {/* Duration */}
            <div className="field">
              <div className="field-label">Investment duration</div>
              <div className="sip-presets sip-presets-wide">
                {YEAR_PRESETS.map((y) => (
                  <button
                    key={y}
                    className={"sip-preset-btn" + (years === y ? " on" : "")}
                    onClick={() => setYears(y)}
                  >
                    {y}Y
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <input
                  className="sip-slider"
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                />
                <div className="sip-rate-badge tnum" style={{ minWidth: 56 }}>{years} yr{years > 1 ? "s" : ""}</div>
              </div>
            </div>

            {/* Step-up toggle */}
            <div className="sip-stepup-section">
              <button className="sip-toggle-row" onClick={() => setStepUp(!stepUp)}>
                <div>
                  <div style={{ fontWeight: 600 }}>Step-up SIP</div>
                  <div className="tiny muted">Increase your SIP annually</div>
                </div>
                <span className={"sip-toggle" + (stepUp ? " on" : "")}>
                  <span className="sip-toggle-knob" />
                </span>
              </button>
              {stepUp && (
                <div className="sip-stepup-input" style={{ marginTop: 12 }}>
                  <div className="field-label">Annual increase</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      className="sip-slider"
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={stepUpPct}
                      onChange={(e) => setStepUpPct(parseFloat(e.target.value))}
                    />
                    <div className="sip-rate-badge tnum">{stepUpPct}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="sip-results">
            {/* Summary cards */}
            <div className="sip-summary-grid">
              <div className="card card-pad sip-summary-card">
                <div className="tiny muted">Total invested</div>
                <div className="tnum sip-summary-value" style={{ color: "var(--green-700)" }}>{PW.fmt(result.totalInvested, currency, { compact: true })}</div>
              </div>
              <div className="card card-pad sip-summary-card">
                <div className="tiny muted">Est. returns</div>
                <div className="tnum sip-summary-value" style={{ color: "var(--orange-600)" }}>{PW.fmt(result.totalReturns, currency, { compact: true })}</div>
              </div>
              <div className="card card-pad sip-summary-card sip-summary-total">
                <div className="tiny" style={{ color: "var(--green-100)" }}>Total value</div>
                <div className="tnum sip-summary-value" style={{ color: "#fff" }}>{PW.fmt(result.totalValue, currency, { compact: true })}</div>
              </div>
            </div>

            {/* Growth chart */}
            <div className="card card-pad" style={{ marginBottom: 18 }}>
              <div className="card-head" style={{ marginBottom: 14 }}>
                <div className="card-title">Wealth growth</div>
                <span className="tiny muted">{years} year projection</span>
              </div>
              <SIPChart
                valueSeries={chartSeries}
                investedSeries={investedSeries}
                labels={chartLabels}
                currency={currency}
              />
            </div>

            {/* Donut + breakdown */}
            <div className="sip-donut-row">
              <div className="card card-pad" style={{ display: "grid", placeItems: "center" }}>
                <UI.Donut segments={donutSegments} size={180} thickness={26}>
                  <div>
                    <div className="section-eyebrow" style={{ fontSize: 10 }}>Returns</div>
                    <div className="tnum" style={{ fontSize: 22, fontWeight: 700, color: "var(--orange-600)" }}>{returnsPct}%</div>
                  </div>
                </UI.Donut>
              </div>
              <div className="card card-pad" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
                <div className="kv">
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><UI.Dot color="var(--green-600)" /> Invested</span>
                  <span className="tnum" style={{ fontWeight: 600 }}>{PW.fmt(result.totalInvested, currency, { compact: true })}</span>
                </div>
                <div className="kv">
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><UI.Dot color="var(--orange-500)" /> Returns</span>
                  <span className="tnum" style={{ fontWeight: 600 }}>{PW.fmt(result.totalReturns, currency, { compact: true })}</span>
                </div>
                <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 14 }}>
                  <div className="kv">
                    <span className="muted">Wealth multiplier</span>
                    <span className="tnum" style={{ fontWeight: 700, color: "var(--green-800)" }}>
                      {result.totalInvested > 0 ? (result.totalValue / result.totalInvested).toFixed(1) : "0"}x
                    </span>
                  </div>
                </div>
                <div className="kv">
                  <span className="muted">Monthly SIP</span>
                  <span className="tnum" style={{ fontWeight: 600 }}>{PW.fmt(monthly, currency)}/mo</span>
                </div>
                {stepUp && (
                  <div className="kv">
                    <span className="muted">Final monthly SIP</span>
                    <span className="tnum" style={{ fontWeight: 600 }}>
                      {PW.fmt(monthly * Math.pow(1 + stepUpPct / 100, years - 1), currency)}/mo
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SIPChart({ valueSeries, investedSeries, labels, currency, height = 240 }) {
    const wrapRef = window.React.useRef(null);
    const [w, setW] = useState(640);
    const [hover, setHover] = useState(null);

    window.React.useEffect(() => {
      if (!wrapRef.current) return;
      const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
      ro.observe(wrapRef.current);
      return () => ro.disconnect();
    }, []);

    const padL = 8, padR = 8, padT = 14, padB = 26;
    const allVals = [...valueSeries, ...investedSeries];
    const min = 0;
    const max = Math.max(...allVals);
    const range = max - min || 1;
    const innerW = w - padL - padR, innerH = height - padT - padB;
    const X = (i) => padL + (i / (valueSeries.length - 1)) * innerW;
    const Y = (v) => padT + innerH - ((v - min) / range) * innerH * 0.92 - innerH * 0.04;

    const valuePts = valueSeries.map((v, i) => `${X(i)},${Y(v)}`);
    const valueLine = "M" + valuePts.join(" L");
    const valueArea = `M${X(0)},${height - padB} L` + valuePts.join(" L") + ` L${X(valueSeries.length - 1)},${height - padB} Z`;

    const investedPts = investedSeries.map((v, i) => `${X(i)},${Y(v)}`);
    const investedLine = "M" + investedPts.join(" L");
    const investedArea = `M${X(0)},${height - padB} L` + investedPts.join(" L") + ` L${X(investedSeries.length - 1)},${height - padB} Z`;

    function onMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const i = Math.round(((x - padL) / innerW) * (valueSeries.length - 1));
      setHover(Math.max(0, Math.min(valueSeries.length - 1, i)));
    }

    const grid = [0.25, 0.5, 0.75].map((f) => min + range * f);

    return (
      <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
        <svg width={w} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ display: "block" }}>
          <defs>
            <linearGradient id="sipValueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--orange-500)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--orange-500)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sipInvestedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--green-600)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--green-600)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((g, k) => (
            <line key={k} x1={padL} x2={w - padR} y1={Y(g)} y2={Y(g)} stroke="var(--line-soft)" strokeWidth="1" />
          ))}
          <path d={valueArea} fill="url(#sipValueFill)" />
          <path d={investedArea} fill="url(#sipInvestedFill)" />
          <path d={investedLine} fill="none" stroke="var(--green-600)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <path d={valueLine} fill="none" stroke="var(--orange-500)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          {hover != null && (
            <g>
              <line x1={X(hover)} x2={X(hover)} y1={padT} y2={height - padB} stroke="var(--ink-300)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={X(hover)} cy={Y(valueSeries[hover])} r="5" fill="var(--orange-500)" stroke="#fff" strokeWidth="2.5" />
              <circle cx={X(hover)} cy={Y(investedSeries[hover])} r="4" fill="var(--green-600)" stroke="#fff" strokeWidth="2" />
            </g>
          )}
          {labels && labels.map((lb, i) => {
            const step = Math.ceil(labels.length / 6);
            if (i % step !== 0 && i !== labels.length - 1) return null;
            return <text key={i} x={X(i)} y={height - 6} fontSize="11" fill="var(--ink-400)" textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}>{lb}</text>;
          })}
        </svg>
        {hover != null && (
          <div style={{
            position: "absolute", top: 0, left: Math.min(Math.max(X(hover) - 70, 0), w - 150),
            background: "var(--ink-900)", color: "#fff", padding: "8px 12px", borderRadius: 9,
            fontSize: 12.5, fontWeight: 600, pointerEvents: "none", boxShadow: "var(--shadow-md)",
            transform: "translateY(-4px)",
          }} className="tnum">
            <div style={{ opacity: 0.6, fontSize: 11, fontWeight: 500 }}>{labels ? labels[hover] : ""}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--orange-400)", display: "inline-block" }} />
              Value: {PW.fmt(valueSeries[hover], currency, { compact: true })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--green-400)", display: "inline-block" }} />
              Invested: {PW.fmt(investedSeries[hover], currency, { compact: true })}
            </div>
          </div>
        )}
      </div>
    );
  }

  window.PAGES = window.PAGES || {};
  window.PAGES.SIPCalculator = SIPCalculator;
})();
