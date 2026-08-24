/* Modular instrument kit-of-parts. Costs are mass-production targets in
   millions of US dollars at around unit 1,000 of a production run, not
   one-off flagship prices. The site shows them in AUD with the rate noted. */
window.VSS_SENSORS = [
  { id: "hyperspec", name: "Hyperspectral imager", short: "Camera, 220+ colour bands, UV to thermal infrared",
    massKg: 18, powerW: 45, dataMbps: 800, costUsdM: 1.5,
    gloss: "A camera that splits light into hundreds of colour bands instead of three, so it reads rock, ice and gas chemistry from orbit." },
  { id: "highenergy", name: "X-ray and gamma-ray spectrometer", short: "Counts the highest-energy light",
    massKg: 9, powerW: 30, dataMbps: 15, costUsdM: 0.8,
    gloss: "Watches solar flares and naturally radioactive surfaces by counting X-ray and gamma-ray photons one by one." },
  { id: "mag", name: "Fluxgate magnetometer", short: "Magnetic field strength and direction, on a boom",
    massKg: 3, powerW: 5, dataMbps: 1, costUsdM: 0.3,
    gloss: "A compass of laboratory grade held away from the spacecraft on a boom; maps magnetic fields in three dimensions." },
  { id: "epd", name: "Energetic particle detector", short: "High-energy ions and electrons",
    massKg: 5, powerW: 10, dataMbps: 4, costUsdM: 0.4,
    gloss: "Counts fast charged particles from solar storms and cosmic rays; the core instrument for space weather warnings." },
  { id: "swa", name: "Solar wind analyser", short: "Speed, density and temperature of the solar wind",
    massKg: 6, powerW: 12, dataMbps: 6, costUsdM: 0.3,
    gloss: "Samples the thin wind of particles that blows off the Sun and reports how fast, dense and hot it is." },
  { id: "radar", name: "Ice-penetrating radar", short: "Sees tens of kilometres below ice and rock",
    massKg: 22, powerW: 60, dataMbps: 120, costUsdM: 1.2,
    gloss: "Radio pulses that pass through ice and echo off what is underneath; the tool that finds buried oceans." },
  { id: "lidar", name: "Laser altimeter", short: "Centimetre-scale shape and terrain mapping",
    massKg: 7, powerW: 25, dataMbps: 10, costUsdM: 0.45,
    gloss: "Bounces laser pulses off the surface and times the echo, building an exact height map of the whole body." },
  { id: "navcam", name: "Navigation camera pair", short: "Star tracking plus swarm-on-swarm sighting",
    massKg: 4, powerW: 8, dataMbps: 90, costUsdM: 0.25,
    gloss: "Ordinary cameras doing two jobs: fixing position by the stars, and spotting sibling satellites so the swarm can navigate itself." },
  { id: "dust", name: "Dust analyser", short: "Catches and weighs individual dust grains",
    massKg: 4, powerW: 6, dataMbps: 1, costUsdM: 0.35,
    gloss: "Catches the dust a comet or ring sheds and measures each grain, a free sample of the body without landing." },
  { id: "gravsci", name: "Radio science package", short: "Weighs a body by how it bends the orbit",
    massKg: 1.5, powerW: 4, dataMbps: 0.2, costUsdM: 0.15,
    gloss: "Uses tiny wobbles in the satellite's own radio signal to weigh the body below and map lumps inside it." },
  { id: "lasercomm", name: "Laser comms terminal", short: "Broadband-class downlink over interplanetary distance",
    massKg: 12, powerW: 70, dataMbps: 2000, costUsdM: 0.5,
    gloss: "Sends data home on a light beam rather than radio; the difference between dial-up and broadband, across the solar system." },
  { id: "qcomm", name: "Quantum key channel", short: "Tamper-proof command link",
    massKg: 8, powerW: 25, dataMbps: 0.01, costUsdM: 2.0,
    gloss: "A slow but physically tamper-proof channel used only for commands and cryptographic keys, never for bulk data." },
  { id: "mesh", name: "Radio mesh unit", short: "Swarm-to-swarm networking with store-and-forward",
    massKg: 2.5, powerW: 6, dataMbps: 50, costUsdM: 0.1,
    gloss: "Lets every satellite relay for its neighbours, like a bucket brigade for data, so no single failure cuts the link." },
  { id: "aiproc", name: "Edge AI processor", short: "Onboard triage so only the interesting data flies home",
    massKg: 2, powerW: 20, dataMbps: 0, costUsdM: 0.2,
    gloss: "A small onboard computer that spots events (a plume, a flare) and re-points instruments itself rather than waiting hours for Earth." },
  { id: "radshield", name: "Radiation vault", short: "Shielding for the harsh zone around Jupiter",
    massKg: 12, powerW: 0, dataMbps: 0, costUsdM: 0.3,
    gloss: "A titanium box that keeps the electronics alive inside Jupiter's radiation belts, the harshest weather in the solar system." }
];

/* Recommended fit-out per target class. */
window.VSS_KITS = {
  star:        ["hyperspec", "highenergy", "mag", "epd", "swa", "aiproc", "lasercomm", "qcomm", "mesh"],
  planet:      ["hyperspec", "highenergy", "mag", "epd", "swa", "radar", "aiproc", "lasercomm", "mesh"],
  gasgiant:    ["hyperspec", "highenergy", "mag", "epd", "swa", "aiproc", "lasercomm", "mesh"],
  icymoon:     ["hyperspec", "mag", "epd", "radar", "lidar", "aiproc", "lasercomm", "mesh"],
  smallmoon:   ["hyperspec", "navcam", "lidar", "gravsci", "aiproc", "mesh"],
  asteroid:    ["hyperspec", "epd", "lidar", "gravsci", "navcam", "aiproc", "mesh"],
  comet:       ["hyperspec", "dust", "epd", "navcam", "aiproc", "mesh"],
  distant:     ["hyperspec", "epd", "navcam", "gravsci", "aiproc", "lasercomm", "mesh"],
  interstellar:["hyperspec", "dust", "navcam", "aiproc", "mesh"]
};

/* Map an object to its kit key. */
window.VSS_KIT_OF = function (o) {
  if (o.cls === "star") return "star";
  if (o.cls === "interstellar") return "interstellar";
  if (o.cls === "planet") return (o.id === "jupiter" || o.id === "saturn" || o.id === "uranus" || o.id === "neptune") ? "gasgiant" : "planet";
  if (o.cls === "moon") {
    var icy = ["europa", "ganymede", "callisto", "enceladus", "titan", "triton", "mimas", "tethys", "dione", "rhea", "iapetus", "miranda", "ariel", "umbriel", "titania", "oberon", "charon"];
    return icy.indexOf(o.id) >= 0 ? "icymoon" : "smallmoon";
  }
  if (o.cls === "asteroid") return "asteroid";
  if (o.cls === "comet" || o.cls === "centaur") return "comet";
  return "distant"; // tno, dwarf
};
