/* My First 100 Myanmar Words — chapter action mini games (fun-first, not hear-and-pick) */
(function (w) {
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function setupCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    var W = 0;
    var H = 0;
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 20) return;
      var dpr = w.devicePixelRatio || 1;
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      W = canvas.width;
      H = canvas.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    w.addEventListener("resize", resize);
    return {
      ctx: ctx,
      get W() { return canvas.width / (w.devicePixelRatio || 1); },
      get H() { return canvas.height / (w.devicePixelRatio || 1); },
      resize: resize
    };
  }

  function bindKeys(state) {
    function onKey(e) {
      if (!state.running) return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") state.keys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.keys.right = true;
      if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") state.keys.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") state.keys.down = true;
    }
    function offKey(e) {
      if (e.code === "ArrowLeft" || e.code === "KeyA") state.keys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.keys.right = false;
      if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") state.keys.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") state.keys.down = false;
    }
    w.addEventListener("keydown", onKey);
    w.addEventListener("keyup", offKey);
    return function () {
      w.removeEventListener("keydown", onKey);
      w.removeEventListener("keyup", offKey);
    };
  }

  function wireJumpPad(container, state) {
    if (!container) return;
    container.innerHTML =
      '<button type="button" class="action-btn action-btn-jump" data-dir="up">▲ Jump</button>';
    var btn = container.querySelector(".action-btn-jump");
    function down(e) {
      e.preventDefault();
      state.keys.up = true;
      if (state.onJump) state.onJump();
    }
    function up() { state.keys.up = false; }
    btn.addEventListener("touchstart", down, { passive: false });
    btn.addEventListener("mousedown", down);
    btn.addEventListener("touchend", up);
    btn.addEventListener("mouseup", up);
    btn.addEventListener("mouseleave", up);
  }

  function wireTouchPad(container, state) {
    if (!container) return;
    container.innerHTML =
      '<button type="button" class="action-btn" data-dir="left">◀</button>' +
      '<button type="button" class="action-btn action-btn-main" data-dir="up">▲</button>' +
      '<button type="button" class="action-btn" data-dir="right">▶</button>';
    container.querySelectorAll(".action-btn").forEach(function (btn) {
      var dir = btn.getAttribute("data-dir");
      function down(e) {
        e.preventDefault();
        state.keys[dir] = true;
        if (dir === "up" && state.onJump) state.onJump();
      }
      function up() { state.keys[dir] = false; }
      btn.addEventListener("touchstart", down, { passive: false });
      btn.addEventListener("mousedown", down);
      btn.addEventListener("touchend", up);
      btn.addEventListener("mouseup", up);
      btn.addEventListener("mouseleave", up);
    });
  }

  function wireLRPad(container, state) {
    if (!container) return;
    container.innerHTML =
      '<button type="button" class="action-btn action-btn-wide" data-dir="left">◀ Left</button>' +
      '<button type="button" class="action-btn action-btn-wide" data-dir="right">Right ▶</button>';
    container.querySelectorAll(".action-btn").forEach(function (btn) {
      var dir = btn.getAttribute("data-dir");
      function down(e) { e.preventDefault(); state.keys[dir] = true; }
      function up() { state.keys[dir] = false; }
      btn.addEventListener("touchstart", down, { passive: false });
      btn.addEventListener("mousedown", down);
      btn.addEventListener("touchend", up);
      btn.addEventListener("mouseup", up);
      btn.addEventListener("mouseleave", up);
    });
  }

  function wireUDPad(container, state) {
    if (!container) return;
    container.innerHTML =
      '<button type="button" class="action-btn action-btn-wide" data-dir="up">▲ Jump</button>' +
      '<button type="button" class="action-btn action-btn-wide" data-dir="down">▼ Duck</button>';
    container.querySelectorAll(".action-btn").forEach(function (btn) {
      var dir = btn.getAttribute("data-dir");
      function down(e) { e.preventDefault(); state.keys[dir] = true; }
      function up() { state.keys[dir] = false; }
      btn.addEventListener("touchstart", down, { passive: false });
      btn.addEventListener("mousedown", down);
      btn.addEventListener("touchend", up);
      btn.addEventListener("mouseup", up);
      btn.addEventListener("mouseleave", up);
    });
  }

  function showOverlay(id, show) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !show);
  }

  function updateScore(el, score, target) {
    if (el) el.textContent = score + " / " + target;
  }

  function playerEmoji() {
    return (w.MMPlayer && w.MMPlayer.getCharacter()) || "🧒";
  }

  function drawSky(ctx, W, H, top, bottom) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(ctx, W, H, tick) {
    var pts = [[0.08, 0.12], [0.22, 0.08], [0.45, 0.15], [0.68, 0.1], [0.85, 0.18], [0.15, 0.28], [0.55, 0.22], [0.78, 0.26]];
    pts.forEach(function (p, i) {
      var a = 0.35 + 0.35 * Math.sin(tick * 0.04 + i);
      ctx.fillStyle = "rgba(255,248,220," + a + ")";
      ctx.beginPath();
      ctx.arc(p[0] * W, p[1] * H, 1.5 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawMoon(ctx, W) {
    ctx.fillStyle = "rgba(255,245,210,.92)";
    ctx.beginPath();
    ctx.arc(W - 52, 38, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(45,27,78,.85)";
    ctx.beginPath();
    ctx.arc(W - 46, 34, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawVillageBg(ctx, W, H, scroll, groundY, parallax) {
    var rate = parallax == null ? 0.15 : parallax;
    var off = (scroll * rate) % (W + 80);
    for (var i = -1; i < 4; i++) {
      var bx = i * (W * 0.35) - off;
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = "rgba(30,18,12,.55)";
      ctx.fillRect(bx + 10, groundY - 72, 56, 58);
      ctx.fillStyle = "rgba(120,53,15,.7)";
      ctx.beginPath();
      ctx.moveTo(bx + 4, groundY - 72);
      ctx.lineTo(bx + 38, groundY - 96);
      ctx.lineTo(bx + 72, groundY - 72);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,200,80,.55)";
      ctx.fillRect(bx + 26, groundY - 52, 12, 14);
      ctx.fillRect(bx + 44, groundY - 52, 10, 12);
      ctx.globalAlpha = 1;
    }
  }

  function drawGround(ctx, W, H, color, label, accent, scroll) {
    var gy = H - 40;
    var g = ctx.createLinearGradient(0, gy - 8, 0, H);
    g.addColorStop(0, accent || color);
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fillRect(0, gy, W, 3);
    ctx.strokeStyle = "rgba(0,0,0,.08)";
    ctx.lineWidth = 1;
    var dashOff = typeof scroll === "number" ? scroll % 28 : 0;
    for (var i = -1; i <= Math.ceil(W / 28) + 1; i++) {
      var xi = i * 28 - dashOff;
      ctx.beginPath();
      ctx.moveTo(xi, gy + 8);
      ctx.lineTo(xi + 14, gy + 8);
      ctx.stroke();
    }
    if (label) {
      ctx.font = "600 11px Georgia,serif";
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.textAlign = "center";
      ctx.fillText(label, W / 2, H - 12);
    }
    return gy;
  }

  function drawShadow(ctx, x, y, w) {
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.beginPath();
    ctx.ellipse(x, y, w, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEmoji(ctx, emoji, x, y, size) {
    ctx.font = (size || 28) + "px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);
  }

  function drawBrightEmoji(ctx, emoji, x, y, size, ring) {
    var r = size * 0.52;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ring || "#F59E0B";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(251,191,36,.18)";
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, Math.PI * 2);
    ctx.fill();
    drawEmoji(ctx, emoji, x, y, size);
  }

  function drawPickup(ctx, emoji, x, y, tick, seed) {
    var bob = Math.sin(tick * 0.08 + seed) * 3;
    var py = y + bob;
    drawShadow(ctx, x, py + 14, 14);
    ctx.strokeStyle = "rgba(201,162,39,.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, py, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,248,220,.35)";
    ctx.beginPath();
    ctx.arc(x, py, 16, 0, Math.PI * 2);
    ctx.fill();
    drawEmoji(ctx, emoji, x, py, 26);
  }

  function drawBrightPickup(ctx, emoji, x, y, tick, seed, label) {
    var bob = Math.sin(tick * 0.08 + seed) * 4;
    var py = y + bob;
    drawShadow(ctx, x, py + 18, 18);
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.beginPath();
    ctx.arc(x, py, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, py, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(251,191,36,.35)";
    ctx.beginPath();
    ctx.arc(x, py, 30, 0, Math.PI * 2);
    ctx.fill();
    drawEmoji(ctx, emoji, x, py - 1, 34);
    if (label) {
      ctx.font = "bold 10px Georgia,serif";
      ctx.fillStyle = "#1E1B4B";
      ctx.textAlign = "center";
      ctx.fillText(label, x, py + 38);
    }
  }

  function drawPlayer(ctx, x, y, emoji, jumping) {
    drawShadow(ctx, x, y + 16, jumping ? 10 : 14);
    var scale = jumping ? 1.08 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    drawEmoji(ctx, emoji, 0, 0, 30);
    ctx.restore();
  }

  function drawBrightPlayer(ctx, x, y, emoji, jumping, invincible, tick) {
    var blink = invincible > 0 && Math.floor(tick / 5) % 2 === 0;
    drawShadow(ctx, x, y + 18, jumping ? 12 : 16);
    ctx.save();
    if (blink) ctx.globalAlpha = 0.5;
    ctx.translate(x, y);
    if (jumping) ctx.scale(1.06, 1.06);
    drawEmoji(ctx, emoji, 0, 0, 38);
    ctx.restore();
  }

  function drawPuddle(ctx, x, y, w) {
    ctx.fillStyle = "rgba(59,130,246,.55)";
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.ellipse(x - w * 0.15, y - 3, w * 0.18, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRock(ctx, x, y, w) {
    ctx.fillStyle = "#57534E";
    ctx.beginPath();
    ctx.ellipse(x, y - 8, w * 0.45, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#78716C";
    ctx.beginPath();
    ctx.ellipse(x - w * 0.12, y - 12, w * 0.22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🪨", x, y - 10);
  }

  function drawFallenLantern(ctx, x, y) {
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏮", x, y - 6);
    ctx.strokeStyle = "rgba(220,38,38,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 2);
    ctx.lineTo(x + 14, y + 2);
    ctx.stroke();
  }

  function drawFurniture(ctx, x, y, w, h) {
    ctx.fillStyle = "#5C3317";
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = "#78350F";
    ctx.fillRect(x - w / 2 + 3, y - h + 4, w - 6, h * 0.35);
    ctx.fillStyle = "rgba(0,0,0,.12)";
    ctx.fillRect(x - w / 2, y - 4, w, 4);
  }

  function drawDesk(ctx, x, y, w) {
    ctx.fillStyle = "#64748B";
    ctx.fillRect(x - w / 2, y - 24, w, 24);
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(x - w / 2 + 5, y - 20, w - 10, 5);
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - w / 2 + 8, y, 6, 8);
    ctx.fillRect(x + w / 2 - 14, y, 6, 8);
  }

  function drawHudBar(ctx, W, score, target) {
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.fillRect(8, 8, 88, 22);
    ctx.strokeStyle = "rgba(201,162,39,.6)";
    ctx.strokeRect(8.5, 8.5, 87, 21);
    ctx.font = "600 12px Georgia,serif";
    ctx.fillStyle = "#FFF8E7";
    ctx.textAlign = "left";
    ctx.fillText("★ " + score + " / " + target, 16, 23);
  }

  function drawLanternHud(ctx, W, level, maxLevel, lives, goalLabel, timeSec, progress) {
    ctx.fillStyle = "rgba(15,23,42,.62)";
    ctx.fillRect(6, 6, W - 12, 28);
    ctx.strokeStyle = "rgba(251,191,36,.75)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6.5, 6.5, W - 13, 27);
    ctx.font = "600 11px Georgia,serif";
    ctx.fillStyle = "#FFF8E7";
    ctx.textAlign = "left";
    ctx.fillText("Lvl " + level + "/" + maxLevel, 10, 24);
    ctx.textAlign = "center";
    ctx.fillText("⏱ " + Math.max(0, Math.ceil(timeSec)) + "s  ·  " + (goalLabel || "Find family!"), W / 2, 24);
    ctx.textAlign = "right";
    var hearts = "";
    for (var i = 0; i < 3; i++) hearts += i < lives ? "❤️" : "🖤";
    ctx.font = "12px sans-serif";
    ctx.fillText(hearts, W - 10, 24);
    if (typeof progress === "number") {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(6, 36, W - 12, 5);
      ctx.fillStyle = timeSec < 5 ? "#EF4444" : "#22C55E";
      ctx.fillRect(6, 36, (W - 12) * clamp(progress, 0, 1), 5);
    }
  }

  function updateLanternHud(el, level, maxLevel, lives, goal, timeSec) {
    if (!el) return;
    var hearts = "";
    for (var i = 0; i < 3; i++) hearts += i < lives ? "❤️" : "🖤";
    el.textContent = "Level " + level + " / " + maxLevel + "  ⏱ " + Math.max(0, Math.ceil(timeSec)) + "s  " + hearts + (goal ? "  ·  " + goal : "");
  }

  function drawFamilyPortrait(ctx, emoji, x, y, tick, seed, label) {
    var bob = Math.sin(tick * 0.07 + seed) * 5;
    var py = y + bob;
    var tag = (label || "Family").toUpperCase();
    ctx.fillStyle = "#312E81";
    ctx.fillRect(x - 46, py - 62, 92, 22);
    ctx.strokeStyle = "#FBBF24";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 45.5, py - 61.5, 91, 21);
    ctx.font = "bold 11px Georgia,serif";
    ctx.fillStyle = "#FEF3C7";
    ctx.textAlign = "center";
    ctx.fillText(tag, x, py - 47);
    drawShadow(ctx, x, py + 22, 20);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, py, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "rgba(251,191,36,.25)";
    ctx.beginPath();
    ctx.arc(x, py, 38, 0, Math.PI * 2);
    ctx.fill();
    drawEmoji(ctx, emoji, x, py - 2, 44);
  }

  function drawFamilyEnemy(ctx, o, ox, groundY, tick) {
    if (o.remove) return;
    var walk = Math.sin(tick * 0.18 + (o.x || 0) * 0.015) * (o.boss ? 4 : 2.5);
    var hop = Math.abs(Math.sin(tick * 0.22 + (o.x || 0) * 0.02)) * (o.boss ? 5 : 3);
    var size = o.size || (o.boss ? 48 : 40);
    var ey = groundY - 36 - hop;
    var sx = ox + walk;
    if (o.dead && o.dying > 0) {
      ctx.save();
      ctx.globalAlpha = o.dying / 40;
      ctx.font = (size * 0.6) + "px 'Segoe UI Emoji','Apple Color Emoji',sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("💫", sx, ey);
      ctx.restore();
      return;
    }
    ctx.save();
    if (o.flash > 0) {
      ctx.fillStyle = "rgba(251,191,36,.35)";
      ctx.beginPath();
      ctx.arc(sx, ey, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    drawShadow(ctx, sx, groundY - 6, o.boss ? 22 : 14);
    drawEmoji(ctx, o.emoji, sx, ey, size);
    if (o.label) {
      ctx.font = "bold " + (o.boss ? 10 : 9) + "px Georgia,serif";
      ctx.fillStyle = "#FFF8E7";
      ctx.textAlign = "center";
      ctx.fillText(o.label, sx, ey - size * 0.72);
    }
    ctx.restore();
  }

  function drawSkyLanterns(ctx, W, H, lanterns, scroll, tick, parallax) {
    var rate = parallax == null ? 0.08 : parallax;
    lanterns.forEach(function (L) {
      var sx = ((L.x - scroll * rate) % (W + 80)) - 20;
      if (sx < -40 || sx > W + 40) return;
      var sy = L.y + Math.sin(tick * 0.045 + L.seed) * 10;
      var pulse = 0.65 + 0.35 * Math.sin(tick * 0.05 + L.seed);
      ctx.fillStyle = "rgba(255,200,80," + (pulse * 0.35) + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, 26 + L.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(251,191,36," + pulse + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, 14 + L.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,248,220,.75)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 24 - L.size);
      ctx.lineTo(sx, sy - 10);
      ctx.stroke();
      drawEmoji(ctx, "🏮", sx, sy, 22 + L.size * 2);
    });
  }

  function initSkyLanterns(W, H, count) {
    var list = [];
    for (var i = 0; i < count; i++) {
      list.push({
        x: Math.random() * W * 4,
        y: 24 + Math.random() * (H * 0.42),
        seed: Math.random() * 100,
        size: 2 + Math.floor(Math.random() * 4)
      });
    }
    return list;
  }

  /** Thadingyut Lantern Run — 15 timed levels, boss every 4 levels, 3 lives */
  function bootLanternRun(opts, canvas, cv, scoreEl, words, hero, overlayEl) {
    var maxLevel = opts.target || 15;
    var maxLives = 3;
    var JUMP_V = -13;
    var GRAVITY = 0.58;
    var STOMP_BOUNCE = -10.5;
    var familyEnemies = [
      { type: "wolf", emoji: "🐺", label: "Wolf!" },
      { type: "dog", emoji: "🐕", label: "Dog!" },
      { type: "thief", emoji: "🥷", label: "Thief!" }
    ];
    var bossRoster = {
      4: { emoji: "🐺", label: "Alpha Wolf Boss", size: 54 },
      8: { emoji: "🥷", label: "Lantern Thief Boss", size: 52 },
      12: { emoji: "🐕‍🦺", label: "Wild Dog Boss", size: 52 },
      15: { emoji: "👹", label: "Festival Guardian", size: 58 }
    };
    var theme = {
      skyTop: "#312E81", skyBot: "#C084FC", ground: "#6B4423", groundAccent: "#A16207",
      label: "🪔 Thadingyut lane"
    };
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      level: 1,
      lives: maxLives,
      invincible: 0,
      levelBanner: 0,
      px: 70,
      py: 0,
      vy: 0,
      grounded: true,
      scroll: 0,
      levelDist: 0,
      scrollSpeed: 2,
      timeLeft: 0,
      timeTotal: 0,
      obstacles: [],
      boss: null,
      pickup: null,
      skyLanterns: [],
      spawnT: 0,
      raf: null,
      lastTs: 0,
      onJump: null,
      isBossLevel: false
    };
    state.onJump = function () {
      if (state.grounded && state.running) {
        state.vy = JUMP_V;
        state.grounded = false;
      }
    };
    wireJumpPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    var portraitEmoji = {
      Mother: "👩‍🦰",
      Father: "👨‍🦱",
      Grandmother: "👵",
      Grandfather: "👴",
      Sister: "👧",
      Brother: "👦",
      Baby: "👶",
      Family: "👨‍👩‍👧‍👦",
      Aunt: "👩‍🦱",
      Uncle: "👨‍🦰",
      Cousin: "🧒",
      Parents: "👨‍👩‍👧"
    };

    function levelWord() {
      if (!words.length) return { emoji: "👨‍👩‍👧‍👦", en: "Family" };
      var w = words[(state.level - 1) % words.length];
      return { emoji: portraitEmoji[w.en] || w.emoji || "👨‍👩‍👧", en: w.en || "Family" };
    }

    function goalLabel() {
      return "Reach " + (levelWord().en || "family") + "!";
    }

    function syncHud() {
      updateLanternHud(scoreEl, state.level, maxLevel, state.lives, goalLabel(), state.timeLeft / 60);
    }

    function isBossLevel(level) {
      return level % 4 === 0 || level === maxLevel;
    }

    function levelConfig(level, W) {
      W = W || 760;
      var bossLevel = isBossLevel(level);
      var enemyCount = 10;
      var gap = 170 + level * 7;
      var startX = 520 + W * 1.15;
      var scrollSpeed = 1.75 + level * 0.2;
      var timeSec = 70 + level * 6 + (bossLevel ? 25 : 0);
      var obstacles = [];
      var x = startX;
      for (var i = 0; i < enemyCount; i++) {
        var e = familyEnemies[i % familyEnemies.length];
        obstacles.push({
          x: x, w: 44, type: e.type, emoji: e.emoji, label: e.label,
          boss: false, stompHp: 1, dead: false, dying: 0, flash: 0, remove: false
        });
        x += gap;
      }
      var dist = x + 220;
      var boss = null;
      if (bossLevel && bossRoster[level]) {
        var b = bossRoster[level];
        boss = {
          x: dist - 520,
          emoji: b.emoji,
          label: b.label,
          size: b.size,
          boss: true,
          patrolT: 0
        };
        obstacles.push({
          x: dist - 360,
          w: 70,
          type: "boss",
          emoji: b.emoji,
          label: b.label,
          size: b.size,
          boss: true,
          stompHp: 2,
          dead: false,
          dying: 0,
          flash: 0,
          remove: false
        });
        obstacles.push({
          x: dist - 180,
          w: 70,
          type: "boss",
          emoji: b.emoji,
          label: b.label,
          size: b.size,
          boss: true,
          stompHp: 2,
          dead: false,
          dying: 0,
          flash: 0,
          remove: false
        });
        dist += 120;
      }
      return {
        dist: dist,
        timeSec: timeSec,
        scrollSpeed: scrollSpeed,
        obstacles: obstacles,
        boss: boss,
        pickupX: dist - 120
      };
    }

    function startLevel() {
      cv.resize();
      var cfg = levelConfig(state.level, cv.W);
      state.scroll = 0;
      state.levelDist = cfg.dist;
      state.scrollSpeed = cfg.scrollSpeed;
      state.timeTotal = cfg.timeSec * 60;
      state.timeLeft = cfg.timeSec * 60;
      state.obstacles = cfg.obstacles.slice();
      state.boss = cfg.boss;
      state.isBossLevel = isBossLevel(state.level);
      state.skyLanterns = initSkyLanterns(cv.W, cv.H, 12 + state.level);
      var w = levelWord();
      state.pickup = {
        x: cfg.pickupX,
        emoji: w.emoji || "👨‍👩‍👧",
        label: w.en || "Family",
        got: false
      };
      state.spawnT = 0;
      state.levelBanner = 50;
      state.px = 70;
      state.py = cv.H - 72;
      state.vy = 0;
      state.grounded = true;
      state.lastTs = 0;
      syncHud();
    }

    function reset(full) {
      state.level = 1;
      state.lives = maxLives;
      state.invincible = 0;
      startLevel();
      if (full && overlayEl) {
        var msg = overlayEl.querySelector("p");
        if (msg) {
          msg.textContent = "Tap Start — jump ON enemies to stomp them Mario-style! Only the lane speed changes each level — your jump stays quick. 15 levels, boss fights every 4 levels. 3 lives.";
        }
      }
    }

    function gameOver(msg) {
      state.running = false;
      if (state.raf) cancelAnimationFrame(state.raf);
      showOverlay("action-start-overlay", true);
      var btn = document.getElementById("action-start-btn");
      if (btn) btn.textContent = "▶ Try again";
      if (overlayEl) {
        var p = overlayEl.querySelector("p");
        if (p) p.textContent = msg;
      }
    }

    function hurtPlayer() {
      if (state.invincible > 0) return;
      state.lives--;
      state.invincible = 90;
      state.vy = -9;
      state.grounded = false;
      syncHud();
      if (state.lives <= 0) {
        gameOver("Out of lives! Stomp enemies from above or dodge from the side. Try all " + maxLevel + " levels again!");
      } else {
        startLevel();
      }
    }

    function timeExpired() {
      state.lives--;
      syncHud();
      if (state.lives <= 0) {
        gameOver("Time ran out! Reach each family member before the timer hits zero.");
      } else {
        startLevel();
      }
    }

    function advanceLevel() {
      if (state.level >= maxLevel) {
        endGame(state, opts.badge);
        return;
      }
      state.level++;
      startLevel();
    }

    function enemyOx(o) {
      var ox = o.x - state.scroll;
      if (state.boss && o.boss) {
        ox += Math.sin(state.boss.patrolT * 0.09 + o.x * 0.01) * 42;
      }
      return ox;
    }

    function enemyHeadTop(o, groundY) {
      var hop = Math.abs(Math.sin(state.spawnT * 0.2 + (o.x || 0) * 0.02)) * (o.boss ? 6 : 4);
      var size = o.size || (o.boss ? 50 : 36);
      return groundY - 34 - hop - size * 0.52;
    }

    function stompEnemy(o) {
      o.stompHp = (o.stompHp || 1) - 1;
      state.vy = STOMP_BOUNCE;
      state.grounded = false;
      state.invincible = 26;
      if (o.stompHp <= 0) {
        o.dead = true;
        o.dying = 42;
      } else {
        o.flash = 20;
      }
    }

    function resolveEnemyCollision(o, ox, groundY) {
      if (o.dead || o.remove) return;
      var halfW = o.boss ? 34 : 26;
      if (Math.abs(ox - state.px) > halfW) return;
      var headTop = enemyHeadTop(o, groundY);
      var bodyCenter = groundY - 34;
      var playerBottom = state.py + 20;
      var playerTop = state.py - 22;

      if (state.vy > 1 && playerBottom >= headTop - 4 && playerTop < bodyCenter) {
        stompEnemy(o);
        return;
      }

      if (state.invincible > 0) return;
      if (playerBottom >= groundY - 34 && state.py >= groundY - 50 && playerTop < headTop + 18) {
        hurtPlayer();
      }
    }

    function start() {
      cv.resize();
      reset(true);
      showOverlay("action-start-overlay", false);
      var btn = document.getElementById("action-start-btn");
      if (btn) btn.textContent = "▶ Start game";
      state.running = true;
      state.lastTs = 0;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;
      var groundY = H - 40;
      var now = performance.now();
      if (!state.lastTs) state.lastTs = now;
      var dt = clamp((now - state.lastTs) / 16.667, 0.65, 2.2);
      state.lastTs = now;

      if (state.invincible > 0) state.invincible -= dt;
      if (state.levelBanner > 0) state.levelBanner -= dt;
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        timeExpired();
        if (!state.running) return;
      }

      if (state.keys.up && state.grounded) state.onJump();
      state.vy += GRAVITY * dt;
      state.py += state.vy * dt;
      if (state.py >= groundY - 32) {
        state.py = groundY - 32;
        state.vy = 0;
        state.grounded = true;
      } else {
        state.grounded = false;
      }

      state.scroll += state.scrollSpeed * dt;
      state.spawnT += dt;

      if (state.boss) {
        state.boss.patrolT += dt;
      }

      state.obstacles.forEach(function (o) {
        resolveEnemyCollision(o, enemyOx(o), groundY);
      });

      if (state.pickup && !state.pickup.got) {
        var px = state.pickup.x - state.scroll;
        if (px > 38 && px < 102) {
          state.pickup.got = true;
          advanceLevel();
          if (!state.running) return;
        }
      }

      drawSky(ctx, W, H, theme.skyTop, theme.skyBot);
      drawStars(ctx, W, H, state.spawnT);
      drawMoon(ctx, W);
      drawSkyLanterns(ctx, W, H, state.skyLanterns, state.scroll, state.spawnT, 0.32);
      drawVillageBg(ctx, W, H, state.scroll, groundY, 0.38);
      drawGround(ctx, W, H, theme.ground, theme.label, theme.groundAccent, state.scroll);

      state.obstacles.forEach(function (o) {
        var ox = enemyOx(o);
        if (ox < -80 || ox > W + 80) return;
        drawFamilyEnemy(ctx, o, ox, groundY, state.spawnT);
      });

      if (state.pickup && !state.pickup.got) {
        var sx = state.pickup.x - state.scroll;
        if (sx > -60 && sx < W + 60) {
          drawFamilyPortrait(ctx, state.pickup.emoji, sx, groundY - 58, state.spawnT, state.pickup.x, state.pickup.label);
        }
      }

      drawBrightPlayer(ctx, state.px, state.py, hero, !state.grounded, state.invincible, state.spawnT);
      var progress = state.timeLeft / state.timeTotal;
      drawLanternHud(ctx, W, state.level, maxLevel, state.lives, goalLabel(), state.timeLeft / 60, progress);

      if (state.levelBanner > 0) {
        ctx.fillStyle = state.isBossLevel ? "rgba(127,29,29,.82)" : "rgba(49,46,129,.78)";
        ctx.fillRect(W * 0.06, H * 0.28, W * 0.88, state.isBossLevel ? 54 : 46);
        ctx.strokeStyle = state.isBossLevel ? "#FCA5A5" : "#FBBF24";
        ctx.lineWidth = 2;
        ctx.strokeRect(W * 0.06 + 1, H * 0.28 + 1, W * 0.88 - 2, (state.isBossLevel ? 54 : 46) - 2);
        ctx.font = "bold 17px Georgia,serif";
        ctx.fillStyle = "#FFF8E7";
        ctx.textAlign = "center";
        if (state.isBossLevel) {
          ctx.fillText("⚔️ BOSS — Level " + state.level + " · " + goalLabel(), W / 2, H * 0.28 + 22);
          ctx.font = "12px Georgia,serif";
          ctx.fillText("Stomp the boss twice from above — then reach family!", W / 2, H * 0.28 + 42);
        } else {
          ctx.fillText("Level " + state.level + " · " + goalLabel(), W / 2, H * 0.28 + 22);
          ctx.font = "12px Georgia,serif";
          ctx.fillText("Jump ON enemies to stomp them — lane speed rises, your jump stays the same!", W / 2, H * 0.28 + 40);
        }
      }

      state.obstacles.forEach(function (o) {
        if (o.flash > 0) o.flash -= dt;
        if (o.dead && o.dying > 0) o.dying -= dt;
        if (o.dead && o.dying <= 0) o.remove = true;
      });
      state.obstacles = state.obstacles.filter(function (o) { return !o.remove; });
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  function endGame(state, badge) {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    showOverlay("action-start-overlay", true);
    var btn = document.getElementById("action-start-btn");
    if (btn) btn.textContent = "▶ Play again";
    if (w.MMGame && w.MMGame.showBadgeWin) {
      w.MMGame.showBadgeWin(badge);
    } else if (w.MMPlayer) {
      w.MMPlayer.earnBadge(badge);
      alert("🏆 You earned: " + badge + "!");
    }
  }

  /** Side-scrolling runner — Family (Lantern Run) / Home / School */
  function bootRunner(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var words = opts.words || [];
    var hero = playerEmoji();
    var overlayEl = document.getElementById("action-start-overlay");

    if (opts.variant === "family") {
      bootLanternRun(opts, canvas, cv, scoreEl, words, hero, overlayEl);
      return;
    }

    var target = opts.target || 8;
    var themes = {
      home: {
        skyTop: "#FDF8F0", skyBot: "#E8DCC8", ground: "#A68B5B", groundAccent: "#C4A574",
        obs: "furniture", label: "🏠 Home runner", village: false
      },
      school: {
        skyTop: "#DBEAFE", skyBot: "#93C5FD", ground: "#64748B", groundAccent: "#94A3B8",
        obs: "desk", label: "🏫 Bell rush", village: false
      }
    };
    var theme = themes[opts.variant] || themes.home;
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      px: 70,
      py: 0,
      vy: 0,
      grounded: true,
      scroll: 0,
      obstacles: [],
      pickups: [],
      spawnT: 0,
      raf: null,
      onJump: null
    };
    state.onJump = function () {
      if (state.grounded && state.running) {
        state.vy = -11;
        state.grounded = false;
      }
    };
    wireJumpPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function reset() {
      state.score = 0;
      state.scroll = 0;
      state.obstacles = [];
      state.pickups = [];
      state.spawnT = 0;
      state.px = 70;
      state.vy = 0;
      state.grounded = true;
      updateScore(scoreEl, 0, target);
    }

    function spawnClassic() {
      var x = cv.W + state.scroll + 40;
      if (Math.random() < 0.55) {
        var w = rand(words);
        state.pickups.push({ x: x, emoji: w.emoji || "⭐", word: w, got: false });
      } else {
        state.obstacles.push({ x: x, w: 36 + Math.random() * 24, type: theme.obs });
      }
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;
      var groundY = H - 40;

      if (state.keys.up && state.grounded) state.onJump();
      state.vy += 0.55;
      state.py += state.vy;
      if (state.py >= groundY - 32) {
        state.py = groundY - 32;
        state.vy = 0;
        state.grounded = true;
      } else {
        state.grounded = false;
      }

      state.scroll += 3.2;
      state.spawnT++;
      if (state.spawnT % 55 === 0) spawnClassic();

      state.obstacles = state.obstacles.filter(function (o) { return o.x > state.scroll - 80; });
      state.pickups = state.pickups.filter(function (p) { return p.x > state.scroll - 80 && !p.got; });

      state.obstacles.forEach(function (o) {
        var ox = o.x - state.scroll;
        if (ox > 30 && ox < 90 && state.grounded) {
          state.vy = -9;
          state.grounded = false;
        }
      });

      state.pickups.forEach(function (p) {
        var px = p.x - state.scroll;
        if (!p.got && px > 40 && px < 100) {
          p.got = true;
          state.score++;
          updateScore(scoreEl, state.score, target);
          if (state.score >= target) endGame(state, opts.badge);
        }
      });

      drawSky(ctx, W, H, theme.skyTop, theme.skyBot);
      drawGround(ctx, W, H, theme.ground, theme.label, theme.groundAccent);

      state.obstacles.forEach(function (o) {
        var ox = o.x - state.scroll;
        if (o.type === "furniture") drawFurniture(ctx, ox, groundY, o.w, 34);
        else drawDesk(ctx, ox, groundY, o.w);
      });

      state.pickups.forEach(function (p) {
        if (p.got) return;
        drawPickup(ctx, p.emoji, p.x - state.scroll, groundY - 48, state.spawnT, p.x);
      });

      drawPlayer(ctx, state.px, state.py, hero, !state.grounded);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  /** Food — catch falling tea items */
  function bootTeaDash(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var words = opts.words || [];
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      trayX: 0,
      items: [],
      tick: 0,
      raf: null
    };
    wireLRPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function reset() {
      state.score = 0;
      state.trayX = cv.W / 2;
      state.items = [];
      state.tick = 0;
      updateScore(scoreEl, 0, target);
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;
      var trayW = 70;
      if (state.keys.left) state.trayX -= 5;
      if (state.keys.right) state.trayX += 5;
      state.trayX = clamp(state.trayX, trayW / 2, W - trayW / 2);

      state.tick++;
      if (state.tick % 45 === 0) {
        var w = rand(words);
        state.items.push({ x: 30 + Math.random() * (W - 60), y: -20, word: w, emoji: w.emoji || "🍵", vy: 2 + Math.random() * 1.5 });
      }

      state.items = state.items.filter(function (it) {
        it.y += it.vy;
        if (it.y > H - 50 && it.y < H - 20 && Math.abs(it.x - state.trayX) < trayW / 2 + 10) {
          state.score++;
          updateScore(scoreEl, state.score, target);
          if (state.score >= target) endGame(state, opts.badge);
          return false;
        }
        return it.y < H + 20;
      });

      drawSky(ctx, W, H, "#FEF3C7", "#FDE68A");
      ctx.fillStyle = "rgba(120,53,15,.15)";
      for (var row = 0; row < 4; row++) {
        ctx.fillRect(0, 30 + row * 28, W, 2);
      }
      ctx.font = "20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("🫖", 12, 36);
      ctx.textAlign = "right";
      ctx.fillText("🍵", W - 12, 36);
      drawGround(ctx, W, H, "#78350F", "☕ Tea shop dash", "#92400E");

      state.items.forEach(function (it) {
        drawPickup(ctx, it.emoji, it.x, it.y, state.tick, it.x);
      });

      drawShadow(ctx, state.trayX, H - 46, 36);
      var tg = ctx.createLinearGradient(state.trayX - trayW / 2, H - 58, state.trayX + trayW / 2, H - 44);
      tg.addColorStop(0, "#A16207");
      tg.addColorStop(1, "#78350F");
      ctx.fillStyle = tg;
      ctx.fillRect(state.trayX - trayW / 2, H - 56, trayW, 14);
      ctx.strokeStyle = "rgba(201,162,39,.7)";
      ctx.strokeRect(state.trayX - trayW / 2 + 0.5, H - 55.5, trayW - 1, 13);
      drawEmoji(ctx, "🍽️", state.trayX, H - 62, 22);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  /** Animals — platform hop */
  function bootJungleHop(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var words = opts.words || [];
    var hero = playerEmoji();
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      px: 60,
      py: 0,
      vy: 0,
      camX: 0,
      platforms: [],
      raf: null,
      onJump: null
    };
    state.onJump = function () {
      if (state.grounded && state.running) {
        state.vy = -10;
        state.grounded = false;
      }
    };
    wireTouchPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function buildPlatforms() {
      state.platforms = [];
      var x = 0;
      for (var i = 0; i < 18; i++) {
        var w = rand(words);
        state.platforms.push({
          x: x,
          y: cv.H - 50 - (i % 3) * 38,
          w: 70 + Math.random() * 40,
          emoji: i % 2 === 0 ? (w.emoji || "🐘") : null,
          word: w,
          got: false
        });
        x += 85 + Math.random() * 35;
      }
    }

    function reset() {
      state.score = 0;
      state.px = 60;
      state.py = cv.H - 80;
      state.vy = 0;
      state.camX = 0;
      state.grounded = false;
      buildPlatforms();
      updateScore(scoreEl, 0, target);
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function onPlatform(px, py) {
      for (var i = 0; i < state.platforms.length; i++) {
        var p = state.platforms[i];
        if (px > p.x - state.camX && px < p.x - state.camX + p.w && Math.abs(py - p.y) < 18 && state.vy >= 0) {
          return p;
        }
      }
      return null;
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;

      if (state.keys.left) state.px -= 4;
      if (state.keys.right) state.px += 4;
      if (state.keys.up && state.grounded) state.onJump();
      state.vy += 0.45;
      state.py += state.vy;

      var plat = onPlatform(state.px, state.py);
      if (plat) {
        state.py = plat.y;
        state.vy = 0;
        state.grounded = true;
        if (plat.emoji && !plat.got) {
          plat.got = true;
          state.score++;
          updateScore(scoreEl, state.score, target);
          if (state.score >= target) endGame(state, opts.badge);
        }
      } else {
        state.grounded = false;
      }

      if (state.px > W * 0.55) {
        var dx = state.px - W * 0.45;
        state.camX += dx;
        state.px = W * 0.45;
      }

      if (state.py > H + 30) reset();

      ctx.fillStyle = "#14532D";
      ctx.fillRect(0, 0, W, H);
      drawSky(ctx, W, H, "#134E4A", "#166534");
      for (var t = 0; t < 6; t++) {
        ctx.fillStyle = "rgba(0,0,0,.12)";
        ctx.fillRect(t * (W / 5) - (state.camX * 0.05) % 40, H - 120, 14, 80);
        ctx.fillStyle = "rgba(21,128,61,.45)";
        ctx.beginPath();
        ctx.arc(t * (W / 5) + 8 - (state.camX * 0.05) % 40, H - 118, 28, 0, Math.PI * 2);
        ctx.fill();
      }
      drawGround(ctx, W, H, "#166534", "🌴 Jungle hop", "#15803D");

      state.platforms.forEach(function (p) {
        var sx = p.x - state.camX;
        if (sx < -80 || sx > W + 80) return;
        ctx.fillStyle = "#854D0E";
        ctx.fillRect(sx, p.y, p.w, 12);
        ctx.fillStyle = "rgba(34,197,94,.5)";
        ctx.fillRect(sx + 2, p.y - 4, p.w - 4, 6);
        if (p.emoji && !p.got) {
          drawPickup(ctx, p.emoji, sx + p.w / 2, p.y - 18, state.camX, p.x);
        }
      });

      drawPlayer(ctx, state.px, state.py - 4, hero, !state.grounded);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  /** Colors — rainbow river bridge climb */
  function bootRainbowClimb(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var hero = playerEmoji();
    var colors = ["#DC2626", "#2563EB", "#CA8A04", "#16A34A", "#9333EA", "#EA580C", "#0891B2", "#BE185D"];
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      px: 0,
      py: 0,
      vy: 0,
      camY: 0,
      steps: [],
      raf: null
    };
    wireLRPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function buildSteps() {
      state.steps = [];
      var y = cv.H - 30;
      for (var i = 0; i < target + 4; i++) {
        state.steps.push({
          x: 40 + Math.random() * (cv.W - 120),
          y: y,
          w: 64,
          color: colors[i % colors.length],
          reached: i < 1
        });
        y -= 42 + Math.random() * 12;
      }
    }

    function reset() {
      state.score = 0;
      state.px = cv.W / 2;
      state.py = cv.H - 60;
      state.vy = 0;
      state.camY = 0;
      buildSteps();
      updateScore(scoreEl, 0, target);
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;

      if (state.keys.left) state.px -= 4.5;
      if (state.keys.right) state.px += 4.5;
      state.px = clamp(state.px, 16, W - 16);
      state.vy += 0.42;
      state.py += state.vy;

      var landed = null;
      state.steps.forEach(function (s, idx) {
        var sy = s.y + state.camY;
        if (state.vy >= 0 && state.py >= sy - 8 && state.py <= sy + 12 &&
            state.px >= s.x && state.px <= s.x + s.w) {
          state.py = sy;
          state.vy = 0;
          landed = s;
          if (!s.reached) {
            s.reached = true;
            state.score++;
            updateScore(scoreEl, state.score, target);
            if (state.score >= target) endGame(state, opts.badge);
          }
        }
      });

      if (!landed && state.py > H + 20) reset();

      if (landed && state.steps.indexOf(landed) >= 2) {
        var topIdx = state.steps.indexOf(landed);
        var ty = landed.y + state.camY;
        if (ty < H * 0.45) state.camY += (H * 0.45 - ty) * 0.08;
      }

      drawSky(ctx, W, H, "#BAE6FD", "#38BDF8");
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.fillRect(0, H - 32, W, 32);
      ctx.fillStyle = "rgba(56,189,248,.45)";
      ctx.fillRect(0, H - 22, W, 14);
      ctx.font = "11px Georgia,serif";
      ctx.fillStyle = "#0C4A6E";
      ctx.textAlign = "center";
      ctx.fillText("🌈 Rainbow bridge climb", W / 2, H - 8);

      state.steps.forEach(function (s) {
        var sy = s.y + state.camY;
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, sy, s.w, 14);
        ctx.fillStyle = "rgba(255,255,255,.4)";
        ctx.fillRect(s.x + 4, sy + 2, s.w - 8, 4);
        ctx.strokeStyle = "rgba(0,0,0,.12)";
        ctx.strokeRect(s.x + 0.5, sy + 0.5, s.w - 1, 13);
      });

      drawPlayer(ctx, state.px, state.py - 6, hero, !landed);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  /** Numbers — tap when stall count matches */
  function bootMarketSprint(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      scroll: 0,
      stalls: [],
      want: 3,
      raf: null,
      tick: 0
    };

    function reset() {
      state.score = 0;
      state.scroll = 0;
      state.stalls = [];
      state.want = 2 + Math.floor(Math.random() * 4);
      state.tick = 0;
      updateScore(scoreEl, 0, target);
    }

    function spawnStall() {
      var count = 1 + Math.floor(Math.random() * 5);
      state.stalls.push({ x: cv.W + state.scroll + 20, count: count, hit: false });
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function hit() {
      if (!state.running) return;
      var best = null;
      var bestD = 999;
      state.stalls.forEach(function (s) {
        var sx = s.x - state.scroll;
        if (s.hit) return;
        var d = Math.abs(sx - cv.W / 2);
        if (d < 70 && d < bestD) {
          bestD = d;
          best = s;
        }
      });
      if (best && best.count === state.want) {
        best.hit = true;
        state.score++;
        updateScore(scoreEl, state.score, target);
        state.want = 2 + Math.floor(Math.random() * 4);
        if (state.score >= target) endGame(state, opts.badge);
      }
    }

    var ctrl = document.getElementById(opts.controlsId || "action-controls");
    if (ctrl) {
      ctrl.innerHTML = '<button type="button" class="action-btn action-btn-hit" id="action-hit-btn">✋ Hit stall!</button>';
      document.getElementById("action-hit-btn").onclick = hit;
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;
      state.scroll += 2.5;
      state.tick++;
      if (state.tick % 70 === 0) spawnStall();
      state.stalls = state.stalls.filter(function (s) { return s.x > state.scroll - 100; });

      drawSky(ctx, W, H, "#FEF9C3", "#FDE68A");
      drawGround(ctx, W, H, "#D97706", "🔢 Market sprint", "#EA580C");

      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 20px Georgia,serif";
      ctx.textAlign = "center";
      ctx.fillText("Find " + state.want + " 🥭", W / 2, 32);

      ctx.strokeStyle = "rgba(220,38,38,.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 40);
      ctx.lineTo(W / 2, H - 36);
      ctx.stroke();

      state.stalls.forEach(function (s) {
        var sx = s.x - state.scroll;
        ctx.fillStyle = s.hit ? "#86EFAC" : "#FDE68A";
        ctx.fillRect(sx - 40, H - 100, 80, 64);
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        var em = "";
        for (var i = 0; i < s.count; i++) em += "🥭";
        ctx.fillText(em, sx, H - 62);
      });

      drawPlayer(ctx, W / 2 - 10, H - 58, playerEmoji(), false);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  /** Body — duck and jump */
  function bootObstacleCourse(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var hero = playerEmoji();
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      py: 0,
      duck: false,
      scroll: 0,
      obs: [],
      raf: null,
      tick: 0
    };
    wireUDPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function reset() {
      state.score = 0;
      state.scroll = 0;
      state.obs = [];
      state.tick = 0;
      state.duck = false;
      updateScore(scoreEl, 0, target);
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;
      var groundY = H - 36;
      state.duck = state.keys.down;
      state.py = state.duck ? groundY - 18 : groundY - 32;
      state.scroll += 3;
      state.tick++;
      if (state.tick % 50 === 0) {
        state.obs.push({ x: W + state.scroll, kind: Math.random() < 0.5 ? "low" : "high" });
      }

      state.obs = state.obs.filter(function (o) {
        var ox = o.x - state.scroll;
        if (ox > 50 && ox < 90) {
          if (o.kind === "low" && !state.keys.up && !state.duck) return false;
          if (o.kind === "high" && !state.duck) return false;
        }
        if (ox > 50 && ox < 90 && ((o.kind === "low" && state.keys.up) || (o.kind === "high" && state.duck))) {
          state.score++;
          updateScore(scoreEl, state.score, target);
          if (state.score >= target) endGame(state, opts.badge);
          return false;
        }
        return ox > -40;
      });

      ctx.fillStyle = "#E0E7FF";
      ctx.fillRect(0, 0, W, H);
      drawGround(ctx, W, H, "#6366F1", "🤸 Obstacle course");

      state.obs.forEach(function (o) {
        var ox = o.x - state.scroll;
        if (o.kind === "low") {
          ctx.fillStyle = "#DC2626";
          ctx.fillRect(ox - 20, groundY - 22, 40, 22);
        } else {
          ctx.fillStyle = "#F59E0B";
          ctx.fillRect(ox - 25, groundY - 70, 50, 12);
        }
      });

      drawPlayer(ctx, 70, state.py + (state.duck ? 8 : 16), hero, state.keys.up && !state.duck);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  /** Feelings — land on happy platforms */
  function bootMoodHop(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var moods = [
      { face: "😊", good: true },
      { face: "😢", good: false },
      { face: "😠", good: false }
    ];
    var hero = playerEmoji();
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      px: 60,
      py: 0,
      vy: 0,
      camX: 0,
      plats: [],
      raf: null,
      onJump: null
    };
    state.onJump = function () {
      if (state.grounded && state.running) {
        state.vy = -10;
        state.grounded = false;
      }
    };
    wireTouchPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function build() {
      state.plats = [];
      var x = 0;
      for (var i = 0; i < 20; i++) {
        var m = rand(moods);
        state.plats.push({ x: x, y: cv.H - 48 - (i % 4) * 32, w: 72, mood: m });
        x += 80 + Math.random() * 30;
      }
    }

    function reset() {
      state.score = 0;
      state.px = 60;
      state.py = cv.H - 80;
      state.vy = 0;
      state.camX = 0;
      build();
      updateScore(scoreEl, 0, target);
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;

      if (state.keys.left) state.px -= 4;
      if (state.keys.right) state.px += 4;
      if (state.keys.up && state.grounded) state.onJump();
      state.vy += 0.45;
      state.py += state.vy;

      var landed = null;
      state.plats.forEach(function (p) {
        var sx = p.x - state.camX;
        if (state.vy >= 0 && state.py >= p.y - 8 && state.py <= p.y + 10 && state.px >= sx && state.px <= sx + p.w) {
          if (!p.mood.good) {
            reset();
            return;
          }
          state.py = p.y;
          state.vy = 0;
          state.grounded = true;
          landed = p;
        }
      });
      if (!landed) state.grounded = false;
      if (landed && !landed.done) {
        landed.done = true;
        state.score++;
        updateScore(scoreEl, state.score, target);
        if (state.score >= target) endGame(state, opts.badge);
      }

      if (state.px > W * 0.55) {
        state.camX += state.px - W * 0.45;
        state.px = W * 0.45;
      }
      if (state.py > H + 30) reset();

      ctx.fillStyle = "#FDF4FF";
      ctx.fillRect(0, 0, W, H);
      drawGround(ctx, W, H, "#C084FC", "😊 Stay kind — hop happy!");

      state.plats.forEach(function (p) {
        var sx = p.x - state.camX;
        ctx.fillStyle = p.mood.good ? "#86EFAC" : "#FCA5A5";
        ctx.fillRect(sx, p.y, p.w, 10);
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.mood.face, sx + p.w / 2, p.y - 6);
      });

      drawPlayer(ctx, state.px, state.py - 4, hero, !state.grounded);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  function wireWalkPad(container, state) {
    if (!container) return;
    container.innerHTML =
      '<button type="button" class="action-btn action-btn-wide" data-dir="left">◀ Left</button>' +
      '<button type="button" class="action-btn action-btn-wide" data-dir="right">Right ▶</button>' +
      '<button type="button" class="action-btn action-btn-wide" data-dir="up">▲ Up</button>' +
      '<button type="button" class="action-btn action-btn-wide" data-dir="down">▼ Down</button>';
    container.querySelectorAll(".action-btn").forEach(function (btn) {
      var dir = btn.getAttribute("data-dir");
      function down(e) { e.preventDefault(); state.keys[dir] = true; }
      function up() { state.keys[dir] = false; }
      btn.addEventListener("touchstart", down, { passive: false });
      btn.addEventListener("mousedown", down);
      btn.addEventListener("touchend", up);
      btn.addEventListener("mouseup", up);
      btn.addEventListener("mouseleave", up);
    });
  }

  function dist(ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /** End book — walk the finished village, deliver festival gifts */
  function bootFestivalParade(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var hero = playerEmoji();
    var overlayEl = document.getElementById("action-start-overlay");
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      px: 0,
      py: 0,
      score: 0,
      carrying: false,
      targetHouse: -1,
      houses: [],
      lanterns: [],
      hazards: [],
      villagers: [],
      fireworks: [],
      tick: 0,
      stun: 0,
      finale: false,
      finaleT: 0,
      raf: null
    };
    wireWalkPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function layoutVillage(W, H) {
      state.houses = [
        { x: W * 0.18, y: H * 0.28, lit: false, glow: 0 },
        { x: W * 0.42, y: H * 0.2, lit: false, glow: 0 },
        { x: W * 0.68, y: H * 0.26, lit: false, glow: 0 },
        { x: W * 0.82, y: H * 0.44, lit: false, glow: 0 },
        { x: W * 0.62, y: H * 0.58, lit: false, glow: 0 },
        { x: W * 0.28, y: H * 0.52, lit: false, glow: 0 }
      ];
      state.lanterns = [];
      state.hazards = [
        { x: W * 0.35, y: H * 0.42, type: "puddle", r: 22 },
        { x: W * 0.55, y: H * 0.48, type: "puddle", r: 20 },
        { x: W * 0.48, y: H * 0.62, type: "dog", r: 18, vx: 0.8, vy: -0.4 },
        { x: W * 0.72, y: H * 0.38, type: "dog", r: 18, vx: -0.6, vy: 0.5 }
      ];
      state.villagers = [];
      state.fireworks = [];
      state.px = W * 0.5;
      state.py = H * 0.72;
    }

    function pickTargetHouse() {
      var open = [];
      state.houses.forEach(function (h, i) {
        if (!h.lit) open.push(i);
      });
      if (!open.length) {
        state.houses.forEach(function (h, i) {
          if (i !== state.targetHouse) open.push(i);
        });
      }
      state.targetHouse = open.length ? rand(open) : 0;
    }

    function spawnLantern() {
      var W = cv.W;
      var H = cv.H;
      var tries = 0;
      while (tries++ < 12) {
        var lx = 40 + Math.random() * (W - 80);
        var ly = H * 0.32 + Math.random() * (H * 0.38);
        var ok = true;
        state.houses.forEach(function (h) {
          if (dist(lx, ly, h.x, h.y) < 50) ok = false;
        });
        if (ok) {
          state.lanterns.push({ x: lx, y: ly, bob: Math.random() * 6 });
          return;
        }
      }
    }

    function syncHud() {
      if (!scoreEl) return;
      var msg = "Gifts delivered: " + state.score + " / " + target;
      if (state.carrying) msg += "  ·  🎁 Find the glowing house!";
      else msg += "  ·  Collect 🏮 lanterns";
      scoreEl.textContent = msg;
    }

    function reset(full) {
      cv.resize();
      layoutVillage(cv.W, cv.H);
      state.score = 0;
      state.carrying = false;
      state.targetHouse = -1;
      state.tick = 0;
      state.stun = 0;
      state.finale = false;
      state.finaleT = 0;
      spawnLantern();
      spawnLantern();
      syncHud();
      if (full && overlayEl) {
        var msg = overlayEl.querySelector("p");
        if (msg) {
          msg.textContent = "The village you built is complete! Walk around, collect lanterns, avoid puddles and playful dogs, and deliver gifts to every house.";
        }
      }
    }

    function bumpHazard() {
      if (state.stun > 0 || state.finale) return;
      state.stun = 45;
      state.carrying = false;
      state.targetHouse = -1;
      syncHud();
    }

    function addVillager() {
      var W = cv.W;
      var H = cv.H;
      var faces = ["🧒", "👧", "👩", "👨", "👵", "👴", "🧍", "🧍‍♀️"];
      state.villagers.push({
        x: 30 + Math.random() * (W - 60),
        y: H * 0.34 + Math.random() * (H * 0.36),
        emoji: rand(faces),
        wave: Math.random() * Math.PI * 2
      });
    }

    function spawnFirework() {
      var W = cv.W;
      state.fireworks.push({
        x: 20 + Math.random() * (W - 40),
        y: 20 + Math.random() * (cv.H * 0.35),
        c: rand(["#FDE68A", "#F472B6", "#38BDF8", "#A78BFA", "#4ADE80"]),
        life: 40 + Math.random() * 30,
        r: 2 + Math.random() * 3
      });
    }

    function startFinale() {
      state.finale = true;
      state.finaleT = 0;
      state.carrying = false;
      state.houses.forEach(function (h) {
        h.lit = true;
        h.glow = 1;
      });
      while (state.villagers.length < 10) addVillager();
    }

    function start() {
      reset(false);
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;
      state.tick++;
      if (state.stun > 0) state.stun--;

      if (!state.finale) {
        var speed = state.stun > 0 ? 1.6 : 3.2;
        if (state.keys.left) state.px -= speed;
        if (state.keys.right) state.px += speed;
        if (state.keys.up) state.py -= speed;
        if (state.keys.down) state.py += speed;
        state.px = clamp(state.px, 24, W - 24);
        state.py = clamp(state.py, H * 0.24, H - 28);

        state.hazards.forEach(function (z) {
          if (z.type === "dog") {
            z.x += z.vx;
            z.y += z.vy;
            if (z.x < 30 || z.x > W - 30) z.vx *= -1;
            if (z.y < H * 0.3 || z.y > H * 0.68) z.vy *= -1;
          }
          if (dist(state.px, state.py, z.x, z.y) < z.r + 14) bumpHazard();
        });

        state.lanterns = state.lanterns.filter(function (L) {
          L.bob += 0.08;
          if (!state.carrying && dist(state.px, state.py, L.x, L.y) < 26) {
            state.carrying = true;
            pickTargetHouse();
            syncHud();
            if (state.lanterns.length < 2) spawnLantern();
            return false;
          }
          return true;
        });

        if (state.carrying && state.targetHouse >= 0) {
          var th = state.houses[state.targetHouse];
          if (th && dist(state.px, state.py, th.x, th.y) < 44) {
            state.carrying = false;
            state.score++;
            th.lit = true;
            th.glow = 1;
            addVillager();
            if (state.villagers.length < 12) addVillager();
            syncHud();
            spawnLantern();
            if (state.score >= target) {
              startFinale();
            } else {
              pickTargetHouse();
            }
          }
        }

        if (state.tick % 70 === 0 && state.lanterns.length < 3) spawnLantern();
        if (state.tick % Math.max(18, 40 - state.score * 2) === 0) spawnFirework();
      } else {
        state.finaleT++;
        if (state.finaleT % 8 === 0) spawnFirework();
        if (state.finaleT > 180) {
          endGame(state, opts.badge || "Festival Fan");
          return;
        }
      }

      var sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#1e1b4b");
      sky.addColorStop(0.45, "#312e81");
      sky.addColorStop(1, "#4ade80");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      drawStars(ctx, W, H, state.tick);
      state.fireworks.forEach(function (f) {
        f.life--;
        ctx.globalAlpha = clamp(f.life / 40, 0, 1);
        ctx.fillStyle = f.c;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r + (40 - f.life) * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      state.fireworks = state.fireworks.filter(function (f) { return f.life > 0; });

      ctx.fillStyle = "rgba(34,197,94,.55)";
      ctx.fillRect(0, H * 0.22, W, H * 0.78);
      ctx.fillStyle = "rgba(180,83,9,.35)";
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.55, W * 0.42, H * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      state.houses.forEach(function (h, i) {
        var glow = h.glow || (state.targetHouse === i && state.carrying ? 0.6 + Math.sin(state.tick * 0.12) * 0.3 : 0);
        if (glow > 0) {
          ctx.fillStyle = "rgba(251,191,36," + (0.25 + glow * 0.35) + ")";
          ctx.beginPath();
          ctx.arc(h.x, h.y, 38, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(h.lit ? "🏠" : "🛖", h.x, h.y);
        if (h.lit || glow > 0.4) {
          ctx.font = "14px sans-serif";
          ctx.fillText("🏮", h.x + 14, h.y - 18);
        }
        if (state.carrying && state.targetHouse === i) {
          ctx.font = "20px sans-serif";
          ctx.fillText("🎁", h.x, h.y - 32);
        }
      });

      state.lanterns.forEach(function (L) {
        var bob = Math.sin(L.bob) * 4;
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🏮", L.x, L.y + bob);
      });

      state.hazards.forEach(function (z) {
        ctx.font = z.type === "dog" ? "24px sans-serif" : "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(z.type === "dog" ? "🐕" : "💧", z.x, z.y);
      });

      state.villagers.forEach(function (v) {
        var wobble = state.finale ? Math.sin(state.tick * 0.2 + v.wave) * 6 : Math.sin(state.tick * 0.08 + v.wave) * 2;
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(v.emoji, v.x, v.y + wobble);
        if (state.finale && state.finaleT > 20) {
          ctx.font = "16px sans-serif";
          ctx.fillText("👋", v.x + 12, v.y - 16 + wobble);
        }
      });

      if (state.carrying) {
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎁", state.px, state.py - 28);
      }
      drawPlayer(ctx, state.px, state.py, hero, false);
      drawHudBar(ctx, W, state.score, target);

      if (state.finale) {
        ctx.fillStyle = "rgba(49,46,129,.72)";
        ctx.fillRect(W * 0.06, H * 0.08, W * 0.88, 52);
        ctx.strokeStyle = "#FBBF24";
        ctx.lineWidth = 2;
        ctx.strokeRect(W * 0.06 + 1, H * 0.08 + 1, W * 0.88 - 2, 50);
        ctx.font = "bold 15px Georgia,serif";
        ctx.fillStyle = "#FFF8E7";
        ctx.textAlign = "center";
        ctx.fillText("🎆 The whole village lights up — everyone waves!", W / 2, H * 0.08 + 22);
        ctx.font = "12px Georgia,serif";
        ctx.fillText("Thank you for finishing My First 100 Myanmar Words!", W / 2, H * 0.08 + 42);
      } else {
        ctx.font = "600 11px Georgia,serif";
        ctx.fillStyle = "rgba(255,248,231,.92)";
        ctx.textAlign = "center";
        ctx.fillText("🎆 Myanmar Festival Parade — walk, collect, deliver!", W / 2, H - 10);
      }
    }

    reset(true);
    document.getElementById("action-start-btn").onclick = start;
  }

  /** Festivals — dodge sparks, collect lanterns */
  function bootFireworksDodge(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var target = opts.target || 8;
    var hero = playerEmoji();
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      px: 0,
      hazards: [],
      lanterns: [],
      tick: 0,
      raf: null
    };
    wireLRPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function reset() {
      state.score = 0;
      state.px = cv.W / 2;
      state.hazards = [];
      state.lanterns = [];
      state.tick = 0;
      updateScore(scoreEl, 0, target);
    }

    function start() {
      cv.resize();
      reset();
      showOverlay("action-start-overlay", false);
      state.running = true;
      loop();
    }

    function loop() {
      if (!state.running) return;
      state.raf = requestAnimationFrame(loop);
      var ctx = cv.ctx;
      var W = cv.W;
      var H = cv.H;

      if (state.keys.left) state.px -= 5;
      if (state.keys.right) state.px += 5;
      state.px = clamp(state.px, 20, W - 20);
      state.tick++;

      if (state.tick % 35 === 0) {
        state.lanterns.push({ x: 20 + Math.random() * (W - 40), y: -10, vy: 2.2 });
      }
      if (state.tick % 28 === 0) {
        state.hazards.push({ x: 20 + Math.random() * (W - 40), y: -10, vy: 3.5 });
      }

      state.lanterns = state.lanterns.filter(function (L) {
        L.y += L.vy;
        if (L.y > H - 55 && Math.abs(L.x - state.px) < 28) {
          state.score++;
          updateScore(scoreEl, state.score, target);
          if (state.score >= target) endGame(state, opts.badge);
          return false;
        }
        return L.y < H + 10;
      });

      state.hazards = state.hazards.filter(function (z) {
        z.y += z.vy;
        if (z.y > H - 55 && Math.abs(z.x - state.px) < 22) {
          reset();
          return false;
        }
        return z.y < H + 10;
      });

      var grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(1, "#312e81");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.font = "11px Georgia,serif";
      ctx.fillStyle = "#FDE68A";
      ctx.textAlign = "center";
      ctx.fillText("🎆 Collect lanterns — dodge sparks!", W / 2, 18);

      state.lanterns.forEach(function (L) {
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🏮", L.x, L.y);
      });
      state.hazards.forEach(function (z) {
        ctx.font = "18px sans-serif";
        ctx.fillText("✨", z.x, z.y);
      });

      drawPlayer(ctx, state.px, H - 48, hero, false);
      drawHudBar(ctx, W, state.score, target);
    }

    document.getElementById("action-start-btn").onclick = start;
  }

  var BOOTERS = {
    "lantern-run": function (o) { o.variant = "family"; bootRunner(o); },
    "room-runner": function (o) { o.variant = "home"; bootRunner(o); },
    "bell-rush": function (o) { o.variant = "school"; bootRunner(o); },
    "tea-dash": bootTeaDash,
    "jungle-hop": bootJungleHop,
    "rainbow-climb": bootRainbowClimb,
    "market-sprint": bootMarketSprint,
    "obstacle-course": bootObstacleCourse,
    "mood-hop": bootMoodHop,
    "fireworks-dodge": bootFireworksDodge,
    "festival-parade": bootFestivalParade
  };

  w.MMGame = w.MMGame || {};
  w.MMGame.bootActionGame = function (opts) {
    opts = opts || {};
    var fn = BOOTERS[opts.gameType];
    if (!fn) {
      console.warn("Unknown game type:", opts.gameType);
      return;
    }
    fn(opts);
  };

  w.MMGame.showBadgeWin = function (badge) {
    if (!w.MMPlayer) return;
    var isNew = w.MMPlayer.earnBadge(badge);
    var modal = document.createElement("div");
    modal.className = "badge-modal";
    modal.innerHTML =
      '<div class="badge-modal-backdrop"></div>' +
      '<div class="badge-modal-box">' +
      '<button type="button" class="badge-modal-x" aria-label="Close">×</button>' +
      "<h3>" + (isNew ? "🏆 You earned: " + badge + "!" : "🏆 " + badge + " — great job!") + "</h3>" +
      "<p>Book game complete!</p>" +
      '<button type="button" class="dismiss-btn">OK</button></div>';
    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector(".badge-modal-backdrop").onclick = close;
    modal.querySelector(".badge-modal-x").onclick = close;
    modal.querySelector(".dismiss-btn").onclick = close;
  };
})(window);
