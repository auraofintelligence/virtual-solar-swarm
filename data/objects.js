/* Merges the catalogue parts into window.VSS_OBJECTS (exactly 200 objects)
   and builds the id index. Load after every objects-*.js part. */
(function () {
  "use strict";
  var P = window.VSS_PARTS || {};
  var order = ["core", "moons", "asteroids", "comets", "tnos"];
  var all = [];
  order.forEach(function (k) { if (P[k]) all = all.concat(P[k]); });

  var byId = {};
  all.forEach(function (o) { byId[o.id] = o; });

  /* Environment class drives design life on the cadence pages. */
  function envOf(o) {
    if (o.cls === "star") return "solar";
    if (o.cls === "interstellar") return "intercept";
    var host = o.parent ? byId[o.parent] : o;
    if (o.parent === "jupiter" && o.orbit && o.orbit.aKm && o.orbit.aKm < 2.0e6) return "radiation";
    var a = host && host.orbit && host.orbit.aAU ? host.orbit.aAU : 40;
    if (a < 0.6) return "scorch";
    if (a < 2.0) return "inner";
    if (a < 5.5) return "belt";
    if (a < 31) return "outer";
    return "deep";
  }
  all.forEach(function (o) { o.env = envOf(o); });

  window.VSS_OBJECTS = all;
  window.VSS_BY_ID = byId;
})();
