/* My First 100 Myanmar Words — catch game + quiz helpers */
(function (w) {
  function injectBadgeModalStyles() {
    if (document.getElementById("mm-badge-modal-styles")) return;
    var s = document.createElement("style");
    s.id = "mm-badge-modal-styles";
    s.textContent =
      ".badge-modal{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;}" +
      ".badge-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45);cursor:pointer;}" +
      ".badge-modal-box{position:relative;background:#FFFFFF;border-radius:20px;padding:24px 20px 20px;max-width:340px;width:100%;text-align:center;border:3px solid #38BDF8;box-shadow:0 8px 32px rgba(56,189,248,.35);z-index:1;}" +
      ".badge-modal-box h3{color:#6D28D9;margin-bottom:8px;font-size:20px;font-family:'Comic Neue','Comic Sans MS',system-ui,sans-serif;}" +
      ".badge-modal-box p{color:#475569;margin-bottom:14px;font-size:15px;font-family:'Comic Neue','Comic Sans MS',system-ui,sans-serif;}" +
      ".badge-modal-x{position:absolute;top:8px;right:12px;border:none;background:transparent;font-size:28px;line-height:1;color:#94A3B8;cursor:pointer;padding:4px 8px;}" +
      ".badge-modal-x:hover{color:#DB2777;}" +
      ".badge-modal .dismiss-btn{padding:10px 22px;border:none;border-radius:12px;background:linear-gradient(135deg,#DB2777,#8B5CF6);color:#fff;font-weight:bold;cursor:pointer;font-size:15px;font-family:inherit;}";
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
        }
        btn.onclick = startGame;
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

  w.MMGame.buildHearPickQuestions = function (words, count) {
    count = count || 3;
    if (!words || !words.length) return [];
    var picked = shuffle(words).slice(0, Math.min(count, words.length));
    return picked.map(function (correct) {
      var others = shuffle(words.filter(function (w) { return w.en !== correct.en; })).slice(0, 3);
      var options = shuffle([correct].concat(others));
      return {
        type: "hear",
        mm: correct.mm,
        hint: correct.hint || correct.en,
        emoji: correct.emoji || "🔊",
        correctEn: correct.en,
        options: options.map(function (o) {
          return { en: o.en, emoji: o.emoji || "", mm: o.mm || "" };
        })
      };
    });
  };

  /** @deprecated — showed Myanmar script in options; use buildHearPickQuestions */
  w.MMGame.buildQuiz = function (words, count) {
    return w.MMGame.buildHearPickQuestions(words, count);
  };

  w.MMGame.bootHybridQuiz = function (opts) {
    opts = opts || {};
    var badge = opts.badge || "Quiz Star";
    var opponent = opts.opponent || w.MM_QUIZ_OPPONENT || { name: "Professor M", icon: "👩‍🏫" };
    var botCorrectRate = opts.botCorrectRate != null ? opts.botCorrectRate : 0.7;

    var cards = Array.prototype.slice.call(document.querySelectorAll(".quiz-card"));
    var totalQuestions = cards.length;
    var currentQuestion = 1;
    var score = 0;
    var computerScore = 0;

    var playerScoreEl = document.getElementById("playerScore");
    var computerScoreEl = document.getElementById("computerScore");
    var liveScoreBar = document.getElementById("liveScoreBar");
    var scoreCard = document.getElementById("scoreCard");
    var retryBtn = document.getElementById("quizRetryBtn");

    function loadPlayerInfo() {
      var userName = (w.MMPlayer && w.MMPlayer.getUserName()) || "Explorer";
      var userCharacter = (w.MMPlayer && w.MMPlayer.getCharacter()) || "🧒";
      var botName = opponent.name;
      var botIcon = opponent.icon;
      var el;
      el = document.getElementById("playerName2"); if (el) el.textContent = userName;
      el = document.getElementById("playerIcon"); if (el) el.textContent = userCharacter;
      el = document.getElementById("botName"); if (el) el.textContent = botName;
      el = document.getElementById("botIcon"); if (el) el.textContent = botIcon;
      el = document.getElementById("podium-char-1"); if (el) el.textContent = userCharacter;
      el = document.getElementById("podium-name-1"); if (el) el.textContent = userName;
      el = document.getElementById("podium-char-2"); if (el) el.textContent = botIcon;
      el = document.getElementById("podium-name-2"); if (el) el.textContent = botName;
    }

    function playHearCard(card) {
      if (!card || !w.MMAudio) return;
      var type = card.getAttribute("data-quiz-type");
      if (type !== "hear" && type !== "hear-sentence") return;
      var mm = card.getAttribute("data-mm");
      var hint = card.getAttribute("data-hint");
      if (mm) w.MMAudio.speakMyanmar(mm, hint || null);
    }

    function playActiveHear() {
      var active = document.getElementById("quizCard-" + currentQuestion);
      playHearCard(active);
    }

    function showScore() {
      if (!scoreCard) return;
      var userName = (w.MMPlayer && w.MMPlayer.getUserName()) || "Explorer";
      var userCharacter = (w.MMPlayer && w.MMPlayer.getCharacter()) || "🧒";
      var botName = opponent.name;
      var botIcon = opponent.icon;

      var competitors = [
        { name: userName, character: userCharacter, score: score, isPlayer: true },
        { name: botName, character: botIcon, score: computerScore, isPlayer: false }
      ];
      competitors.sort(function (a, b) { return b.score - a.score; });

      var el;
      el = document.getElementById("podium-char-1"); if (el) el.textContent = competitors[0].character;
      el = document.getElementById("podium-name-1"); if (el) el.textContent = competitors[0].name;
      el = document.getElementById("podium-score-1"); if (el) el.textContent = competitors[0].score;
      el = document.getElementById("podium-char-2"); if (el) el.textContent = competitors[1].character;
      el = document.getElementById("podium-name-2"); if (el) el.textContent = competitors[1].name;
      el = document.getElementById("podium-score-2"); if (el) el.textContent = competitors[1].score;

      var msg = document.getElementById("scoreMessage");
      var detail = document.getElementById("scoreDetail");
      if (score === computerScore) {
        if (msg) msg.textContent = "It's a tie!";
        if (detail) detail.textContent = score + " — " + computerScore + ". Try again to break the tie!";
      } else if (score > computerScore) {
        if (msg) msg.textContent = "🎉 " + userName + " wins!";
        if (detail) detail.textContent = "You beat " + botName + " — " + score + " to " + computerScore + ".";
        if (w.MMPlayer) w.MMPlayer.earnBadge(badge);
      } else {
        if (msg) msg.textContent = botName + " wins this time!";
        if (detail) detail.textContent = "Score: " + score + " vs " + computerScore + " — tap Try Again!";
      }

      if (liveScoreBar) liveScoreBar.classList.add("hidden");
      cards.forEach(function (c) { c.classList.remove("active"); });
      var podium = document.getElementById("podium");
      if (podium) podium.style.display = "flex";
      scoreCard.classList.add("show");
    }

    function nextQuestion() {
      var current = document.getElementById("quizCard-" + currentQuestion);
      if (current) current.classList.remove("active");
      currentQuestion++;
      if (currentQuestion <= totalQuestions) {
        var next = document.getElementById("quizCard-" + currentQuestion);
        if (next) next.classList.add("active");
        setTimeout(playActiveHear, 350);
      } else {
        showScore();
      }
    }

    function checkAnswer(optionEl, isCorrect) {
      var card = optionEl.closest(".quiz-card");
      if (!card || card.dataset.answered === "1") return;
      card.dataset.answered = "1";
      var questionNum = card.id.replace("quizCard-", "");
      var options = card.querySelectorAll(".option");
      var feedback = document.getElementById("feedback-" + questionNum);
      var isHear = card.getAttribute("data-quiz-type") === "hear" || card.getAttribute("data-quiz-type") === "hear-sentence";

      options.forEach(function (opt) { opt.style.pointerEvents = "none"; });

      if (Math.random() < botCorrectRate) {
        computerScore++;
        if (computerScoreEl) computerScoreEl.textContent = computerScore;
      }

      if (isCorrect) {
        optionEl.classList.add("correct");
        if (feedback) {
          feedback.textContent = "✅ Correct! Great job!";
          feedback.className = "feedback show correct";
        }
        score++;
        if (playerScoreEl) playerScoreEl.textContent = score;
      } else {
        optionEl.classList.add("wrong");
        if (feedback) {
          feedback.textContent = isHear
            ? "❌ Not quite — tap 🔊 and listen again!"
            : "❌ Not quite — read the story again!";
          feedback.className = "feedback show wrong";
        }
        options.forEach(function (opt) {
          if (opt.dataset.correct === "1") opt.classList.add("correct");
        });
        if (isHear) setTimeout(function () { playHearCard(card); }, 400);
      }
      setTimeout(nextQuestion, 1500);
    }

    function retryQuiz() {
      score = 0;
      computerScore = 0;
      currentQuestion = 1;
      if (playerScoreEl) playerScoreEl.textContent = "0";
      if (computerScoreEl) computerScoreEl.textContent = "0";
      if (scoreCard) scoreCard.classList.remove("show");
      if (liveScoreBar) liveScoreBar.classList.remove("hidden");
      var podium = document.getElementById("podium");
      if (podium) podium.style.display = "none";

      cards.forEach(function (card, index) {
        card.classList.remove("active");
        card.dataset.answered = "0";
        if (index === 0) card.classList.add("active");
        card.querySelectorAll(".option").forEach(function (opt) {
          opt.classList.remove("correct", "wrong");
          opt.style.pointerEvents = "auto";
        });
        var num = card.id.replace("quizCard-", "");
        var fb = document.getElementById("feedback-" + num);
        if (fb) {
          fb.textContent = "";
          fb.className = "feedback";
        }
      });
      setTimeout(playActiveHear, 350);
    }

    loadPlayerInfo();
    if (retryBtn) retryBtn.addEventListener("click", retryQuiz);

    document.addEventListener("click", function (e) {
      var replay = e.target.closest(".hear-replay-btn");
      if (replay) {
        playHearCard(replay.closest(".quiz-card"));
        return;
      }
      var option = e.target.closest(".quiz-card .option");
      if (option) {
        checkAnswer(option, option.dataset.correct === "1");
      }
    });

    setTimeout(playActiveHear, 500);
  };
})(window);
