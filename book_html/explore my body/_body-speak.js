/* Explore My Body — press words to hear (Web Speech API) */
(function (w) {
  var gen = 0;
  var englishVoice = null;

  function loadVoices() {
    if (!w.speechSynthesis) return;
    w.speechSynthesis.getVoices().forEach(function (v) {
      if (!englishVoice && (v.lang || "").toLowerCase().indexOf("en") === 0) englishVoice = v;
    });
  }

  function stop() {
    gen++;
    if (w.speechSynthesis) w.speechSynthesis.cancel();
  }

  function speak(text) {
    if (!text || !w.speechSynthesis) return;
    stop();
    loadVoices();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    if (englishVoice) u.voice = englishVoice;
    u.rate = 0.92;
    w.speechSynthesis.speak(u);
  }

  w.BodySpeak = {
    init: function () {
      loadVoices();
      if (w.speechSynthesis) w.speechSynthesis.onvoiceschanged = loadVoices;
    },
    say: function (text) { speak(text); },
    chip: function (btn) {
      if (!btn) return;
      var word = btn.getAttribute("data-word") || btn.textContent.trim();
      var row = btn.closest(".speak-chips");
      if (row) row.querySelectorAll(".speak-chip").forEach(function (b) { b.classList.remove("pressed"); });
      btn.classList.add("pressed");
      speak(word);
      if (w.BodyPlayer && w.BodyPlayer.markWordHeard) {
        var ch = btn.getAttribute("data-chapter") || "";
        w.BodyPlayer.markWordHeard(ch, word);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { w.BodySpeak.init(); });
  } else {
    w.BodySpeak.init();
  }
})(window);
