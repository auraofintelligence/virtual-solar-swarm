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

  /* A faster-than-Hohmann transfer: burn tangentially at Earth's orbit with
     extraKms beyond the minimum, ride the resulting ellipse (or hyperbola)
     to the target's distance. Returns time of flight, required phase angle,
     and the arrival speed that must be killed. extraKms = 0 reproduces Hohmann. */
  function fastTransfer(a1AU, a2AU, extraKms) {
    var r1 = a1AU * AU_KM, r2 = a2AU * AU_KM;
    var out = r2 > r1;
    var v1c = Math.sqrt(GM_SUN / r1);
    var at = (r1 + r2) / 2;
    var vHoh = Math.sqrt(GM_SUN * (2 / r1 - 1 / at));
    var base = Math.abs(vHoh - v1c);
    var burn = base + (extraKms || 0);
    var v1 = out ? v1c + burn : Math.max(v1c - burn, 0.12 * v1c); // engines cannot fully stop you sunward
    var eps = v1 * v1 / 2 - GM_SUN / r1;              // orbital energy
    if (Math.abs(eps) < 1e-6) eps = -1e-6;            // dodge the exactly-parabolic case
    var h = r1 * v1;                                   // angular momentum (tangential burn)
    var a = -GM_SUN / (2 * eps);
    var p = h * h / GM_SUN;
    var e = Math.max(1e-6, Math.sqrt(Math.max(0, 1 + 2 * eps * h * h / (GM_SUN * GM_SUN))));
    var cosNu = Math.min(1, Math.max(-1, (p / r2 - 1) / e));
    var nu2 = Math.acos(cosNu);                        // true anomaly at arrival radius
    var tofDays, dNuDeg;
    if (eps < 0) {                                     // elliptic
      var E2 = Math.acos(Math.min(1, Math.max(-1, (e + cosNu) / (1 + e * cosNu))));
      var M2 = E2 - e * Math.sin(E2);
      var n = Math.sqrt(GM_SUN / (a * a * a));         // rad/s
      if (out) { tofDays = M2 / n / DAY_S; dNuDeg = nu2 / D2R; }
      else { tofDays = (Math.PI - M2) / n / DAY_S; dNuDeg = 180 - nu2 / D2R; }
    } else {                                           // hyperbolic (outbound fast runs)
      var F2 = Math.acosh(Math.max(1, (e + cosNu) / (1 + e * cosNu)));
      var Mh = e * Math.sinh(F2) - F2;
      var nh = Math.sqrt(GM_SUN / Math.pow(-a, 3));
      tofDays = Mh / nh / DAY_S; dNuDeg = nu2 / D2R;
    }
    var v2sq = 2 * (eps + GM_SUN / r2);
    var vt2 = h / r2;
    var vr2 = Math.sqrt(Math.max(0, v2sq - vt2 * vt2));
    var vTarget = Math.sqrt(GM_SUN / r2);
    var vinf = Math.sqrt((vt2 - vTarget) * (vt2 - vTarget) + vr2 * vr2);
    return { tofYears: tofDays / YEAR_D, dvDep: burn, vinfArr: vinf, dNuDeg: dNuDeg, hyperbolic: eps > 0 };
  }

  /* Departure windows given an arbitrary transfer (phase-angle method on mean
     longitudes): the target must lead Earth by dNu - (target motion during
     the cruise) at the moment of departure. */
  function windowsForTransfer(earthOrbit, targetOrbit, fromDate, count, transfer) {
    if (targetOrbit.hyperbolic) return [];
    var t0 = daysSinceJ2000(fromDate);
    var Pt = periodYearsOf(targetOrbit), Pe = periodYearsOf(earthOrbit);
    if (Math.abs(Pt - Pe) < 0.02) return []; // near-identical period, no clean synodic cycle
    var nT = 360 / (Pt * YEAR_D), nE = 360 / (Pe * YEAR_D); // deg/day
    var gamma = transfer.dNuDeg - nT * (transfer.tofYears * YEAR_D);
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

  /* Cheapest-path departure windows: the classic Hohmann phasing. */
  function nextWindows(earthOrbit, targetOrbit, fromDate, count) {
    return windowsForTransfer(earthOrbit, targetOrbit, fromDate, count,
      fastTransfer(earthOrbit.aAU, targetOrbit.aAU, 0));
  }

  /* ---- The restricted three-body problem, planar, in the rotating frame ----
     Normalised units: the two bodies sit at (-mu, 0) and (1-mu, 0), total
     gravity 1, one rotation takes 2*pi. Gravity plus spin makes a landscape
     with five ledges: the Lagrange points. */
  var CR3BP = {
    lagrangePoints: function (mu) {
      function solve(x0) {
        var x = x0;
        for (var k = 0; k < 80; k++) {
          var s1 = x + mu, s2 = x - 1 + mu;
          var f = x - (1 - mu) * s1 / Math.pow(Math.abs(s1), 3) - mu * s2 / Math.pow(Math.abs(s2), 3);
          var fp = 1 + 2 * (1 - mu) / Math.pow(Math.abs(s1), 3) + 2 * mu / Math.pow(Math.abs(s2), 3);
          var dx = f / fp;
          x -= dx;
          if (Math.abs(dx) < 1e-12) break;
        }
        return x;
      }
      var c = Math.cbrt(mu / 3);
      return {
        L1: { x: solve(1 - mu - c), y: 0 },
        L2: { x: solve(1 - mu + c), y: 0 },
        L3: { x: solve(-1 - (5 / 12) * mu), y: 0 },
        L4: { x: 0.5 - mu, y: Math.sqrt(3) / 2 },
        L5: { x: 0.5 - mu, y: -Math.sqrt(3) / 2 }
      };
    },
    /* Effective potential: gravity of both bodies plus the spin of the frame. */
    omega: function (mu, x, y) {
      var r1 = Math.hypot(x + mu, y), r2 = Math.hypot(x - 1 + mu, y);
      return 0.5 * (x * x + y * y) + (1 - mu) / Math.max(r1, 1e-6) + mu / Math.max(r2, 1e-6);
    },
    accel: function (mu, x, y, vx, vy) {
      var s1 = x + mu, s2 = x - 1 + mu;
      var r13 = Math.pow(Math.max(Math.hypot(s1, y), 1e-5), 3);
      var r23 = Math.pow(Math.max(Math.hypot(s2, y), 1e-5), 3);
      return {
        ax: x + 2 * vy - (1 - mu) * s1 / r13 - mu * s2 / r23,
        ay: y - 2 * vx - (1 - mu) * y / r13 - mu * y / r23
      };
    },
    /* One fixed-step RK4 integration step for a particle {x,y,vx,vy}. */
    step: function (mu, p, dt) {
      function d(s) {
        var a = CR3BP.accel(mu, s[0], s[1], s[2], s[3]);
        return [s[2], s[3], a.ax, a.ay];
      }
      var s0 = [p.x, p.y, p.vx, p.vy];
      var k1 = d(s0);
      var k2 = d(s0.map(function (v, i) { return v + dt / 2 * k1[i]; }));
      var k3 = d(s0.map(function (v, i) { return v + dt / 2 * k2[i]; }));
      var k4 = d(s0.map(function (v, i) { return v + dt * k3[i]; }));
      p.x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      p.y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      p.vx += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
      p.vy += dt / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]);
    }
  };

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
    fastTransfer: fastTransfer, windowsForTransfer: windowsForTransfer, CR3BP: CR3BP,
    hillRadiusKm: hillRadiusKm, circVel: circVel, orbPeriodHours: orbPeriodHours,
    insertionDv: insertionDv, stableBands: stableBands
  };
})();
