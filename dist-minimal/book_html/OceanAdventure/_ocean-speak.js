/* Ocean Adventure — press words to hear (Web Speech API) */
(function (w) {
  var gen = 0;
  var englishVoice = null;

  function loadVoices() {
    if (!w.speechSynthesis) return;
    var voices = w.speechSynthesis.getVoices();
    voices.forEach(function (v) {
      if (!englishVoice && (v.lang || "").toLowerCase().indexOf("en") === 0) englishVoice = v;
    });
  }

  function stop() {
    gen++;
    if (w.speechSynthesis) w.speechSynthesis.cancel();
  }

  function speak(text, onend) {
    if (!text || !w.speechSynthesis) { if (onend) onend(); return; }
    stop();
    var myGen = gen;
    loadVoices();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    if (englishVoice) u.voice = englishVoice;
    u.rate = 0.92;
    u.onend = function () { if (myGen === gen && onend) onend(); };
    w.speechSynthesis.speak(u);
  }

  w.OceanSpeak = {
    init: function () {
      loadVoices();
      if (w.speechSynthesis) w.speechSynthesis.onvoiceschanged = loadVoices;
      document.addEventListener("click", function () {
        if (w.speechSynthesis && w.speechSynthesis.paused) w.speechSynthesis.resume();
      }, true);
    },
    say: function (text) { speak(text); },
    chip: function (btn) {
      if (!btn) return;
      var word = btn.getAttribute("data-word") || btn.textContent.trim();
      btn.closest(".speak-chips") && btn.closest(".speak-chips").querySelectorAll(".speak-chip").forEach(function (b) {
        b.classList.remove("pressed");
      });
      btn.classList.add("pressed");
      speak(word);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { w.OceanSpeak.init(); });
  } else {
    w.OceanSpeak.init();
  }
})(window);
