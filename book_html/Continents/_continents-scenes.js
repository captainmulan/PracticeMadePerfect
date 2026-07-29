/* Chapter scene slots — load PNG/JPG assets directly (Ocean style, no multi-MB embeds) */
(function (w) {
  function assetCandidates(chapterId, slot) {
    var base = "assets/" + chapterId + "-" + slot;
    return [base + ".png", base + ".jpg"];
  }

  function assetUrl(chapterId, slot) {
    return assetCandidates(chapterId, slot)[0];
  }

  w.ContinentChapterImage = {
    getUri: function (id, slot) {
      return assetUrl(id, slot);
    },
    render: function (id, slot, title, opts) {
      opts = opts || {};
      var alt = (title || id) + " — " + slot;
      var loading = opts.eager ? "eager" : "lazy";
      var priority = opts.eager ? ' fetchpriority="high"' : "";
      var candidates = assetCandidates(id, slot);
      var fallback = candidates[1]
        ? ' onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback=\'\';}else{this.onerror=null;}" data-fallback="' +
          candidates[1] +
          '"'
        : "";
      return (
        '<img class="chapter-hero-img" src="' +
        candidates[0] +
        '" alt="' +
        String(alt).replace(/"/g, "&quot;") +
        '" loading="' +
        loading +
        '" decoding="async"' +
        priority +
        fallback +
        ">"
      );
    }
  };

  w.ContinentScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      var chapterId = opts.chapterId;
      var slot = opts.slot || "main-1";
      var title = opts.title || chapterId;
      container.className = "scene-card scene-card-hero chapter-photo-hero";
      container.innerHTML = w.ContinentChapterImage.render(chapterId, slot, title, {
        eager: !!opts.eager
      });
    }
  };
})(window);
