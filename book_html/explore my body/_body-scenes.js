/* Chapter scene slots — load PNG/JPG from assets/ (Ocean Adventure pattern) */
(function (w) {
  function assetCandidates(chapterId, slot) {
    var alt = slot.replace(/^explain-/, "exp-");
    var bases = ["assets/" + chapterId + "-" + slot, "assets/" + chapterId + "-" + alt];
    var out = [];
    bases.forEach(function (base) {
      out.push(base + ".jpg", base + ".png");
    });
    return out;
  }

  w.BodyChapterImage = {
    render: function (id, slot, title, opts) {
      opts = opts || {};
      var alt = (title || id) + " — " + slot;
      var loading = opts.eager ? "eager" : "lazy";
      var priority = opts.eager ? ' fetchpriority="high"' : "";
      var candidates = assetCandidates(id, slot);
      var rest = candidates.slice(1);
      var fallback = rest.length
        ? ' onerror="var n=this.dataset.n?+this.dataset.n+1:1;if(window.__bodyImgFallback&&window.__bodyImgFallback(this,n))return;this.onerror=null;" data-n="0"'
        : "";
      w.__bodyImgFallback = function (img, n) {
        if (n >= candidates.length) return false;
        img.dataset.n = String(n);
        img.src = candidates[n];
        return true;
      };
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

  w.BodyScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      container.className = "scene-card scene-card-hero chapter-photo-hero";
      container.innerHTML = w.BodyChapterImage.render(opts.chapterId, opts.slot || "main-1", opts.title || opts.chapterId, {
        eager: !!opts.eager
      });
    }
  };
})(window);
