/* Where a solar observatory actually puts its satellites.
   Not a ring: a layered architecture of regimes that see different things,
   each with a real precedent that has flown or is flying. Shares sum to 1
   and are applied to whatever the reader has set the observatory to.
   Distances are published values, rounded. */
window.VSS_SOLAR_STATIONS = [
  {
    id: "divers", name: "Sun divers", share: 0.09,
    where: "looping perihelion passes down to about 0.046 AU, roughly 10 solar radii, inside the corona itself",
    sees: "The only way to measure the solar wind where it is born rather than where it arrives. Each pass is a few days inside the corona, then years out at aphelion cooling off.",
    hard: "Heat, and speed. A diver crosses perihelion at nearly 200 km/s and needs a shield facing exactly the right way the whole time.",
    precedent: "Parker Solar Probe has done this since 2018", link: "https://science.nasa.gov/mission/parker-solar-probe/"
  },
  {
    id: "inner", name: "Inner ecliptic stations", share: 0.18,
    where: "circular heliocentric orbits near 0.3 AU, spread around the Sun in longitude",
    sees: "Close, continuous imaging of the whole disc from several sides at once, plus in-situ sampling of the young solar wind before it has spread out.",
    hard: "Thermal load and radiation dose. At 0.3 AU sunlight is eleven times fiercer than at Earth.",
    precedent: "Solar Orbiter works from about 0.28 AU", link: "https://science.nasa.gov/mission/solar-orbiter/"
  },
  {
    id: "polar", name: "Polar orbiters", share: 0.13,
    where: "steeply inclined heliocentric orbits, 75 degrees and up, over the solar poles",
    sees: "The poles, which no telescope on the ecliptic can properly see. The polar field drives the cycle and flips at every maximum, and the fast solar wind pours out of the polar holes.",
    hard: "Leaving the plane of the planets is expensive. Ulysses needed a swing past Jupiter to do it at all.",
    precedent: "Ulysses flew three polar passes; Solar Orbiter is climbing toward 33 degrees", link: "https://sci.esa.int/web/ulysses"
  },
  {
    id: "l1", name: "L1 sentinels", share: 0.07,
    where: "1.5 million km sunward of Earth, on the Earth to Sun line",
    sees: "The wind that is about to hit us, measured before it arrives. This is where space weather warning actually happens.",
    hard: "Only about an hour of warning, because the wind crosses that last stretch fast. The post is unstable and needs regular nudging.",
    precedent: "ACE, DSCOVR, SOHO and WIND all work from here", link: "https://www.swpc.noaa.gov/products/real-time-solar-wind"
  },
  {
    id: "sub-l1", name: "Sub-L1 sail stations", share: 0.05,
    where: "held sunward of L1, where nothing can normally hover, by a solar sail balancing gravity against sunlight",
    sees: "The same wind, earlier. Pushing the sentry line closer to the Sun buys more warning time before a storm reaches Earth.",
    hard: "It is not an orbit. Station is held by continuous light pressure on a very large, very thin sail.",
    precedent: "NASA's Solar Cruiser studied exactly this", link: "https://www.nasa.gov/solar-cruiser/"
  },
  {
    id: "flanks", name: "L4 and L5 flankers", share: 0.13,
    where: "60 degrees ahead of and behind Earth on Earth's own orbit, the stable Lagrange camps",
    sees: "Storms side-on instead of head-on. From L5 a coronal mass ejection aimed at Earth is seen from the side, which is the geometry that turns a guess about its speed into a measurement, days ahead.",
    hard: "Distance. These posts sit 150 million km from Earth, so the data comes home slowly.",
    precedent: "ESA's Vigil is being built for L5 now", link: "https://www.esa.int/Space_Safety/Vigil"
  },
  {
    id: "farside", name: "Far-side watch", share: 0.08,
    where: "near L3 on the far side of the Sun, and on slow drift orbits that walk around the Sun over years",
    sees: "The hemisphere turned away from Earth. Active regions rotate into view already grown; a far-side watch means they are tracked from birth instead of appearing over the edge as a surprise.",
    hard: "L3 is unstable and permanently behind the Sun for communications, so far-side stations lean on relays or on drifting instead of holding.",
    precedent: "The STEREO pair drifted apart to do this from 2006", link: "https://science.nasa.gov/mission/stereo/"
  },
  {
    id: "earth-orbit", name: "Earth-orbit telescopes", share: 0.09,
    where: "geosynchronous and sun-synchronous orbits close to home",
    sees: "The high-cadence, high-resolution work. Being near Earth means a fat downlink, so these are the instruments that can afford to send a full-disc image every few seconds in a dozen wavelengths.",
    hard: "Earth gets in the way, and low orbits pass through the radiation belts. Sun-synchronous orbits are chosen so the Sun is never eclipsed for long.",
    precedent: "SDO in geosynchronous orbit, Hinode and IRIS in sun-synchronous", link: "https://sdo.gsfc.nasa.gov/"
  },
  {
    id: "flux", name: "Flux tube surfers", share: 0.09,
    where: "strung out along one arm of the Parker spiral, each holding magnetic connection to the same patch of the Sun",
    sees: "The solar wind does not drift freely; it is threaded on magnetic field lines that the Sun's rotation winds into a spiral. A chain of satellites spaced along one of those tubes measures the same stream of field and plasma at several distances at once, so the wind can be watched heating, accelerating and going turbulent along its own path instead of being inferred from separate snapshots taken in different places.",
    hard: "Connection is not a place. The footpoint on the Sun rotates away underneath you and the spiral itself bends with wind speed, so holding a chain on one tube means constant re-planning. This is the station type a single spacecraft cannot do at all.",
    precedent: "Solar Orbiter's linkage science ties in-situ measurements back to their source region, and Parker found the switchback kinks in these tubes", link: "https://science.nasa.gov/mission/parker-solar-probe/"
  },
  {
    id: "boundary", name: "Heliosphere boundary probes", share: 0.06,
    where: "outbound past the termination shock near 85 to 95 AU and the heliopause near 120 AU",
    sees: "Where the solar wind finally loses to the interstellar medium. The edge of the Sun's actual territory, and the shield that keeps most galactic cosmic rays off the planets.",
    hard: "Decades of travel, and power. Nothing has crossed it but the two Voyagers, and they had a lucky planetary alignment.",
    precedent: "Voyager 1 crossed the heliopause in 2012", link: "https://science.nasa.gov/mission/voyager/"
  },
  {
    id: "deep", name: "Deep field listeners", share: 0.03,
    where: "far beyond the heliopause, out toward the inner Oort cloud at thousands of AU",
    sees: "The Sun from outside its own bubble, and the interstellar weather it is flying through. Spread far enough apart, precise clocks out here also work together as one instrument the size of the solar system.",
    hard: "Everything. Travel time in generations, power for a century, and a signal that takes days each way.",
    precedent: "Studied as the Interstellar Probe concept", link: "https://interstellarprobe.jhuapl.edu/"
  }
];
