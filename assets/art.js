/* Procedural portraits: every body drawn by code from its real properties.
   No photographs, no borrowed art; the same seed always paints the same face. */
(function () {
  "use strict";

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Hand-set tints for famous faces; class fallbacks for the rest. */
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

  function sphere(ctx, x, y, r, t) {
    var g = ctx.createRadialGradient(x - r * 0.45, y - r * 0.45, r * 0.1, x, y, r);
    g.addColorStop(0, css(lighten(t, 70)));
    g.addColorStop(0.55, css(t));
    g.addColorStop(1, css(darken(t, 90)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    // terminator shadow on the right
    var s = ctx.createLinearGradient(x - r, y, x + r, y);
    s.addColorStop(0, "rgba(4,6,13,0)");
    s.addColorStop(0.72, "rgba(4,6,13,0)");
    s.addColorStop(1, "rgba(4,6,13,.6)");
    ctx.fillStyle = s;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  function clipCircle(ctx, x, y, r, fn) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); fn(); ctx.restore();
  }
  function craters(ctx, R, x, y, r, t, n) {
    clipCircle(ctx, x, y, r, function () {
      for (var i = 0; i < n; i++) {
        var a = R() * 7, d = Math.sqrt(R()) * r * 0.85;
        var cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d;
        var cr = r * (0.04 + R() * 0.1);
        ctx.fillStyle = css(darken(t, 55), 0.5);
        ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 7); ctx.fill();
        ctx.strokeStyle = css(lighten(t, 45), 0.35); ctx.lineWidth = Math.max(0.6, cr * 0.2);
        ctx.beginPath(); ctx.arc(cx, cy, cr, Math.PI * 0.9, Math.PI * 1.7); ctx.stroke();
      }
    });
  }
  function bands(ctx, R, x, y, r, t, spot) {
    clipCircle(ctx, x, y, r, function () {
      var n = 7 + Math.floor(R() * 4);
      for (var i = 0; i < n; i++) {
        var by = y - r + (i + 0.5) * (2 * r / n);
        var bh = (2 * r / n) * (0.55 + R() * 0.5);
        var tone = R() < 0.5 ? lighten(t, 18 + R() * 25) : darken(t, 12 + R() * 30);
        ctx.fillStyle = css(tone, 0.55);
        ctx.beginPath();
        ctx.ellipse(x, by + Math.sin(i * 2.1) * r * 0.02, r * 1.05, bh / 2, 0, 0, 7);
        ctx.fill();
      }
      if (spot) {
        ctx.fillStyle = "rgba(190,90,60,.75)";
        ctx.beginPath(); ctx.ellipse(x - r * 0.3, y + r * 0.32, r * 0.2, r * 0.12, -0.2, 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(220,140,100,.5)";
        ctx.beginPath(); ctx.ellipse(x - r * 0.3, y + r * 0.32, r * 0.12, r * 0.07, -0.2, 0, 7); ctx.fill();
      }
    });
    // re-shade after banding
    var s = ctx.createLinearGradient(x - r, y, x + r, y);
    s.addColorStop(0, "rgba(4,6,13,0)"); s.addColorStop(0.72, "rgba(4,6,13,0)"); s.addColorStop(1, "rgba(4,6,13,.6)");
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  function ringSystem(ctx, x, y, r, tilt, colour, width, alpha) {
    // back half first (above the planet), front half after the sphere is drawn by caller order
    ctx.save();
    ctx.translate(x, y); ctx.rotate(tilt);
    ctx.strokeStyle = css(colour, alpha);
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * 0.55, 0, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.restore();
  }
  function ringFront(ctx, x, y, r, tilt, colour, width, alpha) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(tilt);
    ctx.strokeStyle = css(colour, alpha);
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * 0.55, 0, 0, Math.PI); ctx.stroke();
    ctx.restore();
  }
  function lumpy(ctx, R, x, y, r, t) {
    var n = 9 + Math.floor(R() * 4);
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 2 * Math.PI;
      var rr = r * (0.68 + R() * 0.5);
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    var g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r * 1.15);
    g.addColorStop(0, css(lighten(t, 55)));
    g.addColorStop(0.6, css(t));
    g.addColorStop(1, css(darken(t, 80)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k <= n; k++) {
      var p = pts[k % n], q = pts[(k + 1) % n];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    for (var c = 0; c < 6; c++) {
      var ca = R() * 7, cd = Math.sqrt(R()) * r * 0.7;
      ctx.fillStyle = css(darken(t, 50), 0.5);
      ctx.beginPath(); ctx.arc(x + Math.cos(ca) * cd, y + Math.sin(ca) * cd, r * (0.06 + R() * 0.12), 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  function cometFace(ctx, R, x, y, r, t) {
    // tail away to the lower-right (the sun sits upper-left in every portrait)
    var tg = ctx.createLinearGradient(x, y, x + r * 3.1, y + r * 1.9);
    tg.addColorStop(0, css(lighten(t, 60), 0.5));
    tg.addColorStop(1, css(t, 0));
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.3, y - r * 0.7);
    ctx.quadraticCurveTo(x + r * 2.1, y + r * 0.1, x + r * 3.1, y + r * 1.9);
    ctx.quadraticCurveTo(x + r * 1.6, y + r * 1.6, x - r * 0.6, y + r * 0.5);
    ctx.closePath(); ctx.fill();
    // straight blue ion tail
    ctx.strokeStyle = "rgba(120,190,255,.4)"; ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r * 3.3, y + r * 1.1); ctx.stroke();
    // coma
    var cg = ctx.createRadialGradient(x, y, 0, x, y, r * 1.4);
    cg.addColorStop(0, css(lighten(t, 80), 0.9));
    cg.addColorStop(1, css(t, 0));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(x, y, r * 1.4, 0, 7); ctx.fill();
    lumpy(ctx, R, x, y, r * 0.4, darken(t, 40));
  }
  function starFace(ctx, R, x, y, r) {
    var t = TINT.sun;
    var halo = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.2);
    halo.addColorStop(0, "rgba(255,200,90,.5)");
    halo.addColorStop(0.5, "rgba(255,140,50,.16)");
    halo.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
    for (var i = 0; i < 10; i++) {
      var a = R() * 7;
      ctx.strokeStyle = "rgba(255,180,80," + (0.15 + R() * 0.25) + ")";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05, r * (0.14 + R() * 0.22),
        a + Math.PI * 0.8, a + Math.PI * 1.9);
      ctx.stroke();
    }
    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, "#fff3d0");
    g.addColorStop(0.55, css(t));
    g.addColorStop(1, "rgba(220,90,30,.95)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    clipCircle(ctx, x, y, r, function () {
      for (var k = 0; k < 14; k++) {
        ctx.fillStyle = "rgba(160,60,20," + (0.12 + R() * 0.2) + ")";
        var sx = x - r + R() * 2 * r, sy = y - r + R() * 2 * r;
        ctx.beginPath(); ctx.arc(sx, sy, r * (0.03 + R() * 0.06), 0, 7); ctx.fill();
      }
    });
  }

  function paint(canvas, o) {
    var ctx = canvas.getContext("2d");
    var s = canvas.width;
    var x = s / 2, y = canvas.height / 2, r = Math.min(x, y) * 0.52;
    var R = rng(hash(o.id));
    var t = tintOf(o);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // backdrop stars
    for (var i = 0; i < s / 8; i++) {
      ctx.fillStyle = "rgba(220,229,245," + (0.06 + R() * 0.2) + ")";
      ctx.fillRect(R() * canvas.width, R() * canvas.height, 1, 1);
    }
    var detail = s >= 90;

    if (o.cls === "star") { starFace(ctx, R, x, y, r); return; }
    if (o.cls === "hypothesis") {
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = css(t, 0.8); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
      ctx.setLineDash([]);
      var hg = ctx.createRadialGradient(x, y, 0, x, y, r);
      hg.addColorStop(0, css(t, 0.25)); hg.addColorStop(1, css(t, 0));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.fillStyle = css(t, 0.9); ctx.font = "bold " + (r * 0.9) + "px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("?", x, y + r * 0.05);
      return;
    }
    if (o.cls === "comet" || (o.cls === "interstellar" && o.id !== "oumuamua")) {
      cometFace(ctx, R, x, y, r * 0.8, t); return;
    }
    if (o.id === "oumuamua") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5);
      var og = ctx.createLinearGradient(-r, 0, r, 0);
      og.addColorStop(0, css(darken(t, 60))); og.addColorStop(0.4, css(lighten(t, 30))); og.addColorStop(1, css(darken(t, 80)));
      ctx.fillStyle = og;
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * 0.28, 0, 0, 7); ctx.fill();
      ctx.restore(); return;
    }
    if (o.cls === "asteroid" || (o.cls === "moon" && o.radiusKm < 120) || o.cls === "centaur") {
      lumpy(ctx, R, x, y, r * 0.85, t);
      if (o.id === "psyche" && detail) {
        ctx.fillStyle = "rgba(240,240,250,.35)";
        ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.2, r * 0.12, 0, 7); ctx.fill();
      }
      return;
    }

    var gas = ["jupiter", "saturn", "uranus", "neptune"].indexOf(o.id) >= 0;
    var icy = ["europa", "enceladus"].indexOf(o.id) >= 0;

    if (o.id === "saturn") ringSystem(ctx, x, y, r, 0.32, lighten(t, 40), r * 0.16, 0.55);
    if (o.id === "uranus") ringSystem(ctx, x, y, r, 1.35, lighten(t, 30), r * 0.05, 0.5);
    if (o.id === "chariklo") ringSystem(ctx, x, y, r, 0.5, lighten(t, 50), r * 0.04, 0.6);

    sphere(ctx, x, y, r, t);
    if (gas) bands(ctx, R, x, y, r, t, o.id === "jupiter");
    else if (icy && detail) {
      clipCircle(ctx, x, y, r, function () {
        for (var c = 0; c < 9; c++) {
          ctx.strokeStyle = c % 2 ? "rgba(160,110,80,.4)" : "rgba(120,150,190,.35)";
          ctx.lineWidth = 0.8 + R();
          ctx.beginPath();
          ctx.moveTo(x - r + R() * 2 * r, y - r + R() * 2 * r);
          ctx.quadraticCurveTo(x - r + R() * 2 * r, y - r + R() * 2 * r, x - r + R() * 2 * r, y - r + R() * 2 * r);
          ctx.stroke();
        }
      });
    }
    else if (o.id === "earth" && detail) {
      clipCircle(ctx, x, y, r, function () {
        for (var c = 0; c < 6; c++) {
          ctx.fillStyle = "rgba(90,160,90,.75)";
          ctx.beginPath();
          ctx.ellipse(x - r + R() * 2 * r, y - r + R() * 2 * r, r * (0.12 + R() * 0.22), r * (0.08 + R() * 0.14), R() * 3, 0, 7);
          ctx.fill();
        }
        for (var w = 0; w < 7; w++) {
          ctx.fillStyle = "rgba(255,255,255,.5)";
          ctx.beginPath();
          ctx.ellipse(x - r + R() * 2 * r, y - r + R() * 2 * r, r * (0.2 + R() * 0.25), r * 0.05, R() * 3, 0, 7);
          ctx.fill();
        }
      });
    }
    else if (o.id === "mars" && detail) {
      clipCircle(ctx, x, y, r, function () {
        for (var c = 0; c < 5; c++) {
          ctx.fillStyle = "rgba(120,60,40,.4)";
          ctx.beginPath();
          ctx.ellipse(x - r + R() * 2 * r, y - r + R() * 2 * r, r * (0.15 + R() * 0.2), r * (0.1 + R() * 0.1), R() * 3, 0, 7);
          ctx.fill();
        }
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.beginPath(); ctx.ellipse(x, y - r * 0.9, r * 0.3, r * 0.14, 0, 0, 7); ctx.fill();
      });
    }
    else if (o.id === "venus" && detail) {
      clipCircle(ctx, x, y, r, function () {
        for (var c = 0; c < 6; c++) {
          ctx.strokeStyle = "rgba(255,235,190,.3)"; ctx.lineWidth = r * 0.1;
          ctx.beginPath();
          ctx.arc(x, y + (R() - 0.5) * r, r * (0.5 + R() * 0.5), 3.4 + R(), 5.6 + R());
          ctx.stroke();
        }
      });
    }
    else if (o.id === "pluto" && detail) {
      clipCircle(ctx, x, y, r, function () {
        ctx.fillStyle = "rgba(240,230,210,.5)";
        ctx.beginPath();
        ctx.moveTo(x - r * 0.15, y + r * 0.55);
        ctx.bezierCurveTo(x - r * 0.5, y + r * 0.1, x - r * 0.15, y - r * 0.1, x + r * 0.05, y + r * 0.15);
        ctx.bezierCurveTo(x + r * 0.25, y - r * 0.1, x + r * 0.55, y + r * 0.15, x + r * 0.2, y + r * 0.55);
        ctx.closePath(); ctx.fill();
      });
    }
    else if (detail && (o.cls === "moon" || o.cls === "planet" || o.cls === "dwarf" || o.cls === "tno")) {
      craters(ctx, R, x, y, r, t, o.id === "mercury" || o.id === "moon" ? 16 : 7);
    }
    if (o.id === "titan") {
      var haze = ctx.createRadialGradient(x, y, r, x, y, r * 1.3);
      haze.addColorStop(0, "rgba(230,160,70,.4)"); haze.addColorStop(1, "rgba(230,160,70,0)");
      ctx.fillStyle = haze; ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, 7); ctx.fill();
    }
    if (o.id === "saturn") ringFront(ctx, x, y, r, 0.32, lighten(t, 55), r * 0.16, 0.8);
    if (o.id === "uranus") ringFront(ctx, x, y, r, 1.35, lighten(t, 40), r * 0.05, 0.7);
    if (o.id === "chariklo") ringFront(ctx, x, y, r, 0.5, lighten(t, 60), r * 0.04, 0.8);
  }

  /* Lazy-paint every canvas.portrait-canvas[data-obj] as it scrolls into view. */
  function autoPaint(root) {
    var byId = window.VSS_BY_ID || {};
    var els = (root || document).querySelectorAll("canvas[data-obj]");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (c) { var o = byId[c.dataset.obj]; if (o) paint(c, o); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var c = en.target, o = byId[c.dataset.obj];
        if (o && !c.dataset.painted) { paint(c, o); c.dataset.painted = "1"; }
        io.unobserve(c);
      });
    }, { rootMargin: "200px" });
    els.forEach(function (c) { io.observe(c); });
  }

  /* ---- equirectangular surface skins, for the orbit lab's rotating globes ----
     Deterministic value-noise per body: continents, bands, craters, cracks.
     Returns a canvas of w x h holding the map. */
  function valueNoise(seed, gw, gh) {
    var R = rng(seed);
    var g = [];
    for (var i = 0; i < gw * gh; i++) g.push(R());
    return function (u, v) { // u wraps horizontally
      var x = u * gw, y = v * (gh - 1);
      var x0 = Math.floor(x) % gw, y0 = Math.min(gh - 2, Math.floor(y));
      var x1 = (x0 + 1) % gw, y1 = y0 + 1;
      var fx = x - Math.floor(x), fy = y - y0;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      var a = g[y0 * gw + x0], b = g[y0 * gw + x1], c = g[y1 * gw + x0], d = g[y1 * gw + x1];
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
  }
  function fbmMaker(seed) {
    var n1 = valueNoise(seed, 8, 5), n2 = valueNoise(seed ^ 0x9e37, 16, 9), n3 = valueNoise(seed ^ 0x51ab, 32, 17), n4 = valueNoise(seed ^ 0x2c1f, 64, 33);
    return function (u, v) { return 0.45 * n1(u, v) + 0.28 * n2(u, v) + 0.17 * n3(u, v) + 0.10 * n4(u, v); };
  }

  function texture(o, w, h) {
    w = w || 512; h = h || 256;
    var cvs = document.createElement("canvas");
    cvs.width = w; cvs.height = h;
    var ctx = cvs.getContext("2d");
    var img = ctx.createImageData(w, h);
    var d = img.data;
    var seed = hash(o.id);
    var fbm = fbmMaker(seed), fbm2 = fbmMaker(seed ^ 0xdead);
    var t = tintOf(o);
    var gas = ["jupiter", "saturn", "uranus", "neptune"].indexOf(o.id) >= 0;
    var icy = ["europa", "enceladus", "eris", "haumea", "makemake", "triton", "mimas", "tethys", "dione", "rhea"].indexOf(o.id) >= 0;

    for (var y = 0; y < h; y++) {
      var v = y / (h - 1), lat = (0.5 - v) * Math.PI;
      for (var x = 0; x < w; x++) {
        var u = x / w;
        var r, g2, b;
        if (o.id === "earth") {
          var e = fbm(u, v) + 0.18 * Math.cos(lat) - 0.12;
          if (e > 0.52) { // land
            var veg = fbm2(u * 2 % 1, v);
            r = 92 + veg * 70; g2 = 118 + veg * 50; b = 60 + veg * 30;
          } else { r = 24 + e * 40; g2 = 62 + e * 60; b = 132 + e * 70; }
          if (Math.abs(lat) > 1.15) { r = g2 = b = 235; }             // ice caps
          var cl = fbm2((u + 0.37) % 1, v * 0.9);
          if (cl > 0.62) { var cw = (cl - 0.62) * 500; r += cw; g2 += cw; b += cw; }
        } else if (gas) {
          var bandN = o.id === "jupiter" ? 9 : o.id === "saturn" ? 7 : 4;
          var wob = (fbm(u, v) - 0.5) * 0.35;
          var band = Math.sin((v + wob * 0.12) * Math.PI * bandN);
          var f = band * (o.id === "uranus" || o.id === "neptune" ? 10 : 26);
          r = t[0] + f + wob * 30; g2 = t[1] + f + wob * 24; b = t[2] + f * 0.7;
          if (o.id === "jupiter") { // the great spot, southern hemisphere
            var du = Math.min(Math.abs(u - 0.3), 1 - Math.abs(u - 0.3)) / 0.06, dv = (v - 0.62) / 0.05;
            var s = du * du + dv * dv;
            if (s < 1) { r = 205 - s * 30; g2 = 110 + s * 40; b = 80 + s * 40; }
          }
        } else if (icy) {
          var ice = fbm(u, v);
          r = t[0] + ice * 26 - 8; g2 = t[1] + ice * 26 - 8; b = t[2] + ice * 30 - 8;
          var crack = Math.abs(fbm2(u, v) - 0.5);
          if (crack < 0.018) { r = 150; g2 = 96; b = 70; }             // rusty lineae
        } else if (o.id === "mars") {
          var m = fbm(u, v);
          r = 176 + m * 60; g2 = 92 + m * 42; b = 56 + m * 30;
          if (fbm2(u, v) > 0.63) { r -= 60; g2 -= 34; b -= 20; }       // dark basalt
          if (Math.abs(lat) > 1.25) { r = g2 = b = 238; }              // polar caps
        } else if (o.id === "venus") {
          var s2 = fbm((u + 0.1 * Math.sin(v * 9)) % 1, v);
          r = 216 + s2 * 30; g2 = 188 + s2 * 26; b = 138 + s2 * 22;
        } else if (o.id === "titan") {
          var hz = fbm(u, v);
          r = 214 + hz * 26; g2 = 148 + hz * 18; b = 62 + hz * 12;
          if (v < 0.18 && fbm2(u, v) > 0.5) { r -= 50; g2 -= 30; }     // northern lakes
        } else {
          // cratered rock and ice-dust worlds
          var base = fbm(u, v);
          r = t[0] + base * 44 - 22; g2 = t[1] + base * 44 - 22; b = t[2] + base * 44 - 22;
          var cr = fbm2(u, v);
          if (cr > 0.66) { var k2 = (cr - 0.66) * 160; r -= k2; g2 -= k2; b -= k2; }
        }
        var i4 = (y * w + x) * 4;
        d[i4] = Math.max(0, Math.min(255, r));
        d[i4 + 1] = Math.max(0, Math.min(255, g2));
        d[i4 + 2] = Math.max(0, Math.min(255, b));
        d[i4 + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cvs;
  }

  window.VSS_ART = { paint: paint, autoPaint: autoPaint, tintOf: tintOf, texture: texture };
})();
