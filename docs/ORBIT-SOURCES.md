# Where the orbits come from, and how far they can be trusted

Every orbital element in `data/objects-*.js` is a published value from NASA/JPL,
or is fitted to one. This note records which source, at which epoch, and what
the residual error measures.

## Sources

| Group | Count | Source |
|---|---|---|
| The eight planets | 8 | JPL/Standish, *Keplerian Elements for Approximate Positions of the Major Planets*, J2000 values plus secular rates per century, valid 1800 to 2050 |
| Asteroids, comets, centaurs, dwarf planets, trans-Neptunian objects, interstellar visitors | 187 | [JPL Small-Body Database](https://ssd-api.jpl.nasa.gov/doc/sbdb.html), elements at each body's own solution epoch |
| Comets whose catalogued solution sits on an old arc | 34 of the above | [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) osculating elements re-derived at a common epoch, JD 2461278.5 (26 August 2026) |
| Moons of the planets | 155 placed, 32 not | Ecliptic mean elements fitted to JPL Horizons, epoch JD 2461278.5 |
| Moons of dwarf planets and asteroids | 18 | Published values from the discovery and follow-up literature; JPL publishes no element table for these |

Elements carry an `epochJD` field wherever they are not referenced to J2000.
`assets/astro.js` reads it, so a body is propagated from its own epoch rather
than extrapolated from 2000.

## How positions are computed

Two-body Kepler propagation and nothing more. Elements are held fixed, except
for the planets, which carry JPL's secular rates, and the moons, whose node and
pericentre drift at fitted rates. Mean anomaly advances at a constant rate,
Kepler's equation is solved by Newton iteration, and the result is rotated into
the ecliptic frame.

There is no n-body integration, no non-gravitational forces on comets, and no
planetary ephemeris. That is why elements are taken near the present epoch
rather than at J2000: it keeps the interval over which perturbations accumulate
short.

## Where the moons' elements came from

JPL publishes mean elements for all 187 planetary satellites, but referred to
three different planes depending on the table: the ecliptic, the planet's
equator, or the satellite's local Laplace plane with its pole given per row.
Those elements also sit at epoch 2000 and do not propagate well to the present
for the shorter-period moons, because the table's period is not the sidereal
one and the fitted arcs are old.

So the elements here are fitted instead. For each moon, Horizons is asked for
osculating elements **in the ecliptic frame**, planetocentric, sampled across a
window centred on the epoch, and the result is reduced to: mean semi-major axis,
eccentricity and inclination; node and pericentre linear in time; and a mean
motion taken from the unwrapped mean anomaly rather than from averaged
osculating values, which carry a bias. Asking Horizons for the ecliptic frame
directly removes the reference-plane question rather than answering it.

Two refinements were needed:

- **Window length is chosen per moon.** Windows of 16, 6, 2 and 0.75 years were
  each tried and the one that actually reproduced Horizons best was kept.
- **Near-circular orbits are fitted on mean longitude.** Where eccentricity is
  tiny the pericentre is barely defined and races, so fitting the argument of
  pericentre and mean anomaly separately is unstable even though their sum is
  solid. Those moons are fitted on node plus mean longitude with the pericentre
  held still. Proteus went from 159 degrees of error to 0.06 by this change
  alone; Amalthea from 85 to 3.

## Measured accuracy

Checked against JPL Horizons state vectors, heliocentric ecliptic, on
26 August 2026, for thirty bodies from Mercury to Sedna:

| | angular miss from the Sun | distance miss |
|---|---|---|
| median | 0.0003° (about 1 arcsecond) | 0.00003 AU |
| worst | 0.019° (Jupiter) | 0.012 AU (Saturn) |

Every one of the 191 heliocentric bodies sits within 0.4° of where JPL puts it.
Element by element, semi-major axis, eccentricity, inclination, node, argument
of perihelion and period all agree to the digits stored.

The moons were checked the same way, against Horizons planetocentric vectors,
for all 155 that carry a position:

| | today | in two years |
|---|---|---|
| median | 0.72° | 1.03° |
| 90th percentile | 3.70° | 3.39° |
| worst | 8.94° | 9.32° |

Accuracy decays further out: the median is 3.3° at ten years, and the Jovian and
Saturnian irregulars are the first to go, since the Sun perturbs them hardest.

## Moons the model does not place

Thirty-two of the 187 moons carry the size and shape of their orbit but no
position, and the site says so on the parent's page rather than drawing them
somewhere plausible.

- **Co-orbital and librating moons**, which no single ellipse can represent:
  Janus and Epimetheus swap orbits every four years; Helene and Polydeuces are
  Dione trojans that swing tens of degrees about their Lagrange points; Pandora
  is chased chaotically by Prometheus.
- **Moons the fit could not hold within ten degrees**: Larissa, Hippocamp,
  Carpo, Pasiphae, and Pluto's small moons Styx, Nix, Kerberos and Hydra.
- **Daphnis**, whose fit did not converge at all.
- **The 18 satellites of dwarf planets and asteroids**, for which JPL publishes
  no element table.

## Physical parameters

Radii and masses were reconciled body by body rather than in bulk, because
JPL's stored values are not uniformly the newer ones. The rule applied:

- A JPL value is adopted when its reference is a named modern survey or a
  radar or occultation measurement, or is dated 2008 or later and carries an
  uncertainty.
- Otherwise the catalogue's value stands, since it came from sources tracking
  the current literature.
- Spacecraft-visited bodies and binaries the catalogue lists component by
  component were decided by hand.

What changed: **26 small-body radii** adopted, nearly all from the NEOWISE PDS
release with uncertainties, plus Arecibo radar for 1998 OR2 and Phaethon.
**25 moon masses** adopted from Horizons, which draws on the current satellite
ephemeris fits, several of them Brozović and Jacobson 2024 for the Pluto system;
seven moons gained a mass they did not have.

What deliberately did not change:

- **704 Interamnia.** JPL's `GM` traces to Landgraf, 1992. The catalogue's
  modern mass stands.
- **10 Hygiea.** JPL's radius is IRAS 1983 and its GM is Scholl 1987. The
  catalogue carries the 2019 VLT figures.
- **2060 Chiron, 4179 Toutatis, 1566 Icarus, 2062 Aten.** JPL's diameters trace
  to 1994 and 1998 compilations.
- **20000 Varuna and 10199 Chariklo.** JPL traces to the 2002 *Earth, Moon, and
  Planets* compilation; occultation work since supersedes it.
- **617 Patroclus and 87 Sylvia.** The catalogue lists their companions
  separately, so JPL's single diameter is the whole system, not the primary.
- **Moon radii generally.** Horizons carries Voyager-era round numbers for the
  small irregular and Uranian moons, where the catalogue already has the later
  Karkoschka and Cassini figures. Horizons radii were taken only where the
  catalogue had none.

## Reproducing the check

The audit scripts are not in the repository. The steps were:

1. `ssd-api.jpl.nasa.gov/sbdb.api?full-prec=true&sstr=<designation>` for each small body,
   and `&phys-par=true` for diameters and GM with their references.
2. `ssd.jpl.nasa.gov/api/horizons.api` with `EPHEM_TYPE=ELEMENTS`,
   `CENTER='500@<planet>'` and `REF_PLANE=ECLIPTIC` for the moon fits, and
   `EPHEM_TYPE=VECTORS` for every check. Horizons rejects a fractional step
   size but accepts a count of equal intervals across a span, which is how the
   sampling lands on a whole number of orbital periods.
3. `ssd.jpl.nasa.gov/sats/elem/` for JPL's own satellite mean elements, used to
   cross-check rather than to ship.
4. Feed the same dates through `assets/astro.js` and compare.

`tools/devserver.py` serves the site locally with caching switched off, which
matters when editing data files a browser would otherwise hold on to.
