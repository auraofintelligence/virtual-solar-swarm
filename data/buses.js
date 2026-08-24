/* Satellite bus classes. dry/capacity in kg, power in W at 1 AU unless noted,
   dv is onboard propulsion budget in km/s, cost in millions of USD at
   mass-production scale. */
window.VSS_BUSES = [
  { id: "p4", name: "Picket P-4", role: "The workhorse. Four of these watching any one body gives all-angle coverage.",
    dryKg: 140, capacityKg: 45, powerW: 240, ratedAU: 3.4, powerSource: "solar", dvKms: 1.8, costUsdM: 1.2,
    note: "Solar wings sized for the destination, the trick Lucy used to fly on sunlight at Jupiter's distance; past that the light gets too thin." },
  { id: "s40", name: "Swarm S-40", role: "The weather-station bus for dense swarms at busy worlds.",
    dryKg: 260, capacityKg: 90, powerW: 450, ratedAU: 3.5, powerSource: "solar", dvKms: 2.5, costUsdM: 2.0,
    note: "Big arrays and radios for high-tempo mapping work; the same wing trick Europa Clipper uses at Jupiter." },
  { id: "h100", name: "Helios H-100", role: "The solar observatory bus, built to stare at the Sun.",
    dryKg: 380, capacityKg: 130, powerW: 800, ratedAU: 1.1, powerSource: "solar", dvKms: 3.0, costUsdM: 3.0,
    note: "Heat-shielded and radiation-tolerant for close solar work." },
  { id: "drtg", name: "Deep D-RTG", role: "The nuclear bus, for the dark and for Jupiter's radiation belts.",
    dryKg: 320, capacityKg: 90, powerW: 300, powerSource: "rtg", dvKms: 2.2, costUsdM: 6.0,
    note: "A Cassini-class radioisotope generator; its power fades about one per cent a year, which sets its useful life." },
  { id: "dart", name: "Dart I-2", role: "The interceptor. Light, fast, single-purpose flyby craft.",
    dryKg: 90, capacityKg: 32, powerW: 150, ratedAU: 2.0, powerSource: "solar", dvKms: 6.0, costUsdM: 1.5,
    note: "For interstellar visitors and short-notice targets; no orbit insertion, one good pass." }
];

/* Default bus by tier and environment. */
window.VSS_BUS_OF = function (o) {
  if (o.tier === "observatory") return "h100";
  if (o.tier === "intercept") return "dart";
  if (o.env === "outer" || o.env === "deep" || o.env === "radiation") return "drtg";
  if (o.tier === "swarm" || o.tier === "enhanced") return "s40";
  return "p4";
};
