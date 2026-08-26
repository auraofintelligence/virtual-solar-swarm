/* Renders the record of solar observation: the timeline, the grouped cards
   and the gravitational lens studies. Data lives in data/sun-watchers.js. */
(function () {
  "use strict";
  VSS.mountChrome("sun-watchers.html");

  var ALL = (window.VSS_SUN_WATCHERS || []).slice();
  var LENS = ALL.filter(function (m) { return m.lens; });
  var MAIN = ALL.filter(function (m) { return !m.lens; });

  var STATUS = {
    operating: { label: "Operating now", note: "watching the Sun today" },
    building:  { label: "Being built",   note: "approved and in construction" },
    planned:   { label: "Planned",       note: "formally planned, not yet built" },
    concept:   { label: "Concept",       note: "studied and published, not approved" },
    retired:   { label: "Retired",       note: "its watch is over" }
  };
  var ORDER = ["operating", "building", "planned", "concept", "retired"];
  var filter = null;

  function yearOf(m) {
    var y = parseInt(String(m.launched).replace(/[^0-9]/g, ""), 10);
    return isNaN(y) ? null : y;
  }
  function imgHtml(m) {
    if (m.image) return '<img loading="lazy" decoding="async" src="assets/watchers/' + m.image + '" alt="' + m.name + '">';
    return '<div class="no-img">no free image aboard</div>';
  }
  function card(m) {
    return '<div class="card mission-card" id="m-' + m.slug + '">' + imgHtml(m) +
      '<div><div class="mission-head"><h3>' + m.name + '</h3>' +
      '<span class="st st-' + m.status + '">' + m.status + "</span></div>" +
      '<p class="mission-years">' + m.agency + " · " + m.launched +
      (m.ended ? " to " + m.ended : (m.status === "operating" ? " to now" : "")) +
      (m.where ? " · " + m.where : "") + "</p>" +
      '<p class="dim small">' + m.role + "</p>" +
      '<p class="dim small mission-finding">' + m.finding + "</p>" +
      (m.link ? '<p class="small"><a href="' + m.link + '">Mission page →</a></p>' : "") +
      "</div></div>";
  }

  function renderGroups() {
    var host = document.getElementById("mission-groups");
    host.innerHTML = ORDER.map(function (st) {
      var list = MAIN.filter(function (m) { return m.status === st; });
      if (!list.length || (filter && filter !== st)) return "";
      list.sort(function (a, b) { return (yearOf(b) || 0) - (yearOf(a) || 0); });
      return "<h2>" + STATUS[st].label + ' <span class="dim" style="font-weight:400;font-size:.9rem">· ' +
        list.length + " of them, " + STATUS[st].note + "</span></h2>" +
        '<div class="grid cols-2">' + list.map(card).join("") + "</div>";
    }).join("");
  }

  function renderChips() {
    var host = document.getElementById("status-chips");
    host.innerHTML = '<button class="chip" data-st="" aria-pressed="' + (!filter) + '">Everything</button>' +
      ORDER.map(function (st) {
        var n = MAIN.filter(function (m) { return m.status === st; }).length;
        if (!n) return "";
        return '<button class="chip" data-st="' + st + '" aria-pressed="' + (filter === st) + '">' +
          STATUS[st].label + " · " + n + "</button>";
      }).join("");
    host.querySelectorAll("[data-st]").forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.dataset.st || null;
        renderChips(); renderGroups(); drawTimeline();
      });
    });
  }

  // ---- timeline ----
  var cv = document.getElementById("timeline"), ctx = cv.getContext("2d");
  var marks = [];
  var COL = { operating: "#4ade80", retired: "#7e8ca6", building: "#38bdf8", planned: "#a78bfa", concept: "#f0b429" };

  function drawTimeline() {
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    var dated = MAIN.filter(function (m) { return yearOf(m); });
    if (!dated.length) return;
    var years = dated.map(yearOf);
    var y0 = Math.min.apply(null, years) - 2, y1 = Math.max.apply(null, years) + 2;
    var x0 = 46, x1 = W - 24, axisY = H - 42;

    ctx.strokeStyle = "#1c2942"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, axisY); ctx.lineTo(x1, axisY); ctx.stroke();
    ctx.fillStyle = "#5c6a85"; ctx.font = "11px system-ui, sans-serif";
    var step = (y1 - y0) > 60 ? 10 : 5;
    for (var y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
      var x = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
      ctx.fillRect(x, axisY - 4, 1, 8);
      ctx.fillText(String(y), x - 13, axisY + 20);
    }
    // today
    var nowX = x0 + (x1 - x0) * (2026 - y0) / (y1 - y0);
    ctx.strokeStyle = "rgba(240,180,41,.5)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(nowX, 16); ctx.lineTo(nowX, axisY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(240,180,41,.8)"; ctx.fillText("today", nowX + 4, 26);

    marks = [];
    var lanes = [];
    dated.sort(function (a, b) { return yearOf(a) - yearOf(b); }).forEach(function (m) {
      var x = x0 + (x1 - x0) * (yearOf(m) - y0) / (y1 - y0);
      var lane = 0;
      while (lanes[lane] !== undefined && x - lanes[lane] < 13) lane++;
      lanes[lane] = x;
      var cy = axisY - 14 - lane * 15;
      if (cy < 14) cy = 14;
      var dim = filter && m.status !== filter;
      ctx.fillStyle = dim ? "rgba(90,104,130,.35)" : COL[m.status] || "#7e8ca6";
      ctx.beginPath(); ctx.arc(x, cy, 5, 0, 7); ctx.fill();
      marks.push({ x: x, y: cy, m: m });
    });
  }

  function nearest(ev) {
    var r = cv.getBoundingClientRect();
    var mx = (ev.clientX - r.left) * (cv.width / r.width);
    var my = (ev.clientY - r.top) * (cv.height / r.height);
    var best = null, bd = 13 * 13;
    marks.forEach(function (k) {
      var dx = k.x - mx, dy = k.y - my, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = k; }
    });
    return best;
  }
  cv.addEventListener("mousemove", function (ev) {
    var k = nearest(ev);
    document.getElementById("tl-hud").textContent = k
      ? k.m.name + " · " + k.m.agency + " · " + k.m.launched + (k.m.ended ? " to " + k.m.ended : "")
      : "hover a mark";
    cv.style.cursor = k ? "pointer" : "default";
  });
  cv.addEventListener("click", function (ev) {
    var k = nearest(ev);
    if (!k) return;
    if (filter && k.m.status !== filter) { filter = null; renderChips(); renderGroups(); drawTimeline(); }
    var el = document.getElementById("m-" + k.m.slug);
    if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); el.style.borderColor = "var(--accent)"; }
  });

  // ---- the lens studies ----
  document.getElementById("lens-cards").innerHTML = LENS.map(function (m) {
    return '<div class="card"><div class="mission-head"><h3>' + m.name + '</h3>' +
      '<span class="st st-concept">' + (m.launched || "concept") + "</span></div>" +
      '<p class="mission-years">' + m.agency + (m.where ? " · " + m.where : "") + "</p>" +
      '<p class="dim small">' + m.role + "</p>" +
      '<p class="dim small mission-finding">' + m.finding + "</p>" +
      (m.link ? '<p class="small"><a href="' + m.link + '">Read it →</a></p>' : "") + "</div>";
  }).join("");

  renderChips();
  renderGroups();
  drawTimeline();
})();
