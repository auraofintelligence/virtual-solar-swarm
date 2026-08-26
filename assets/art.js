/* Body portraits.
   Bodies humanity has mapped wear their real map (see data/maps.js for every
   source and credit). Bodies we have not mapped are drawn as a lit sphere in
   their measured colour under a latitude and longitude grid: never an
   invented surface, and never a blank ball either. The grid is the honest
   picture of what we know, and the missing maps are part of the case for
   sending something. */
(function () {
  "use strict";

  /* Measured colours. These come from real observation, not invention. */
  var TINT = {
    sun: [255, 186, 64], mercury: [154, 144, 134], venus: [232, 202, 148], earth: [88, 140, 214],
    mars: [198, 108, 66], jupiter: [214, 176, 138], saturn: [222, 198, 152], uranus: [156, 204, 218],
    neptune: [92, 122, 220], moon: [168, 168, 172], io: [226, 198, 96], europa: [206, 190, 164],
    ganymede: [162, 152, 140], callisto: [130, 122, 112], titan: [228, 158, 70], enceladus: [232, 240, 250],
    triton: [212, 186, 176], pluto: [212, 184, 150], charon: [152, 146, 146], ceres: [150, 144, 134],
    psyche: [176, 170, 168], vesta: [172, 160, 144], eris: [222, 222, 228], makemake: [200, 160, 130],
    haumea: [210, 210, 216], sedna: [196, 96, 70], oumuamua: [178, 96, 70], "planet-nine": [110, 130, 180]
  };
  var CLASS_TINT = {
    star: [255, 186, 64], planet: [170, 170, 180], dwarf: [178, 168, 158], moon: [158, 158, 164],
    asteroid: [142, 132, 120], comet: [168, 190, 214], centaur: [158, 146, 134],
    tno: [150, 140, 168], interstellar: [178, 110, 90], hypothesis: [110, 130, 180]
  };
  function tintOf(o) { return TINT[o.id] || CLASS_TINT[o.cls] || [160, 160, 165]; }
  function css(t, a) { return "rgba(" + t[0] + "," + t[1] + "," + t[2] + "," + (a === undefined ? 1 : a) + ")"; }
  function lighten(t, f) { return [Math.min(255, t[0] + f), Math.min(255, t[1] + f), Math.min(255, t[2] + f)]; }
  function darken(t, f) { return [Math.max(0, t[0] - f), Math.max(0, t[1] - f), Math.max(0, t[2] - f)]; }

  /* Real ring systems: measured band edges in planet radii, drawn as geometry
     at the ring plane's true tilt. Nothing here is invented structure. */
  var RINGS = {
    saturn: {
      tilt: 26.7 * Math.PI / 180, outer: 2.27,
      bands: [[1.24, 1.53, 0.22], [1.53, 1.95, 0.62], [1.95, 2.03, 0.06], [2.03, 2.27, 0.4]]
    },
    uranus: {
      tilt: 82 * Math.PI / 180, outer: 2.0,
      bands: [[1.64, 1.75, 0.12], [1.94, 2.0, 0.4]]
    }
  };

  /* ---- map cache: load once, repaint any canvas that asked early ---- */
  var mapCache = {};   // id -> {state, data, w, h, waiting:[]}
  function getMap(id, onReady) {
    var maps = window.VSS_MAPS || {};
    if (!maps[id]) return null;
    var entry = mapCache[id];
    if (entry && entry.state === "ready") return entry;
    if (!entry) {
      entry = mapCache[id] = { state: "loading", waiting: [] };
      var im = new Image();
      im.onload = function () {
        var w = 512, h = 256;
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        var cx = c.getContext("2d");
        cx.drawImage(im, 0, 0, w, h);
        entry.data = cx.getImageData(0, 0, w, h).data;
        entry.w = w; entry.h = h; entry.state = "ready";
        entry.waiting.splice(0).forEach(function (fn) { fn(); });
      };
      im.onerror = function () { entry.state = "failed"; entry.waiting.splice(0).forEach(function (fn) { fn(); }); };
      im.src = maps[id].small || maps[id].full || maps[id].file;
    }
    if (entry.state === "loading" && onReady) entry.waiting.push(onReady);
    return null;
  }

  /* Longitude offsets so a body's best-known face points at the viewer.
     Earth shows the Australian side, because that is where this was built. */
  var LON_OFFSET = { earth: 0.369, mars: 0.13, jupiter: 0.0, moon: 0.0 };

  function drawMappedGlobe(ctx, o, cx, cy, R, map) {
    var size = Math.ceil(R * 2) + 2, half = size / 2;
    var tmp = document.createElement("canvas");
    tmp.width = size; tmp.height = size;
    var tctx = tmp.getContext("2d");
    var img = tctx.createImageData(size, size);
    var d = img.data, td = map.data, tw = map.w, th = map.h;
    var isSun = o.cls === "star";
    // light from the upper left, a little toward the viewer
    var Lx = -0.52, Ly = 0.42, Lz = 0.74;
    var off = LON_OFFSET[o.id] || 0;
    for (var y = 0; y < size; y++) {
      var b = -(y - half) / R;
      for (var x = 0; x < size; x++) {
        var a = (x - half) / R;
        var rr = a * a + b * b;
        if (rr > 1) continue;
        var c = Math.sqrt(1 - rr);
        var lat = Math.asin(Math.max(-1, Math.min(1, b)));
        var lon = Math.atan2(a, c);
        var u = lon / (2 * Math.PI) + 0.5 + off;
        u -= Math.floor(u);
        var v = 0.5 - lat / Math.PI;
        var si = ((Math.min(th - 1, Math.max(0, Math.round(v * (th - 1)))) * tw) + ((u * tw) | 0)) * 4;
        var lum = isSun ? 1 : 0.22 + 0.88 * Math.max(0, a * Lx + b * Ly + c * Lz);
        var oi = (y * size + x) * 4;
        d[oi] = Math.min(255, td[si] * lum);
        d[oi + 1] = Math.min(255, td[si + 1] * lum);
        d[oi + 2] = Math.min(255, td[si + 2] * lum);
        d[oi + 3] = 255;
      }
    }
    tctx.putImageData(img, 0, 0);
    ctx.drawImage(tmp, Math.round(cx - half), Math.round(cy - half));
  }

  /* A body we have no map of: a lit sphere under a latitude and longitude
     grid, so its shape, spin axis and scale still read. Honest and never
     blank: this is what we actually know about it. */
  function graticule(ctx, cx, cy, R) {
    var LAT = [-60, -30, 0, 30, 60], STEP = 30;
    function plot(pts, alphaMul, width) {
      var run = [];
      function flush() {
        if (run.length > 1) {
          ctx.beginPath();
          run.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
          ctx.stroke();
        }
        run = [];
      }
      ctx.lineWidth = width;
      pts.forEach(function (q) {
        if (q[2] <= 0.02) { flush(); return; }
        ctx.strokeStyle = "rgba(226,235,250," + (alphaMul * Math.min(1, q[2] * 2.2)).toFixed(3) + ")";
        run.push([cx + R * q[0], cy - R * q[1]]);
        if (run.length > 1) { flush(); run = [[cx + R * q[0], cy - R * q[1]]]; }
      });
      flush();
    }
    LAT.forEach(function (la) {
      var r = Math.cos(la * Math.PI / 180), y = Math.sin(la * Math.PI / 180), pts = [];
      for (var k = 0; k <= 72; k++) {
        var lo = k / 72 * 2 * Math.PI;
        pts.push([r * Math.sin(lo), y, r * Math.cos(lo)]);
      }
      plot(pts, la === 0 ? 0.5 : 0.26, la === 0 ? 1.1 : 0.9);
    });
    for (var lonDeg = 0; lonDeg < 180; lonDeg += STEP) {
      var lo2 = lonDeg * Math.PI / 180, pts2 = [];
      for (var k2 = 0; k2 <= 72; k2++) {
        var la2 = (-90 + k2 / 72 * 180) * Math.PI / 180;
        pts2.push([Math.cos(la2) * Math.sin(lo2), Math.sin(la2), Math.cos(la2) * Math.cos(lo2)]);
      }
      plot(pts2, 0.26, 0.9);
    }
  }
  function plainDisc(ctx, o, cx, cy, R) {
    var t = tintOf(o);
    var g = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.42, R * 0.1, cx, cy, R);
    g.addColorStop(0, css(lighten(t, 62)));
    g.addColorStop(0.58, css(t));
    g.addColorStop(1, css(darken(t, 92)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    if (R >= 11) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      graticule(ctx, cx, cy, R);
      ctx.restore();
    }
  }

  function ringHalf(ctx, cx, cy, R, ring, back) {
    var squash = Math.sin(ring.tilt);   // how open the ring plane looks from here
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-0.18);
    ring.bands.forEach(function (b) {
      var steps = Math.max(2, Math.round((b[1] - b[0]) * R / 1.2));
      for (var k = 0; k <= steps; k++) {
        var rad = R * (b[0] + (b[1] - b[0]) * k / steps);
        ctx.strokeStyle = "rgba(228,212,182," + b[2] + ")";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(0, 0, rad, rad * squash, 0, back ? Math.PI : 0, back ? 2 * Math.PI : Math.PI);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  function paint(canvas, o) {
    var ctx = canvas.getContext("2d");
    var cx = canvas.width / 2, cy = canvas.height / 2;
    var R = Math.min(cx, cy) * 0.62;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var ring = RINGS[o.id];
    if (ring) R = Math.min(cx, cy) * 0.42;

    if (o.cls === "star") {
      var halo = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.9);
      halo.addColorStop(0, "rgba(255,190,80,.45)");
      halo.addColorStop(0.5, "rgba(255,140,50,.15)");
      halo.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.9, 0, 7); ctx.fill();
    }
    if (o.cls === "hypothesis") {
      var t = tintOf(o);
      ctx.setLineDash([Math.max(3, R * 0.16), Math.max(3, R * 0.13)]);
      ctx.strokeStyle = css(t, 0.85); ctx.lineWidth = Math.max(1.5, R * 0.06);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    if (ring) ringHalf(ctx, cx, cy, R, ring, true);

    var map = getMap(o.id, function () { paint(canvas, o); });
    if (map) drawMappedGlobe(ctx, o, cx, cy, R, map);
    else plainDisc(ctx, o, cx, cy, R);

    if (ring) ringHalf(ctx, cx, cy, R, ring, false);
  }

  /* Paint every canvas[data-obj] that is near the viewport, and keep painting
     as the reader scrolls. Deliberately not relying on IntersectionObserver:
     this runs the same everywhere, including inside embedded viewers. */
  var pending = [];
  var sweepQueued = false;
  function sweep() {
    sweepQueued = false;
    var byId = window.VSS_BY_ID || {};
    var h = window.innerHeight || 800;
    var still = [];
    pending.forEach(function (c) {
      if (c.dataset.painted) return;
      if (!c.isConnected) return;
      var r = c.getBoundingClientRect();
      if (r.bottom > -300 && r.top < h + 300) {
        var o = byId[c.dataset.obj];
        if (o) { paint(c, o); c.dataset.painted = "1"; return; }
      }
      still.push(c);
    });
    pending = still;
  }
  function queueSweep() {
    if (sweepQueued) return;
    sweepQueued = true;
    requestAnimationFrame(sweep);
  }
  function autoPaint(root) {
    var els = (root || document).querySelectorAll("canvas[data-obj]");
    els.forEach(function (c) { if (!c.dataset.painted) pending.push(c); });
    sweep();
  }
  window.addEventListener("scroll", queueSweep, { passive: true });
  window.addEventListener("resize", queueSweep, { passive: true });

  window.VSS_ART = { paint: paint, autoPaint: autoPaint, tintOf: tintOf, hasMap: function (id) { return !!(window.VSS_MAPS || {})[id]; } };
})();
