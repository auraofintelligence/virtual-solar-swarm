/* The scale: every number in this study as a function of one dial.
   Proportional scaling laws pinned so a fleet of 1,332 reproduces the
   starting design exactly (100 solar watchers, 50-strong swarms,
   12-strong enhanced pickets, 4-strong baselines, 200 funded targets).
   The starting point is a calibration, not a law. */
(function () {
  "use strict";

  /* Priority score for promoting census entries (and triaging pickets when
     the budget is thin). Deterministic and explainable: class worth plus
     size, with a nudge for hazard-class rocks near Earth. */
  var CLASS_W = { star: 99, planet: 9, dwarf: 6.5, moon: 5, asteroid: 4.5, comet: 4, centaur: 3.8, tno: 3.5, interstellar: 8, hypothesis: 1 };
  function score(o) {
    var s = (CLASS_W[o.cls] || 3) + Math.log10(Math.max(o.radiusKm, 0.1)) * 0.8;
    if (o.group === "Near-Earth") s += 1.5;          // hazard custody matters
    if (o.env === "radiation") s += 0.4;             // ocean-world neighbourhood
    return s;
  }

  function allocate(F) {
    var objs = window.VSS_OBJECTS;
    var out = { F: F, per: {}, tiers: {}, funded: 0, fleet: 0, notes: [] };

    // tier size laws, calibrated at F = 1332
    var obsN = Math.min(1200, Math.max(4, Math.round(F * 100 / 1332)));
    var swarmN = Math.min(300, Math.max(6, Math.round(F * 50 / 1332)));
    var enhN = Math.min(40, Math.max(4, Math.round(F * 12 / 1332)));
    var intN = Math.min(12, Math.max(2, Math.round(F * 6 / 1332))); // total interceptors
    var picketN = Math.min(8, Math.max(2, Math.round(F * 4 / 1332)));

    var budget = F;
    function give(o, n) {
      if (n <= 0) return;
      out.per[o.id] = (out.per[o.id] || 0) + n;
      budget -= n;
      out.fleet += n;
    }

    // fixed roles first
    var sun = window.VSS_BY_ID.sun;
    give(sun, Math.min(obsN, Math.max(4, budget)));
    var swarms = objs.filter(function (o) { return o.tier === "swarm"; });
    swarms.forEach(function (o) { if (budget > swarmN) give(o, swarmN); });
    var enhs = objs.filter(function (o) { return o.tier === "enhanced"; });
    enhs.forEach(function (o) { if (budget > enhN) give(o, enhN); });
    var ints = objs.filter(function (o) { return o.tier === "intercept"; });
    var perInt = Math.max(1, Math.floor(intN / Math.max(ints.length, 1)));
    ints.forEach(function (o) { if (budget > perInt) give(o, perInt); });

    // pickets by priority, then census promotion by priority
    var pickets = objs.filter(function (o) { return o.tier === "picket"; })
      .sort(function (a, b) { return score(b) - score(a); });
    var census = objs.filter(function (o) { return o.tier === "survey"; })
      .sort(function (a, b) { return score(b) - score(a); });
    var queue = pickets.concat(census);
    var i = 0;
    while (budget >= picketN && i < queue.length) { give(queue[i], picketN); i++; }
    if (i >= queue.length && budget > 0) {
      // everyone is funded; thicken every station evenly with what is left
      var ids = Object.keys(out.per);
      var k = 0;
      while (budget > 0) { out.per[ids[k % ids.length]] += 1; budget--; out.fleet++; k++; }
      out.notes.push("Every catalogued body is funded at this scale; the surplus thickens every station.");
    }

    out.funded = Object.keys(out.per).length;
    out.tiers = { observatory: obsN, swarm: swarmN, enhanced: enhN, picket: picketN, intercept: perInt };
    out.promoted = Math.max(0, i - pickets.length);
    out.unfundedPickets = Math.max(0, pickets.length - Math.min(i, pickets.length));
    return out;
  }

  /* Downstream systems at a given allocation. Reuses the site's own models
     at their lowest fidelity: proportional laws, honestly labelled. */
  function systems(alloc) {
    var objs = window.VSS_OBJECTS;
    var byId = window.VSS_BY_ID;
    var A = window.ASTRO;
    var repl = 0, inEarthSpace = 0, neaFunded = 0, neaTotal = 0, dataTB = 0;
    objs.forEach(function (o) {
      var n = alloc.per[o.id] || 0;
      var life = VSS.DESIGN_LIFE[o.env];
      if (n && life) repl += n / life;
      if (o.id === "earth" || o.parent === "earth") inEarthSpace += n;
      if (o.group === "Near-Earth") { neaTotal++; if (n) neaFunded++; }
      if (n) {
        var ho = VSS.helioOrbitOf(o);
        var d = o.cls === "star" ? 1 : (ho && ho.aAU ? Math.max(ho.aAU, 0.3) : 40);
        dataTB += Math.min(n * 0.32, 2000 / (d * d) * 86400 / 8 / 1e6);
      }
    });
    var convoys = Math.ceil(alloc.fleet / 24);
    return {
      replPerYear: repl,
      launchEveryDays: repl > 0 ? 365 / repl : Infinity,
      convoys: convoys,
      inEarthSpace: inEarthSpace,
      neaFunded: neaFunded, neaTotal: neaTotal,
      dataTBday: dataTB,
      costUsdB: alloc.fleet * 5.5 / 1000   // ~US$5.5m average satellite at production scale
    };
  }

  /* Gate one: would it disrupt the solar system? */
  function disruptionGate(alloc, sys) {
    var checks = [];
    var VOL_40AU = 4 / 3 * Math.PI * Math.pow(40 * 1.496e8, 3); // km^3
    var perSat = VOL_40AU / Math.max(alloc.fleet, 1);
    checks.push({
      level: "ok",
      title: "Room to move",
      text: "Spread across the solar system, this fleet is one satellite per " + (perSat / 1e27).toFixed(0) +
        " thousand trillion trillion cubic kilometres. Space out there is not crowded; it is barely occupied."
    });
    var earthLevel = sys.inEarthSpace <= 2000 ? "ok" : sys.inEarthSpace <= 20000 ? "warn" : "bad";
    checks.push({
      level: earthLevel,
      title: "Earth's own doorstep",
      text: "About " + VSS.fmt(sys.inEarthSpace) + " of these satellites would live in Earth and Moon space, against roughly ten thousand active satellites already there today. " +
        (earthLevel === "ok" ? "A modest addition, and the only shell where traffic care is a real discipline."
          : earthLevel === "warn" ? "At this scale the home shell needs serious traffic management; the rest of the system still barely notices."
            : "At this scale the home shell is being crowded beyond today's entire satellite population; the gate fails here first.")
    });
    checks.push({
      level: "ok",
      title: "Ocean worlds stay clean",
      text: "Watchers at Europa and Enceladus orbit, never land, and would be built sterilised to planetary-protection rules; their end-of-life is a controlled disposal away from the ice, funded in escrow before launch, the same discipline the study demands of every satellite."
    });
    checks.push({
      level: alloc.fleet <= 50000 ? "ok" : "warn",
      title: "Leave no wreckage",
      text: "Every satellite carries a funded end-of-life plan before it is allowed to switch on: deorbit, graveyard orbit or controlled disposal. The commons stays usable because the rule scales with the fleet."
    });
    var worst = checks.reduce(function (w, c) { return c.level === "bad" ? "bad" : (c.level === "warn" && w !== "bad") ? "warn" : w; }, "ok");
    return { verdict: worst, checks: checks };
  }

  /* Gate two: does it earn its keep for humanity? */
  function worthGate(alloc, sys) {
    var sunN = alloc.per.sun || 0;
    var rows = [];
    rows.push({
      met: sunN >= 12,
      title: "No blind side on the Sun",
      text: sunN >= 12 ? "With " + sunN + " solar watchers, every side of the Sun is watched at once; no storm could leave unseen."
        : "With only " + sunN + " solar watchers there are still blind sides; a storm could begin where nothing is looking."
    });
    rows.push({
      met: sunN >= 60,
      title: "Storm warnings in days, not hours",
      text: sunN >= 60 ? "At " + sunN + " vantage points the model would support solar storm forecasts stretching from today's roughly one hour of warning toward days, which is the difference between watching the lights fail and preparing calmly."
        : "Multi-day storm forecasting would want sixty or more vantage points; this scale is not there yet."
    });
    rows.push({
      met: sys.neaFunded >= sys.neaTotal,
      title: "Custody of the near-Earth rocks",
      text: sys.neaFunded + " of the " + sys.neaTotal + " catalogued near-Earth asteroids under continuous watch" +
        (sys.neaFunded >= sys.neaTotal ? ": full custody of the listed hazards, with orbits refined every day." : "; the rest wait on survey sweeps.")
    });
    rows.push({
      met: alloc.funded >= 384,
      title: "Nothing unwatched",
      text: alloc.funded + " of 384 catalogued bodies hold dedicated watchers (" + VSS.fmt(alloc.funded / 384 * 100, 0) + " per cent)."
    });
    rows.push({
      met: sys.dataTBday >= 20,
      title: "A knowledge commons",
      text: "About " + VSS.fmt(sys.dataTBday, 0) + " terabytes of open, verifiable observations delivered every day, free to every school, researcher and community on Earth."
    });
    rows.push({
      met: (alloc.per.oumuamua || 0) >= 1,
      title: "Ready for visitors",
      text: (alloc.per.oumuamua ? "Interceptors stand fuelled for the next visitor from another star: our place in the galaxy includes answering the door."
        : "No interceptors at this scale; the next interstellar visitor would pass unmet.")
    });
    var met = rows.filter(function (r) { return r.met; }).length;
    return { rows: rows, met: met, total: rows.length };
  }

  window.VSS_SCALE = { allocate: allocate, systems: systems, disruptionGate: disruptionGate, worthGate: worthGate, score: score };
})();
