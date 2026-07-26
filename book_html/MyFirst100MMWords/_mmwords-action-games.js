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

  function drawVillageBg(ctx, W, H, scroll, groundY) {
    var off = (scroll * 0.15) % (W + 80);
    for (var i = -1; i < 4; i++) {
      var bx = i * (W * 0.35) - off;
      ctx.fillStyle = "rgba(30,18,12,.55)";
      ctx.fillRect(bx + 10, groundY - 58, 56, 58);
      ctx.fillStyle = "rgba(120,53,15,.7)";
      ctx.beginPath();
      ctx.moveTo(bx + 4, groundY - 58);
      ctx.lineTo(bx + 38, groundY - 82);
      ctx.lineTo(bx + 72, groundY - 58);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,200,80,.75)";
      ctx.fillRect(bx + 26, groundY - 38, 12, 14);
      ctx.fillRect(bx + 44, groundY - 38, 10, 12);
    }
    for (var j = 0; j < 5; j++) {
      var lx = ((j * 97 + scroll * 0.08) % (W + 40)) - 20;
      ctx.font = "16px sans-serif";
      ctx.fillText("🏮", lx, groundY - 72 - (j % 2) * 12);
    }
  }

  function drawGround(ctx, W, H, color, label, accent) {
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
    for (var i = 0; i < W; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, gy + 8);
      ctx.lineTo(i + 14, gy + 8);
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
    ctx.font = (size || 28) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);
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
    var blink = invincible > 0 && Math.floor(tick / 6) % 2 === 0;
    if (blink) return;
    drawShadow(ctx, x, y + 18, jumping ? 12 : 16);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.stroke();
    var scale = jumping ? 1.1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    drawEmoji(ctx, emoji, 0, 0, 34);
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

  function drawLanternHud(ctx, W, level, maxLevel, lives, goalLabel) {
    ctx.fillStyle = "rgba(15,23,42,.55)";
    ctx.fillRect(6, 6, W - 12, 28);
    ctx.strokeStyle = "rgba(251,191,36,.75)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6.5, 6.5, W - 13, 27);
    ctx.font = "600 12px Georgia,serif";
    ctx.fillStyle = "#FFF8E7";
    ctx.textAlign = "left";
    ctx.fillText("Lvl " + level + " / " + maxLevel, 14, 24);
    ctx.textAlign = "center";
    ctx.fillText(goalLabel || "Find family!", W / 2, 24);
    ctx.textAlign = "right";
    var hearts = "";
    for (var i = 0; i < 3; i++) hearts += i < lives ? "❤️" : "🖤";
    ctx.font = "13px sans-serif";
    ctx.fillText(hearts, W - 14, 24);
  }

  function updateLanternHud(el, level, maxLevel, lives, goal) {
    if (!el) return;
    var hearts = "";
    for (var i = 0; i < 3; i++) hearts += i < lives ? "❤️" : "🖤";
    el.textContent = "Level " + level + " / " + maxLevel + "  " + hearts + (goal ? "  ·  " + goal : "");
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

  /** Side-scrolling runner — Family (10 levels + lives) / Home / School */
  function bootRunner(opts) {
    var canvas = document.getElementById(opts.canvasId || "action-canvas");
    if (!canvas) return;
    var cv = setupCanvas(canvas);
    var scoreEl = document.getElementById(opts.scoreId || "action-score");
    var words = opts.words || [];
    var hero = playerEmoji();
    var isLanternRun = opts.variant === "family";
    var maxLevel = isLanternRun ? 10 : 1;
    var target = isLanternRun ? maxLevel : (opts.target || 8);
    var maxLives = 3;
    var themes = {
      family: {
        skyTop: "#312E81", skyBot: "#C084FC", ground: "#6B4423", groundAccent: "#A16207",
        obs: "puddle", label: "🪔 Thadingyut lane", village: true, bright: true
      },
      home: {
        skyTop: "#FDF8F0", skyBot: "#E8DCC8", ground: "#A68B5B", groundAccent: "#C4A574",
        obs: "furniture", label: "🏠 Home runner", village: false, bright: false
      },
      school: {
        skyTop: "#DBEAFE", skyBot: "#93C5FD", ground: "#64748B", groundAccent: "#94A3B8",
        obs: "desk", label: "🏫 Bell rush", village: false, bright: false
      }
    };
    var theme = themes[opts.variant] || themes.family;
    var familyObsTypes = ["puddle", "rock", "lantern"];
    var overlayEl = document.getElementById("action-start-overlay");
    var state = {
      running: false,
      keys: { left: false, right: false, up: false, down: false },
      score: 0,
      level: 1,
      lives: maxLives,
      invincible: 0,
      levelBanner: 0,
      px: 70,
      py: 0,
      vy: 0,
      grounded: true,
      scroll: 0,
      obstacles: [],
      pickups: [],
      spawnT: 0,
      needPickup: false,
      raf: null,
      onJump: null
    };
    state.onJump = function () {
      if (state.grounded && state.running) {
        state.vy = isLanternRun ? -12 : -11;
        state.grounded = false;
      }
    };
    wireJumpPad(document.getElementById(opts.controlsId || "action-controls"), state);
    bindKeys(state);

    function levelWord() {
      if (!words.length) return { emoji: "👨‍👩‍👧", en: "Family" };
      return words[(state.level - 1) % words.length];
    }

    function goalLabel() {
      var w = levelWord();
      return isLanternRun ? "Find " + (w.en || "family") + "!" : "";
    }

    function syncHud() {
      if (isLanternRun) updateLanternHud(scoreEl, state.level, maxLevel, state.lives, goalLabel());
      else updateScore(scoreEl, state.score, target);
    }

    function reset(full) {
      state.score = 0;
      state.level = 1;
      state.lives = maxLives;
      state.invincible = 0;
      state.levelBanner = 90;
      state.scroll = 0;
      state.obstacles = [];
      state.pickups = [];
      state.spawnT = 0;
      state.needPickup = false;
      state.px = 70;
      state.vy = 0;
      state.grounded = true;
      syncHud();
      if (full && overlayEl) {
        var msg = overlayEl.querySelector("p");
        if (msg) msg.textContent = "Tap Start — tap Jump to leap over obstacles! 10 levels, 3 lives.";
      }
    }

    function spawnFamilyPickup() {
      if (state.needPickup || state.pickups.length) return;
      var w = levelWord();
      state.pickups.push({
        x: state.scroll + cv.W + 120,
        emoji: w.emoji || "👨‍👩‍👧",
        word: w,
        label: w.en || "",
        required: true,
        got: false
      });
      state.needPickup = true;
    }

    function spawnFamilyObstacle() {
      var x = cv.W + state.scroll + 50 + Math.random() * 80;
      var type = rand(familyObsTypes);
      state.obstacles.push({
        x: x,
        w: 32 + Math.random() * 28,
        type: type
      });
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

    function advanceLevel() {
      if (state.level >= maxLevel) {
        endGame(state, opts.badge);
        return;
      }
      state.level++;
      state.levelBanner = 90;
      state.scroll = 0;
      state.obstacles = [];
      state.pickups = [];
      state.needPickup = false;
      state.spawnT = 0;
      syncHud();
    }

    function hurtPlayer() {
      if (state.invincible > 0) return;
      state.lives--;
      state.invincible = 100;
      state.vy = -8;
      state.grounded = false;
      syncHud();
      if (state.lives <= 0) {
        state.running = false;
        if (state.raf) cancelAnimationFrame(state.raf);
        showOverlay("action-start-overlay", true);
        var btn = document.getElementById("action-start-btn");
        if (btn) btn.textContent = "▶ Try again";
        if (overlayEl) {
          var msg = overlayEl.querySelector("p");
          if (msg) msg.textContent = "Out of lives! Jump over puddles and lanterns. Try all 10 levels again!";
        }
      }
    }

    function playerHitsObstacle(ox, groundY) {
      if (ox < 42 || ox > 108) return false;
      if (state.py < groundY - 46) return false;
      if (!state.grounded && state.vy < -1.5) return false;
      return state.py >= groundY - 34;
    }

    function drawFamilyObstacle(ctx, o, ox, groundY) {
      if (o.type === "puddle") drawPuddle(ctx, ox, groundY - 4, o.w);
      else if (o.type === "rock") drawRock(ctx, ox, groundY, o.w);
      else drawFallenLantern(ctx, ox, groundY - 2);
    }

    function start() {
      cv.resize();
      reset(true);
      showOverlay("action-start-overlay", false);
      var btn = document.getElementById("action-start-btn");
      if (btn) btn.textContent = "▶ Start game";
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

      if (state.invincible > 0) state.invincible--;
      if (state.levelBanner > 0) state.levelBanner--;

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

      var speed = isLanternRun ? 2.8 + state.level * 0.35 : 3.2;
      state.scroll += speed;
      state.spawnT++;

      if (isLanternRun) {
        if (state.spawnT === 30) spawnFamilyPickup();
        var obsEvery = Math.max(28, 62 - state.level * 3);
        if (state.spawnT > 40 && state.spawnT % obsEvery === 0) spawnFamilyObstacle();
      } else if (state.spawnT % 55 === 0) {
        spawnClassic();
      }

      state.obstacles = state.obstacles.filter(function (o) { return o.x > state.scroll - 80; });
      state.pickups = state.pickups.filter(function (p) { return p.x > state.scroll - 80 && !p.got; });

      if (isLanternRun) {
        state.obstacles.forEach(function (o) {
          var ox = o.x - state.scroll;
          if (playerHitsObstacle(ox, groundY)) hurtPlayer();
        });
      } else {
        state.obstacles.forEach(function (o) {
          var ox = o.x - state.scroll;
          if (ox > 30 && ox < 90 && state.grounded) {
            state.vy = -9;
            state.grounded = false;
          }
        });
      }

      state.pickups.forEach(function (p) {
        var px = p.x - state.scroll;
        if (!p.got && px > 40 && px < 100) {
          p.got = true;
          if (isLanternRun) {
            state.needPickup = false;
            advanceLevel();
          } else {
            state.score++;
            syncHud();
            if (state.score >= target) endGame(state, opts.badge);
          }
        }
      });

      drawSky(ctx, W, H, theme.skyTop, theme.skyBot);
      if (theme.village) {
        drawStars(ctx, W, H, state.spawnT);
        drawMoon(ctx, W);
        drawVillageBg(ctx, W, H, state.scroll, groundY);
      }
      drawGround(ctx, W, H, theme.ground, theme.label, theme.groundAccent);

      state.obstacles.forEach(function (o) {
        var ox = o.x - state.scroll;
        if (isLanternRun) drawFamilyObstacle(ctx, o, ox, groundY);
        else if (o.type === "puddle") drawPuddle(ctx, ox, groundY - 4, o.w);
        else if (o.type === "furniture") drawFurniture(ctx, ox, groundY, o.w, 34);
        else drawDesk(ctx, ox, groundY, o.w);
      });

      state.pickups.forEach(function (p) {
        if (p.got) return;
        var sx = p.x - state.scroll;
        if (isLanternRun) drawBrightPickup(ctx, p.emoji, sx, groundY - 52, state.spawnT, p.x, p.label);
        else drawPickup(ctx, p.emoji, sx, groundY - 48, state.spawnT, p.x);
      });

      if (isLanternRun) {
        drawBrightPlayer(ctx, state.px, state.py, hero, !state.grounded, state.invincible, state.spawnT);
        drawLanternHud(ctx, W, state.level, maxLevel, state.lives, goalLabel());
        if (state.levelBanner > 0) {
          ctx.fillStyle = "rgba(49,46,129,.72)";
          ctx.fillRect(W * 0.12, H * 0.34, W * 0.76, 42);
          ctx.strokeStyle = "#FBBF24";
          ctx.lineWidth = 2;
          ctx.strokeRect(W * 0.12 + 1, H * 0.34 + 1, W * 0.76 - 2, 40);
          ctx.font = "bold 18px Georgia,serif";
          ctx.fillStyle = "#FFF8E7";
          ctx.textAlign = "center";
          ctx.fillText("Level " + state.level + " — " + goalLabel(), W / 2, H * 0.34 + 27);
        }
      } else {
        drawPlayer(ctx, state.px, state.py, hero, !state.grounded);
        drawHudBar(ctx, W, state.score, target);
      }
    }

    var startBtn = document.getElementById("action-start-btn");
    if (startBtn) startBtn.onclick = start;
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
    "fireworks-dodge": bootFireworksDodge
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
      "<p>Mini game complete!</p>" +
      '<button type="button" class="dismiss-btn">OK</button></div>';
    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector(".badge-modal-backdrop").onclick = close;
    modal.querySelector(".badge-modal-x").onclick = close;
    modal.querySelector(".dismiss-btn").onclick = close;
  };
})(window);
