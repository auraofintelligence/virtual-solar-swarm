/* Global surface maps from mission imagery, credited per body and on the
   about page. Two sizes: `small` (512x256) for portraits and thumbnails,
   `full` (1024x512) for the orbit lab globe. Both load only when a body is
   drawn. Bodies absent from this list render as a lit sphere with a latitude
   and longitude grid, showing size and orientation only. */
window.VSS_MAPS = {
  sun: { small: "assets/maps/small/sun.jpg", full: "assets/maps/sun.jpg", credit: "solar imagery assembled by Solar System Scope from NASA data, CC BY 4.0" },
  mercury: { small: "assets/maps/small/mercury.jpg", full: "assets/maps/mercury.jpg", credit: "NASA MESSENGER mission data, assembled by Solar System Scope, CC BY 4.0" },
  venus: { small: "assets/maps/small/venus.jpg", full: "assets/maps/venus.jpg", credit: "cloud-top view assembled by Solar System Scope from NASA data, CC BY 4.0" },
  earth: { small: "assets/maps/small/earth.jpg", full: "assets/maps/earth.jpg", credit: "NASA Blue Marble Next Generation, public domain" },
  moon: { small: "assets/maps/small/moon.jpg", full: "assets/maps/moon.jpg", credit: "NASA Lunar Reconnaissance Orbiter camera mosaic, via the NASA SVS CGI Moon Kit, public domain" },
  mars: { small: "assets/maps/small/mars.jpg", full: "assets/maps/mars.jpg", credit: "NASA Viking and MOLA mission data, assembled by Solar System Scope, CC BY 4.0" },
  phobos: { small: "assets/maps/small/phobos.jpg", full: "assets/maps/phobos.jpg", credit: "NASA Viking imagery, Planetary Data System mosaic by Phil Stooke, public domain" },
  ceres: { small: "assets/maps/small/ceres.jpg", full: "assets/maps/ceres.jpg", credit: "NASA/JPL-Caltech/UCLA/MPS/DLR/IDA, Dawn global map, public domain" },
  vesta: { small: "assets/maps/small/vesta.jpg", full: "assets/maps/vesta.jpg", credit: "NASA/JPL-Caltech/UCLA/MPS/DLR/IDA, Dawn global map, public domain" },
  jupiter: { small: "assets/maps/small/jupiter.jpg", full: "assets/maps/jupiter.jpg", credit: "NASA Cassini flyby mosaic, assembled by Solar System Scope, CC BY 4.0" },
  io: { small: "assets/maps/small/io.jpg", full: "assets/maps/io.jpg", credit: "NASA Galileo and Voyager imagery, USGS Astrogeology global mosaic, public domain" },
  europa: { small: "assets/maps/small/europa.jpg", full: "assets/maps/europa.jpg", credit: "NASA Voyager and Galileo imagery, USGS Astrogeology global mosaic, public domain" },
  ganymede: { small: "assets/maps/small/ganymede.jpg", full: "assets/maps/ganymede.jpg", credit: "NASA Voyager and Galileo imagery, mapped by Bjorn Jonsson, CC BY" },
  callisto: { small: "assets/maps/small/callisto.jpg", full: "assets/maps/callisto.jpg", credit: "NASA Voyager imagery, Caltech/JPL/USGS map, public domain" },
  saturn: { small: "assets/maps/small/saturn.jpg", full: "assets/maps/saturn.jpg", credit: "NASA Cassini mission data, assembled by Solar System Scope, CC BY 4.0" },
  mimas: { small: "assets/maps/small/mimas.jpg", full: "assets/maps/mimas.jpg", credit: "NASA/JPL-Caltech/Space Science Institute and LPI, Cassini colour map, public domain" },
  enceladus: { small: "assets/maps/small/enceladus.jpg", full: "assets/maps/enceladus.jpg", credit: "NASA/JPL-Caltech/Space Science Institute and LPI, Cassini colour map, public domain" },
  tethys: { small: "assets/maps/small/tethys.jpg", full: "assets/maps/tethys.jpg", credit: "NASA/JPL-Caltech/Space Science Institute and LPI, Cassini colour map, public domain" },
  dione: { small: "assets/maps/small/dione.jpg", full: "assets/maps/dione.jpg", credit: "NASA/JPL-Caltech/Space Science Institute and LPI, Cassini colour map, public domain" },
  rhea: { small: "assets/maps/small/rhea.jpg", full: "assets/maps/rhea.jpg", credit: "NASA/JPL-Caltech/Space Science Institute and LPI, Cassini colour map, public domain" },
  titan: { small: "assets/maps/small/titan.jpg", full: "assets/maps/titan.jpg", credit: "NASA/JPL-Caltech and University of Arizona, Cassini surface mosaic, public domain" },
  iapetus: { small: "assets/maps/small/iapetus.jpg", full: "assets/maps/iapetus.jpg", credit: "NASA/JPL-Caltech/Space Science Institute and LPI, Cassini colour map, public domain" },
  uranus: { small: "assets/maps/small/uranus.jpg", full: "assets/maps/uranus.jpg", credit: "based on NASA Voyager 2 imagery, assembled by Solar System Scope, CC BY 4.0" },
  miranda: { small: "assets/maps/small/miranda.jpg", full: "assets/maps/miranda.jpg", credit: "NASA Voyager 2 imagery, assembled by Robin Gilbert, public domain" },
  ariel: { small: "assets/maps/small/ariel.jpg", full: "assets/maps/ariel.jpg", credit: "NASA Voyager 2 imagery, Caltech/JPL/USGS map, public domain" },
  umbriel: { small: "assets/maps/small/umbriel.jpg", full: "assets/maps/umbriel.jpg", credit: "NASA Voyager 2 imagery, Caltech/JPL/USGS map, public domain" },
  titania: { small: "assets/maps/small/titania.jpg", full: "assets/maps/titania.jpg", credit: "NASA Voyager 2 imagery, Caltech/JPL/USGS map, public domain" },
  oberon: { small: "assets/maps/small/oberon.jpg", full: "assets/maps/oberon.jpg", credit: "NASA Voyager 2 imagery, Caltech/JPL/USGS map, public domain" },
  neptune: { small: "assets/maps/small/neptune.jpg", full: "assets/maps/neptune.jpg", credit: "based on NASA Voyager 2 imagery, assembled by Solar System Scope, CC BY 4.0" },
  triton: { small: "assets/maps/small/triton.jpg", full: "assets/maps/triton.jpg", credit: "NASA Voyager 2 imagery, Lunar and Planetary Institute global mosaic, public domain" },
  pluto: { small: "assets/maps/small/pluto.jpg", full: "assets/maps/pluto.jpg", credit: "NASA/JHUAPL/SwRI, New Horizons global colour mosaic, public domain" },
  charon: { small: "assets/maps/small/charon.jpg", full: "assets/maps/charon.jpg", credit: "NASA/JHUAPL/SwRI, New Horizons cylindrical map, public domain" }
};
