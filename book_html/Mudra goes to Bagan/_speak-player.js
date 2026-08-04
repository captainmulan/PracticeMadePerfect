/* Mudra goes to Bagan — player, audio, badges */
(function (w) {
  var BOOK = "mudra-goes-to-bagan";
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
  var currentEnAudio = null;
  var sharedAudio = null;
  var enAudio = null;
  var unlockAudioEl = null;
  var audioUnlocked = false;
  var myanmarVoice = null;
  var englishVoice = null;
  var mmAudioCtx = null;
  var mmGainNode = null;
  var mmMediaSource = null;
  /* Tiny silent WAV — unlocks HTMLAudioElement on iOS Safari (gesture chain). */
  var SILENT_WAV = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

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

  function ensureAudio() {
    if (!sharedAudio) {
      sharedAudio = new Audio();
      sharedAudio.setAttribute("playsinline", "true");
      sharedAudio.setAttribute("webkit-playsinline", "true");
      try { sharedAudio.playsInline = true; } catch (e) {}
      sharedAudio.preload = "auto";
      wireMmGain(sharedAudio);
    }
    resumeMmAudioCtx();
    return sharedAudio;
  }

  /** Boost Myanmar MP3 loudness (HTMLAudio volume maxes at 1). EN path untouched. */
  function wireMmGain(mediaEl) {
    try {
      var AC = w.AudioContext || w.webkitAudioContext;
      if (!AC || mmMediaSource) return;
      mmAudioCtx = mmAudioCtx || new AC();
      mmGainNode = mmAudioCtx.createGain();
      mmGainNode.gain.value = 2.2;
      mmGainNode.connect(mmAudioCtx.destination);
      mmMediaSource = mmAudioCtx.createMediaElementSource(mediaEl);
      mmMediaSource.connect(mmGainNode);
    } catch (e) {}
  }

  function resumeMmAudioCtx() {
    try {
      if (mmAudioCtx && mmAudioCtx.state === "suspended") mmAudioCtx.resume();
    } catch (e) {}
  }

  /** Separate element for English — never shares src/state with Myanmar MP3 playback. */
  function ensureEnAudio() {
    if (!enAudio) {
      enAudio = new Audio();
      enAudio.setAttribute("playsinline", "true");
      enAudio.setAttribute("webkit-playsinline", "true");
      try { enAudio.playsInline = true; } catch (e) {}
      enAudio.preload = "auto";
    }
    return enAudio;
  }

  /** Text nodes have no .closest — normalize event targets inside buttons. */
  function eventEl(e) {
    var t = e && e.target;
    if (!t) return null;
    if (t.nodeType !== 1) t = t.parentElement;
    return t;
  }

  function warmSynth() {
    resumeSynth();
    if (!w.speechSynthesis) return;
    try {
      var warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      warm.rate = 10;
      w.speechSynthesis.speak(warm);
      w.speechSynthesis.cancel();
    } catch (e) {}
  }

  /**
   * Must run synchronously inside a user tap on iOS (esp. inside app iframes).
   * Uses a dedicated unlock element so we never steal the playback Audio's src.
   */
  function unlockMedia() {
    warmSynth();
    resumeMmAudioCtx();
    if (audioUnlocked) return;
    try {
      if (!unlockAudioEl) {
        unlockAudioEl = new Audio(SILENT_WAV);
        unlockAudioEl.setAttribute("playsinline", "true");
        unlockAudioEl.setAttribute("webkit-playsinline", "true");
        try { unlockAudioEl.playsInline = true; } catch (e1) {}
      }
      unlockAudioEl.muted = true;
      var p = unlockAudioEl.play();
      if (p && p.then) {
        p.then(function () {
          audioUnlocked = true;
          try { unlockAudioEl.pause(); unlockAudioEl.currentTime = 0; } catch (e2) {}
        }).catch(function () {});
      } else {
        audioUnlocked = true;
      }
    } catch (e) {}
  }

  /** Stop current speech immediately (fast tap = new word replaces old) */
  function stopAll() {
    speakGen++;
    if (currentAudio) {
      try {
        currentAudio.onended = null;
        currentAudio.onerror = null;
        currentAudio.pause();
        /* Keep src — clearing it re-locks HTMLAudio on iOS. */
      } catch (e) {}
      currentAudio = null;
    }
    if (currentEnAudio) {
      try {
        currentEnAudio.onended = null;
        currentEnAudio.onerror = null;
        currentEnAudio.pause();
      } catch (eEn) {}
      currentEnAudio = null;
    }
    if (w.speechSynthesis) w.speechSynthesis.cancel();
  }

  function isStale(gen) {
    return gen !== speakGen;
  }

  function googleTtsUrl(text, lang, mirror) {
    var q = encodeURIComponent(text);
    var tl = lang || "my";
    /* googleapis is usually faster; translate.google.com is fallback */
    if (mirror === 0) {
      return "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=" + tl + "&q=" + q;
    }
    return "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + tl + "&q=" + q;
  }

  function audioScriptBase() {
    try {
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || "";
        if (/_mmwords-player\.js(\?|$)/.test(src)) {
          return src.replace(/_mmwords-player\.js(\?.*)?$/, "");
        }
      }
    } catch (e) {}
    return "";
  }

  function localMmUrl(text) {
    text = String(text || "").trim();
    if (!text) return null;
    var map = w.MM_AUDIO_MAP || {};
    var file = map[text];
    if (!file) return null;
    return audioScriptBase() + "assets/audio/" + file;
  }

  function localEnUrl(text) {
    text = String(text || "").trim();
    if (!text) return null;
    var map = w.MM_EN_AUDIO_MAP || {};
    var file = map[text];
    if (!file) return null;
    return audioScriptBase() + "assets/audio-en/" + file;
  }

  function playLocalUrl(url, gen, onok, onfail) {
    if (isStale(gen) || !url) {
      if (onfail) onfail();
      return;
    }
    var settled = false;
    var watchdog = null;
    function clearWatch() {
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
    }
    function doneOk() {
      if (settled || isStale(gen)) return;
      settled = true;
      clearWatch();
      currentAudio = null;
      audioUnlocked = true;
      if (onok) onok();
    }
    function doneFail() {
      if (settled || isStale(gen)) return;
      settled = true;
      clearWatch();
      currentAudio = null;
      if (onfail) onfail();
    }
    var a = ensureAudio();
    try {
      a.onended = null;
      a.onerror = null;
      a.pause();
    } catch (e) {}
    a.muted = false;
    a.playbackRate = 1;
    a.volume = 1;
    a.src = url;
    currentAudio = a;
    a.onended = doneOk;
    a.onerror = doneFail;
    watchdog = setTimeout(function () {
      if (settled || isStale(gen)) return;
      try {
        if (!a.paused && a.currentTime > 0.02) return;
        if (a.readyState >= 2 && !a.paused) return;
        if (a.paused && (!a.currentTime || a.currentTime < 0.05)) doneFail();
      } catch (e2) {
        doneFail();
      }
    }, 4000);
    var playPromise = a.play();
    if (playPromise && playPromise.then) {
      playPromise.then(function () {
        audioUnlocked = true;
      }).catch(doneFail);
    } else if (playPromise && playPromise.catch) {
      playPromise.catch(doneFail);
    }
  }

  /** English-only local/network playback on dedicated Audio element. */
  function playEnUrl(url, gen, onok, onfail) {
    if (isStale(gen) || !url) {
      if (onfail) onfail();
      return;
    }
    var settled = false;
    var watchdog = null;
    function clearWatch() {
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
    }
    function doneOk() {
      if (settled || isStale(gen)) return;
      settled = true;
      clearWatch();
      currentEnAudio = null;
      audioUnlocked = true;
      if (onok) onok();
    }
    function doneFail() {
      if (settled || isStale(gen)) return;
      settled = true;
      clearWatch();
      currentEnAudio = null;
      if (onfail) onfail();
    }
    var a = ensureEnAudio();
    try {
      a.onended = null;
      a.onerror = null;
      a.pause();
    } catch (e) {}
    a.muted = false;
    a.playbackRate = 1;
    a.volume = 1;
    a.src = url;
    currentEnAudio = a;
    a.onended = doneOk;
    a.onerror = doneFail;
    watchdog = setTimeout(function () {
      if (settled || isStale(gen)) return;
      try {
        if (!a.paused && a.currentTime > 0.02) return;
        if (a.readyState >= 2 && !a.paused) return;
        if (a.paused && (!a.currentTime || a.currentTime < 0.05)) doneFail();
      } catch (e2) {
        doneFail();
      }
    }, 4000);
    var playPromise = a.play();
    if (playPromise && playPromise.then) {
      playPromise.then(function () {
        audioUnlocked = true;
      }).catch(doneFail);
    } else if (playPromise && playPromise.catch) {
      playPromise.catch(doneFail);
    }
  }

  /**
   * English audio: local EN MP3 first (same-origin), then Google TTS on enAudio,
   * then speechSynthesis. Never uses the Myanmar sharedAudio element.
   */
  function playEnglish(text, onend) {
    var gen = speakGen;
    loadVoices();
    text = String(text || "").trim();
    if (!text) {
      if (onend) onend();
      return;
    }
    function finishOk() {
      if (!isStale(gen) && onend) onend();
    }
    function trySynth() {
      if (isStale(gen)) return;
      if (!w.speechSynthesis) {
        if (onend) onend();
        return;
      }
      /* Chrome drops speak() if called in the same tick as cancel(). */
      setTimeout(function () {
        if (isStale(gen)) return;
        speakSynth(text, "en-US", englishVoice, gen, onend);
      }, 40);
    }
    function tryGoogle() {
      if (isStale(gen)) return;
      var chunks = chunkForTts(text, 180);
      var i = 0;
      function next() {
        if (isStale(gen)) return;
        if (i >= chunks.length) {
          finishOk();
          return;
        }
        var url = googleTtsUrl(chunks[i++], "en", 0);
        playEnUrl(url, gen, next, function () {
          if (isStale(gen)) return;
          if (i === 1) {
            playEnUrl(googleTtsUrl(chunks[0], "en", 1), gen, finishOk, trySynth);
          } else {
            trySynth();
          }
        });
      }
      next();
    }
    var local = localEnUrl(text);
    if (local) {
      playEnUrl(local, gen, finishOk, tryGoogle);
      return;
    }
    tryGoogle();
  }

  /** Warm browser HTTP cache so the next play() starts faster. */
  var prefetchDone = {};
  function prefetchMm(text) {
    text = String(text || "").trim();
    if (!text || prefetchDone[text]) return;
    prefetchDone[text] = true;
    try {
      var local = localMmUrl(text);
      var a = new Audio();
      a.preload = "auto";
      a.src = local || googleTtsUrl(text, "my", 0);
    } catch (e) {}
  }

  function prefetchPageMm() {
    try {
      var nodes = document.querySelectorAll("[data-mm], .speak-word-mm, .wb-text-mm");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var mm = el.getAttribute("data-mm") || (el.textContent || "").trim();
        if (mm && mm.length < 220) prefetchMm(mm);
      }
    } catch (e) {}
  }

  /** Google TTS rejects long queries — split Myanmar by punctuation / length. */
  function chunkForTts(text, maxLen) {
    text = String(text || "").trim();
    if (!text) return [];
    maxLen = maxLen || 180;
    if (text.length <= maxLen) return [text];
    var parts = [];
    var buf = "";
    var tokens = text.split(/([။၊.!?\n]+|\s+)/);
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (!t) continue;
      if ((buf + t).length > maxLen && buf) {
        parts.push(buf);
        buf = t;
      } else {
        buf += t;
      }
    }
    if (buf) parts.push(buf);
    var out = [];
    for (var j = 0; j < parts.length; j++) {
      var p = parts[j].trim();
      if (!p) continue;
      while (p.length > maxLen) {
        out.push(p.slice(0, maxLen));
        p = p.slice(maxLen);
      }
      if (p) out.push(p);
    }
    return out.length ? out : [text.slice(0, maxLen)];
  }

  function playGoogleTts(text, lang, mirror, gen, onok, onfail) {
    if (isStale(gen)) return;
    var settled = false;
    var watchdog = null;
    function clearWatch() {
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
    }
    function doneOk() {
      if (settled || isStale(gen)) return;
      settled = true;
      clearWatch();
      currentAudio = null;
      audioUnlocked = true;
      if (onok) onok();
    }
    function doneFail() {
      if (settled || isStale(gen)) return;
      settled = true;
      clearWatch();
      currentAudio = null;
      if (mirror < 1) playGoogleTts(text, lang, mirror + 1, gen, onok, onfail);
      else if (onfail) onfail();
    }
    var a = ensureAudio();
    try {
      a.onended = null;
      a.onerror = null;
      a.pause();
    } catch (e) {}
    a.muted = false;
    a.playbackRate = 1;
    a.volume = 1;
    var url = googleTtsUrl(text, lang, mirror);
    /* Do not removeAttribute("src") — that re-locks HTMLAudio on iOS Safari. */
    a.src = url;
    currentAudio = a;
    a.onended = doneOk;
    a.onerror = doneFail;
    resumeSynth();
    watchdog = setTimeout(function () {
      if (settled || isStale(gen)) return;
      try {
        if (a.paused && (!a.currentTime || a.currentTime < 0.05)) doneFail();
      } catch (e2) {
        doneFail();
      }
    }, 2500);
    var playPromise = a.play();
    if (playPromise && playPromise.then) {
      playPromise.then(function () {
        audioUnlocked = true;
      }).catch(doneFail);
    } else if (playPromise && playPromise.catch) {
      playPromise.catch(doneFail);
    }
  }

  function playGoogleChunks(chunks, lang, gen, onok, onfail) {
    var i = 0;
    function next() {
      if (isStale(gen)) return;
      if (i >= chunks.length) {
        if (onok) onok();
        return;
      }
      playGoogleTts(chunks[i++], lang, 0, gen, next, onfail);
    }
    next();
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

  /**
   * Myanmar audio: local MP3 first (same-origin, works in app iframes),
   * then Google TTS, then device Myanmar voice if available.
   */
  function playMyanmar(text, hint, onend) {
    var gen = speakGen;
    loadVoices();
    text = String(text || "").trim();
    if (!text) {
      if (onend) onend();
      return;
    }
    function finishOk() {
      if (!isStale(gen) && onend) onend();
    }
    function tryGoogle() {
      if (isStale(gen)) return;
      var chunks = chunkForTts(text, 180);
      playGoogleChunks(chunks, "my", gen, finishOk, function () {
        if (isStale(gen)) return;
        if (chunks.length === 1) {
          playGoogleTts(chunks[0], "my-MM", 0, gen, finishOk, function () {
            if (isStale(gen)) return;
            if (myanmarVoice) speakSynth(text, "my-MM", myanmarVoice, gen, onend);
            else if (onend) onend();
          });
        } else if (myanmarVoice) {
          speakSynth(text, "my-MM", myanmarVoice, gen, onend);
        } else if (onend) {
          onend();
        }
      });
    }
    var local = localMmUrl(text);
    if (local) {
      playLocalUrl(local, gen, finishOk, tryGoogle);
      return;
    }
    tryGoogle();
  }

  w.MMAudio = {
    init: function () {
      loadVoices();
      if (w.speechSynthesis) {
        w.speechSynthesis.onvoiceschanged = loadVoices;
        setTimeout(loadVoices, 300);
        setTimeout(loadVoices, 1200);
      }
      function onGesture(e) {
        unlockMedia();
      }
      document.addEventListener("pointerdown", onGesture, true);
      document.addEventListener("touchstart", onGesture, true);
      setTimeout(prefetchPageMm, 80);
      setTimeout(prefetchPageMm, 600);
      document.addEventListener("pointerenter", function (e) {
        var btn = e.target && e.target.closest && e.target.closest(".speak-btn-mm, [data-mm].btn-speak, .wb-speak-btn.speak-btn-mm");
        if (!btn) return;
        var card = btn.closest(".word-card, .wb-sentence-pair, .wb-line") || btn;
        var mm = btn.getAttribute("data-mm") || (card.getAttribute && card.getAttribute("data-mm"));
        if (!mm) {
          var label = (btn.closest(".speak-btn-mm") || btn).querySelector(".speak-word-mm, .wb-text-mm");
          mm = label && label.textContent;
        }
        if (mm) prefetchMm(mm.trim());
      }, true);
    },

    stop: stopAll,

    unlock: unlockMedia,

    /** Myanmar — local MP3 preferred; keep play() inside user gesture */
    speakMyanmar: function (text, hint, onend) {
      if (!text) { if (onend) onend(); return; }
      unlockMedia();
      stopAll();
      ensureAudio();
      resumeSynth();
      playMyanmar(text, hint, onend);
    },

    /** English — separate Audio element + local EN MP3s; does not touch MM pipeline */
    speakEnglish: function (text, onend) {
      if (!text) { if (onend) onend(); return; }
      unlockMedia();
      stopAll();
      ensureEnAudio();
      playEnglish(text, onend);
    },

    prefetch: prefetchMm,
    prefetchPage: prefetchPageMm,

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
      var en = btn.getAttribute("data-en") || card.getAttribute("data-en");
      var mm = btn.getAttribute("data-mm") || card.getAttribute("data-mm");
      var hint = btn.getAttribute("data-hint") || card.getAttribute("data-hint");
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
    if (!w.MMAudio) return;
    var en = btn.getAttribute("data-en");
    var mm = btn.getAttribute("data-mm");
    if (!en || !mm) {
      var pair = btn.closest(".wb-sentence-pair");
      if (pair) {
        var enEl = pair.querySelector("[data-en]");
        var mmEl = pair.querySelector("[data-mm]");
        en = en || (enEl && enEl.getAttribute("data-en"));
        mm = mm || (mmEl && mmEl.getAttribute("data-mm"));
      }
    }
    var row = btn.closest(".wb-line") || btn.parentElement;
    if (row) row.querySelectorAll(".btn-speak").forEach(function (b) { b.classList.remove("pressed"); });
    btn.classList.add("pressed");
    if (lang === "en") {
      if (en) MMAudio.speakEnglish(en);
    } else if (mm) {
      MMAudio.speakMyanmar(mm, null);
    }
  };

  /* legacy */
  w.tapWord = function (el, chapterId) {
    var mmBtn = el.querySelector(".speak-btn-mm");
    if (mmBtn) tapMm(mmBtn, chapterId);
  };

  var lastPointerSpeak = 0;
  function speakFromPointer(btn) {
    var now = Date.now();
    if (now - lastPointerSpeak < 320) return true;
    lastPointerSpeak = now;
    var oc = btn.getAttribute("onclick") || "";
    var mMm = oc.match(/tapMm\s*\(\s*this\s*,\s*['"]([^'"]*)['"]\s*\)/);
    if (mMm) { tapMm(btn, mMm[1]); return true; }
    var mEn = oc.match(/tapEn\s*\(\s*this\s*,\s*['"]([^'"]*)['"]\s*\)/);
    if (mEn) { tapEn(btn, mEn[1]); return true; }
    var mPh = oc.match(/tapPhrase\s*\(\s*this\s*,\s*['"]([^'"]*)['"]\s*\)/);
    if (mPh) { tapPhrase(btn, mPh[1]); return true; }
    if (btn.classList.contains("speak-btn-mm")) {
      tapMm(btn, null);
      return true;
    }
    if (btn.classList.contains("speak-btn-en")) {
      tapEn(btn, null);
      return true;
    }
    if (btn.classList.contains("speak-btn-mm") || (btn.getAttribute("data-mm") && btn.classList.contains("btn-speak"))) {
      tapPhrase(btn, "mm");
      return true;
    }
    if (btn.getAttribute("data-en") && btn.classList.contains("btn-speak")) {
      tapPhrase(btn, "en");
      return true;
    }
    return false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { MMAudio.init(); });
  } else {
    MMAudio.init();
  }

  /* Start audio on pointerdown so Google TTS stays inside the iOS gesture window
     (onclick alone is often too late after touchend → click). */
  document.addEventListener("pointerdown", function (e) {
    var t = eventEl(e);
    if (!t || !t.closest) return;
    var btn = t.closest(".speak-btn, .wb-speak-btn, .btn-speak, #hearBtn");
    if (!btn || btn.classList.contains("hear-replay-btn")) return;
    if (btn.id === "hearBtn") {
      /* Congrats page — keep gesture chain for EN + MM */
      warmSynth();
      unlockMedia();
      return;
    }
    if (speakFromPointer(btn)) {
      /* Swallow the synthetic click that would double-fire speak */
      btn.addEventListener("click", function swallow(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        btn.removeEventListener("click", swallow, true);
      }, true);
    }
  }, true);
})(window);
