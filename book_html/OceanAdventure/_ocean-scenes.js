/* Chapter scene slots — load PNG assets directly (no multi-MB JS embeds) */
(function (w) {
  function assetUrl(chapterId, slot) {
    return "assets/" + chapterId + "-" + slot + ".png";
  }

  w.OceanChapterImage = {
    getUri: function (id, slot) {
      return assetUrl(id, slot);
    },
    render: function (id, slot, title, opts) {
      opts = opts || {};
      var alt = (title || id) + " — " + slot;
      var loading = opts.eager ? "eager" : "lazy";
      var priority = opts.eager ? ' fetchpriority="high"' : "";
      return (
        '<img class="chapter-hero-img" src="' +
        assetUrl(id, slot) +
        '" alt="' +
        String(alt).replace(/"/g, "&quot;") +
        '" loading="' +
        loading +
        '" decoding="async"' +
        priority +
        ">"
      );
    }
  };

  w.OceanScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      var chapterId = opts.chapterId;
      var slot = opts.slot || "main-1";
      var title = opts.title || chapterId;
      container.className = "scene-card scene-card-hero chapter-photo-hero";
      container.innerHTML = w.OceanChapterImage.render(chapterId, slot, title, {
        eager: !!opts.eager
      });
    }
  };
})(window);
