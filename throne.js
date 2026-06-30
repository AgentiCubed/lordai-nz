/* =============================================================================
   NAZARICK — Floor B2: the Throne Room ambient
   A tasteful canvas hero backdrop: a slow-rotating arcane sigil ring behind the
   name, drifting gold motes rising through the void, and a soft breathing glow.
   Vanilla JS, no deps. DPR-aware. Pauses when hidden. Reduced-motion → one
   static frame, no animation loop. Public-safe; purely decorative.
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.querySelector(".hero__canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- palette (matches the design tokens) --------------------------------
  var GOLD = "200,162,76";
  var GOLD_HI = "233,205,126";
  var BLOOD = "123,45,78";

  var W = 0,
    H = 0,
    DPR = 1,
    cx = 0,
    cy = 0;
  var motes = [];
  var t0 = 0;

  // deterministic-ish PRNG so layout is stable across a single load
  function rnd(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W * 0.5;
    cy = H * 0.42; // sigil sits a touch above center, behind the name
    seed();
  }

  function seed() {
    // particle count scales with area, capped for small screens / perf
    var n = Math.round(Math.min(70, Math.max(22, (W * H) / 26000)));
    motes = [];
    for (var i = 0; i < n; i++) {
      var depth = rnd(0.35, 1); // parallax: nearer motes bigger + faster
      motes.push({
        x: rnd(0, W),
        y: rnd(0, H),
        r: rnd(0.6, 2.2) * depth,
        depth: depth,
        vy: rnd(6, 16) * depth, // px/sec, rising
        sway: rnd(8, 26),
        phase: rnd(0, Math.PI * 2),
        swaySpd: rnd(0.2, 0.6),
        tw: rnd(0.4, 1), // base twinkle
        twSpd: rnd(0.6, 1.6),
        hi: Math.random() < 0.22 // a few brighter highlight motes
      });
    }
  }

  // ---- the arcane sigil ring ----------------------------------------------
  function drawSigil(time, breathe) {
    var R = Math.min(W, H) * 0.34;
    if (R < 40) return;

    var rot = reduce ? -0.3 : time * 0.04; // slow rotation
    var rot2 = reduce ? 0.5 : -time * 0.027;

    ctx.save();
    ctx.translate(cx, cy);

    // soft central glow that breathes
    var glow = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.5);
    glow.addColorStop(0, "rgba(" + GOLD + "," + (0.05 + breathe * 0.04) + ")");
    glow.addColorStop(0.5, "rgba(" + BLOOD + "," + (0.04 + breathe * 0.03) + ")");
    glow.addColorStop(1, "rgba(" + GOLD + ",0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = "round";

    // outer ring + tick runes (rotating one way)
    ctx.save();
    ctx.rotate(rot);
    ctx.strokeStyle = "rgba(" + GOLD + ",0.22)";
    ctx.lineWidth = 1;
    ring(R);
    ring(R * 0.985);
    ticks(R, 48, R * 0.04, "rgba(" + GOLD + ",0.30)");
    ctx.restore();

    // inner ring + longer runes (counter-rotating)
    ctx.save();
    ctx.rotate(rot2);
    ctx.strokeStyle = "rgba(" + GOLD + ",0.18)";
    ctx.lineWidth = 1;
    ring(R * 0.66);
    ticks(R * 0.66, 12, R * 0.09, "rgba(" + GOLD_HI + ",0.26)");
    // a faint inscribed hexagram (Nazarick's seal, abstracted)
    star(R * 0.6, 6, "rgba(" + GOLD + ",0.10)");
    ctx.restore();

    // innermost ring, steady
    ctx.strokeStyle = "rgba(" + GOLD + ",0.14)";
    ctx.lineWidth = 1;
    ring(R * 0.34);

    ctx.restore();
  }

  function ring(r) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  function ticks(r, count, len, color) {
    ctx.strokeStyle = color;
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2;
      var c = Math.cos(a),
        s = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(c * r, s * r);
      ctx.lineTo(c * (r + len), s * (r + len));
      ctx.stroke();
    }
  }

  function star(r, points, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i <= points; i++) {
      // step by 2 vertices to inscribe an interlaced figure
      var a = ((i * 2) / points) * Math.PI - Math.PI / 2;
      var x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // ---- motes ---------------------------------------------------------------
  function drawMotes(time, dt) {
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      if (!reduce) {
        m.y -= m.vy * dt;
        m.phase += m.swaySpd * dt;
        if (m.y < -4) {
          m.y = H + 4;
          m.x = rnd(0, W);
        }
      }
      var x = m.x + Math.sin(m.phase) * m.sway;
      var tw = reduce
        ? m.tw
        : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * m.twSpd + m.phase));
      var alpha = (m.hi ? 0.85 : 0.5) * tw * (0.5 + m.depth * 0.5);

      var col = m.hi ? GOLD_HI : GOLD;
      // soft halo
      var g = ctx.createRadialGradient(x, m.y, 0, x, m.y, m.r * 4);
      g.addColorStop(0, "rgba(" + col + "," + alpha + ")");
      g.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, m.y, m.r * 4, 0, Math.PI * 2);
      ctx.fill();
      // bright core
      ctx.fillStyle = "rgba(" + col + "," + Math.min(1, alpha + 0.15) + ")";
      ctx.beginPath();
      ctx.arc(x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- frame ---------------------------------------------------------------
  var last = 0;
  function frame(now) {
    if (!t0) t0 = now;
    var time = (now - t0) / 1000;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    ctx.clearRect(0, 0, W, H);
    var breathe = 0.5 + 0.5 * Math.sin(time * 0.5);
    drawSigil(time, breathe);
    drawMotes(time, dt);

    if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
    else raf = 0;
  }

  var raf = 0;
  function start() {
    if (raf) return;
    last = 0;
    t0 = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function renderStatic() {
    ctx.clearRect(0, 0, W, H);
    drawSigil(0, 0.5);
    drawMotes(0, 0);
  }

  // ---- wire up -------------------------------------------------------------
  resize();

  var rt;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        resize();
        if (reduce) renderStatic();
      }, 150);
    },
    { passive: true }
  );

  if (reduce) {
    renderStatic();
  } else {
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    start();
  }
})();
