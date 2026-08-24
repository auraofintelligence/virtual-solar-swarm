/* Virtual Solar Swarm : orbital mechanics engine.
   Teaching-grade two-body maths. Good enough to plan and compare;
   not an ephemeris. All angles degrees in, radians internally. */
(function () {
  "use strict";

  var AU_KM = 149597870.7;
  var GM_SUN = 1.32712440018e11;      // km^3/s^2
  var G_KM = 6.674e-20;               // km^3 / (kg s^2)
  var DAY_S = 86400;
  var YEAR_D = 365.25;
  var J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  var D2R = Math.PI / 180;

  function daysSinceJ2000(date) { return (date.getTime() - J2000_MS) / 86400000; }
  function dateFromDays(d) { return new Date(J2000_MS + d * 86400000); }

  /* Standard gravitational parameter, km^3/s^2. Falls back to a density
     guess by class when the mass has never been measured. */
  function gmOf(obj) {
    if (obj.massKg) return obj.massKg * G_KM;
    var density = { comet: 0.6e12, interstellar: 0.5e12, centaur: 1.0e12, tno: 1.5e12, dwarf: 1.8e12, moon: 1.5e12, asteroid: 2.0e12 }[obj.cls] || 2.0e12; // kg/km^3
    var r = obj.radiusKm || 1;
    var mass = density * (4 / 3) * Math.PI * r * r * r;
    return mass * G_KM;
  }

  function solveKepler(Mrad, e) {
    var E = e < 0.8 ? Mrad : Math.PI;
    for (var k = 0; k < 30; k++) {
      var dE = (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-9) break;
    }
    return E;
  }

  function periodYearsOf(orbit) {
    if (orbit.periodYears) return orbit.periodYears;
    return Math.pow(orbit.aAU, 1.5);
  }

  /* Heliocentric position at tDays since J2000. Returns {x,y,z} in AU
     (ecliptic frame, x toward the vernal equinox). */
  function helioPos(orbit, tDays) {
    if (orbit.hyperbolic) return null;
    var P = periodYearsOf(orbit) * YEAR_D;
    var M = ((orbit.M0Deg || 0) + 360 * (tDays / P)) % 360;
    if (M < 0) M += 360;
    var E = solveKepler(M * D2R, orbit.e);
    var a = orbit.aAU, e = orbit.e;
    var xo = a * (Math.cos(E) - e);
    var yo = a * Math.sqrt(1 - e * e) * Math.sin(E);
    var w = (orbit.wDeg || 0) * D2R, om = (orbit.omDeg || 0) * D2R, i = (orbit.iDeg || 0) * D2R;
    var cw = Math.cos(w), sw = Math.sin(w), co = Math.cos(om), so = Math.sin(om), ci = Math.cos(i), si = Math.sin(i);
    return {
      x: (cw * co - sw * so * ci) * xo + (-sw * co - cw * so * ci) * yo,
      y: (cw * so + sw * co * ci) * xo + (-sw * so + cw * co * ci) * yo,
      z: (sw * si) * xo + (cw * si) * yo
    };
  }

  /* Mean ecliptic longitude, degrees, linear in time. */
  function meanLongitude(orbit, tDays) {
    var P = periodYearsOf(orbit) * YEAR_D;
    var L = (orbit.omDeg || 0) + (orbit.wDeg || 0) + (orbit.M0Deg || 0) + 360 * (tDays / P);
    L %= 360; if (L < 0) L += 360;
    return L;
  }

  /* Hohmann transfer between circular heliocentric orbits, radii in AU. */
  function hohmann(a1AU, a2AU) {
    var r1 = a1AU * AU_KM, r2 = a2AU * AU_KM;
    var at = (r1 + r2) / 2;
    var v1 = Math.sqrt(GM_SUN / r1), v2 = Math.sqrt(GM_SUN / r2);
    var vp = Math.sqrt(GM_SUN * (2 / r1 - 1 / at));
    var va = Math.sqrt(GM_SUN * (2 / r2 - 1 / at));
    var tofYears = Math.PI * Math.sqrt(at * at * at / GM_SUN) / (DAY_S * YEAR_D);
    return {
      dvDep: Math.abs(vp - v1),         // km/s, heliocentric burn at departure
      dvArr: Math.abs(v2 - va),         // km/s, heliocentric matching at arrival
      vinfArr: Math.abs(v2 - va),       // arrival excess speed relative to target
      tofYears: tofYears
    };
  }

  function synodicYears(P1, P2) {
    var d = Math.abs(1 / P1 - 1 / P2);
    return d < 1e-9 ? Infinity : 1 / d;
  }

  /* Next Hohmann-style departure windows from Earth to a heliocentric target.
     Phase-angle method on mean longitudes. Returns array of Dates. */
  function nextWindows(earthOrbit, targetOrbit, fromDate, count) {
    if (targetOrbit.hyperbolic) return [];
    var t0 = daysSinceJ2000(fromDate);
    var Pt = periodYearsOf(targetOrbit), Pe = periodYearsOf(earthOrbit);
    if (Math.abs(Pt - Pe) < 0.02) return []; // near-identical period, no clean synodic cycle
    var h = hohmann(earthOrbit.aAU, targetOrbit.aAU);
    var nT = 360 / (Pt * YEAR_D), nE = 360 / (Pe * YEAR_D); // deg/day
    var gamma = 180 - nT * (h.tofYears * YEAR_D); // required lead of target over Earth at departure
    gamma = ((gamma % 360) + 360) % 360;
    var rel0 = meanLongitude(targetOrbit, t0) - meanLongitude(earthOrbit, t0);
    rel0 = ((rel0 % 360) + 360) % 360;
    var rate = nT - nE; // deg/day, negative for outer targets
    // solve rel0 + rate*t = gamma + 360*m for integer m, keep t >= 0
    var out = [];
    var m = 0, guard = 0;
    while (out.length < count && guard < 4000) {
      var tA = (gamma + 360 * m - rel0) / rate;
      var tB = (gamma - 360 * m - rel0) / rate;
      [tA, tB].forEach(function (t) {
        if (t >= 0 && out.indexOf(t) < 0) out.push(t);
      });
      m++; guard++;
    }
    out = out.filter(function (t) { return t >= 0; }).sort(function (a, b) { return a - b; }).slice(0, count);
    return out.map(function (t) { return dateFromDays(t0 + t); });
  }

  /* Next perihelion passages for a bound orbit, as Dates. Month-accurate for
     short periods, rougher for very stretched ones. */
  function nextPerihelia(orbit, fromDate, count) {
    var P = periodYearsOf(orbit) * YEAR_D;
    var t0 = daysSinceJ2000(fromDate);
    var M = ((orbit.M0Deg || 0) + 360 * (t0 / P)) % 360;
    if (M < 0) M += 360;
    var out = [];
    var remain = ((360 - M) / 360) * P;
    for (var k = 0; k < count; k++) out.push(dateFromDays(t0 + remain + k * P));
    return out;
  }

  /* Hill sphere radius in km: how far from a body its gravity stays in charge. */
  function hillRadiusKm(obj, parentGm, parentDistKm) {
    var gm = gmOf(obj);
    return parentDistKm * (1 - (obj.orbit && obj.orbit.e ? obj.orbit.e : 0)) * Math.pow(gm / (3 * parentGm), 1 / 3);
  }

  function circVel(gm, rKm) { return Math.sqrt(gm / rKm); }
  function orbPeriodHours(gm, rKm) { return 2 * Math.PI * Math.sqrt(rKm * rKm * rKm / gm) / 3600; }

  /* Delta-v to drop from an arrival hyperbola into a circular orbit at rKm. */
  function insertionDv(gm, vinf, rKm) {
    var vPeri = Math.sqrt(vinf * vinf + 2 * gm / rKm);
    return vPeri - circVel(gm, rKm);
  }

  /* Stable orbit bands around a body. Conservative published rules of thumb:
     prograde orbits hold to about a third of the Hill radius, retrograde to
     about a half. Minimum is a safety margin above the surface. */
  function stableBands(obj, parentGm, parentDistKm) {
    var rH = hillRadiusKm(obj, parentGm, parentDistKm);
    var minR = obj.radiusKm + Math.max(0.3, obj.radiusKm * 0.05);
    return {
      hillKm: rH,
      minKm: minR,
      progradeMaxKm: rH / 3,
      retrogradeMaxKm: rH / 2,
      usable: rH / 3 > minR
    };
  }

  window.ASTRO = {
    AU_KM: AU_KM, GM_SUN: GM_SUN, G_KM: G_KM, J2000_MS: J2000_MS,
    daysSinceJ2000: daysSinceJ2000, dateFromDays: dateFromDays,
    gmOf: gmOf, solveKepler: solveKepler, periodYearsOf: periodYearsOf,
    helioPos: helioPos, meanLongitude: meanLongitude,
    hohmann: hohmann, synodicYears: synodicYears, nextWindows: nextWindows, nextPerihelia: nextPerihelia,
    hillRadiusKm: hillRadiusKm, circVel: circVel, orbPeriodHours: orbPeriodHours,
    insertionDv: insertionDv, stableBands: stableBands
  };
})();
