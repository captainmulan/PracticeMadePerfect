/* Chapter scene slots — WebP → JPG → PNG; also tries exp-* alias for explain-* */
(function (w) {
  function assetCandidates(chapterId, slot) {
    var alt = String(slot).replace(/^explain-/, "exp-");
    var bases = ["assets/" + chapterId + "-" + slot];
    if (alt !== slot) {
      bases.push("assets/" + chapterId + "-" + alt);
    }
    var out = [];
    bases.forEach(function (base) {
      out.push(base + ".webp", base + ".jpg", base + ".png");
    });
    return out;
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

  w.BodyChapterImage = {
    getUri: function (id, slot) {
      return assetCandidates(id, slot)[0];
    },
    render: function (id, slot, title, opts) {
      return renderImg(id, slot, title, opts);
    }
  };

  w.BodyScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      container.className = "scene-card scene-card-hero chapter-photo-hero";
      container.innerHTML = renderImg(opts.chapterId, opts.slot || "main-1", opts.title || opts.chapterId, {
        eager: !!opts.eager
      });
    }
  };
})(window);
