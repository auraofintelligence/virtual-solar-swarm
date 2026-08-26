/* A planet's moons where they actually are.

   Elements are ecliptic mean elements fitted to JPL Horizons (see
   docs/ORBIT-SOURCES.md), so this is a real configuration for the date shown,
   not a diagram. Moons the catalogue has no phase for are listed but not
   placed. Drawn looking down on the ecliptic; a moon below the plane is drawn
   dimmer, and the parent's north is up. */
(function () {
  "use strict";

  var A = window.ASTRO;
  var TAU = Math.PI * 2;

  function moonsOf(id) {
    return (window.VSS_OBJECTS || [])
      .filter(function (k) { return k.parent === id && k.orbit && k.orbit.aKm; })
      .sort(function (a, b) { return a.orbit.aKm - b.orbit.aKm; });
  }

  /* Radial scale: linear out to maxKm, with a gentle square root so the inner
     moons do not collapse into the planet when the outliers set the scale. */
  function makeScale(maxKm, px) {
    return function (km) { return Math.sqrt(Math.max(0, km) / maxKm) * px; };
  }

  function paint(cv, opts) {
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) / 2 - 26;
    var parent = window.VSS_BY_ID[opts.parentId];
    var moons = moonsOf(opts.parentId);
    var placed = moons.filter(function (k) { return A.hasPhase(k.orbit); });
    var shown = placed.filter(function (k) { return k.orbit.aKm <= opts.maxKm; });
    var scale = makeScale(opts.maxKm, R);
    var tDays = opts.tDays;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#060913";
    ctx.fillRect(0, 0, W, H);

    /* distance rings, labelled in thousands of km */
    ctx.strokeStyle = "rgba(140,155,184,.14)";
    ctx.fillStyle = "rgba(92,106,133,.9)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.lineWidth = 1;
    var decade = Math.pow(10, Math.floor(Math.log(opts.maxKm) / Math.LN10));
    for (var s = 1; s <= 10; s++) {
      var rk = s * decade / 2;
      if (rk > opts.maxKm) break;
      var rp = scale(rk);
      ctx.beginPath(); ctx.arc(cx, cy, rp, 0, TAU); ctx.stroke();
      ctx.fillText(rk >= 1e6 ? (rk / 1e6) + "M km" : (rk / 1000) + "k km", cx + rp + 3, cy - 2);
    }

    /* the planet */
    var pr = Math.max(4, Math.min(16, scale(parent.radiusKm * 6)));
    var grad = ctx.createRadialGradient(cx - pr / 3, cy - pr / 3, pr / 6, cx, cy, pr);
    grad.addColorStop(0, "#ffe9b0");
    grad.addColorStop(1, "#c98f16");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, pr, 0, TAU); ctx.fill();

    /* orbit traces */
    shown.forEach(function (k) {
      ctx.beginPath();
      for (var n = 0; n <= 96; n++) {
        var fake = {
          aKm: k.orbit.aKm, e: k.orbit.e, iDeg: k.orbit.iDeg,
          omDeg: k.orbit.omDeg, wDeg: k.orbit.wDeg,
          M0Deg: (n / 96) * 360, nPerDay: 1, epochJD: k.orbit.epochJD
        };
        var q = A.moonPos(fake, (k.orbit.epochJD || 2451545) - 2451545);
        if (!q) break;
        var rr = Math.sqrt(q.x * q.x + q.y * q.y);
        var ang = Math.atan2(q.y, q.x);
        var px = cx + Math.cos(ang) * scale(rr), py = cy - Math.sin(ang) * scale(rr);
        if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = k.tier === "survey" ? "rgba(111,162,135,.28)" : "rgba(76,201,240,.30)";
      ctx.stroke();
    });

    /* the moons themselves */
    var labels = [];
    shown.forEach(function (k) {
      var p = A.moonPos(k.orbit, tDays);
      if (!p) return;
      var rr = Math.sqrt(p.x * p.x + p.y * p.y);
      var ang = Math.atan2(p.y, p.x);
      var px = cx + Math.cos(ang) * scale(rr), py = cy - Math.sin(ang) * scale(rr);
      var below = p.z < 0;
      var dot = Math.max(1.6, Math.min(6, Math.pow(k.radiusKm || 5, 0.34)));
      ctx.beginPath(); ctx.arc(px, py, dot, 0, TAU);
      ctx.fillStyle = k.tier === "survey"
        ? (below ? "rgba(111,162,135,.55)" : "#6fa287")
        : (below ? "rgba(120,205,245,.6)" : "#8fd8f7");
      ctx.fill();
      if (k.radiusKm >= opts.labelAbove) labels.push([k.name, px, py, dot]);
    });

    ctx.fillStyle = "rgba(220,229,245,.92)";
    ctx.font = "11px system-ui, sans-serif";
    labels.forEach(function (L) { ctx.fillText(L[0], L[1] + L[3] + 3, L[2] + 3); });

    return { shown: shown.length, placed: placed.length, total: moons.length };
  }

  /* Mount the whole panel: canvas, scale presets and a time control. */
  function mount(elId, parentId) {
    var host = document.getElementById(elId);
    if (!host) return;
    var moons = moonsOf(parentId);
    var placed = moons.filter(function (k) { return A.hasPhase(k.orbit); });
    if (!placed.length) return;
    var parent = window.VSS_BY_ID[parentId];

    var maxA = Math.max.apply(null, placed.map(function (k) { return k.orbit.aKm; }));
    var regularA = Math.max.apply(null, placed.filter(function (k) {
      return (k.orbit.e || 0) < 0.1 && (k.orbit.iDeg || 0) < 40;
    }).map(function (k) { return k.orbit.aKm; }).concat([maxA / 20]));

    var views = [
      { label: "the close-in moons", max: regularA * 1.15, labelAbove: 100 },
      { label: "the whole system", max: maxA * 1.05, labelAbove: 400 }
    ];
    var view = 0, offsetDays = 0, playing = false, raf = null;

    host.innerHTML =
      '<h2 style="clear:both">' + parent.name + "'s moons, where they are now</h2>" +
      '<p class="dim small">Positions computed from mean elements fitted to JPL Horizons. ' +
      'Looking down on the ecliptic; a moon below that plane is drawn dimmer. ' +
      placed.length + ' of ' + moons.length + ' catalogued moons here carry a position.</p>' +
      '<div class="chip-row" id="mv-views"></div>' +
      '<canvas id="mv-canvas" width="760" height="560" style="width:100%;max-width:760px;border-radius:var(--radius);border:1px solid var(--panel-edge)"></canvas>' +
      '<div class="controls" style="margin-top:.5rem">' +
      '<button class="chip" id="mv-play">Play</button>' +
      '<label style="flex:1;min-width:220px">Time <input type="range" id="mv-time" min="-365" max="365" value="0" style="width:100%;max-width:420px"></label>' +
      '<button class="chip" id="mv-now">Now</button>' +
      '<span class="dim small" id="mv-date"></span></div>';

    var cv = document.getElementById("mv-canvas");
    var chips = document.getElementById("mv-views");
    var slider = document.getElementById("mv-time");

    function render() {
      var when = new Date(Date.now() + offsetDays * 86400000);
      paint(cv, {
        parentId: parentId, maxKm: views[view].max,
        labelAbove: views[view].labelAbove, tDays: A.daysSinceJ2000(when)
      });
      document.getElementById("mv-date").textContent = when.toLocaleDateString("en-AU",
        { day: "numeric", month: "short", year: "numeric" });
      chips.innerHTML = views.map(function (v, k) {
        return '<button class="chip" data-v="' + k + '" aria-pressed="' + (k === view) + '">' + v.label + "</button>";
      }).join("");
      chips.querySelectorAll("[data-v]").forEach(function (b) {
        b.addEventListener("click", function () { view = +b.dataset.v; render(); });
      });
    }

    function tick() {
      if (!playing) return;
      offsetDays += 0.25;
      if (offsetDays > 365) offsetDays = -365;
      slider.value = Math.round(offsetDays);
      render();
      raf = requestAnimationFrame(tick);
    }

    slider.addEventListener("input", function () {
      playing = false;
      document.getElementById("mv-play").textContent = "Play";
      offsetDays = +slider.value; render();
    });
    document.getElementById("mv-play").addEventListener("click", function () {
      playing = !playing;
      this.textContent = playing ? "Pause" : "Play";
      if (playing) raf = requestAnimationFrame(tick); else if (raf) cancelAnimationFrame(raf);
    });
    document.getElementById("mv-now").addEventListener("click", function () {
      offsetDays = 0; slider.value = 0; render();
    });
    render();
  }

  window.VSS_MOONVIEW = { mount: mount, paint: paint, moonsOf: moonsOf };
})();
