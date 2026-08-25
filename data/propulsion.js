/* The rides: launch stages for climbing Earth's gravity well, and cruise
   systems for the interplanetary road. Two different problems, two different
   machines. Numbers are round engineering figures; status lines are honest. */

window.VSS_LAUNCHERS = [
  { id: "heavy", name: "Heavy reusable lifter", propellant: "methane and liquid oxygen",
    toLeoT: 120, costUsdM: 40,
    gloss: "The Starship-class workhorse: brute chemical fire, flown back and refuelled like an airliner. Nothing efficient climbs the well; you climb it with volume and reuse.",
    note: "One flight could loft dozens of swarm satellites plus their kick stages." },
  { id: "medium", name: "Medium lifter", propellant: "kerosene and liquid oxygen",
    toLeoT: 18, costUsdM: 65,
    gloss: "The Falcon-class proven mid-size: reusable first stage, a decade of routine flights behind the design.",
    note: "Right-sized for a single picket of four plus a cruise stage." },
  { id: "light", name: "Light dedicated lifter", propellant: "kerosene and liquid oxygen",
    toLeoT: 0.3, costUsdM: 8,
    gloss: "The Electron-class taxi: small, frequent, and able to drop one replacement satellite into exactly the right slot on short notice.",
    note: "The cadence model's gap-filler when one picket loses one satellite." }
];

window.VSS_ENGINES = [
  { id: "chem", name: "Chemical kick stage", fuel: "methane or storable propellants", ispS: 320,
    thrust: "kick", costUsdM: 0.3, needsPower: false,
    status: "The flown workhorse: every orbit insertion in history so far has ended with one of these.",
    gloss: "Burns minutes at a time with a hard shove. Terrible fuel mileage, hard to beat when the burn must happen right now, like braking into orbit.",
    bestFor: "capture burns, plane changes, the last kilometre of every journey" },
  { id: "ion", name: "Solar-electric ion", fuel: "xenon or krypton gas", ispS: 2500,
    thrust: "patient", costUsdM: 0.5, needsPower: true,
    status: "Flown for decades: Deep Space 1, Dawn and Psyche all cruised on ion.",
    gloss: "Electric fields throw single ions out the back at enormous speed. Ten times the fuel mileage of chemical, but the push is a sheet of paper resting on your hand: it wins by never stopping.",
    bestFor: "inner and belt cruising wherever sunlight is strong" },
  { id: "neumann", name: "Neumann Drive", fuel: "solid molybdenum rod", ispS: 9000,
    thrust: "patient", costUsdM: 0.4, needsPower: true,
    status: "Adelaide-built. Laboratory fuel mileage among the highest ever measured for its class; small units have flown in low Earth orbit. Deep-space scale is the open question this study would love answered.",
    gloss: "A pulsed electric arc eats a metal rod one spark at a time. The fuel is a solid bar: no tanks, no leaks, storable for decades, and in principle the fleet could one day refuel on scrap metal.",
    bestFor: "long patient cruises and station-keeping where refuelling may never come" },
  { id: "ntp", name: "Nuclear thermal (uranium)", fuel: "hydrogen through a uranium core", ispS: 900,
    thrust: "kick", costUsdM: 4.0, needsPower: false,
    status: "Ground-tested in the NERVA era; flight demonstrations have been in development this decade.",
    gloss: "A reactor heats hydrogen white-hot and throws it out a nozzle: three times chemical's mileage at full shove. The heavy-cargo and fast-run engine.",
    bestFor: "fast heavy runs and short-window departures" },
  { id: "nep", name: "Fission-electric (uranium)", fuel: "uranium reactor driving ion thrusters", ispS: 4000,
    thrust: "patient", costUsdM: 3.0, needsPower: false,
    status: "Kilopower-class space reactors are ground-proven; marrying one to big thrusters is engineering work, not new physics. Thorium versions live on paper only, so this study keeps its reactors uranium and its thorium honest.",
    gloss: "Carries its own sun: a small reactor makes constant power anywhere, so the patient electric push works in the deep dark where solar wings starve.",
    bestFor: "everything beyond Jupiter, where sunlight is a rumour" },
  { id: "sail", name: "Solar sail", fuel: "none: sunlight itself", ispS: 0,
    thrust: "patient", costUsdM: 0.2, needsPower: false,
    status: "Flown: IKAROS sailed to Venus distance, LightSail flew on sunlight in Earth orbit.",
    gloss: "A mirror the size of a footy field, pushed by light. No propellant at all, so the speed change is not limited by any tank; but the push fades with distance and a sail cannot brake into orbit at the far end.",
    bestFor: "inner-system couriers and sun-watching stations that never need to stop" }
];

/* Default cruise engine by environment. */
window.VSS_ENGINE_OF = function (o) {
  if (o.env === "outer" || o.env === "deep" || o.env === "radiation") return "nep";
  return "ion";
};
