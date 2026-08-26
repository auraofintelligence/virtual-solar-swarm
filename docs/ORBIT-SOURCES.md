# Where the orbits come from, and how far they can be trusted

Every orbital element in `data/objects-*.js` is a published value from NASA/JPL.
This note records which source, at which epoch, and what the residual error is.

## Sources

| Group | Count | Source |
|---|---|---|
| The eight planets | 8 | JPL/Standish, *Keplerian Elements for Approximate Positions of the Major Planets*, J2000 values plus secular rates per century, valid 1800 to 2050 |
| Asteroids, comets, centaurs, dwarf planets, trans-Neptunian objects, interstellar visitors | 187 | [JPL Small-Body Database](https://ssd-api.jpl.nasa.gov/doc/sbdb.html), elements at each body's own solution epoch |
| Comets whose catalogued solution is pinned to an old arc | 34 of the above | [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) osculating elements re-derived at a common epoch, JD 2461278.5 (26 August 2026) |
| Moons of the planets | 169 | [JPL Planetary Satellite Mean Elements](https://ssd.jpl.nasa.gov/sats/elem/) |
| Moons of dwarf planets and asteroids | 18 | Published values from the discovery and follow-up literature; JPL publishes no element table for these |

Elements carry an `epochJD` field wherever they are not referenced to J2000.
`assets/astro.js` reads it, so a body is propagated from its own epoch rather
than extrapolated from 2000.

## How positions are computed

Two-body Kepler propagation and nothing more. Elements are held fixed, except
for the planets, which carry JPL's secular rates for semi-major axis,
eccentricity, inclination, node and argument of perihelion. Mean anomaly
advances at a constant rate, Kepler's equation is solved by Newton iteration,
and the result is rotated into the ecliptic frame.

There is no n-body integration, no non-gravitational forces on comets, and no
planetary ephemeris. This is why the elements are taken near the present epoch
rather than at J2000: it keeps the interval over which perturbations accumulate
short.

## Measured accuracy

Checked on 26 August 2026 against JPL Horizons state vectors, heliocentric
ecliptic, for a spread of thirty bodies from Mercury to Sedna:

| | angular miss from the Sun | distance miss |
|---|---|---|
| median | 0.0003° (about 1 arcsecond) | 0.00003 AU |
| worst | 0.019° (Jupiter) | 0.012 AU (Saturn) |

Checked against JPL's published elements for all 191 heliocentric bodies:
semi-major axis, eccentricity, inclination, node, argument of perihelion and
period all agree to the digits stored. Every body sits within 0.4° of where JPL
puts it today.

The 169 moons match the JPL mean-element tables exactly for the three
quantities the site uses: semi-major axis, eccentricity and orbital period.

## What this does not do

- **Positions drift with distance from the epoch.** A two-body model has no
  perturbations, so accuracy decays the further the date is from the element
  epoch. Over a few decades the planets stay within an arcminute. Comets and
  near-Earth asteroids that pass close to a planet decay much faster.
- **Comets carry no non-gravitational forces.** Outgassing changes a comet's
  path by an amount this model cannot represent. Encke is the clearest case.
- **Moons have no orientation or phase.** Only semi-major axis, eccentricity
  and period are stored, so the site models the size and pace of a moon's orbit
  but never where the moon is on it. JPL's tables do carry the angles; adopting
  them means first settling which reference plane each is quoted in, since the
  table mixes the local Laplace plane with the ecliptic.
- **Two marginal comets are held as ellipses.** C/2014 UN271
  Bernardinelli-Bernstein has a heliocentric osculating eccentricity that
  crosses 1 while Jupiter is pulling on it; the catalogued bound solution is
  used instead. C/2023 A3 Tsuchinshan-ATLAS is carried as JPL has it, marginally
  unbound, so the site gives it no orbital period.

## Physical parameters, not yet reconciled

Radii and masses were not regenerated in this pass, because JPL's stored values
are not uniformly the newer ones. Two examples found while checking:

- **704 Interamnia.** JPL's `GM` traces to Landgraf, 1992, and implies 7.5 × 10¹⁹ kg.
  The catalogue carries the modern 3.5 × 10¹⁹ kg. The catalogue is the better value here.
- **2060 Chiron.** JPL's diameter is a 1998 occultation chord of 166 km. The
  catalogue carries a radius consistent with the larger modern estimates.
- **3753 Cruithne.** The reverse: JPL carries a NEOWISE diameter of 2.07 ± 0.11 km,
  and the catalogue carries an older and larger figure.

Of the 94 bodies where JPL publishes a diameter, 24 differ from the catalogue by
more than 10 per cent. Of the 14 where JPL publishes a measured GM, one differs
by more than 20 per cent. Each needs reading against its reference rather than
overwriting in bulk. Radii feed the density fallback in `gmOf`, so this affects
Hill spheres and insertion burns for bodies that have never been weighed.

## Reproducing the check

The audit scripts are not in the repository. The steps were:

1. `ssd-api.jpl.nasa.gov/sbdb.api?full-prec=true&sstr=<designation>` for each small body.
2. `ssd.jpl.nasa.gov/api/horizons.api` with `EPHEM_TYPE=ELEMENTS` for the bodies
   whose SBDB solution sits on an old arc, and `EPHEM_TYPE=VECTORS`,
   `CENTER='500@10'`, `REF_PLANE=ECLIPTIC` for the end-to-end position check.
3. `ssd.jpl.nasa.gov/sats/elem/` for the satellite mean elements.
4. Feed the same dates through `assets/astro.js` and compare.
