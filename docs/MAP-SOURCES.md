# Where the surface maps come from, and where to find more

This site draws every body with real mission imagery wherever a global map exists
and can be carried here. Bodies without one are drawn as a lit sphere under a
latitude and longitude grid, never an invented surface.

## Carried in this repo

Thirty-two bodies, listed with their credits in [`data/maps.js`](../data/maps.js)
and again on the site's about page. Two sizes per body, generated from the source
image: `assets/maps/small/<id>.jpg` at 512x256 for portraits and thumbnails, and
`assets/maps/<id>.jpg` at 1024x512 for the orbit lab globe. Together about 3 MB,
and both tiers load only when a body is actually drawn.

| Group | Bodies |
|---|---|
| Star | Sun |
| Planets | Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune |
| Earth system | the Moon |
| Mars system | Phobos |
| Main belt | Ceres, Vesta |
| Jupiter system | Io, Europa, Ganymede, Callisto |
| Saturn system | Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Iapetus |
| Uranus system | Miranda, Ariel, Umbriel, Titania, Oberon |
| Neptune system | Triton |
| Pluto system | Pluto, Charon |

## Where to get more

Ordered by how directly useful they are for equirectangular (simple cylindrical)
global maps, which is the projection this site samples.

1. **USGS Astrogeology Astropedia** : <https://astrogeology.usgs.gov/search/results?q=global+mosaic>
   The authoritative source: controlled global mosaics for most mapped bodies,
   public domain. Downloads are often large GeoTIFFs and the download host can be
   slow or blocked; the Wikimedia mirrors below are usually the same data.
2. **NASA Planetary Data System, Cartography and Imaging Sciences node** :
   <https://pds-imaging.jpl.nasa.gov/> Raw and derived mission products,
   including the mosaics the USGS maps are built from.
3. **JPL Photojournal** : <https://photojournal.jpl.nasa.gov/> Every PIA image,
   public domain. Search for "map" plus the body; many global mosaics are
   published here first. Direct hotlinking is blocked, so download by hand.
4. **NASA Scientific Visualization Studio** : <https://svs.gsfc.nasa.gov/>
   Well-made texture kits, including the CGI Moon Kit used here.
5. **Wikimedia Commons, "Maps of X" categories** : for example
   <https://commons.wikimedia.org/wiki/Category:Maps_of_Enceladus>
   Mirrors most of the above with licence metadata attached, and is the easiest
   to fetch programmatically. Filter for images at a 2:1 aspect ratio and avoid
   files whose names contain "geologic", "labeled", "nomenclature", "topographic"
   or "grid" unless annotation is what you want.
6. **Bjorn Jonsson's planetary maps** : <https://bjj.mmedia.is/> Careful
   reconstructions from mission data, CC BY. Used here for Ganymede.
7. **Solar System Scope textures** : <https://www.solarsystemscope.com/textures/>
   NASA-derived assemblies for the Sun and planets, CC BY 4.0.

## Bodies still without a map here

Everything else in the catalogue, which is most of it: the small outer moons, the
asteroids and comets, and the trans-Neptunian objects. Some have partial coverage
worth assembling (Hyperion, Phoebe, Amalthea, Proteus, Eros, Bennu, Ryugu,
Itokawa, comet 67P and Lutetia all have real shape models and mosaics from their
missions), and many have never been resolved at all. For irregular bodies a
texture map alone is not enough anyway: they need their shape model, which is
what the small-body radar and flyby archives publish.

## Rules used here

- Real mission data only. No invented terrain, no artist reconstructions of
  surfaces we have not seen.
- Prefer public domain, then CC BY. Credit every source in `data/maps.js`, on the
  about page, and on each body's dossier.
- Prefer unannotated photographic mosaics over geologic or nomenclature maps.
- Where nothing authoritative exists, draw the grid and say so.
