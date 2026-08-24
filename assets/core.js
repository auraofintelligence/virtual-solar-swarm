/* Shared chrome, tier metadata and formatting for the Virtual Solar Swarm studio. */
(function () {
  "use strict";

  var NAV = [
    ["index.html", "Home"],
    ["targets.html", "The 200"],
    ["map.html", "Orbit map"],
    ["orbit-lab.html", "Orbit lab"],
    ["windows.html", "Launch windows"],
    ["builder.html", "Satellite builder"],
    ["sensors.html", "Instruments"],
    ["fleet.html", "Fleet"],
    ["cadence.html", "Cadence"],
    ["about.html", "About"]
  ];

  var TIERS = {
    observatory: { label: "Solar observatory", n: 100, cssVar: "--tier-obs" },
    swarm:       { label: "Priority swarm",    n: 50,  cssVar: "--tier-swarm" },
    enhanced:    { label: "Enhanced picket",   n: 12,  cssVar: "--tier-enh" },
    picket:      { label: "Baseline picket",   n: 4,   cssVar: "--tier-picket" },
    intercept:   { label: "Interceptor pair",  n: 2,   cssVar: "--tier-int" }
  };

  /* Design life in years by environment class. Radiation is the killer at
     Jupiter; power decay is the killer in the deep. */
  var DESIGN_LIFE = { solar: 7, scorch: 8, inner: 12, belt: 15, radiation: 6, outer: 18, deep: 25, intercept: null };

  var ENV_LABEL = {
    solar: "Close solar (heat and flare dose)",
    scorch: "Inner scorch zone",
    inner: "Inner system (benign)",
    belt: "Main belt to Jupiter distance",
    radiation: "Jovian radiation belts (harsh)",
    outer: "Outer system (power-starved)",
    deep: "Deep trans-Neptunian dark",
    intercept: "One-shot flyby"
  };

  var CLS_LABEL = {
    star: "Star", planet: "Planet", dwarf: "Dwarf planet", moon: "Moon",
    asteroid: "Asteroid", comet: "Comet", centaur: "Centaur", tno: "Trans-Neptunian object",
    interstellar: "Interstellar visitor"
  };

  var AUD_PER_USD = 1.55; // indicative conversion, August 2026

  function fmt(n, dp) {
    if (n === null || n === undefined || isNaN(n)) return "?";
    if (dp === undefined) dp = 0;
    return Number(n).toLocaleString("en-AU", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function fmtAud(usdM) {
    return "A$" + fmt(usdM * AUD_PER_USD, 1) + "m";
  }
  function fmtAudFull(usdM) {
    return "A$" + fmt(usdM * AUD_PER_USD, 1) + "m (US$" + fmt(usdM, 1) + "m)";
  }
  function fmtDate(d) {
    return d.toLocaleDateString("en-AU", { year: "numeric", month: "short" });
  }
  function fmtDur(years) {
    if (years === null || isNaN(years)) return "?";
    if (years < 1) return fmt(years * 12, 1) + " months";
    return fmt(years, 1) + " years";
  }
  function fmtKm(km) {
    if (km >= 1e6) return fmt(km / 1e6, 2) + " million km";
    if (km < 10) return fmt(km, 2) + " km";
    return fmt(km) + " km";
  }
  function fmtSpeed(vKms) {
    if (vKms >= 1) return fmt(vKms, 2) + " km/s";
    if (vKms >= 0.001) return fmt(vKms * 1000, 0) + " m/s";
    return fmt(vKms * 100000, 1) + " cm/s";
  }

  /* The heliocentric orbit that governs getting to this object. */
  function helioOrbitOf(o) {
    if (!o.parent) return o.orbit;
    var host = window.VSS_BY_ID[o.parent];
    return host ? host.orbit : null;
  }

  function tierCount(o, tierSizes) {
    var t = tierSizes || {};
    var meta = TIERS[o.tier];
    return t[o.tier] !== undefined ? t[o.tier] : (meta ? meta.n : 4);
  }

  function qs(name) {
    var m = new URLSearchParams(location.search).get(name);
    return m === null ? undefined : m;
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }

  function mountChrome(activeHref) {
    var header = document.getElementById("site-header");
    if (header) {
      var links = NAV.map(function (n) {
        return '<a href="' + n[0] + '"' + (n[0] === activeHref ? ' class="active"' : "") + ">" + n[1] + "</a>";
      }).join("");
      header.innerHTML =
        '<div class="brand"><a href="index.html"><span class="brand-mark">◍</span> Virtual Solar Swarm</a>' +
        '<span class="brand-sub">mission design studio</span></div>' +
        '<nav class="site-nav">' + links + "</nav>";
    }
    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.innerHTML =
        '<p>A design study in the open. Every number here is a model you can pull on; nothing described on this site has been built or launched.</p>' +
        '<p>🤝🔷 A Luke × Claude build. Created by Luke Nathan Hayes (<a href="https://github.com/auraofintelligence">auraofintelligence</a>) ' +
        'and Claude (Fable 5), August 2026. Not a Codex build. · <a href="about.html">About and licence</a></p>';
    }
  }

  window.VSS = {
    NAV: NAV, TIERS: TIERS, DESIGN_LIFE: DESIGN_LIFE, ENV_LABEL: ENV_LABEL, CLS_LABEL: CLS_LABEL,
    AUD_PER_USD: AUD_PER_USD,
    fmt: fmt, fmtAud: fmtAud, fmtAudFull: fmtAudFull, fmtDate: fmtDate, fmtDur: fmtDur, fmtKm: fmtKm, fmtSpeed: fmtSpeed,
    helioOrbitOf: helioOrbitOf, tierCount: tierCount, qs: qs, el: el, mountChrome: mountChrome
  };
})();
