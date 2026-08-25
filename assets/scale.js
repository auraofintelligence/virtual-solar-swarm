/* The scale: the fleet total and the allocation policy are both yours to set.
   This file does arithmetic on the dials; it decides nothing.
   Defaults are pinned so the starting point (fleet 1,332) reproduces the
   original design exactly: 100 solar watchers, 50-strong swarms, 12-strong
   enhanced pickets, 4-strong baselines, 200 funded targets. */
(function () {
  "use strict";

  var DEFAULT_POLICY = {
    obsSharePct: 7.5,   // share of the fleet held by the solar observatory
    swarmN: 50,         // satellites per priority-swarm world, at the starting fleet
    enhN: 12,           // per enhanced-picket target
    picketN: 4,         // per baseline picket
    interceptors: 6,    // held ready across the visitor classes
    scaleStations: true, // grow station sizes with the fleet, or hold them fixed
    order: "shipped"    // which bodies get pickets first as the budget moves
  };

  /* Transparent fill orders; no hidden scoring. */
  function orderedQueue(order) {
    var objs = window.VSS_OBJECTS;
    var pickets = objs.filter(function (o) { return o.tier === "picket"; });
    var census = objs.filter(function (o) { return o.tier === "survey"; });
    function byRadius(a, b) { return b.radiusKm - a.radiusKm; }
    function byNear(a, b) {
      var ha = VSS.helioOrbitOf(a), hb = VSS.helioOrbitOf(b);
      return (ha.aAU || ha.qAU || 999) - (hb.aAU || hb.qAU || 999);
    }
    if (order === "largest") return pickets.slice().sort(byRadius).concat(census.slice().sort(byRadius));
    if (order === "nearest") return pickets.slice().sort(byNear).concat(census.slice().sort(byNear));
    if (order === "hazard") {
      var isNea = function (o) { return o.group === "Near-Earth"; };
      var first = pickets.filter(isNea).concat(census.filter(isNea));
      var rest = pickets.filter(function (o) { return !isNea(o); }).concat(census.filter(function (o) { return !isNea(o); }));
      return first.concat(rest);
    }
    return pickets.concat(census); // shipped: the order the study started with
  }

  function allocate(F, policy) {
    var p = policy || DEFAULT_POLICY;
    var out = { F: F, per: {}, funded: 0, fleet: 0, notes: [] };
    var grow = p.scaleStations ? F / 1332 : 1;

    var obsN = Math.max(1, Math.round(F * p.obsSharePct / 100));
    var swarmN = Math.max(1, Math.round(p.swarmN * grow));
    var enhN = Math.max(1, Math.round(p.enhN * grow));
    var picketN = Math.max(1, Math.round(p.picketN * grow));
    var intTotal = Math.max(0, Math.round(p.interceptors));

    var budget = F;
    function give(o, n) {
      if (n <= 0 || !o) return;
      out.per[o.id] = (out.per[o.id] || 0) + n;
      budget -= n; out.fleet += n;
    }

    give(window.VSS_BY_ID.sun, Math.min(obsN, budget));
    window.VSS_OBJECTS.filter(function (o) { return o.tier === "swarm"; })
      .forEach(function (o) { if (budget >= swarmN) give(o, swarmN); });
    window.VSS_OBJECTS.filter(function (o) { return o.tier === "enhanced"; })
      .forEach(function (o) { if (budget >= enhN) give(o, enhN); });
    var ints = window.VSS_OBJECTS.filter(function (o) { return o.tier === "intercept"; });
    var perInt = ints.length ? Math.max(1, Math.floor(intTotal / ints.length)) : 0;
    ints.forEach(function (o) { if (budget >= perInt && intTotal > 0) give(o, perInt); });

    var queue = orderedQueue(p.order);
    var i = 0;
    while (budget >= picketN && i < queue.length) { give(queue[i], picketN); i++; }
    if (i >= queue.length && budget > 0) {
      var ids = Object.keys(out.per);
      var k = 0;
      while (budget > 0) { out.per[ids[k % ids.length]] += 1; budget--; out.fleet++; k++; }
      out.notes.push("Every catalogued body is funded under this policy; the remainder thickens every station.");
    }

    out.funded = Object.keys(out.per).length;
    out.tiers = { observatory: Math.min(obsN, F), swarm: swarmN, enhanced: enhN, picket: picketN, intercept: perInt };
    var picketTargets = window.VSS_OBJECTS.filter(function (o) { return o.tier === "picket"; }).length;
    out.promoted = Math.max(0, i - picketTargets);
    out.unfundedPickets = Math.max(0, picketTargets - Math.min(i, picketTargets));
    return out;
  }

  /* Downstream quantities at a given allocation. Same teaching-grade models
     as the rest of the site; numbers, not judgements. */
  function systems(alloc) {
    var repl = 0, inEarthSpace = 0, neaFunded = 0, neaTotal = 0, dataTB = 0, oceanWorlds = 0;
    window.VSS_OBJECTS.forEach(function (o) {
      var n = alloc.per[o.id] || 0;
      var life = VSS.DESIGN_LIFE[o.env];
      if (n && life) repl += n / life;
      if (o.id === "earth" || o.parent === "earth") inEarthSpace += n;
      if (o.group === "Near-Earth") { neaTotal++; if (n) neaFunded++; }
      if (n && (o.id === "europa" || o.id === "enceladus")) oceanWorlds += n;
      if (n) {
        var ho = VSS.helioOrbitOf(o);
        var d = o.cls === "star" ? 1 : (ho && ho.aAU ? Math.max(ho.aAU, 0.3) : 40);
        dataTB += Math.min(n * 0.32, 2000 / (d * d) * 86400 / 8 / 1e6);
      }
    });
    var VOL_40AU_KM3 = 4 / 3 * Math.PI * Math.pow(40 * 1.496e8, 3);
    return {
      replPerYear: repl,
      launchEveryDays: repl > 0 ? 365 / repl : Infinity,
      convoys: Math.ceil(alloc.fleet / 24),
      inEarthSpace: inEarthSpace,
      neaFunded: neaFunded, neaTotal: neaTotal,
      oceanWorlds: oceanWorlds,
      dataTBday: dataTB,
      kmCubedPerSat: VOL_40AU_KM3 / Math.max(alloc.fleet, 1),
      sunN: alloc.per.sun || 0,
      interceptorsReady: (alloc.per.oumuamua || 0) + (alloc.per.borisov || 0) + (alloc.per["3i-atlas"] || 0),
      costUsdB: alloc.fleet * 5.5 / 1000
    };
  }

  window.VSS_SCALE = { DEFAULT_POLICY: DEFAULT_POLICY, allocate: allocate, systems: systems };
})();
