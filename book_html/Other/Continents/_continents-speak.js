/* Continents Adventure — press words to hear (Web Speech API, Ocean + MM voice scoring) */
(function (w) {
  var gen = 0;
  var englishVoice = null;

  function scoreVoice(v) {
    var lang = (v.lang || "").toLowerCase();
    var name = (v.name || "").toLowerCase();
    var score = 0;
    if (lang.indexOf("en") !== 0) return -1;
    if (lang === "en-us" || lang === "en_us") score += 30;
    else if (lang === "en-gb" || lang === "en_gb") score += 20;
    else score += 10;
    if (/female|woman|girl|samantha|karen|moira|zira|susan|linda|jenny/.test(name)) score += 25;
    if (/natural|neural|premium|enhanced|google|microsoft/.test(name)) score += 15;
    if (/male|david|mark|daniel|george/.test(name)) score -= 5;
    return score;
  }

  function loadVoices() {
    if (!w.speechSynthesis) return;
    var voices = w.speechSynthesis.getVoices() || [];
    var best = null;
    var bestScore = -1;
    voices.forEach(function (v) {
      var s = scoreVoice(v);
      if (s > bestScore) {
        bestScore = s;
        best = v;
      }
    });
    if (best) englishVoice = best;
  }

  function stop() {
    gen++;
    if (w.speechSynthesis) w.speechSynthesis.cancel();
  }

  function speak(text, onend) {
    if (!text || !w.speechSynthesis) {
      if (onend) onend();
      return;
    }
    stop();
    var myGen = gen;
    loadVoices();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = (englishVoice && englishVoice.lang) || "en-US";
    if (englishVoice) u.voice = englishVoice;
    u.rate = 0.92;
    u.onend = function () {
      if (myGen === gen && onend) onend();
    };
    w.speechSynthesis.speak(u);
  }

  w.ContinentSpeak = {
    init: function () {
      loadVoices();
      if (w.speechSynthesis) w.speechSynthesis.onvoiceschanged = loadVoices;
      document.addEventListener(
        "click",
        function () {
          if (w.speechSynthesis && w.speechSynthesis.paused) w.speechSynthesis.resume();
        },
        true
      );
    },
    say: function (text) {
      speak(text);
    },
    chip: function (btn) {
      if (!btn) return;
      var word = btn.getAttribute("data-word") || btn.textContent.trim();
      var row = btn.closest(".speak-chips");
      if (row) {
        row.querySelectorAll(".speak-chip").forEach(function (b) {
          b.classList.remove("pressed");
        });
      }
      btn.classList.add("pressed");
      speak(word);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      w.ContinentSpeak.init();
    });
  } else {
    w.ContinentSpeak.init();
  }
})(window);
