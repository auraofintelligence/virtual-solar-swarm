/* Spin and shape data for the special-orbit maths. hours: sidereal rotation
   period, negative = spins backwards; absent = unmeasured, and the lab says
   so rather than guessing. j2: oblateness coefficient where it has actually
   been measured (Earth's is known to many digits; most bodies' are not).
   Tidally locked moons are derived in code (regular moons spin once per lap);
   "chaotic" marks the famous tumbler. */
window.VSS_ROT = {
  hours: {
    mercury: 1407.6, venus: -5832.5, earth: 23.934, mars: 24.623,
    jupiter: 9.925, saturn: 10.656, uranus: -17.24, neptune: 16.11,
    pluto: -153.29, ceres: 9.074, haumea: 3.915, makemake: 22.83,
    gonggong: 22.4, sedna: 10.27, varuna: 6.34, quaoar: 8.84, salacia: 6.61,
    vesta: 5.342, pallas: 7.813, juno: 7.21, hygiea: 13.83, psyche: 4.196,
    eunomia: 6.08, euphrosyne: 5.53, interamnia: 8.71, davida: 5.13,
    sylvia: 5.18, kleopatra: 5.385, kalliope: 4.15, iris: 7.14, hebe: 7.27,
    flora: 12.87, herculina: 9.4, themis: 8.37, lutetia: 8.17,
    mathilde: 417.7, ida: 4.63, gaspra: 7.04, steins: 6.05, massalia: 8.1,
    eros: 5.27, itokawa: 12.13, bennu: 4.296, ryugu: 7.63, apophis: 30.6,
    didymos: 2.26, phaethon: 3.604, toutatis: 176, icarus: 2.27,
    golevka: 6.02, geographos: 5.22, florence: 2.36,
    hektor: 6.924, patroclus: 102.8,
    chiron: 5.918, chariklo: 7.004, pholus: 9.98,
    "67p": 12.4, halley: 52.8, "tempel-1": 40.7, "hartley-2": 18.1, encke: 11.1,
    phoebe: 9.27, nereid: 11.52, himalia: 7.78
  },
  j2: {
    mercury: 5.03e-5, venus: 4.46e-6, earth: 1.08263e-3, mars: 1.9555e-3,
    jupiter: 0.014736, saturn: 0.016298, uranus: 0.0033434, neptune: 0.0034110,
    moon: 2.033e-4, ceres: 0.0262, vesta: 0.0717
  },
  chaotic: { hyperion: true }
};

/* Rotation seconds for any body, honouring tidal locking: regular moons
   (a lap under 100 days) spin once per lap of their parent. Returns
   { seconds, locked, chaotic, retrograde } or null when unmeasured. */
window.VSS_ROT_OF = function (o) {
  if (window.VSS_ROT.chaotic[o.id]) return { chaotic: true };
  var h = window.VSS_ROT.hours[o.id];
  if (h !== undefined) return { seconds: Math.abs(h) * 3600, retrograde: h < 0, locked: false };
  if (o.cls === "moon" && o.orbit && o.orbit.periodDays && o.orbit.periodDays < 100) {
    return { seconds: o.orbit.periodDays * 86400, locked: true, retrograde: false };
  }
  return null;
};
