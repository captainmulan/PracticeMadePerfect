/* Chapter scene slots — load PNG/JPG from assets/ (Ocean Adventure pattern) */
(function (w) {
  function assetCandidates(chapterId, slot) {
    var base = "assets/" + chapterId + "-" + slot;
    return [base + ".jpg", base + ".png"];
  }

  w.DinoChapterImage = {
    getUri: function (id, slot) {
      return assetCandidates(id, slot)[0];
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

  w.DinoScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      container.className = "scene-card scene-card-hero chapter-photo-hero";
      container.innerHTML = w.DinoChapterImage.render(opts.chapterId, opts.slot || "main-1", opts.title, {
        eager: !!opts.eager
      });
    }
  };
})(window);
