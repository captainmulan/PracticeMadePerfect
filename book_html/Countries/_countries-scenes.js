/* Chapter scene slots — load WebP/JPG/PNG from assets/ (no multi-MB JS embeds) */
(function (w) {
  function assetCandidates(chapterId, slot) {
    var base = "assets/" + chapterId + "-" + slot;
    return [base + ".webp", base + ".jpg", base + ".png"];
  }

  function fallbackAttrs(candidates) {
    if (candidates.length < 2) {
      return "";
    }
    return (
      ' onerror="var f=(this.dataset.fallbacks||\'\').split(\'|\').filter(Boolean);if(f.length){this.src=f.shift();this.dataset.fallbacks=f.join(\'|\');}else{this.onerror=null;}" data-fallbacks="' +
      candidates.slice(1).join("|") +
      '"'
    );
  }

  function renderImg(chapterId, slot, title, opts) {
    opts = opts || {};
    var alt = (title || chapterId) + " — " + slot;
    var loading = opts.eager ? "eager" : "lazy";
    var priority = opts.eager ? ' fetchpriority="high"' : "";
    var candidates = assetCandidates(chapterId, slot);
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

  w.CountriesChapterImage = {
    getUri: function (id, slot) {
      return assetCandidates(id, slot)[0];
    },
    applySrc: function (img, id, slot) {
      if (!img) return;
      var candidates = assetCandidates(id, slot);
      img.src = candidates[0];
      img.dataset.fallbacks = candidates.slice(1).join("|");
      img.onerror = function () {
        var f = (this.dataset.fallbacks || "").split("|").filter(Boolean);
        if (f.length) {
          this.src = f.shift();
          this.dataset.fallbacks = f.join("|");
        } else {
          this.onerror = null;
        }
      };
    },
    render: function (id, slot, title, opts) {
      return renderImg(id, slot, title, opts);
    }
  };

  w.CountriesScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      var chapterId = opts.chapterId;
      var slot = opts.slot || "main-1";
      var title = opts.title || chapterId;
      container.className = "scene-card scene-card-hero chapter-photo-hero";
      container.innerHTML = renderImg(chapterId, slot, title, {
        eager: !!opts.eager
      });
    }
  };
})(window);
