/** Shared CSS/JS blocks for Ocean Adventure UI patch scripts. */

export const AUDIT_MARKER = "/* ocean-ui-audit-overrides */";

export const READING_PAGE_CSS = `
body.reading-page {
  overflow-x: hidden;
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100%;
  -webkit-overflow-scrolling: touch;
}
body.reading-page .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block;
}`;

export const BIG_PLANET_PAGE_CSS = `
/* big-ocean-first-view */
body.big-planet-page {
  overflow-x: hidden;
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100%;
  -webkit-overflow-scrolling: touch;
}
body.big-planet-page .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block;
  padding: 8px 10px 32px;
}
body.big-planet-page .header {
  margin-bottom: 8px;
}
body.big-planet-page .header h1 {
  font-size: 24px;
  margin-bottom: 4px;
}
body.big-planet-page .ocean-display {
  margin: 10px 0 8px;
  height: min(72vw, calc(100svh - 220px));
  min-height: min(56vw, 240px);
  max-height: min(78vw, 320px);
}
body.big-planet-page .scroll-cue {
  text-align: center;
  color: #80deea;
  font-size: 13px;
  margin: 6px 0 10px;
  opacity: 0.9;
}
body.big-planet-page .card {
  margin-bottom: 10px;
}
body.big-planet-page .nav-hint {
  margin-top: 8px;
  padding-bottom: 8px;
  font-size: 12px;
  line-height: 1.45;
}`;

export const AUDIT_OVERRIDE_CSS = `
${AUDIT_MARKER}
body.reading-page,
body.reading-page:has(.container),
body.reading-page:has(.quiz-card),
body.reading-page:has(.character-grid) {
  overflow-y: auto !important;
  height: auto !important;
}
body.reading-page .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block;
}
body.reading-page:has(.character-grid) .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  justify-content: flex-start;
}
@media (max-width: 639px) {
  body.big-planet-page .ocean-display {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: min(78vw, calc(100svh - 220px)) !important;
    min-height: min(56vw, 220px) !important;
    box-sizing: border-box !important;
  }
  body.big-planet-page .container {
    overflow-x: hidden !important;
    max-width: 100% !important;
  }
  body.big-planet-page .planet-game .game-canvas {
    height: min(48vh, 400px) !important;
    min-height: min(40vh, 280px) !important;
    max-height: min(52vh, 420px) !important;
  }
}
@media (min-width: 640px) {
  body.big-planet-page .ocean-display {
    max-height: min(92vw, calc(100svh - 156px)) !important;
    min-height: min(56vw, calc(100svh - 200px)) !important;
  }
}
body.big-planet-page .planet-game .game-canvas {
  width: 100% !important;
  height: min(50vh, 440px) !important;
  min-height: min(42vh, 300px) !important;
  max-height: min(56vh, 480px) !important;
}
body.big-planet-page .planet-game {
  margin-bottom: 8px !important;
}
body.big-game-page:has(.game-shell) {
  overflow: hidden !important;
  height: 100% !important;
  min-height: 100% !important;
  max-height: 100% !important;
}
html:has(body.big-game-page) {
  height: 100% !important;
  min-height: 100% !important;
  overflow: hidden !important;
}
body.big-game-page:has(.game-shell) .game-shell {
  min-height: 100% !important;
  height: 100% !important;
  max-height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}
body.big-game-page:has(.game-shell) .stage-wrap {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  align-items: center !important;
  justify-content: center !important;
}
body.big-game-page:has(.game-shell) .game-stage {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: none !important;
  aspect-ratio: unset !important;
  margin: 0 !important;
}
@media (max-width: 639px) {
  body:has(.planet-game) .game-canvas {
    height: min(48vh, 400px) !important;
    min-height: min(40vh, 280px) !important;
    max-height: min(52vh, 420px) !important;
  }
  .planet-game {
    padding: 10px !important;
    margin-top: 10px !important;
  }
  .planet-game h2 {
    margin-bottom: 8px !important;
    font-size: 17px !important;
  }
  .touch-controls {
    margin-top: 6px;
    gap: 6px;
  }
  .touch-btn {
    min-height: 48px;
    font-size: 18px;
  }
}`;

export const LOAD_PLAYER_IIFE = `(function loadPlayerInfo() {
  const userName = OceanPlayer.getUserName() || 'Explorer';
  const userCharacter = OceanPlayer.getCharacter() || '🤿';
  const playerName2 = document.getElementById('playerName2');
  const playerIcon = document.getElementById('playerIcon');
  const podiumChar = document.getElementById('podium-char-1');
  const podiumName = document.getElementById('podium-name-1');
  if (playerName2) playerName2.textContent = userName;
  if (playerIcon) playerIcon.textContent = userCharacter;
  if (podiumChar) podiumChar.textContent = userCharacter;
  if (podiumName) podiumName.textContent = userName;
})();`;

export const FIT_GAME_FRAME_SCRIPT = `<script>
/* ocean-ui-fit-frame */
(function () {
  function fitGameFrame() {
    if (!document.body.classList.contains("big-game-page")) return;
    const h = window.innerHeight + "px";
    document.documentElement.style.height = h;
    document.documentElement.style.minHeight = h;
    document.body.style.height = h;
    document.body.style.minHeight = h;
    const shell = document.querySelector(".game-shell");
    if (shell) {
      shell.style.height = h;
      shell.style.minHeight = h;
    }
  }
  fitGameFrame();
  window.addEventListener("resize", fitGameFrame);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(fitGameFrame).observe(document.documentElement);
  }
})();
</script>`;

export const END_POPUP_CSS = `
    .game-overlay.end-popup{display:none;flex-direction:column;align-items:center;text-align:center;}
    .game-overlay.end-popup h3,.overlay.end-popup h3{color:#64ffda;margin-bottom:8px;font-size:22px;writing-mode:horizontal-tb;text-orientation:mixed;}
    .game-overlay.end-popup .overlay-btn,.overlay.end-popup .btn{margin-top:8px;}`;

export function classifyPage(file, html) {
  if (file === "004-Intro-OceanReefDefender.html") return "intro-game";
  if (file === "031-Outro-OceanTreasureRush.html") return "outro-game";
  if (html.includes('class="planet-game"') || html.includes("class='planet-game'")) return "activity";
  if (/Quiz\.html$/i.test(file)) return "quiz";
  if (file === "003-Character-Selection.html") return "character";
  return "reading";
}

export function bodyClassForType(type, existing = "") {
  const want =
    type === "intro-game" || type === "outro-game"
      ? "big-game-page"
      : type === "activity"
        ? "big-planet-page"
        : type === "reading" || type === "quiz" || type === "character"
          ? "reading-page"
          : "";
  if (!want) return existing;
  const parts = new Set(existing.split(/\s+/).filter(Boolean));
  parts.add(want);
  if (type === "character") parts.add("character-select-page");
  return [...parts].join(" ");
}
