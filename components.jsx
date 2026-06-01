/* ============================================================
   PennyWise — shared components
   Donut, AreaChart, Sparkline, deltas, toggles, selectors.
   ============================================================ */
(function () {
  const { useState, useRef, useEffect, useMemo } = window.React;
  const Icon = window.Icon;
  const PW = window.PW;

  function Delta({ value, currency, period, mode = "pct", className = "", showIcon = false }) {
    const dir = value > 0.0001 ? "up" : value < -0.0001 ? "down" : "flat";
    let text;
    if (mode === "pct") text = PW.pct(value);
    else text = (value > 0 ? "+" : value < 0 ? "−" : "") + PW.fmt(Math.abs(value), currency);
    return (
      <span className={"delta " + dir + " " + className}>
        {showIcon && dir !== "flat" && <Icon name={dir === "up" ? "arrowUp" : "arrowDown"} size={13} />}
        {text}
      </span>
    );
  }

  function Pill({ value, className = "" }) {
    const dir = value > 0.0001 ? "up" : value < -0.0001 ? "down" : "flat";
    return (
      <span className={"pill " + dir + " " + className}>
        {dir !== "flat" && <Icon name={dir === "up" ? "arrowUp" : "arrowDown"} size={13} />}
        {PW.pct(value)}
      </span>
    );
  }

  function PeriodToggle({ value, onChange }) {
    const keys = ["W", "M", "Q", "Y"];
    return (
      <div className="segment" role="tablist">
        {keys.map((k) => (
          <button key={k} className={value === k ? "on" : ""} onClick={() => onChange(k)}>
            {PW.PERIODS[k].label}
          </button>
        ))}
      </div>
    );
  }

  function Donut({ segments, size = 200, thickness = 26, gap = 2.2, children, activeId, onHover }) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = (size - thickness) / 2;
    const C = 2 * Math.PI * r;
    let acc = 0;
    const cx = size / 2;
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {segments.map((s) => {
            const frac = s.value / total;
            const len = Math.max(frac * C - gap, 0.5);
            const dash = `${len} ${C - len}`;
            const off = -acc * C;
            acc += frac;
            const dim = activeId && activeId !== s.id;
            return (
              <circle
                key={s.id}
                cx={cx} cy={cx} r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={activeId === s.id ? thickness + 4 : thickness}
                strokeDasharray={dash}
                strokeDashoffset={off}
                strokeLinecap="butt"
                style={{
                  opacity: dim ? 0.32 : 1,
                  transition: "opacity 0.2s, stroke-width 0.2s",
                  cursor: onHover ? "pointer" : "default",
                }}
                onMouseEnter={() => onHover && onHover(s.id)}
                onMouseLeave={() => onHover && onHover(null)}
              />
            );
          })}
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          textAlign: "center", padding: thickness + 6,
        }}>
          {children}
        </div>
      </div>
    );
  }

  function AreaChart({ series, labels, currency, height = 220, color = "var(--green-700)", fillId = "nwfill", showAxis = true }) {
    const wrapRef = useRef(null);
    const [w, setW] = useState(640);
    const [hover, setHover] = useState(null);
    useEffect(() => {
      if (!wrapRef.current) return;
      const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
      ro.observe(wrapRef.current);
      return () => ro.disconnect();
    }, []);

    const padL = showAxis ? 8 : 0, padR = 8, padT = 14, padB = showAxis ? 26 : 6;
    const min = Math.min(...series), max = Math.max(...series);
    const range = max - min || 1;
    const innerW = w - padL - padR, innerH = height - padT - padB;
    const X = (i) => padL + (i / (series.length - 1)) * innerW;
    const Y = (v) => padT + innerH - ((v - min) / range) * innerH * 0.92 - innerH * 0.04;

    const linePts = series.map((v, i) => `${X(i)},${Y(v)}`);
    const linePath = "M" + linePts.join(" L");
    const areaPath = `M${X(0)},${height - padB} L` + linePts.join(" L") + ` L${X(series.length - 1)},${height - padB} Z`;

    function onMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const i = Math.round(((x - padL) / innerW) * (series.length - 1));
      setHover(Math.max(0, Math.min(series.length - 1, i)));
    }

    const grid = [0.5, 1].map((f) => min + range * f);

    return (
      <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
        <svg width={w} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ display: "block" }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((g, k) => (
            <line key={k} x1={padL} x2={w - padR} y1={Y(g)} y2={Y(g)} stroke="var(--line-soft)" strokeWidth="1" />
          ))}
          <path d={areaPath} fill={`url(#${fillId})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={X(series.length - 1)} cy={Y(series[series.length - 1])} r="4" fill={color} stroke="#fff" strokeWidth="2" />
          {hover != null && (
            <g>
              <line x1={X(hover)} x2={X(hover)} y1={padT} y2={height - padB} stroke="var(--ink-300)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={X(hover)} cy={Y(series[hover])} r="5" fill={color} stroke="#fff" strokeWidth="2.5" />
            </g>
          )}
          {showAxis && labels && labels.map((lb, i) => {
            const step = Math.ceil(labels.length / 6);
            if (i % step !== 0 && i !== labels.length - 1) return null;
            return <text key={i} x={X(i)} y={height - 8} fontSize="11" fill="var(--ink-400)" textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}>{lb}</text>;
          })}
        </svg>
        {hover != null && (
          <div style={{
            position: "absolute", top: 0, left: Math.min(Math.max(X(hover) - 60, 0), w - 130),
            background: "var(--ink-900)", color: "#fff", padding: "7px 11px", borderRadius: 9,
            fontSize: 12.5, fontWeight: 600, pointerEvents: "none", boxShadow: "var(--shadow-md)",
            transform: "translateY(-4px)",
          }} className="tnum">
            <div style={{ opacity: 0.6, fontSize: 11, fontWeight: 500 }}>{labels ? labels[hover] : ""}</div>
            {PW.fmt(series[hover], currency)}
          </div>
        )}
      </div>
    );
  }

  function Sparkline({ series, color = "var(--green-700)", w = 96, h = 34 }) {
    const min = Math.min(...series), max = Math.max(...series), range = max - min || 1;
    const X = (i) => (i / (series.length - 1)) * w;
    const Y = (v) => h - 3 - ((v - min) / range) * (h - 6);
    const path = "M" + series.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" L");
    const up = series[series.length - 1] >= series[0];
    const c = color === "auto" ? (up ? "var(--gain)" : "var(--loss)") : color;
    return (
      <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
        <path d={path} fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  function Dot({ color, size = 9 }) {
    return <span style={{ width: size, height: size, borderRadius: 99, background: color, display: "inline-block", flexShrink: 0 }} />;
  }

  function assetSpark(asset, n = 16) {
    const m = (asset.m || 0) / 100;
    const wob = [0, 0.3, -0.2, 0.5, -0.1, 0.4, 0.2, -0.3, 0.6, 0.1, -0.2, 0.5, 0.3, 0.7, 0.4, 1];
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const base = 1 - m * (1 - t) * 1.0;
      out.push(asset.value * (base + (wob[i % wob.length] * Math.abs(m) * 0.25)));
    }
    out[n - 1] = asset.value;
    return out;
  }

  window.UI = { Delta, Pill, PeriodToggle, Donut, AreaChart, Sparkline, Dot, assetSpark };
})();
