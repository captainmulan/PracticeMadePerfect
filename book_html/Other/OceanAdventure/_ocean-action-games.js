/**
 * Ocean Adventure — 3 quality action games (mid-book + outro).
 * Intro aquarium stays in 004-Intro-MyAquarium.html.
 */
(function (w) {
  "use strict";

  var FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  var FACE = /🐠|🐟|🐡|🦈|🐙|🦑|🐢|🐬|🐳|🦭|🐋|🦐|🤿|🧜/;

  function $(id) { return document.getElementById(id); }

  function injectStyles() {
    if ($("ocean-action-game-styles")) return;
    var s = document.createElement("style");
    s.id = "ocean-action-game-styles";
    s.textContent =
      "html:has(body.ocean-book-game),html:has(body.ocean-book-game){height:100%!important;overflow:hidden!important;}" +
      "body.ocean-book-game{overflow:hidden!important;height:100%!important;min-height:100%!important;margin:0;}" +
      "body.ocean-book-game .game-shell{max-width:980px;margin:0 auto;padding:8px 10px;display:flex;flex-direction:column;height:100%;min-height:0;}" +
      "body.ocean-book-game .stage-wrap{flex:1 1 auto;min-height:0;display:flex;}" +
      "body.ocean-book-game .action-stage{position:relative;flex:1 1 auto;min-height:min(52vh,420px);border:2px solid rgba(100,255,218,.45);border-radius:16px;overflow:hidden;background:#062035;touch-action:none;}" +
      "body.ocean-book-game .action-stage canvas{display:block;width:100%;height:100%;}" +
      "body.ocean-book-game .action-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(4,20,36,.92);text-align:center;padding:18px;z-index:5;}" +
      "body.ocean-book-game .action-overlay h3{color:#64ffda;font-size:22px;margin-bottom:8px;}" +
      "body.ocean-book-game .action-overlay p{color:#cce7ff;font-size:14px;line-height:1.55;margin-bottom:14px;max-width:360px;}" +
      "body.ocean-book-game .game-start-btn{padding:11px 24px;border:none;border-radius:12px;background:linear-gradient(135deg,#64ffda,#00bcd4);color:#062035;font-size:15px;font-weight:bold;cursor:pointer;}" +
      "body.ocean-book-game .action-controls{display:flex;gap:10px;justify-content:center;margin-top:8px;flex-shrink:0;}" +
      "body.ocean-book-game .action-btn{min-width:72px;padding:14px 18px;border-radius:12px;border:2px solid rgba(100,255,218,.4);background:rgba(100,255,218,.12);font-size:22px;cursor:pointer;touch-action:manipulation;}" +
      "body.ocean-book-game .game-meta{text-align:center;color:#80deea;font-size:14px;font-weight:bold;margin:6px 0;}" +
      "body.ocean-book-game .badge-box{text-align:center;margin-top:8px;padding:10px;border-radius:12px;background:rgba(255,235,59,.12);color:#ffeb3b;font-size:13px;}" +
      "@media(orientation:landscape){body.ocean-book-game .game-shell{max-width:none;padding:6px 12px;}" +
      "body.ocean-book-game .action-stage{min-height:0!important;max-height:none!important;}" +
      "body.ocean-book-game .page-head{margin-bottom:4px!important;}" +
      "body.ocean-book-game .page-head h1{font-size:20px!important;}" +
      "body.ocean-book-game .page-head .lead{font-size:12px!important;}}" +
      "@media(max-width:639px){body.ocean-book-game .action-stage{min-height:min(46vh,380px);}}";
    document.head.appendChild(s);
  }

  function fitFrame() {
    if (!document.body.classList.contains("ocean-book-game")) return;
    var h = window.innerHeight + "px";
    document.documentElement.style.height = h;
    document.body.style.height = h;
    var shell = document.querySelector(".game-shell");
    if (shell) shell.style.minHeight = h;
  }

  function drawEmoji(ctx, emoji, x, y, size, flip) {
    ctx.save();
    ctx.font = "bold " + size + "px " + FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    if (flip && FACE.test(emoji)) {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.fillText(emoji, 0, 0);
    } else ctx.fillText(emoji, x, y);
    ctx.restore();
  }

  function drawOceanBg(ctx, W, H, top, bot) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top || "#0a3050");
    g.addColorStop(1, bot || "#041525");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < 16; i++) {
      ctx.fillStyle = "rgba(255,255,255," + (0.05 + (i % 3) * 0.04) + ")";
      ctx.beginPath();
      ctx.arc((i * 97) % W, (i * 61 + Date.now() * 0.02) % H, 1.2 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ── Zone Dive (mid-book): stomp-style lane runner through ocean zones ── */
  function bootZoneDive(opts) {
    injectStyles();
    var canvas = $(opts.canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var scoreEl = $(opts.scoreId);
    var controlsEl = $(opts.controlsId);
    var overlay = $(opts.startOverlayId || "action-start-overlay");
    var startBtn = $(opts.startBtnId || "action-start-btn");
    var W = 0, H = 0, dpr = 1;
    var running = false, animId = null, timerId = null;
    var level = 1, maxLevel = opts.levels || 12;
    var lives = 3, timeLeft = 70, score = 0;
    var player = { x: 80, y: 0, vy: 0, w: 28, h: 28, grounded: false, icon: "🤿" };
    var enemies = [], stars = [], scrollX = 0, levelLen = 2400;
    var zones = ["☀️", "🌅", "🌙", "🕳️", "⛰️"];
    var keys = { jump: false, left: false, right: false };

    if (controlsEl && !controlsEl._bound) {
      controlsEl._bound = true;
      controlsEl.innerHTML =
        '<button type="button" class="action-btn" id="zd-left">⬅️</button>' +
        '<button type="button" class="action-btn" id="zd-jump">⬆️</button>' +
        '<button type="button" class="action-btn" id="zd-right">➡️</button>';
      ["zd-left", "zd-right", "zd-jump"].forEach(function (id) {
        var el = $(id);
        if (!el) return;
        var key = id === "zd-left" ? "left" : id === "zd-right" ? "right" : "jump";
        el.addEventListener("touchstart", function (e) { e.preventDefault(); keys[key] = true; });
        el.addEventListener("touchend", function () { keys[key] = false; });
        el.addEventListener("mousedown", function () { keys[key] = true; });
        el.addEventListener("mouseup", function () { keys[key] = false; });
      });
    }

    function resize() {
      var stage = canvas.parentElement;
      var rect = stage.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) return false;
      dpr = Math.min(w.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = rect.width;
      H = rect.height;
      player.y = H - 56;
      return true;
    }

    function hud() {
      if (!scoreEl) return;
      scoreEl.textContent = "Level " + level + " / " + maxLevel + "  ⭐ " + score + "  ⏱ " + timeLeft + "s  " + "❤️".repeat(Math.max(0, lives));
    }

    function spawnLevel() {
      enemies = [];
      stars = [];
      scrollX = 0;
      levelLen = 1800 + level * 120;
      var count = 8 + Math.min(level, 6);
      for (var i = 0; i < count; i++) {
        enemies.push({
          x: 320 + i * (levelLen / count) + Math.random() * 40,
          y: H - 56,
          icon: ["🦈", "🪼", "🛢️", "🗑️"][i % 4],
          w: 30,
          dead: false,
        });
      }
      for (var j = 0; j < 10 + level; j++) {
        stars.push({
          x: 260 + j * (levelLen / (10 + level)),
          y: H - 90 - (j % 3) * 36,
          icon: zones[j % zones.length],
          got: false,
        });
      }
    }

    function endGame(won) {
      running = false;
      clearInterval(timerId);
      cancelAnimationFrame(animId);
      if (overlay) {
        overlay.style.display = "flex";
        overlay.querySelector("h3").textContent = won ? "🏆 " + (opts.badge || "Zone Dive Hero") + "!" : "💫 Try again!";
        overlay.querySelector("p").textContent = won
          ? "You cleared all " + maxLevel + " depth levels!"
          : "Score: " + score + " — reach level " + maxLevel + " to win.";
        startBtn.textContent = "🔄 Play Again";
      }
    }

    function loop() {
      if (!running) return;
      animId = requestAnimationFrame(loop);
      if (!W || !H) return;

      var ground = H - 40;
      player.vy += 0.55;
      if (keys.jump && player.grounded) { player.vy = -11; player.grounded = false; }
      player.y += player.vy;
      if (player.y >= ground - player.h) { player.y = ground - player.h; player.vy = 0; player.grounded = true; }
      if (keys.left) player.x = Math.max(40, player.x - 5);
      if (keys.right) player.x = Math.min(W - 40, player.x + 5);

      scrollX += 2.2 + level * 0.15;
      if (scrollX >= levelLen) {
        level++;
        if (level > maxLevel) { endGame(true); return; }
        spawnLevel();
      }

      enemies.forEach(function (e) {
        if (e.dead) return;
        var ex = e.x - scrollX;
        if (ex < -40 || ex > W + 40) return;
        if (Math.abs(player.x - ex) < 26 && Math.abs(player.y + player.h - e.y) < 22) {
          if (player.vy > 0 && player.y + player.h < e.y + 4) {
            e.dead = true;
            player.vy = -8;
            score += 12;
          } else {
            lives--;
            player.x = 60;
            scrollX = Math.max(0, scrollX - 80);
            if (lives <= 0) endGame(false);
          }
        }
      });

      stars.forEach(function (s) {
        if (s.got) return;
        var sx = s.x - scrollX;
        if (Math.hypot(player.x - sx, player.y - s.y) < 28) {
          s.got = true;
          score += 8;
        }
      });

      var zi = Math.min(zones.length - 1, Math.floor((level - 1) / 3));
      drawOceanBg(ctx, W, H, ["#1565c0", "#1a4480", "#051525", "#040810", "#020208"][zi], ["#0288d1", "#051525", "#020810", "#000008", "#000004"][zi]);
      ctx.fillStyle = "rgba(40,60,70,0.85)";
      ctx.fillRect(0, ground, W, H - ground);
      ctx.fillStyle = "rgba(100,255,218,0.35)";
      ctx.font = "600 11px system-ui,sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(zones[zi] + " zone", 12, 22);

      stars.forEach(function (s) {
        if (s.got) return;
        var sx = s.x - scrollX;
        if (sx > -20 && sx < W + 20) drawEmoji(ctx, s.icon, sx, s.y, 22, false);
      });
      enemies.forEach(function (e) {
        if (e.dead) return;
        var ex = e.x - scrollX;
        if (ex > -30 && ex < W + 30) drawEmoji(ctx, e.icon, ex, e.y - 14, 26, true);
      });
      var pIcon = (w.OceanPlayer && w.OceanPlayer.getCharacter()) || player.icon;
      drawEmoji(ctx, pIcon, player.x, player.y + player.h * 0.5, 28, keys.left);
      hud();
    }

    function start() {
      if (!resize()) { setTimeout(start, 100); return; }
      if (overlay) overlay.style.display = "none";
      running = true;
      level = 1;
      score = 0;
      lives = 3;
      timeLeft = 70;
      player.x = 80;
      player.vy = 0;
      spawnLevel();
      hud();
      clearInterval(timerId);
      timerId = setInterval(function () {
        if (!running) return;
        timeLeft--;
        hud();
        if (timeLeft <= 0) endGame(level > maxLevel);
      }, 1000);
      loop();
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;
      if (e.key === " " || e.key === "ArrowUp") keys.jump = true;
    });
    document.addEventListener("keyup", function (e) {
      if (e.key === "ArrowLeft") keys.left = false;
      if (e.key === "ArrowRight") keys.right = false;
      if (e.key === " " || e.key === "ArrowUp") keys.jump = false;
    });

    if (startBtn) startBtn.onclick = start;
    w.addEventListener("resize", function () { resize(); fitFrame(); });
    fitFrame();
    resize();
  }

  /* ── Treasure Rush (outro): wide collect-a-thon with lanes ── */
  function bootTreasureRush(opts) {
    injectStyles();
    var canvas = $(opts.canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var scoreEl = $(opts.scoreId);
    var overlay = $(opts.startOverlayId || "action-start-overlay");
    var startBtn = $(opts.startBtnId || "action-start-btn");
    var W = 0, H = 0, dpr = 1;
    var running = false, animId = null, timerId = null;
    var score = 0, lives = 3, timeLeft = 75;
    var goal = opts.target || 150;
    var player = { x: 0, y: 0, lane: 1 };
    var lanes = [];
    var goodies = [], baddies = [], spawnT = 0;
    var keys = { left: false, right: false };

    function resize() {
      var stage = canvas.parentElement;
      var rect = stage.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) return false;
      dpr = Math.min(w.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = rect.width;
      H = rect.height;
      lanes = [H * 0.38, H * 0.52, H * 0.66];
      player.x = W / 2;
      player.y = lanes[player.lane];
      return true;
    }

    function hud() {
      if (!scoreEl) return;
      scoreEl.textContent = "⭐ " + score + " / " + goal + "  ⏱ " + timeLeft + "s  " + "❤️".repeat(Math.max(0, lives));
    }

    function spawn() {
      var lane = Math.floor(Math.random() * 3);
      if (Math.random() < 0.62) {
        goodies.push({
          x: W + 20,
          y: lanes[lane],
          icon: Math.random() < 0.5 ? "💎" : "🦪",
          pts: Math.random() < 0.5 ? 10 : 18,
          lane: lane,
        });
      } else {
        baddies.push({
          x: W + 20,
          y: lanes[lane],
          icon: Math.random() < 0.5 ? "🪼" : "🦈",
          lane: lane,
        });
      }
    }

    function endGame(won) {
      running = false;
      clearInterval(timerId);
      cancelAnimationFrame(animId);
      if (overlay) {
        overlay.style.display = "flex";
        overlay.querySelector("h3").textContent = won ? "🏆 Treasure Master!" : "💫 Keep Diving!";
        overlay.querySelector("p").textContent = "Score: " + score + " / " + goal;
        startBtn.textContent = "🔄 Play Again";
      }
    }

    function loop() {
      if (!running) return;
      animId = requestAnimationFrame(loop);
      if (!W || !H) return;

      if (keys.left) player.x -= 6;
      if (keys.right) player.x += 6;
      player.x = Math.max(36, Math.min(W - 36, player.x));

      spawnT++;
      if (spawnT > 28) { spawnT = 0; spawn(); }

      goodies.forEach(function (g, i) {
        g.x -= 3.2;
        if (Math.hypot(player.x - g.x, player.y - g.y) < 30) {
          goodies.splice(i, 1);
          score += g.pts;
          hud();
          if (score >= goal) endGame(true);
        } else if (g.x < -30) goodies.splice(i, 1);
      });
      baddies.forEach(function (b, i) {
        b.x -= 3.5;
        if (Math.hypot(player.x - b.x, player.y - b.y) < 28) {
          baddies.splice(i, 1);
          lives--;
          hud();
          if (lives <= 0) endGame(false);
        } else if (b.x < -30) baddies.splice(i, 1);
      });

      drawOceanBg(ctx, W, H, "#0a2848", "#031525");
      lanes.forEach(function (ly, idx) {
        ctx.strokeStyle = idx === player.lane ? "rgba(100,255,218,0.35)" : "rgba(255,255,255,0.06)";
        ctx.lineWidth = idx === player.lane ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(W, ly);
        ctx.stroke();
      });
      goodies.forEach(function (g) { drawEmoji(ctx, g.icon, g.x, g.y, 24, false); });
      baddies.forEach(function (b) { drawEmoji(ctx, b.icon, b.x, b.y, 26, true); });
      var pIcon = (w.OceanPlayer && w.OceanPlayer.getCharacter()) || "🤿";
      drawEmoji(ctx, pIcon, player.x, player.y, 30, keys.left);
      hud();
    }

    function start() {
      if (!resize()) { setTimeout(start, 100); return; }
      if (overlay) overlay.style.display = "none";
      running = true;
      score = 0;
      lives = 3;
      timeLeft = 75;
      goodies = [];
      baddies = [];
      player.lane = 1;
      player.y = lanes[1];
      player.x = W / 2;
      hud();
      clearInterval(timerId);
      timerId = setInterval(function () {
        if (!running) return;
        timeLeft--;
        hud();
        if (timeLeft <= 0) endGame(score >= goal);
      }, 1000);
      loop();
    }

    var controlsEl = $(opts.controlsId);
    if (controlsEl && !controlsEl._bound) {
      controlsEl._bound = true;
      controlsEl.innerHTML =
        '<button type="button" class="action-btn" id="tr-left">⬅️</button>' +
        '<button type="button" class="action-btn" id="tr-up">⬆️ Lane</button>' +
        '<button type="button" class="action-btn" id="tr-down">⬇️ Lane</button>' +
        '<button type="button" class="action-btn" id="tr-right">➡️</button>';
      $("tr-left").addEventListener("touchstart", function (e) { e.preventDefault(); keys.left = true; });
      $("tr-left").addEventListener("touchend", function () { keys.left = false; });
      $("tr-right").addEventListener("touchstart", function (e) { e.preventDefault(); keys.right = true; });
      $("tr-right").addEventListener("touchend", function () { keys.right = false; });
      $("tr-up").addEventListener("click", function () { player.lane = Math.max(0, player.lane - 1); player.y = lanes[player.lane]; });
      $("tr-down").addEventListener("click", function () { player.lane = Math.min(2, player.lane + 1); player.y = lanes[player.lane]; });
      ["tr-left", "tr-right"].forEach(function (id) {
        var el = $(id);
        el.addEventListener("mousedown", function () { keys[id === "tr-left" ? "left" : "right"] = true; });
        el.addEventListener("mouseup", function () { keys[id === "tr-left" ? "left" : "right"] = false; });
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;
      if (e.key === "ArrowUp") { player.lane = Math.max(0, player.lane - 1); player.y = lanes[player.lane]; }
      if (e.key === "ArrowDown") { player.lane = Math.min(2, player.lane + 1); player.y = lanes[player.lane]; }
    });
    document.addEventListener("keyup", function (e) {
      if (e.key === "ArrowLeft") keys.left = false;
      if (e.key === "ArrowRight") keys.right = false;
    });

    if (startBtn) startBtn.onclick = start;
    w.addEventListener("resize", function () { resize(); fitFrame(); });
    fitFrame();
    resize();
  }

  w.OceanActionGame = {
    boot: function (opts) {
      injectStyles();
      fitFrame();
      w.addEventListener("resize", fitFrame);
      if (opts.gameType === "zone-dive") bootZoneDive(opts);
      else if (opts.gameType === "treasure-rush") bootTreasureRush(opts);
      else console.warn("Unknown ocean action game:", opts.gameType);
    },
  };
})(window);
