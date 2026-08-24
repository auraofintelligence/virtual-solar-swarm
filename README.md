# Virtual Solar Swarm : mission design studio

🤝🔷 **A Luke × Claude build.** Created by Luke Nathan Hayes ([auraofintelligence](https://github.com/auraofintelligence)) and Claude (Fable 5) on 25 August 2026. Not a Codex build.

An interactive, fully static website for designing a solar-system-wide satellite swarm: the 200 most interesting objects in the solar system, their real orbits, stable orbits around each of them, launch windows to get there, modular sensor packages, satellite builds, fleet allocation and replacement cadence.

**Live site:** https://auraofintelligence.github.io/virtual-solar-swarm/

## The pages

| Page | What it models |
|---|---|
| `index.html` | The idea, the numbers, and how the tools chain together |
| `targets.html` | The full 200-object catalogue, searchable and sortable |
| `object.html?id=` | Per-target dossier: orbit, stable orbits, windows, fit-out, cadence |
| `map.html` | Animated heliocentric map driven by real orbital elements |
| `orbit-lab.html` | Stable orbit designer (Hill spheres, safe floors, stable ceilings) |
| `windows.html` | Launch window model plus a whole-catalogue campaign board |
| `builder.html` | Satellite builder with mass, power, data and cost budgets |
| `sensors.html` | The fifteen-module instrument kit of parts |
| `fleet.html` | Fleet allocation with adjustable tier dials |
| `cadence.html` | Replacement drumbeat and factory-pace model |
| `about.html` | Honest framing: every approximation named, licence, signature |

## How it works

No build step, no frameworks, no external requests. Plain HTML, CSS and JavaScript; the physics engine is `assets/astro.js` (teaching-grade two-body mechanics: Kepler propagation, Hohmann transfers, synodic windows, Hill spheres, orbit insertion). The catalogue lives in `data/objects-*.js` as five reviewable data files that merge to exactly 200 objects.

Run it locally with any static server, for example:

```
python -m http.server 4321
```

## Honesty notes

This is a design study. Nothing in it has been built or launched, and the site says so on every relevant page. Orbital elements are real published values, rounded; masses of many small bodies are estimated from size and typical density, and are labelled as such; costs and lifetimes are adjustable round-number engineering targets. Prices display in AUD (converted at 1 USD = A$1.55, indicative, August 2026) with USD alongside.

## Licence

Strange But True Public Source Licence: see [LICENCE.md](LICENCE.md). Non-commercial use free with attribution; all commercial and corporate rights reserved to Luke Nathan Hayes.

---
🤝🔷 *Luke Nathan Hayes × Claude (Fable 5), August 2026.*
