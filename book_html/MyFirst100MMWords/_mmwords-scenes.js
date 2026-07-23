/* Interactive chapter scenes — tap hotspots, then scroll to words */
(function (w) {
  var SCENE_LAYOUTS = {
    family: [
      { en: "Grandmother", left: 10, top: 18, z: 2 },
      { en: "Grandfather", left: 78, top: 18, z: 2 },
      { en: "Father", left: 38, top: 32, z: 3 },
      { en: "Mother", left: 54, top: 38, z: 3 },
      { en: "Aunt", left: 6, top: 42, z: 2 },
      { en: "Uncle", left: 84, top: 42, z: 2 },
      { en: "Sister", left: 22, top: 58, z: 4 },
      { en: "Brother", left: 68, top: 58, z: 4 },
      { en: "Cousin", left: 44, top: 52, z: 3 },
      { en: "Baby", left: 48, top: 72, z: 5 },
      { en: "Parents", left: 46, top: 28, z: 1 },
      { en: "Family", left: 42, top: 82, z: 1 }
    ],
    food: [
      { en: "Rice", left: 48, top: 55, z: 3 },
      { en: "Soup", left: 28, top: 48, z: 2 },
      { en: "Fish", left: 68, top: 50, z: 2 },
      { en: "Tea", left: 72, top: 28, z: 2 },
      { en: "Apple", left: 18, top: 30, z: 2 },
      { en: "Banana", left: 32, top: 22, z: 2 },
      { en: "Mango", left: 58, top: 22, z: 2 },
      { en: "Noodle", left: 38, top: 62, z: 3 },
      { en: "Egg", left: 58, top: 65, z: 2 },
      { en: "Bread", left: 12, top: 55, z: 2 },
      { en: "Water", left: 82, top: 62, z: 2 },
      { en: "Milk", left: 8, top: 38, z: 2 }
    ],
    animals: [
      { en: "Elephant", left: 50, top: 45, z: 3 },
      { en: "Tiger", left: 22, top: 50, z: 2 },
      { en: "Monkey", left: 72, top: 35, z: 2 },
      { en: "Bird", left: 78, top: 18, z: 2 },
      { en: "Cat", left: 18, top: 62, z: 2 },
      { en: "Dog", left: 38, top: 68, z: 2 },
      { en: "Cow", left: 62, top: 62, z: 2 },
      { en: "Horse", left: 8, top: 42, z: 2 },
      { en: "Duck", left: 85, top: 55, z: 2 },
      { en: "Chicken", left: 55, top: 22, z: 2 },
      { en: "Snake", left: 28, top: 28, z: 1 },
      { en: "Butterfly", left: 65, top: 12, z: 2 }
    ]
  };

  var SCENE_META = {
    family: { emoji: "🏠", bg: "linear-gradient(180deg,#e8f4fd 0%,#dbeafe 50%,#f0fdf4 100%)", label: "Tap someone in Aye's family" },
    food: { emoji: "🍽️", bg: "linear-gradient(180deg,#fff7ed 0%,#ffedd5 50%,#fef3c7 100%)", label: "Tap food on the table" },
    animals: { emoji: "🌳", bg: "linear-gradient(180deg,#ecfdf5 0%,#d1fae5 50%,#a7f3d0 100%)", label: "Tap an animal in the park" },
    colors: { emoji: "🎨", bg: "linear-gradient(135deg,#fef2f2,#fef9c3,#dbeafe,#f3e8ff)", label: "Tap a color splash" },
    numbers: { emoji: "🔢", bg: "linear-gradient(180deg,#eff6ff,#e0e7ff)", label: "Tap a number" },
    body: { emoji: "🧍", bg: "linear-gradient(180deg,#fdf2f8,#fce7f3)", label: "Tap a body part" },
    home: { emoji: "🏡", bg: "linear-gradient(180deg,#f5f5f4,#e7e5e4)", label: "Tap something in the house" },
    school: { emoji: "🏫", bg: "linear-gradient(180deg,#eff6ff,#dbeafe)", label: "Tap something at school" },
    feelings: { emoji: "💭", bg: "linear-gradient(180deg,#faf5ff,#ede9fe)", label: "Tap a feeling" },
    festivals: { emoji: "🎊", bg: "linear-gradient(180deg,#fff1f2,#fef3c7,#fce7f3)", label: "Tap festival fun" }
  };

  function findWord(words, en) {
    for (var i = 0; i < words.length; i++) if (words[i].en === en) return words[i];
    return null;
  }

  function scrollToWord(en) {
    var el = document.getElementById("word-" + en.toLowerCase().replace(/\s+/g, "-"));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight");
      setTimeout(function () { el.classList.remove("highlight"); }, 1600);
    }
  }

  function showBubble(container, word, x, y) {
    var old = container.querySelector(".scene-bubble");
    if (old) old.remove();
    var b = document.createElement("div");
    b.className = "scene-bubble";
    b.style.left = x + "%";
    b.style.top = y + "%";
    b.innerHTML = "<strong>" + word.en + "</strong><span class=\"bubble-mm\">" + word.mm + "</span>";
    container.appendChild(b);
    if (w.MMAudio) w.MMAudio.speakMyanmar(word.mm, word.hint);
    setTimeout(function () { if (b.parentNode) b.remove(); }, 2200);
  }

  function autoLayout(words, chapterId) {
    var spots = SCENE_LAYOUTS[chapterId];
    if (spots) return spots;
    var n = words.length;
    var out = [];
    for (var i = 0; i < n; i++) {
      var angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      var rx = 38, ry = 32;
    out.push({
        en: words[i].en,
        left: 50 + Math.cos(angle) * rx,
        top: 48 + Math.sin(angle) * ry,
        z: 2 + (i % 3)
      });
    }
    return out;
  }

  w.MMScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container || !opts.words) return;
      var chapterId = opts.chapterId || "chapter";
      var meta = SCENE_META[chapterId] || { emoji: "✨", bg: "linear-gradient(180deg,#f0f4f8,#e2e8f0)", label: "Tap to explore" };
      var spots = autoLayout(opts.words, chapterId);
      var wordMap = {};
      opts.words.forEach(function (wrd) { wordMap[wrd.en] = wrd; });

      container.style.background = meta.bg;
      container.innerHTML =
        "<div class=\"scene-bg-icon\">" + meta.emoji + "</div>" +
        "<div class=\"scene-title\">" + meta.label + "</div>";

      spots.forEach(function (spot) {
        var word = wordMap[spot.en];
        if (!word) return;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "scene-hotspot";
        btn.style.left = spot.left + "%";
        btn.style.top = spot.top + "%";
        btn.style.zIndex = spot.z || 2;
        btn.setAttribute("aria-label", word.en);
        btn.innerHTML = "<span class=\"hotspot-emoji\">" + word.emoji + "</span><span class=\"hotspot-label\">" + word.en + "</span>";
        btn.onclick = function () {
          container.querySelectorAll(".scene-hotspot").forEach(function (h) { h.classList.remove("active"); });
          btn.classList.add("active");
          showBubble(container, word, spot.left, Math.max(8, spot.top - 12));
          scrollToWord(word.en);
        };
        container.appendChild(btn);
      });
    }
  };
})(window);
