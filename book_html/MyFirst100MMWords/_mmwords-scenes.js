/* Chapter picture slots — WebP → JPG → PNG from assets/ (no embed packs) */
(function (w) {
  function assetCandidates(chapterId, slot) {
    var base = "assets/" + chapterId + "-" + slot;
    return [base + ".webp", base + ".jpg", base + ".png"];
  }

  function fallbackAttrs(candidates) {
    if (candidates.length < 2) return "";
    return (
      ' onerror="var f=(this.dataset.fallbacks||\'\').split(\'|\').filter(Boolean);if(f.length){this.src=f.shift();this.dataset.fallbacks=f.join(\'|\');}else{this.onerror=null;}" data-fallbacks="' +
      candidates.slice(1).join("|") +
      '"'
    );
  }

  function renderImg(id, slot, title, opts) {
    opts = opts || {};
    var alt = (title || id) + " — " + slot;
    var loading = opts.eager ? "eager" : "lazy";
    var priority = opts.eager ? ' fetchpriority="high"' : "";
    var candidates = assetCandidates(id, slot);
    return (
      '<img class="chapter-hero-img" src="' +
      candidates[0] +
      '" alt="' +
      String(alt).replace(/"/g, "&quot;") +
      '" loading="' +
      loading +
      '" decoding="async"' +
      priority +
      fallbackAttrs(candidates) +
      ">"
    );
  }

  w.MMChapterImage = {
    getUri: function (id, slot) {
      return assetCandidates(id, slot)[0];
    },
    render: function (id, slot, title, opts) {
      return renderImg(id, slot, title, opts);
    }
  };

  w.MMScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      var chapterId = opts.chapterId || "chapter";
      var slot = opts.slot || "seg1";
      var title = opts.title || chapterId;
      container.className = "scene-card scene-card-hero scene-static chapter-photo-hero";
      container.innerHTML = renderImg(chapterId, slot, title, { eager: !!opts.eager });
    }
  };
})(window);
