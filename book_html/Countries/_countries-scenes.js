/* Chapter scene slots — embedded PNG/JPG */
(function (w) {
  w.CountriesScene = {
    boot: function (opts) {
      var container = document.getElementById(opts.containerId);
      if (!container) return;
      var chapterId = opts.chapterId;
      var slot = opts.slot || "main-1";
      var title = opts.title || chapterId;
      container.className = "scene-card scene-card-hero chapter-photo-hero";

      var html = null;
      if (w.CountriesChapterImage) {
        html = w.CountriesChapterImage.render(chapterId, slot, title);
      }
      if (html) {
        container.innerHTML = html;
      } else {
        container.innerHTML = '<div class="scene-placeholder">' + title + " — " + slot + "</div>";
      }
    }
  };
})(window);
