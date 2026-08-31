/* Simple chapter minigames — tap correct fact before time runs out */
(function (w) {
  w.DinoGame = {
    bootTapFacts: function (opts) {
      var canvas = document.getElementById(opts.canvasId);
      var scoreEl = document.getElementById(opts.scoreId);
      var startBtn = document.getElementById(opts.startBtnId);
      if (!canvas || !startBtn) return;
      var ctx = canvas.getContext("2d");
      var facts = opts.facts || [];
      var score = 0;
      var timeLeft = opts.duration || 45;
      var running = false;
      var timer = null;
      var current = null;
      var dpr = window.devicePixelRatio || 1;

      function resize() {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function pickQuestion() {
        var f = facts[Math.floor(Math.random() * facts.length)];
        var wrong = facts.filter(function (x) { return x !== f; });
        var optsList = [f];
        while (optsList.length < 3 && wrong.length) {
          var w = wrong.splice(Math.floor(Math.random() * wrong.length), 1)[0];
          if (optsList.indexOf(w) === -1) optsList.push(w);
        }
        optsList.sort(function () { return Math.random() - 0.5; });
        current = { text: f, options: optsList };
      }

      function draw() {
        var W = canvas.width / dpr;
        var H = canvas.height / dpr;
        ctx.fillStyle = "rgba(45,27,14,0.85)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#8bc34a";
        ctx.font = "bold 14px Comic Sans MS, sans-serif";
        ctx.fillText("⏱ " + timeLeft + "s  ·  Score: " + score, 12, 22);
        if (!current) return;
        ctx.fillStyle = "#f5e6d3";
        ctx.font = "bold 16px Comic Sans MS, sans-serif";
        wrapText("Tap the TRUE fact:", 12, 48, W - 24, 20);
        current.options.forEach(function (opt, i) {
          var y = 80 + i * 56;
          ctx.fillStyle = "rgba(139,195,74,0.25)";
          ctx.strokeStyle = "#8bc34a";
          ctx.lineWidth = 2;
          roundRect(12, y, W - 24, 46, 10);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#f5e6d3";
          ctx.font = "14px Comic Sans MS, sans-serif";
          wrapText(opt, 22, y + 18, W - 44, 18);
        });
      }

      function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      function wrapText(text, x, y, maxWidth, lineHeight) {
        var words = text.split(" ");
        var line = "";
        words.forEach(function (word) {
          var test = line + word + " ";
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = word + " ";
            y += lineHeight;
          } else {
            line = test;
          }
        });
        ctx.fillText(line, x, y);
      }

      function tick() {
        timeLeft--;
        if (timeLeft <= 0) {
          endGame();
          return;
        }
        draw();
      }

      function endGame() {
        running = false;
        clearInterval(timer);
        if (scoreEl) scoreEl.textContent = score;
        draw();
        ctx.fillStyle = "#ffc107";
        ctx.font = "bold 18px Comic Sans MS, sans-serif";
        ctx.fillText("Game over! Score: " + score, 12, canvas.height / dpr - 20);
      }

      canvas.addEventListener("click", function (e) {
        if (!running || !current) return;
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var W = rect.width;
        current.options.forEach(function (opt, i) {
          var oy = 80 + i * 56;
          if (x >= 12 && x <= W - 12 && y >= oy && y <= oy + 46) {
            if (opt === current.text) score++;
            if (scoreEl) scoreEl.textContent = score;
            pickQuestion();
            draw();
          }
        });
      });

      startBtn.addEventListener("click", function () {
        if (running) return;
        running = true;
        score = 0;
        timeLeft = opts.duration || 45;
        if (scoreEl) scoreEl.textContent = "0";
        pickQuestion();
        resize();
        draw();
        clearInterval(timer);
        timer = setInterval(tick, 1000);
      });

      window.addEventListener("resize", function () { if (running) { resize(); draw(); } });
      resize();
      draw();
    },
  };
})(window);
