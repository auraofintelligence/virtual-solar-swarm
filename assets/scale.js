/* Arithmetic for the scale page: given a fleet total and an allocation
   policy, work out who gets what and what follows from it. Decides nothing. */
(function () {
  "use strict";

  /* Station sizes are quoted at VSS.BASE_FLEET and ride the total from there,
     unless the reader switches that off. The reset button restores this set. */
  var BASE_POLICY = {
    obsN: 100,          // satellites at the solar observatory
    swarmN: 50,         // per priority-swarm world
    enhN: 12,           // per enhanced-picket target
    picketN: 4,         // per baseline picket
    interceptors: 6,    // held ready across the visitor classes
    scaleStations: true, // let station sizes ride the fleet total, or hold them fixed
    order: "catalogue"  // dedicated tiers before the census
  };
  /* What the page loads with: same sizes, but the fill order defers to
     physics: whoever could soonest be on station gets crewed first. */
  var DEFAULT_POLICY = Object.assign({}, BASE_POLICY, { order: "windows" });

  /* Days until a satellite could be on station: next launch window plus the
     cruise (capped at the site's 25-year fast-path convention), or the next
     perihelion for the stretched divers. Cached per body. */
  var arrivalCache = null;
  function arrivalDays(o) {
    var A = window.ASTRO;
    var earth = window.VSS_BY_ID.earth.orbit;
    var now = new Date();
    var ho = VSS.helioOrbitOf(o);
    if (!ho || o.cls === "hypothesis") return Infinity; // no flight plan to an unfound world
    if (ho.hyperbolic) return 30;                        // interceptors go when the visitor does
    if (ho.e > 0.85) {
      var peri = A.nextPerihelia(ho, now, 1)[0];
      return peri ? (peri - now) / 86400000 : Infinity;
    }
    if (Math.abs(ho.aAU - 1) < 0.02) return 90;          // co-orbital neighbours: on demand
    var t = A.fastTransfer(1, ho.aAU, 0);
    var wins = A.windowsForTransfer(earth, ho, now, 1, t);
    if (!wins.length) return Infinity;
    return (wins[0] - now) / 86400000 + Math.min(t.tofYears, 25) * 365.25;
  }
  function arrivalOf(o) {
    if (!arrivalCache) {
      arrivalCache = {};
      window.VSS_OBJECTS.forEach(function (b) { arrivalCache[b.id] = arrivalDays(b); });
    }
    return arrivalCache[o.id];
  }

  /* Fill orders. "catalogue" keeps the dedicated tiers ahead of the census;
     every other order treats all bodies as one queue. */
  function orderedQueue(order) {
    var objs = window.VSS_OBJECTS;
    var pickets = objs.filter(function (o) { return o.tier === "picket"; });
    var census = objs.filter(function (o) { return o.tier === "survey"; });
    var merged = pickets.concat(census);
    function byRadius(a, b) { return b.radiusKm - a.radiusKm; }
    function byNear(a, b) {
      var ha = VSS.helioOrbitOf(a), hb = VSS.helioOrbitOf(b);
      return (ha.aAU || ha.qAU || 999) - (hb.aAU || hb.qAU || 999);
    }
    function byArrival(a, b) { return arrivalOf(a) - arrivalOf(b); }
    if (order === "windows") return merged.slice().sort(byArrival);
    if (order === "largest") return merged.slice().sort(byRadius);
    if (order === "nearest") return merged.slice().sort(byNear);
    if (order === "hazard") {
      var isNea = function (o) { return o.group === "Near-Earth"; };
      return merged.filter(isNea).sort(byArrival).concat(merged.filter(function (o) { return !isNea(o); }).sort(byArrival));
    }
    return merged; // catalogue order
  }

  function allocate(F, policy) {
    var p = policy || DEFAULT_POLICY;
    var out = { F: F, per: {}, crewed: 0, fleet: 0, notes: [] };
    var grow = p.scaleStations ? F / VSS.BASE_FLEET : 1;

    var obsN = Math.max(1, Math.round(p.obsN * grow));
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
      out.notes.push("Every catalogued body has a crew under this policy; the remainder thickens every station.");
    }

    out.crewed = Object.keys(out.per).length;
    out.tiers = { observatory: Math.min(obsN, F), swarm: swarmN, enhanced: enhN, picket: picketN, intercept: perInt };
    out.promoted = window.VSS_OBJECTS.filter(function (o) { return o.tier === "survey" && out.per[o.id]; }).length;
    out.uncrewedDedicated = window.VSS_OBJECTS.filter(function (o) { return o.tier === "picket" && !out.per[o.id]; }).length;
    return out;
  }

  /* Downstream quantities at a given allocation. Same teaching-grade models
     as the rest of the site; numbers, not judgements. */
  function systems(alloc) {
    var repl = 0, inEarthSpace = 0, neaCrewed = 0, neaTotal = 0, dataTB = 0, oceanWorlds = 0;
    window.VSS_OBJECTS.forEach(function (o) {
      var n = alloc.per[o.id] || 0;
      var life = VSS.DESIGN_LIFE[o.env];
      if (n && life) repl += n / life;
      if (o.id === "earth" || o.parent === "earth") inEarthSpace += n;
      if (o.group === "Near-Earth") { neaTotal++; if (n) neaCrewed++; }
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
      neaCrewed: neaCrewed, neaTotal: neaTotal,
      oceanWorlds: oceanWorlds,
      dataTBday: dataTB,
      kmCubedPerSat: VOL_40AU_KM3 / Math.max(alloc.fleet, 1),
      sunN: alloc.per.sun || 0,
      interceptorsReady: (alloc.per.oumuamua || 0) + (alloc.per.borisov || 0) + (alloc.per["3i-atlas"] || 0),
      costUsdB: alloc.fleet * 5.5 / 1000
    };
  }

  window.VSS_SCALE = { DEFAULT_POLICY: DEFAULT_POLICY, BASE_POLICY: BASE_POLICY, allocate: allocate, systems: systems, orderedQueue: orderedQueue, arrivalOf: arrivalOf };
})();
