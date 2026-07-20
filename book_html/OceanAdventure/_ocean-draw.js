(function (w) {
  var FACE_RE = /🐠|🐟|🐡|🦈|🐙|🦑|🐢|🐬|🐳|🦭|🐋|🦐|🐊|🤿|🐋|🦞|🐬/;
  w.OceanDraw = {
    shouldFace: function (emoji) {
      return FACE_RE.test(emoji || '');
    },
    facingLeft: function (vx, min) {
      return vx < (min != null ? min : -0.15);
    },
    drawEmoji: function (ctx, emoji, x, y, size, font, flipX) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.font = 'bold ' + size + 'px ' + (font || '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      if (flipX && FACE_RE.test(emoji)) {
        ctx.translate(x, y);
        ctx.scale(-1, 1);
        ctx.fillText(emoji, 0, 0);
      } else {
        ctx.fillText(emoji, x, y);
      }
      ctx.restore();
    }
  };
})(window);
