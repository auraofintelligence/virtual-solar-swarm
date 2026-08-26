# Virtual Solar Swarm

**Public website:** [auraofintelligence.github.io/virtual-solar-swarm](https://auraofintelligence.github.io/virtual-solar-swarm/)

[Open the visual site map](https://auraofintelligence.github.io/virtual-solar-swarm/site-map.html) · [View the public repository](https://github.com/auraofintelligence/virtual-solar-swarm)

🤝🔷 **A Luke × Claude build.** Created by Luke Nathan Hayes ([auraofintelligence](https://github.com/auraofintelligence)) and Claude (Fable 5), August 2026. Not a Codex build.

> This is an evolving choose-your-own science adventure, made to help open up the solar system for the civic space stewards of Earth and the solar system. Nothing described here has been built, launched or funded.

## What this project is

Virtual Solar Swarm starts from a question with the hard part removed. The solar system already holds roughly two hundred moons and planets we know by name, and a long tail of smaller worlds behind them. Assume getting there is solved by someone else, and that a sensor package can arrive anywhere. The question left is the good one: **what would you send to each of them, and why?** And then, what lies beyond the two hundred?

The site turns that question into eighteen working models. Every number is a dial rather than a verdict, and the reader's own choices carry across the whole site.

## Where the question came from

The question was first put to a field of students in Kolhapur, Maharashtra, at the inauguration of the SDNx Innovation Lab in June 2019: imagine and design the satellite sensor packages that would monitor the two hundred most interesting objects in the solar system, assuming the space industry solves transport and cost. [`origins.html`](https://auraofintelligence.github.io/virtual-solar-swarm/origins.html) records that day and the [Space Development Nexus](https://spacedevelopmentnexus.com) work around it. The people photographed there do not endorse this study; this studio is a separate, independent design exercise built years later.

## The pages

| Page | What it models |
|---|---|
| `index.html` | The question, and the fleet dial that sets the size of everything else |
| `scale.html` | Fleet total and allocation policy in the reader's hands, with production, cost, coverage and traffic computed at every setting |
| `targets.html` | The 384-body catalogue, searchable and groupable by neighbourhood, class, tier or environment |
| `object.html?id=` | Per-body dossier: orbit, stable orbits, windows, instrument fit-out and renewal |
| `map.html` | Animated 3D heliocentric map driven by real orbital elements |
| `gravity.html` | The restricted three-body problem live: Lagrange points, tadpole and horseshoe orbits, playable insertions |
| `orbit-lab.html` | 3D orbit designer oriented to the real sky, with stationary, sun-synchronous and Molniya orbits from each body's measured spin and oblateness |
| `windows.html` | Interactive launch windows: dial in extra delta-v and the whole timetable bends |
| `convoys.html` | Ride-share batching by where bodies actually are, and renewal convoys on every window |
| `builder.html` | Satellite builder with mass, power, data, delta-v and cost budgets |
| `rides.html` | Launch stages and cruise engines, with a rocket-equation calculator |
| `sensors.html` | The fifteen-module instrument kit of parts |
| `network.html` | Live light lag, conjunction routing, trunk capacity and the control ladder |
| `fleet.html` | Where the satellites end up, neighbourhood by neighbourhood |
| `cadence.html` | Replacement drumbeat and factory-pace model |
| `sun-watchers.html` | Every spacecraft that has watched the Sun, those being built, and the solar gravitational lens studies |
| `origins.html` | Where the question came from: the 2019 talk in Kolhapur and the Space Development Nexus work around it |
| `about.html` | Every approximation named, imagery credits, the music and the licence |
| `site-map.html` | Every page, grouped by what it is for |

## How it works

No build step, no frameworks. Plain HTML, CSS and JavaScript. One external request: the Sun's dossier pulls the latest frames from NASA's Solar Dynamics Observatory, and falls back to the stored map if that feed cannot be reached. Everything else, including all thirty-two body maps and the three songs, is served from this repository.

- `assets/astro.js` is the physics: Kepler propagation, Hohmann and faster tangential-burn transfers including hyperbolic, synodic windows, Hill spheres, orbit insertion, generalised stationary and sun-synchronous orbits, and the planar circular restricted three-body problem with numerically solved Lagrange points and RK4 integration.
- `data/objects-*.js` are eleven reviewable data files that merge to 384 bodies. Two hundred carry dedicated crews; the rest are survey entries the host swarms watch.
- `data/maps.js` registers thirty-two real mission maps in two sizes. `data/rotation.js` holds measured spin, oblateness, axial tilt and magnetic-axis data.
- `assets/scale.js` and the fleet dial in `assets/core.js` let the reader set the size of the whole thing; the choice is remembered on their device and honoured by every page.

Run it locally with any static server, for example:

```
python -m http.server 4321
```

## Data and limits

Orbital elements, radii, masses, rotation rates, oblateness, axial tilts and magnetic tilts are real published values, rounded. The maps are real mission imagery, credited in [`data/maps.js`](data/maps.js) and on the about page; bodies without a map are drawn under a latitude and longitude grid. [`docs/MAP-SOURCES.md`](docs/MAP-SOURCES.md) records where each map came from and where to find the ones still missing.

The satellites, buses, instruments, timelines, design lives and cost figures are design fiction grounded in current public technology. Costs are engineering estimates for comparison, not a budget anyone has raised. Prices show in AUD (converted at 1 USD = A$1.55, indicative, August 2026) with USD alongside. The physics is teaching-grade throughout: right enough to compare options and plan shapes, not to fly a spacecraft. The about page lists every approximation by name.

## The music

Three songs by **i C. infinity**, from the album *A Protopian Gambit*, sit in the site: "Heliospheric Lantern" on the Sun's dossier, and both voices of "We Go Beyond" on the home and about pages. [The album on Suno](https://suno.com/playlist/5e56abcb-272b-455e-baff-6470627172ff) · [The wider music universe](https://auraofintelligence.github.io/i-C-infinity-music-universe/index.html)

## Corrections and contributions

Source corrections and clearly scoped improvements can be proposed through the repository's [public issues](https://github.com/auraofintelligence/virtual-solar-swarm/issues). Corrections to real measured data, and better authoritative maps, are especially welcome.

Do not post personal information, confidential material, culturally restricted information, or claims of authority that have not been confirmed. A GitHub contribution is part of the public working record.

## Licence

This repository uses the [Strange But True Public Source Licence](LICENCE.md).

Copyright © 2026 **Luke Nathan Hayes / Strange But True / Aura of Intelligence**.

This is public-source rather than open-source. Attributed personal, educational, artistic, research, community and other non-commercial use is allowed. Commercial, corporate, institutional, government, startup, agency, client or employer use requires written permission from Luke Nathan Hayes. Third-party material, including the NASA, USGS and CC BY mission imagery credited on the about page, keeps its own licence.

---
🤝🔷 *Luke Nathan Hayes × Claude (Fable 5), August 2026.*
