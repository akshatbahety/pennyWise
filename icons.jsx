/* ============================================================
   PennyWise — Icon library
   Line icons, 24x24, stroke=currentColor. Picker tile style.
   ============================================================ */
(function () {
  const P = window.React.createElement;

  const ICONS = {
    // ---- App / nav ----
    dashboard: <><rect x="3" y="3" width="7.5" height="9" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6"/><rect x="13.5" y="12" width="7.5" height="9" rx="1.6"/><rect x="3" y="15.5" width="7.5" height="5.5" rx="1.6"/></>,
    holdings: <><path d="M3 7c0-1.4 3.6-2.5 8-2.5S19 5.6 19 7 15.4 9.5 11 9.5 3 8.4 3 7Z"/><path d="M3 7v5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V7"/><path d="M3 12v5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-5"/></>,
    trends: <><path d="M3 17l5-5 3.5 3.5L20 7"/><path d="M15 7h5v5"/></>,
    allocation: <><path d="M12 3v9l7.5 4.3A9 9 0 1 0 12 3Z"/><path d="M12 3a9 9 0 0 1 7.8 4.5L12 12"/></>,
    settings: <><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3"/></>,

    // ---- UI ----
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    chevronRight: <><path d="m9 5 7 7-7 7"/></>,
    chevronDown: <><path d="m5 9 7 7 7-7"/></>,
    arrowUp: <><path d="M12 19V5M6 11l6-6 6 6"/></>,
    arrowDown: <><path d="M12 5v14M18 13l-6 6-6-6"/></>,
    edit: <><path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"/><path d="m13.5 6.5 4 4"/></>,
    trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/></>,
    check: <><path d="m4 12 5 5L20 6"/></>,
    x: <><path d="M6 6l12 12M18 6 6 18"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.3 4 5.6 4 9s-1.4 6.7-4 9c-2.6-2.3-4-5.6-4-9s1.4-6.7 4-9Z"/></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8Z"/><path d="M10.5 20a1.8 1.8 0 0 0 3 0"/></>,
    sparkle: <><path d="M12 3v18M3 12h18" opacity="0"/><path d="M12 4l1.8 4.6L18 10l-4.2 1.4L12 16l-1.8-4.6L6 10l4.2-1.4L12 4Z"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="2.6"/></>,
    drag: <><circle cx="9" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.1" fill="currentColor" stroke="none"/></>,

    // ---- Asset / picker icons ----
    trending: <><path d="M3 17l5-5 3.5 3.5L20 7"/><path d="M15 7h5v5"/></>,
    chart: <><path d="M3 20h18"/><rect x="5" y="11" width="3" height="6" rx="0.6"/><rect x="10.5" y="6" width="3" height="11" rx="0.6"/><rect x="16" y="9" width="3" height="8" rx="0.6"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></>,
    basket: <><path d="M5 9h14l-1.3 9.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5 9Z"/><path d="M8.5 9 12 3.5 15.5 9"/><path d="M9.5 13v3M14.5 13v3"/></>,
    bitcoin: <><circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h4.2a2.1 2.1 0 0 1 0 4.2H9.5m0 0h4.6a2.1 2.1 0 0 1 0 4.3H9.5m0-8.5V16.5m1.4-9.8v1.3m0 9.4v1.3m2-12v1.3m0 9.4v1.3"/></>,
    ethereum: <><path d="M12 3 6 12l6 3.5L18 12 12 3Z"/><path d="m6 13.3 6 7.7 6-7.7-6 3.5-6-3.5Z"/></>,
    goldbar: <><path d="M7.5 9h9l1.8 7.5a1.5 1.5 0 0 1-1.5 1.8H7.2a1.5 1.5 0 0 1-1.5-1.8L7.5 9Z"/><path d="M9.2 9 9.8 6h4.4l.6 3"/><path d="M9 13.5h6"/></>,
    coins: <><ellipse cx="9" cy="7" rx="5.5" ry="2.6"/><path d="M3.5 7v4c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6V7"/><path d="M3.5 11v4c0 1.4 2.5 2.6 5.5 2.6 1 0 2-.1 2.8-.4"/><circle cx="16.5" cy="15" r="4.5"/></>,
    building: <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-3h4v3"/></>,
    house: <><path d="m4 11 8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/></>,
    wallet: <><rect x="3" y="6" width="18" height="13" rx="2.4"/><path d="M3 9h18"/><path d="M16.5 13.5h.01"/><path d="M16 6V4.5a1.5 1.5 0 0 0-1.9-1.45L4.6 5.3A2 2 0 0 0 3 7.25"/></>,
    vault: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 9v.01M12 9l2.6-1M14.6 13.5 12 12M9.4 13.5 12 12"/></>,
    rocket: <><path d="M5.5 14.5c-1.5 1-2 5-2 5s4-.5 5-2"/><path d="M14.5 6.5C17 4 21 4 21 4s0 4-2.5 6.5l-5 5-4-4 5-5Z"/><circle cx="15" cy="9.5" r="1.4"/><path d="m8.5 13.5-2 2M10.5 15.5l-2 2"/></>,
    chip: <><rect x="6.5" y="6.5" width="11" height="11" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="0.8"/><path d="M9 6.5V4M12 6.5V4M15 6.5V4M9 20v-2.5M12 20v-2.5M15 20v-2.5M6.5 9H4M6.5 12H4M6.5 15H4M20 9h-2.5M20 12h-2.5M20 15h-2.5"/></>,
    apple: <><path d="M15.5 8c1.7.4 3 2 3 4.2 0 3.2-2.4 6.8-4.3 6.8-1 0-1.5-.6-2.7-.6s-1.8.6-2.8.6C6.5 19 4 15.2 4 11.8 4 9 6 7.5 8 7.5c1.2 0 2.2.7 3 .7s1.8-.7 3-.7"/><path d="M12 5c.2-1.4 1.4-2.5 2.8-2.5C14.7 4 13.5 5 12 5Z"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>,
    diamond: <><path d="M5 4h14l3 5-10 11L2 9l3-5Z"/><path d="M2 9h20M9 4 7 9l5 11M15 4l2 5-5 11"/></>,
    car: <><path d="M4 13.5 5.6 8a2 2 0 0 1 1.9-1.4h9a2 2 0 0 1 1.9 1.4l1.6 5.5"/><path d="M3 13.5h18v4a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z"/><path d="M6.5 16h.01M17.5 16h.01"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18"/></>,
    bank: <><path d="M3 9.5 12 4l9 5.5"/><path d="M5 9.5h14M5.5 10v7M9.5 10v7M14.5 10v7M18.5 10v7M4 20h16M4 17.5h16"/></>,
    leaf: <><path d="M4 20C3 13 7 5 20 4c1 9-3 15-12 15a6 6 0 0 1-4-1Z"/><path d="M4 20c2-5 5-8 10-10"/></>,
    art: <><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="m6 17 4-5 3 3.5L16 12l3 4"/><circle cx="9" cy="8.5" r="1.5"/></>,
    watch: <><circle cx="12" cy="12" r="5.5"/><path d="M12 9.5V12l1.8 1.2"/><path d="M9 6.8 9.5 3h5l.5 3.8M9 17.2 9.5 21h5l.5-3.8"/></>,
    gem: <><path d="m12 3 6 4-6 14L6 7l6-4Z"/><path d="M6 7h12M9.5 4.5 12 21l2.5-16.5"/></>,
    plane: <><path d="M21 11.5 13.5 13l-2 7-1.5-.5.5-6-5 1.5L5 14l5.5-3.5L11 4.5A1.2 1.2 0 0 1 13.4 4.6L13 11l8-1.5v2Z"/></>,
    boat: <><path d="M4 16h16l-2 3.5a1 1 0 0 1-.9.5H6.9a1 1 0 0 1-.9-.5L4 16Z"/><path d="M6 14V8.5L18 11l-12 3ZM6 8.5 6 4l8 4.5"/></>,
    music: <><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="15" r="2.5"/><path d="M9.5 17V6l10-2v11"/><path d="M9.5 9 19.5 7"/></>,
    palette: <><path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-1.3-1-1.5-1-2.6 0-.8.7-1.4 1.6-1.4H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/></>,
    shield: <><path d="M12 3 5 6v5.5c0 4.3 2.9 7.3 7 9.5 4.1-2.2 7-5.2 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4.5"/></>,
    dollar: <><circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.5-.9-1.4-1.4-2.5-1.4-1.7 0-2.8 1-2.8 2.2 0 1.4 1.3 1.8 2.8 2.1 1.6.3 3 .8 3 2.3 0 1.3-1.2 2.3-3 2.3-1.3 0-2.3-.6-2.8-1.5M12 6v1.8M12 16.2V18"/></>,
    piggy: <><path d="M4 12c0-3.3 3.1-6 7-6 1.3 0 2.5.3 3.5.8L17 5l.5 2.7c1 1 1.5 2.2 1.5 3.3l1.5.6v3l-1.8.2c-.5.8-1.2 1.5-2.2 2v2h-3v-1.2c-.5.1-1 .2-1.5.2H10v1h-3v-2.2C5.2 17 4 14.7 4 12Z"/><path d="M15 11h.01M7 10c.5-1 1.5-1.7 2.8-2"/></>,
    calculator: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/></>,
  };

  function Icon({ name, size = 20, sw = 1.8, style, className }) {
    const inner = ICONS[name] || ICONS.dollar;
    return P("svg", {
      width: size, height: size, viewBox: "0 0 24 24",
      fill: "none", stroke: "currentColor", strokeWidth: sw,
      strokeLinecap: "round", strokeLinejoin: "round",
      style, className,
    }, inner);
  }

  function IconTile({ name, size = 44, tint = "orange", color, bg }) {
    const tints = {
      orange: { bg: "var(--orange-50)",  fg: "var(--orange-600)" },
      green:  { bg: "var(--green-50)",   fg: "var(--green-700)" },
      gold:   { bg: "#faf2dc",           fg: "#a87f1e" },
      slate:  { bg: "#eef1ef",           fg: "#5d6b63" },
      clay:   { bg: "#f7ece4",           fg: "#b3582f" },
      violet: { bg: "#f1ecf7",           fg: "#7a5aa6" },
    };
    const t = tints[tint] || tints.orange;
    return P("span", {
      className: "ico-tile",
      style: { width: size, height: size, background: bg || t.bg, color: color || t.fg },
    }, P(Icon, { name, size: Math.round(size * 0.54) }));
  }

  const PICKER = [
    { group: "Markets", names: ["trending", "chart", "layers", "basket", "compass", "dollar"] },
    { group: "Crypto", names: ["bitcoin", "ethereum", "chip", "rocket"] },
    { group: "Metals & Tangible", names: ["goldbar", "coins", "gem", "diamond", "watch", "art"] },
    { group: "Property", names: ["house", "building", "bank", "boat", "car", "plane"] },
    { group: "Banking", names: ["wallet", "vault", "piggy", "shield", "briefcase", "apple"] },
    { group: "Lifestyle", names: ["leaf", "palette", "music", "target"] },
  ];

  const CLASS_TINT = {
    stocks: "green", mutual: "green", etf: "slate", crypto: "orange",
    gold: "gold", silver: "slate", realestate: "clay", cash: "green", alt: "violet",
  };

  window.ICONS_MAP = ICONS;
  window.Icon = Icon;
  window.IconTile = IconTile;
  window.ICON_PICKER = PICKER;
  window.CLASS_TINT = CLASS_TINT;
})();
