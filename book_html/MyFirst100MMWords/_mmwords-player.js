/* My First 100 Myanmar Words — player, audio, badges */
(function (w) {
  var BOOK = "myfirst100mmwords";
  function key(name) { return "book:" + BOOK + ":" + name; }

  w.MMPlayer = {
    getUserName: function () {
      return localStorage.getItem(key("userName")) || localStorage.getItem("userName") || "Friend";
    },
    getCharacter: function () {
      return localStorage.getItem(key("userCharacter")) || localStorage.getItem("userCharacter") || "🧒";
    },
    getCharacterName: function () {
      return localStorage.getItem(key("characterName")) || localStorage.getItem("characterName") || "Learner";
    },
    save: function (name, character, characterName) {
      localStorage.setItem(key("userName"), name);
      localStorage.setItem(key("userCharacter"), character);
      if (characterName != null) localStorage.setItem(key("characterName"), characterName);
      localStorage.setItem("userName", name);
      localStorage.setItem("userCharacter", character);
      if (characterName != null) localStorage.setItem("characterName", characterName);
    },
    getBadges: function () {
      try { return JSON.parse(localStorage.getItem(key("badges")) || "[]"); }
      catch (e) { return []; }
    },
    earnBadge: function (badge) {
      var badges = this.getBadges();
      if (badges.indexOf(badge) === -1) {
        badges.push(badge);
        localStorage.setItem(key("badges"), JSON.stringify(badges));
        return true;
      }
      return false;
    },
    markWordHeard: function (chapterId, wordEn) {
      var heard = this.getHeardWords();
      var id = chapterId + ":" + wordEn;
      if (heard.indexOf(id) === -1) {
        heard.push(id);
        localStorage.setItem(key("heardWords"), JSON.stringify(heard));
      }
    },
    getHeardWords: function () {
      try { return JSON.parse(localStorage.getItem(key("heardWords")) || "[]"); }
      catch (e) { return []; }
    }
  };

  var speakGen = 0;
  var currentAudio = null;
  var myanmarVoice = null;
  var englishVoice = null;

  function loadVoices() {
    if (!w.speechSynthesis) return;
    var voices = w.speechSynthesis.getVoices();
    if (!voices.length) return;
    myanmarVoice = null;
    englishVoice = null;
    voices.forEach(function (v) {
      var lang = (v.lang || "").toLowerCase();
      var name = (v.name || "").toLowerCase();
      if (!myanmarVoice && (lang.indexOf("my") === 0 || name.indexOf("myanmar") >= 0 || name.indexOf("burmese") >= 0)) {
        myanmarVoice = v;
      }
      if (!englishVoice && lang.indexOf("en") === 0) englishVoice = v;
    });
  }

  function resumeSynth() {
    if (w.speechSynthesis && w.speechSynthesis.paused) w.speechSynthesis.resume();
  }

  /** Stop current speech immediately (fast tap = new word replaces old) */
  function stopAll() {
    speakGen++;
    if (currentAudio) {
      try {
        currentAudio.onended = null;
        currentAudio.onerror = null;
        currentAudio.pause();
        currentAudio.src = "";
        currentAudio.load();
      } catch (e) {}
      currentAudio = null;
    }
    if (w.speechSynthesis) w.speechSynthesis.cancel();
  }

  function isStale(gen) {
    return gen !== speakGen;
  }

  function googleTtsUrl(text, lang, mirror) {
    var q = encodeURIComponent(text);
    if (mirror === 1) {
      return "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + lang + "&q=" + q;
    }
    return "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=" + lang + "&q=" + q;
  }

  function playGoogleTts(text, lang, mirror, gen, onok, onfail) {
    if (isStale(gen)) return;
    var a = new Audio(googleTtsUrl(text, lang, mirror));
    a.playbackRate = 1.18;
    a.volume = 1;
    currentAudio = a;
    a.onended = function () {
      if (isStale(gen)) return;
      currentAudio = null;
      if (onok) onok();
    };
    a.onerror = function () {
      if (isStale(gen)) return;
      currentAudio = null;
      if (mirror < 1) playGoogleTts(text, lang, mirror + 1, gen, onok, onfail);
      else if (onfail) onfail();
    };
    resumeSynth();
    a.play().catch(function () {
      if (isStale(gen)) return;
      currentAudio = null;
      if (mirror < 1) playGoogleTts(text, lang, mirror + 1, gen, onok, onfail);
      else if (onfail) onfail();
    });
  }

  function speakSynth(text, lang, voice, gen, onend) {
    if (!text || !w.speechSynthesis || isStale(gen)) {
      if (onend && !isStale(gen)) onend();
      return;
    }
    resumeSynth();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "en-US";
    u.rate = lang && lang.indexOf("my") === 0 ? 0.95 : 1.0;
    u.pitch = 1;
    if (voice) u.voice = voice;
    u.onend = function () { if (!isStale(gen) && onend) onend(); };
    u.onerror = function () { if (!isStale(gen) && onend) onend(); };
    w.speechSynthesis.speak(u);
  }

  function playMyanmar(text, hint, onend) {
    var gen = speakGen;
    loadVoices();
    /* Google TTS is usually clearer for Myanmar on most devices */
    playGoogleTts(text, "my", 0, gen, function () {
      if (!isStale(gen) && onend) onend();
    }, function () {
      if (isStale(gen)) return;
      if (myanmarVoice) {
        speakSynth(text, "my-MM", myanmarVoice, gen, onend);
      } else if (hint) {
        speakSynth(hint, "en-US", englishVoice, gen, onend);
      } else if (onend) onend();
    });
  }

  w.MMAudio = {
    init: function () {
      loadVoices();
      if (w.speechSynthesis) w.speechSynthesis.onvoiceschanged = loadVoices;
      document.addEventListener("click", resumeSynth, true);
      document.addEventListener("touchstart", resumeSynth, true);
    },

    stop: stopAll,

    /** Myanmar only — cancels any in-progress speech and plays immediately */
    speakMyanmar: function (text, hint, onend) {
      if (!text) { if (onend) onend(); return; }
      stopAll();
      playMyanmar(text, hint, onend);
    },

    speakEnglish: function (text, onend) {
      if (!text) { if (onend) onend(); return; }
      stopAll();
      var gen = speakGen;
      loadVoices();
      speakSynth(text, "en-US", englishVoice, gen, onend);
    },

    speak: function (text, lang, onend) {
      if (!text) { if (onend) onend(); return; }
      var l = (lang || "my-MM").toLowerCase();
      if (l.indexOf("my") === 0) this.speakMyanmar(text, null, onend);
      else this.speakEnglish(text, onend);
    },

    speakWord: function (word) {
      if (!word) return;
      this.speakMyanmar(word.mm, word.hint);
    },

    /** Word card tap — Myanmar only, instant interrupt on fast clicks */
    speakWordCard: function (el) {
      if (!el) return;
      this.speakMyanmar(el.getAttribute("data-mm"), el.getAttribute("data-hint"));
    },

    speakFromBtn: function (btn, lang) {
      var card = btn.closest(".word-card") || btn.closest(".phrase-card") || btn.closest(".hero-word-card") || btn;
      if (!card) return;
      var en = card.getAttribute("data-en");
      var mm = card.getAttribute("data-mm");
      var hint = card.getAttribute("data-hint");
      var root = card.closest(".word-card") || card;
      root.querySelectorAll(".speak-btn, .btn-speak").forEach(function (b) { b.classList.remove("pressed"); });
      btn.classList.add("pressed");
      if (lang === "en") this.speakEnglish(en);
      else this.speakMyanmar(mm, hint);
    }
  };

  w.tapEn = function (btn, chapterId) {
    var card = btn.closest(".word-card");
    if (card) card.classList.add("heard");
    if (w.MMAudio) MMAudio.speakFromBtn(btn, "en");
    if (w.MMPlayer && chapterId && card) {
      MMPlayer.markWordHeard(chapterId, card.getAttribute("data-en"));
    }
  };

  w.tapMm = function (btn, chapterId) {
    var card = btn.closest(".word-card");
    if (card) card.classList.add("heard");
    if (w.MMAudio) MMAudio.speakFromBtn(btn, "mm");
    if (w.MMPlayer && chapterId && card) {
      MMPlayer.markWordHeard(chapterId, card.getAttribute("data-en"));
    }
  };

  w.tapPhrase = function (btn, lang) {
    var card = btn.closest(".phrase-card") || btn.closest(".phrase-btns") || btn.parentElement;
    if (card && !card.getAttribute("data-en") && card.parentElement) {
      card = card.closest("[data-en]") || card;
    }
    if (w.MMAudio) {
      if (lang === "en") {
        var en = (card && card.getAttribute("data-en")) || btn.getAttribute("data-en");
        if (en) MMAudio.speakEnglish(en);
      } else {
        var mm = (card && card.getAttribute("data-mm")) || btn.getAttribute("data-mm");
        MMAudio.speakMyanmar(mm, null);
      }
      btn.parentElement.querySelectorAll(".btn-speak").forEach(function (b) { b.classList.remove("pressed"); });
      btn.classList.add("pressed");
    }
  };

  /* legacy */
  w.tapWord = function (el, chapterId) {
    var mmBtn = el.querySelector(".speak-btn-mm");
    if (mmBtn) tapMm(mmBtn, chapterId);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { MMAudio.init(); });
  } else {
    MMAudio.init();
  }
})(window);
