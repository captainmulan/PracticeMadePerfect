/* Minigames for Explore My Body activity pages */
(function (w) {
  function qs(id) { return document.getElementById(id); }

  function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  w.BodyGames = {
    boot: function (gameId, canvasId) {
      var canvas = qs(canvasId);
      if (!canvas) return;
      var map = {
        "heart-beat": startHeartBeat,
        "brain-match": startBrainMatch,
        "bone-stack": startBoneStack,
        "muscle-flex": startMuscleFlex,
        "lung-breath": startLungBreath,
        "stomach-sort": startStomachSort,
        "eye-focus": startEyeFocus,
        "ear-match": startEarMatch
      };
      (map[gameId] || startHeartBeat)(canvas);
    }
  };

  function startHeartBeat(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var score = 0;
    var target = 8;
    var phase = 0;
    var glow = false;
    var running = true;
    var btn = qs("gameStartBtn");
    if (btn) btn.onclick = function () { running = true; score = 0; phase = 0; };

    canvas.onclick = function () {
      if (!running) return;
      if (glow) { score++; glow = false; }
      else score = Math.max(0, score - 1);
      if (score >= target) running = false;
    };

    setInterval(function () {
      phase = (phase + 1) % 60;
      if (phase === 45) glow = true;
      if (phase === 50) glow = false;
    }, 80);

    function loop() {
      ctx.fillStyle = "#1a237e";
      ctx.fillRect(0, 0, w, h);
      var scale = glow ? 1.15 : 1 + 0.05 * Math.sin(Date.now() / 200);
      var cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.22 * scale;
      ctx.fillStyle = glow ? "#ff5252" : "#e53935";
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.3);
      ctx.bezierCurveTo(cx - r, cy - r * 0.5, cx - r * 0.2, cy - r, cx, cy - r * 0.4);
      ctx.bezierCurveTo(cx + r * 0.2, cy - r, cx + r, cy - r * 0.5, cx, cy + r * 0.3);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Comic Sans MS, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(running ? "Tap when the heart GLOWS! " + score + "/" + target : "You win! ❤️", cx, h - 20);
      requestAnimationFrame(loop);
    }
    loop();
  }

  function startBrainMatch(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var icons = ["🧠", "👁️", "👂", "🫀", "🧠", "👁️", "👂", "🫀"];
    var flipped = icons.map(function (_, i) { return { i: i, v: icons[i], open: false, done: false }; });
    var sel = null, matched = 0, moves = 0;

    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    shuffle(flipped);

    canvas.onclick = function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var cols = 4, rows = 2, cw = w / cols, ch = h / rows;
      var col = Math.floor(x / cw), row = Math.floor(y / ch);
      var idx = row * cols + col;
      var card = flipped[idx];
      if (!card || card.done || card.open) return;
      card.open = true;
      if (!sel) sel = card;
      else {
        moves++;
        if (sel.v === card.v) { sel.done = card.done = true; matched += 2; sel = null; }
        else {
          var a = sel, b = card; sel = null;
          setTimeout(function () { a.open = b.open = false; }, 600);
        }
      }
    };

    function loop() {
      ctx.fillStyle = "#311b92";
      ctx.fillRect(0, 0, w, h);
      var cols = 4, rows = 2, cw = w / cols, ch = h / rows;
      flipped.forEach(function (c, i) {
        var col = i % cols, row = Math.floor(i / cols);
        var x = col * cw + 4, y = row * ch + 4;
        ctx.fillStyle = c.done ? "#4caf50" : c.open ? "#7e57c2" : "#4527a0";
        drawRoundRect(ctx, x, y, cw - 8, ch - 8, 8);
        ctx.fill();
        if (c.open || c.done) {
          ctx.font = (ch * 0.4) + "px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(c.v, x + (cw - 8) / 2, y + (ch - 8) / 2 + 10);
        }
      });
      ctx.fillStyle = "#fff";
      ctx.font = "14px Comic Sans MS";
      ctx.textAlign = "center";
      ctx.fillText(matched >= 8 ? "Brain match complete!" : "Match pairs · " + matched + "/8", w / 2, h - 8);
      requestAnimationFrame(loop);
    }
    loop();
  }

  function startBoneStack(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var slots = ["Skull", "Ribs", "Spine", "Femur"];
    var placed = 0;
    var dragging = null, dragY = 0;

    canvas.onmousedown = canvas.ontouchstart = function (e) {
      e.preventDefault();
      var y = (e.touches ? e.touches[0].clientY : e.clientY) - canvas.getBoundingClientRect().top;
      if (y > h * 0.7 && placed < slots.length) dragging = placed;
    };
    canvas.onmouseup = canvas.ontouchend = function (e) {
      if (dragging === null) return;
      var y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - canvas.getBoundingClientRect().top;
      var targetY = h * 0.15 + dragging * (h * 0.12);
      if (Math.abs(y - targetY) < 40) placed = Math.max(placed, dragging + 1);
      dragging = null;
    };

    function loop() {
      ctx.fillStyle = "#37474f";
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 4; i++) {
        ctx.strokeStyle = "#b0bec5";
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.35, h * 0.12 + i * h * 0.12, w * 0.3, h * 0.08);
        ctx.fillStyle = "#eceff1";
        ctx.font = "12px Comic Sans MS";
        ctx.textAlign = "center";
        ctx.fillText(slots[i], w / 2, h * 0.17 + i * h * 0.12);
      }
      if (placed < 4) {
        ctx.fillStyle = "#ffcc80";
        drawRoundRect(ctx, w * 0.2, h * 0.78, w * 0.6, h * 0.12, 8);
        ctx.fill();
        ctx.fillStyle = "#333";
        ctx.fillText("Drag: " + slots[placed], w / 2, h * 0.86);
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillText("Skeleton built!", w / 2, h * 0.86);
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  function startMuscleFlex(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var score = 0, t = 0, gx = w / 2, gy = h / 2;

    setInterval(function () {
      gx = 40 + Math.random() * (w - 80);
      gy = 40 + Math.random() * (h - 80);
      t = 30;
    }, 900);

    canvas.onclick = function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (Math.hypot(x - gx, y - gy) < 45 && t > 0) score++;
    };

    function loop() {
      if (t > 0) t--;
      ctx.fillStyle = "#880e4f";
      ctx.fillRect(0, 0, w, h);
      if (t > 0) {
        ctx.fillStyle = "#ff4081";
        ctx.beginPath();
        ctx.arc(gx, gy, 40, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#fff";
      ctx.font = "16px Comic Sans MS";
      ctx.textAlign = "center";
      ctx.fillText("Tap glowing muscles! Score: " + score, w / 2, h - 16);
      requestAnimationFrame(loop);
    }
    loop();
  }

  function startLungBreath(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var phase = 0, score = 0, inhale = true;

    canvas.onclick = function () {
      var growing = phase < Math.PI;
      if ((inhale && growing) || (!inhale && !growing)) score++;
      inhale = !inhale;
    };

    function loop() {
      phase += 0.02;
      if (phase > Math.PI * 2) phase = 0;
      var r = (Math.sin(phase) * 0.5 + 0.5) * Math.min(w, h) * 0.35 + 20;
      ctx.fillStyle = "#01579b";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fc3f7";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "16px Comic Sans MS";
      ctx.textAlign = "center";
      ctx.fillText(inhale ? "Breathe IN as it grows" : "Breathe OUT as it shrinks", w / 2, h - 20);
      ctx.fillText("Score: " + score, w / 2, 24);
      requestAnimationFrame(loop);
    }
    loop();
  }

  function startStomachSort(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var foods = [{ t: "🍎", good: true }, { t: "🥦", good: true }, { t: "🍟", good: false }, { t: "🥕", good: true }];
    var idx = 0, score = 0;

    canvas.onclick = function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var left = x < w / 2;
      var f = foods[idx % foods.length];
      if ((left && f.good) || (!left && !f.good)) score++;
      idx++;
    };

    function loop() {
      ctx.fillStyle = "#33691e";
      ctx.fillRect(0, 0, w, h);
      var f = foods[idx % foods.length];
      ctx.font = "64px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.t, w / 2, h / 2);
      ctx.font = "14px Comic Sans MS";
      ctx.fillStyle = "#fff";
      ctx.fillText("Tap LEFT = healthy · RIGHT = treat", w / 2, h - 16);
      ctx.fillText("Score: " + score, w / 2, 24);
      requestAnimationFrame(loop);
    }
    loop();
  }

  function startEyeFocus(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var sharp = Math.floor(Math.random() * 3), score = 0, timer = 0;

    canvas.onclick = function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var pick = Math.floor(x / (w / 3));
      if (pick === sharp) score++;
      sharp = Math.floor(Math.random() * 3);
      timer = 0;
    };

    function loop() {
      timer++;
      ctx.fillStyle = "#1a237e";
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 3; i++) {
        var blur = i === sharp ? 0 : 8;
        ctx.filter = "blur(" + blur + "px)";
        ctx.font = "48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(["🌳", "🏠", "🐕"][i], (i + 0.5) * w / 3, h / 2);
      }
      ctx.filter = "none";
      ctx.fillStyle = "#fff";
      ctx.font = "14px Comic Sans MS";
      ctx.fillText("Tap the SHARPEST picture! Score: " + score, w / 2, h - 16);
      requestAnimationFrame(loop);
    }
    loop();
  }

  function startEarMatch(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var sounds = ["🐦", "🚗", "🎹"];
    var target = sounds[Math.floor(Math.random() * sounds.length)];
    var score = 0;

    canvas.onclick = function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var pick = Math.floor(x / (w / 3));
      if (sounds[pick] === target) score++;
      target = sounds[Math.floor(Math.random() * sounds.length)];
    };

    function loop() {
      ctx.fillStyle = "#4a148c";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🔊 Hear: " + target, w / 2, h * 0.35);
      sounds.forEach(function (s, i) {
        ctx.fillText(s, (i + 0.5) * w / 3, h * 0.65);
      });
      ctx.font = "14px Comic Sans MS";
      ctx.fillStyle = "#fff";
      ctx.fillText("Match the sound! Score: " + score, w / 2, h - 16);
      requestAnimationFrame(loop);
    }
    loop();
  }
})(window);
