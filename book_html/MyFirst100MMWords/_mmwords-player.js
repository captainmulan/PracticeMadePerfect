/* My First 100 Myanmar Words — player, audio, badges */
(function (w) {
  var BOOK = "myfirst100mmwords";
  function key(name) { return "book:" + BOOK + ":" + name; }

  w.MMPlayer = {
    getUserName: function () {
      return localStorage.getItem(key("userName")) || "Explorer";
    },
    getCharacter: function () {
      return localStorage.getItem(key("userCharacter")) || "🧒";
    },
    getCharacterName: function () {
      return localStorage.getItem(key("characterName")) || "Learner";
    },
    save: function (name, character, characterName) {
      localStorage.setItem(key("userName"), name);
      localStorage.setItem(key("userCharacter"), character);
      if (characterName != null) localStorage.setItem(key("characterName"), characterName);
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

  function isFemaleVoice(v) {
    if (!v) return false;
    if (v.gender === "female") return true;
    return /female|woman|girl|zira|samantha|karen|heera|priya|hazel|susan|aria|jenny|natasha|xiaoxiao|xiaoyi/i.test(v.name || "");
  }

  function isMaleVoice(v) {
    if (!v) return false;
    if (v.gender === "male") return true;
    return /male|man|boy|david|mark|james|daniel|george|brian|andrew|guy|ryan|paul/i.test(v.name || "");
  }

  function isMyanmarVoice(v) {
    var lang = (v.lang || "").toLowerCase();
    var name = (v.name || "").toLowerCase();
    return lang.indexOf("my") === 0 || name.indexOf("myanmar") >= 0 || name.indexOf("burmese") >= 0;
  }

  function scoreMyanmarVoice(v) {
    var name = (v.name || "").toLowerCase();
    var score = 0;
    if (isMaleVoice(v)) score += 4;
    else if (!isFemaleVoice(v)) score += 2;
    if (/google|online|natural|neural|premium|standard/i.test(name)) score += 3;
    if (/microsoft/i.test(name) && isFemaleVoice(v)) score -= 3;
    return score;
  }

  function pickVoice(voices, matcher, options) {
    options = options || {};
    var matches = voices.filter(matcher);
    if (!matches.length) return null;
    if (options.preferMale) {
      matches = matches.slice().sort(function (a, b) {
        return scoreMyanmarVoice(b) - scoreMyanmarVoice(a);
      });
      return matches[0];
    }
    if (options.preferFemale) {
      var female = matches.filter(isFemaleVoice);
      if (female.length) return female[0];
    }
    return matches[0];
  }

  function loadVoices() {
    if (!w.speechSynthesis) return;
    var voices = w.speechSynthesis.getVoices();
    if (!voices.length) return;
    myanmarVoice = pickVoice(voices, isMyanmarVoice, { preferMale: true });
    englishVoice = pickVoice(voices, function (v) {
      return (v.lang || "").toLowerCase().indexOf("en") === 0;
    }, { preferFemale: true });
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
    if (mirror === 0) {
      return "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + lang + "&q=" + q;
    }
    return "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=" + lang + "&q=" + q;
  }

  function playGoogleTts(text, lang, mirror, gen, onok, onfail) {
    if (isStale(gen)) return;
    var a = new Audio(googleTtsUrl(text, lang, mirror));
    a.playbackRate = 1.0;
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
    if (lang && lang.indexOf("my") === 0) {
      u.rate = 1.0;
      u.pitch = 0.92;
      u.volume = 1;
    } else {
      u.rate = 1.0;
      u.pitch = voice && isFemaleVoice(voice) ? 1.02 : 1.08;
    }
    if (voice) u.voice = voice;
    u.onend = function () { if (!isStale(gen) && onend) onend(); };
    u.onerror = function () { if (!isStale(gen) && onend) onend(); };
    w.speechSynthesis.speak(u);
  }

  function playMyanmar(text, hint, onend) {
    var gen = speakGen;
    loadVoices();
    /* Google TTS first — clearer Myanmar than most built-in voices */
    playGoogleTts(text, "my", 0, gen, function () {
      if (!isStale(gen) && onend) onend();
    }, function () {
      if (isStale(gen)) return;
      if (myanmarVoice) {
        speakSynth(text, "my-MM", myanmarVoice, gen, function () {
          if (!isStale(gen) && onend) onend();
        });
        return;
      }
      if (hint) {
        speakSynth(hint, "en-US", englishVoice, gen, onend);
      } else if (onend) onend();
    });
  }

  w.MMAudio = {
    init: function () {
      loadVoices();
      if (w.speechSynthesis) {
        w.speechSynthesis.onvoiceschanged = loadVoices;
        setTimeout(loadVoices, 300);
        setTimeout(loadVoices, 1200);
      }
      document.addEventListener("click", resumeSynth, true);
      document.addEventListener("touchstart", resumeSynth, true);
    },

    stop: stopAll,

    /** Myanmar only — cancels any in-progress speech and plays immediately */
    speakMyanmar: function (text, hint, onend) {
      if (!text) { if (onend) onend(); return; }
      stopAll();
      loadVoices();
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
