/* My First 100 Myanmar Words — catch game + quiz helpers */
(function (w) {
  function injectBadgeModalStyles() {
    if (document.getElementById("mm-badge-modal-styles")) return;
    var s = document.createElement("style");
    s.id = "mm-badge-modal-styles";
    s.textContent =
      ".badge-modal{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;}" +
      ".badge-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45);cursor:pointer;}" +
      ".badge-modal-box{position:relative;background:#fff;border-radius:20px;padding:24px 20px 20px;max-width:340px;width:100%;text-align:center;border:3px solid #FFD700;box-shadow:0 8px 32px rgba(0,0,0,.2);z-index:1;}" +
      ".badge-modal-box h3{color:#C41E3A;margin-bottom:8px;font-size:20px;font-family:'Comic Sans MS','Comic Neue',system-ui,sans-serif;}" +
      ".badge-modal-box p{color:#3d2914;margin-bottom:14px;font-size:15px;font-family:'Comic Sans MS','Comic Neue',system-ui,sans-serif;}" +
      ".badge-modal-x{position:absolute;top:8px;right:12px;border:none;background:transparent;font-size:28px;line-height:1;color:#888;cursor:pointer;padding:4px 8px;}" +
      ".badge-modal-x:hover{color:#C41E3A;}" +
      ".badge-modal .dismiss-btn{padding:10px 22px;border:none;border-radius:12px;background:#C41E3A;color:#fff;font-weight:bold;cursor:pointer;font-size:15px;font-family:inherit;}";
    document.head.appendChild(s);
  }
  injectBadgeModalStyles();

  w.MMGame = { _badgeModalEsc: null, closeBadgeModal: function () {
    var modal = document.querySelector(".badge-modal");
    if (modal) modal.remove();
    document.body.style.overflow = "";
  }};

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  w.MMGame.bootCatch = function (opts) {
      var canvas = document.getElementById(opts.canvasId);
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var words = opts.words || [];
      var badge = opts.badge || "Word Master";
      var chapterId = opts.chapterId || "chapter";
      var target = opts.target || 8;
      var W = 0;
      var H = 0;
      var score = 0;
      var items = [];
      var basket = { x: 0, y: 0, w: 80, h: 36 };
      var running = false;
      var spawnTimer = null;
      var animId = null;
      var scoreEl = document.getElementById(opts.scoreId);
      var section = canvas.closest(".game-section") || canvas.parentElement;

      function resize() {
        var rect = canvas.getBoundingClientRect();
        if (rect.width < 50 || rect.height < 50) return false;
        canvas.width = rect.width * (w.devicePixelRatio || 1);
        canvas.height = rect.height * (w.devicePixelRatio || 1);
        W = canvas.width;
        H = canvas.height;
        var scale = W / 400;
        basket.w = 80 * scale;
        basket.h = 36 * (H / 300);
        basket.x = W / 2 - basket.w / 2;
        basket.y = H - basket.h - 16 * (H / 300);
        return true;
      }

      function hideWinBanner() {
        var modal = document.querySelector(".badge-modal");
        if (modal) {
          document.removeEventListener("keydown", w.MMGame._badgeModalEsc || function () {});
          modal.remove();
        }
        document.body.style.overflow = "";
      }

      function showWinBanner(isNew) {
        hideWinBanner();
        var modal = document.createElement("div");
        modal.className = "badge-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.innerHTML =
          "<div class=\"badge-modal-backdrop\"></div>" +
          "<div class=\"badge-modal-box\">" +
            "<button type=\"button\" class=\"badge-modal-x\" aria-label=\"Close\">×</button>" +
            "<h3 class=\"win-msg\">" + (isNew ? "🏆 You earned: " + badge + "!" : "🏆 " + badge + " — great job!") + "</h3>" +
            "<p>You caught enough words!</p>" +
            "<button type=\"button\" class=\"dismiss-btn\">OK — back to words</button>" +
          "</div>";
        document.body.appendChild(modal);
        document.body.style.overflow = "hidden";

        function close() { hideWinBanner(); }
        modal.querySelector(".badge-modal-backdrop").onclick = close;
        modal.querySelector(".badge-modal-x").onclick = close;
        modal.querySelector(".dismiss-btn").onclick = close;
        w.MMGame._badgeModalEsc = function (e) {
          if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", w.MMGame._badgeModalEsc);
        modal.addEventListener("remove", function () {
          document.removeEventListener("keydown", w.MMGame._badgeModalEsc);
        });
      }

      function spawn() {
        if (!running || !words.length || W < 100) return;
        var word = rand(words);
        items.push({
          word: word,
          x: Math.random() * (W - 60 * (W / 400)) + 30 * (W / 400),
          y: -40 * (H / 300),
          vy: 1.2 + Math.random() * 1.5,
          emoji: word.emoji || "⭐"
        });
      }

      function draw() {
        if (!running) return;
        animId = requestAnimationFrame(draw);
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "rgba(255,248,220,0.15)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
        ctx.fillStyle = "#FFD700";
        ctx.font = (14 * W / 400) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🧺", basket.x + basket.w / 2, basket.y + basket.h / 2 + 6 * W / 400);

        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          it.y += it.vy * (H / 300);
          ctx.font = (28 * W / 400) + "px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(it.emoji, it.x, it.y);
          var caught = it.y >= basket.y && it.y <= basket.y + basket.h &&
            it.x >= basket.x && it.x <= basket.x + basket.w;
          if (caught) {
            score++;
            if (scoreEl) scoreEl.textContent = score;
            if (w.MMAudio) w.MMAudio.speakMyanmar(it.word.mm, it.word.hint);
            if (w.MMPlayer) w.MMPlayer.markWordHeard(chapterId, it.word.en);
            items.splice(i, 1);
            if (score >= target) endGame(true);
            continue;
          }
          if (it.y > H + 40) items.splice(i, 1);
        }
      }

      function endGame(won) {
        running = false;
        if (spawnTimer) clearInterval(spawnTimer);
        spawnTimer = null;
        if (animId) cancelAnimationFrame(animId);
        var startBtn = section && section.querySelector(".game-start-btn");
        if (startBtn) {
          startBtn.style.display = "inline-block";
          startBtn.textContent = "▶ Play again";
        }
        if (won && w.MMPlayer) {
          var isNew = w.MMPlayer.earnBadge(badge);
          showWinBanner(isNew);
        }
      }

      function startGame() {
        if (running) return;
        if (!resize()) {
          setTimeout(startGame, 100);
          return;
        }
        hideWinBanner();
        score = 0;
        items = [];
        if (scoreEl) scoreEl.textContent = "0";
        running = true;
        var startBtn = section && section.querySelector(".game-start-btn");
        if (startBtn) startBtn.style.display = "none";
        spawnTimer = setInterval(spawn, 900);
        spawn();
        draw();
      }

      function ensureStartButton() {
        if (!section) return;
        var btn = section.querySelector(".game-start-btn");
        if (!btn) {
          btn = document.createElement("button");
          btn.type = "button";
          btn.className = "game-start-btn";
          btn.textContent = "▶ Start catch game";
          canvas.parentNode.insertBefore(btn, canvas);
          btn.onclick = startGame;
        }
      }

      resize();
      ensureStartButton();
      w.addEventListener("resize", resize);

      canvas.addEventListener("mousemove", function (e) {
        if (!running || !W) return;
        var r = canvas.getBoundingClientRect();
        basket.x = (e.clientX - r.left) * (W / r.width) - basket.w / 2;
        basket.x = Math.max(0, Math.min(W - basket.w, basket.x));
      });
      canvas.addEventListener("touchmove", function (e) {
        if (!running || !W) return;
        e.preventDefault();
        var t = e.touches[0];
        var r = canvas.getBoundingClientRect();
        basket.x = (t.clientX - r.left) * (W / r.width) - basket.w / 2;
        basket.x = Math.max(0, Math.min(W - basket.w, basket.x));
      }, { passive: false });
  };

  w.MMGame.buildQuiz = function (words, count) {
      count = count || 5;
      var qs = shuffle(words).slice(0, Math.min(count, words.length));
      return qs.map(function (correct) {
        var others = shuffle(words.filter(function (word) { return word.en !== correct.en; })).slice(0, 3);
        var options = shuffle([correct].concat(others));
        return {
          prompt: correct.emoji + " What is \"" + correct.en + "\" in Myanmar?",
          correct: correct.mm,
          options: options.map(function (o) { return o.mm; })
        };
      });
  };

  w.MMGame.bootBridgeIntro = function (canvasId) {
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var apple = { x: 80, y: 120, r: 36, caught: false };
      var W, H;

      function resize() {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * (w.devicePixelRatio || 1);
        canvas.height = rect.height * (w.devicePixelRatio || 1);
        W = canvas.width; H = canvas.height;
      }
      resize();

      function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#FFF8E7";
        ctx.fillRect(0, 0, W, H);
        if (!apple.caught) {
          ctx.font = (48 * W / 360) + "px sans-serif";
          ctx.fillText("🍎", apple.x, apple.y);
          ctx.font = (14 * W / 360) + "px sans-serif";
          ctx.fillStyle = "#333";
          ctx.fillText("Tap the apple!", W / 2, 40 * H / 240);
        } else {
          ctx.font = (14 * W / 360) + "px sans-serif";
          ctx.fillStyle = "#333";
          ctx.fillText("Apple → ပန်းသီး", W / 2, 50 * H / 240);
          ctx.font = (32 * W / 360) + "px 'Myanmar Text', Padauk, sans-serif";
          ctx.fillStyle = "#C41E3A";
          ctx.fillText("ပန်းသီး", W / 2, 100 * H / 240);
          ctx.font = (13 * W / 360) + "px sans-serif";
          ctx.fillStyle = "#666";
          ctx.fillText("🔊 Tap again to hear", W / 2, 130 * H / 240);
        }
        requestAnimationFrame(draw);
      }
      draw();

      canvas.addEventListener("click", function () {
        if (!apple.caught) {
          apple.caught = true;
          if (w.MMAudio) w.MMAudio.speakMyanmar("ပန်းသီး", "pan-thee");
        } else {
          if (w.MMAudio) w.MMAudio.speakMyanmar("ပန်းသီး", "pan-thee");
        }
      });
  };
})(window);
