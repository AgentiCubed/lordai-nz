/* =============================================================================
   NAZARICK — Floor B4: the Reliquary
   Two self-contained, vanilla-JS/canvas demonstrations of the conceptual
   mechanisms behind the work. No backend, no private data — the IDEA made
   tangible. DPR-aware, mobile-friendly, reduced-motion safe, labelled.

     Relic I  · Valence Flip — one fixed scent; the body's inner state swings the
                grounded verdict craving <-> revulsion while a state-blind model,
                reading only the molecule, stays frozen.
     Relic II · The Flatlander — two scenes pixel-identical in projection; a
                projection-only mind is stuck at chance, a depth-aware mind is
                right every time. Reveal depth and the blindness breaks.
   ========================================================================== */
(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // palette (mirrors the CSS design tokens)
  var GOLD = "200,162,76";
  var GOLD_HI = "244,231,192";
  var BLOOD = "196,77,114";
  var ASH = "154,147,168";
  var BONE = "232,226,212";

  // DPR-fit a canvas to its CSS box; returns the css width/height.
  function fit(canvas, ctx) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || canvas.width;
    var h = canvas.clientHeight || canvas.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h };
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  /* ======================================================================
     RELIC I — VALENCE FLIP
     ====================================================================== */
  (function valenceFlip() {
    var slider = document.getElementById("vf-slider");
    var gG = document.getElementById("vf-gauge-grounded");
    var gB = document.getElementById("vf-gauge-blind");
    var caption = document.getElementById("vf-caption");
    var groundedWord = document.getElementById("vf-grounded-word");
    if (!slider || !gG || !gB || !caption) return;

    var ctxG = gG.getContext("2d");
    var ctxB = gB.getContext("2d");
    if (!ctxG || !ctxB) return;

    // The state-blind model: it only ever sees the molecule, so it reports a
    // single fixed hedonic prior, no matter what the body is doing.
    var BLIND_VALENCE = 0.55;

    // grounded valence as a function of body state s in [0,1]
    //   s=0 (starving)  -> +1  craving
    //   s=0.5           ->  0  indifference
    //   s=1 (overfull)  -> -1  revulsion
    function valenceFor(s) {
      return Math.cos(s * Math.PI); // smooth +1 -> -1
    }

    // draw one semicircular needle gauge. v in [-1,1].
    // live=true tints by sign; live=false draws the frozen/ash treatment.
    function drawGauge(ctx, box, v, live) {
      var w = box.w,
        h = box.h;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2,
        cy = h * 0.92,
        r = Math.min(w * 0.42, h * 0.78);

      // arc track (revulsion -> neutral -> craving), left to right
      var a0 = Math.PI, // 180deg (left)
        a1 = 0; // 0deg (right)
      var grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      grad.addColorStop(0, "rgba(" + BLOOD + ",.85)");
      grad.addColorStop(0.5, "rgba(" + ASH + ",.5)");
      grad.addColorStop(1, "rgba(" + GOLD + ",.9)");
      ctx.lineCap = "round";
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(7, r * 0.13);
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1, false);
      ctx.stroke();

      // end labels
      ctx.font =
        "600 " +
        Math.max(9, r * 0.13) +
        'px "Inter",system-ui,sans-serif';
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "rgba(" + BLOOD + ",.85)";
      ctx.textAlign = "left";
      ctx.fillText("REVULSION", cx - r - 2, cy + r * 0.34);
      ctx.fillStyle = "rgba(" + GOLD + ",.9)";
      ctx.textAlign = "right";
      ctx.fillText("CRAVING", cx + r + 2, cy + r * 0.34);

      // needle angle: v=-1 -> 180deg, v=+1 -> 0deg
      var ang = Math.PI * (1 - (v + 1) / 2);
      var nx = cx + Math.cos(ang) * r * 0.86;
      var ny = cy - Math.sin(ang) * r * 0.86;

      var col = live
        ? v >= 0
          ? GOLD_HI
          : BLOOD
        : ASH;
      // needle
      ctx.strokeStyle = "rgba(" + col + ",1)";
      ctx.lineWidth = Math.max(2.5, r * 0.045);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      // hub
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + col + ",1)";
      ctx.arc(cx, cy, Math.max(4, r * 0.07), 0, Math.PI * 2);
      ctx.fill();
      // tip glow (live only)
      if (live && !reduce) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + col + ",.28)";
        ctx.arc(nx, ny, Math.max(6, r * 0.12), 0, Math.PI * 2);
        ctx.fill();
      }

      // numeric readout
      ctx.font =
        "600 " + Math.max(13, r * 0.2) + 'px "Inter",system-ui,sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = live
        ? "rgba(" + (v >= 0 ? GOLD_HI : BLOOD) + ",1)"
        : "rgba(" + ASH + ",1)";
      var sign = v >= 0 ? "+" : "−";
      ctx.fillText(sign + Math.abs(v).toFixed(2), cx, cy - r * 0.42);
    }

    function wordFor(v) {
      if (v >= 0.55) return "craving";
      if (v >= 0.15) return "drawn to it";
      if (v > -0.15) return "indifferent";
      if (v > -0.55) return "put off";
      return "revolted";
    }

    function captionFor(s, v) {
      var frozen =
        ' The state-blind model has not moved: <b>same molecule, same +0.55</b>' +
        " — it can name the smell, but cannot taste what it is <em>for</em>.";
      if (s < 0.28)
        return (
          "<b>Starving.</b> The body throws its whole weight behind the smell — " +
          "grounded valence reads strong <b>craving</b>." +
          frozen
        );
      if (s < 0.6)
        return (
          "<b>Comfortable.</b> The pull has bled away to near indifference; the " +
          "same scent barely registers." +
          frozen
        );
      if (s < 0.82)
        return (
          "<b>Full.</b> The verdict has crossed zero — the smell is starting to " +
          'turn <span class="rev">unwelcome</span>.' +
          frozen
        );
      return (
        "<b>Overfull.</b> Identical scent, opposite verdict: grounded valence now " +
        'reads <span class="rev">revulsion</span>.' +
        frozen
      );
    }

    var boxG, boxB;
    function render() {
      var s = (+slider.value || 0) / 100;
      var v = valenceFor(s);
      drawGauge(ctxG, boxG, v, true);
      drawGauge(ctxB, boxB, BLIND_VALENCE, false);
      if (groundedWord) groundedWord.textContent = "“" + wordFor(v) + "”";
      caption.innerHTML = captionFor(s, v);
    }

    function resize() {
      boxG = fit(gG, ctxG);
      boxB = fit(gB, ctxB);
      render();
    }

    slider.addEventListener("input", render);
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 120);
    });
    resize();
  })();

  /* ======================================================================
     RELIC II — THE FLATLANDER
     ====================================================================== */
  (function flatlander() {
    var cvA = document.getElementById("fl-canvas-a");
    var cvB = document.getElementById("fl-canvas-b");
    var prompt = document.getElementById("fl-prompt");
    var btnReveal = document.getElementById("fl-reveal");
    var btnNext = document.getElementById("fl-next");
    var scoreBlind = document.getElementById("fl-score-blind");
    var scoreDepth = document.getElementById("fl-score-depth");
    var youStat = document.getElementById("fl-stat-you");
    if (!cvA || !cvB || !btnReveal || !btnNext) return;
    var ctxA = cvA.getContext("2d");
    var ctxB = cvB.getContext("2d");
    if (!ctxA || !ctxB) return;
    var youScoreEl = youStat ? youStat.querySelector("[data-score]") : null;
    var picks = Array.prototype.slice.call(
      document.querySelectorAll(".fl-pick")
    );

    // three orbs share the SAME screen-x and SAME flat radius in both scenes,
    // so at angle 0 the projections are pixel-identical. Only hidden depth
    // (0 = nearest, 1 = farthest) differs — invisible until the camera tilts.
    var WORLD_X = [-0.62, 0, 0.62]; // gold orb is the centre one
    var GOLD_I = 1;

    var state; // current round
    var tally = {
      you: { right: 0, n: 0 },
      blind: { right: 0, n: 0 },
      depth: { right: 0, n: 0 }
    };
    var angle = 0; // 0 flat -> 1 fully tilted
    var raf = 0;

    // pseudo-random round, varied by counter (no Math.random dependency issues)
    var seed = 7;
    function rnd() {
      // simple LCG — deterministic but well-spread across rounds
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }

    function newRound() {
      // which scene actually holds the gold orb nearest?
      var answer = rnd() < 0.5 ? "A" : "B";
      // depth assignments; gold orb near in `answer`, far in the other
      function depths(goldNear) {
        var others = rnd() < 0.5 ? [0.55, 0.9] : [0.9, 0.55];
        var d = [others[0], goldNear ? 0.12 : 0.86, others[1]];
        return d;
      }
      state = {
        answer: answer,
        A: depths(answer === "A"),
        B: depths(answer === "B"),
        you: null,
        blindGuess: rnd() < 0.5 ? "A" : "B", // projection-only -> a coin
        revealed: false,
        scored: false
      };
      angle = 0;
      btnReveal.setAttribute("aria-pressed", "false");
      btnReveal.textContent = "Reveal depth";
      btnReveal.disabled = false;
      cvA.parentNode.classList.remove("is-answer");
      cvB.parentNode.classList.remove("is-answer");
      picks.forEach(function (b) {
        b.classList.remove("is-chosen");
        b.disabled = false;
      });
      if (prompt) {
        prompt.classList.remove("is-right");
        prompt.innerHTML =
          "Which scene holds the gold orb <b>nearest</b> you?";
      }
      draw();
    }

    function project(depth, box, tilt) {
      // orthographic-ish: screen-x fixed; depth lifts up the screen as we tilt.
      var baseY = box.h * 0.62;
      var spread = box.w * 0.3;
      return {
        x: function (wx) {
          return box.w / 2 + wx * spread;
        },
        y: baseY - depth * box.h * 0.4 * tilt,
        r: box.w * 0.092 * (1 - 0.22 * depth * tilt),
        shadowY: baseY + box.h * 0.04
      };
    }

    function drawScene(ctx, box, depths, tilt) {
      var w = box.w,
        h = box.h;
      ctx.clearRect(0, 0, w, h);

      // floor line appears as depth is revealed
      if (tilt > 0.01) {
        ctx.strokeStyle = "rgba(" + GOLD + "," + 0.16 * tilt + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.1, h * 0.66);
        ctx.lineTo(w * 0.9, h * 0.66);
        ctx.stroke();
      }

      // draw farthest-first so nearer orbs overlap correctly
      var order = [0, 1, 2].sort(function (a, b) {
        return depths[b] - depths[a];
      });
      order.forEach(function (i) {
        var d = depths[i];
        var p = project(d, box, tilt);
        var px = p.x(WORLD_X[i]);
        var gold = i === GOLD_I;

        // ground shadow (only when tilted)
        if (tilt > 0.01) {
          ctx.beginPath();
          ctx.fillStyle = "rgba(0,0,0," + 0.32 * tilt + ")";
          ctx.ellipse(
            px,
            p.shadowY,
            p.r * (1.1 - 0.3 * d),
            p.r * 0.32,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // a faint stem tying orb to floor → reads as height/depth
          ctx.strokeStyle = "rgba(" + (gold ? GOLD : ASH) + "," + 0.25 * tilt + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, p.y);
          ctx.lineTo(px, p.shadowY);
          ctx.stroke();
        }

        // the orb
        var base = gold ? GOLD : ASH;
        var hi = gold ? GOLD_HI : BONE;
        var g = ctx.createRadialGradient(
          px - p.r * 0.32,
          p.y - p.r * 0.36,
          p.r * 0.15,
          px,
          p.y,
          p.r
        );
        g.addColorStop(0, "rgba(" + hi + ",1)");
        g.addColorStop(0.55, "rgba(" + base + ",1)");
        g.addColorStop(1, "rgba(" + base + ",.35)");
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(px, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (gold) {
          ctx.strokeStyle = "rgba(" + GOLD_HI + ",.7)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // depth caption once revealed
      if (tilt > 0.6) {
        var goldDepth = depths[GOLD_I];
        ctx.font = '600 11px "Inter",system-ui,sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(" + GOLD + "," + (tilt - 0.6) / 0.4 + ")";
        ctx.fillText(
          goldDepth < 0.5 ? "gold orb · up front" : "gold orb · far back",
          w / 2,
          h - 8
        );
      }
    }

    var boxA, boxB;
    function draw() {
      if (!state) return;
      drawScene(ctxA, boxA, state.A, angle);
      drawScene(ctxB, boxB, state.B, angle);
    }

    function animateTo(target) {
      if (reduce) {
        angle = target;
        draw();
        return;
      }
      cancelAnimationFrame(raf);
      var step = function () {
        var diff = target - angle;
        angle += diff * 0.16;
        if (Math.abs(diff) < 0.004) {
          angle = target;
          draw();
          return;
        }
        draw();
        raf = requestAnimationFrame(step);
      };
      step();
    }

    function fmt(rec) {
      var pct = rec.n ? Math.round((rec.right / rec.n) * 100) : 0;
      return rec.right + " / " + rec.n + (rec.n ? "  ·  " + pct + "%" : "");
    }

    function scoreRound() {
      if (!state || state.scored) return;
      state.scored = true;
      var ans = state.answer;
      // depth-aware always right; projection-only used its coin; you used yours
      tally.depth.n++;
      tally.depth.right++;
      tally.blind.n++;
      if (state.blindGuess === ans) tally.blind.right++;
      if (state.you) {
        tally.you.n++;
        if (state.you === ans) tally.you.right++;
      }
      if (scoreBlind) scoreBlind.textContent = fmt(tally.blind);
      if (scoreDepth) scoreDepth.textContent = fmt(tally.depth);
      if (youScoreEl)
        youScoreEl.textContent = tally.you.n ? fmt(tally.you) : "— ";
    }

    function reveal() {
      if (!state || state.revealed) return;
      state.revealed = true;
      btnReveal.setAttribute("aria-pressed", "true");
      btnReveal.textContent = "Depth revealed";
      btnReveal.disabled = true;
      picks.forEach(function (b) {
        b.disabled = true;
      });
      animateTo(1);
      scoreRound();
      var ans = state.answer;
      (ans === "A" ? cvA : cvB).parentNode.classList.add("is-answer");
      if (prompt) {
        prompt.classList.add("is-right");
        var youBit = state.you
          ? state.you === ans
            ? " You had it."
            : " Not what the flat view suggested, was it?"
          : "";
        prompt.innerHTML =
          "Depth says: <b>Scene " +
          ans +
          "</b> held the gold orb in front." +
          youBit +
          " The projection-only mind could only guess.";
      }
    }

    picks.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!state || state.revealed) return;
        state.you = btn.getAttribute("data-pick");
        picks.forEach(function (b) {
          b.classList.toggle("is-chosen", b === btn);
        });
      });
    });

    btnReveal.addEventListener("click", reveal);
    btnNext.addEventListener("click", newRound);

    var rt2;
    function resize() {
      boxA = fit(cvA, ctxA);
      boxB = fit(cvB, ctxB);
      draw();
    }
    window.addEventListener("resize", function () {
      clearTimeout(rt2);
      rt2 = setTimeout(resize, 120);
    });

    // init
    boxA = fit(cvA, ctxA);
    boxB = fit(cvB, ctxB);
    newRound();
  })();
})();
