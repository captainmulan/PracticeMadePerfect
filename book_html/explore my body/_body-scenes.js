(function (w) {
  w.BodyScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      var chapterId = opts.chapterId;
      var slot = opts.slot || "main-1";
      var title = opts.title || chapterId;
      container.className = "scene-card scene-card-hero scene-static chapter-photo-hero";
      var png = w.BodyChapterImage && w.BodyChapterImage.render(chapterId, slot, title);
      if (png) {
        container.innerHTML = png;
      } else {
        container.innerHTML = '<div class="scene-placeholder">' + (opts.placeholder || "Picture loading…") + "</div>";
      }
    }
  };
})(window);
