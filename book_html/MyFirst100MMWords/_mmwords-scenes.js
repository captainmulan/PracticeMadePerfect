/* Chapter picture slots — embedded PNG only (no SVG fallback on main pages) */
(function (w) {
  w.MMScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      var chapterId = opts.chapterId || "chapter";
      var slot = opts.slot || "seg1";
      var title = opts.title || chapterId;
      container.className = "scene-card scene-card-hero scene-static chapter-photo-hero";

      if (w.MMChapterImage) {
        var html = w.MMChapterImage.render(chapterId, slot, title);
        if (html) {
          container.innerHTML = html;
          return;
        }
      }
      container.innerHTML =
        '<div class="scene-placeholder">Picture loading — add assets/' +
        chapterId +
        "-" +
        slot +
        '.png</div>';
    }
  };
})(window);
