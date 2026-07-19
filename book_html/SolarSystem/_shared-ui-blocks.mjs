/** Shared CSS blocks injected by solar UI patch/audit scripts. */

export const AUDIT_MARKER = "/* solar-ui-audit-overrides */";

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
body.big-planet-page:has(.planet-svg-panel) .svg-viewport,
body.big-planet-page .svg-viewport {
  max-height: min(96vw, calc(100svh - 168px)) !important;
  min-height: min(72vw, calc(100svh - 200px)) !important;
}
body.big-planet-page .sun-game .game-canvas-wrap,
body.big-planet-page .planet-game .game-canvas,
body.big-planet-page .planet-game .game-canvas-wrap {
  width: 100% !important;
  height: min(50vh, 440px) !important;
  min-height: min(42vh, 300px) !important;
  max-height: min(56vh, 480px) !important;
}
body.big-planet-page .sun-game,
body.big-planet-page .planet-game {
  margin-bottom: 8px !important;
}
body.big-planet-page .nav-hint {
  margin-top: 8px !important;
  padding-bottom: 8px !important;
  font-size: 12px !important;
  line-height: 1.45 !important;
}
@media (max-width: 639px) {
  body.big-planet-page .sun-game .game-canvas-wrap,
  body.big-planet-page .planet-game .game-canvas,
  body.big-planet-page .planet-game .game-canvas-wrap {
    height: min(48vh, 400px) !important;
    min-height: min(40vh, 280px) !important;
    max-height: min(52vh, 420px) !important;
  }
}
@media (min-width: 640px) {
  body.big-planet-page:has(.planet-svg-panel) .svg-viewport {
    max-height: min(92vw, calc(100svh - 156px)) !important;
  }
}
body.all-planets-page:has(#solarSvg) .svg-wrap {
  max-height: min(96vw, calc(100svh - 162px)) !important;
  min-height: min(43svh, calc(100svh - 168px), 96vw) !important;
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
@media (min-width: 768px) {
  body.big-game-page:has(.game-shell) .stage-wrap {
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
}
body.big-game-page:has(.fire-btn) .game-wrap {
  min-height: min(calc(100svh - 178px), 78vh) !important;
  height: min(calc(100svh - 178px), 78vh) !important;
  max-height: none !important;
}
@media (min-width: 640px) {
  body:has(.planet-svg-panel) .svg-viewport,
  body:has(.planet-game) .game-canvas,
  body:has(.sun-game) .game-canvas-wrap {
    max-height: none !important;
  }
  body.big-planet-page:has(.planet-svg-panel) .svg-viewport {
    max-height: min(92vw, calc(100svh - 156px)) !important;
  }
}`;

export const LOAD_PLAYER_FN = `function loadPlayerInfo() {
  const userName = SolarPlayer.getUserName() || 'Explorer';
  const userCharacter = SolarPlayer.getCharacter() || '👨‍🚀';
  const playerName2 = document.getElementById('playerName2');
  const playerIcon = document.getElementById('playerIcon');
  const podiumChar = document.getElementById('podium-char-1');
  const podiumName = document.getElementById('podium-name-1');
  if (playerName2) playerName2.textContent = userName;
  if (playerIcon) playerIcon.textContent = userCharacter;
  if (podiumChar) podiumChar.textContent = userCharacter;
  if (podiumName) podiumName.textContent = userName;
}
loadPlayerInfo();`;

export const LOAD_PLAYER_IIFE = `(function loadPlayerInfo() {
  const userName = SolarPlayer.getUserName() || 'Explorer';
  const userCharacter = SolarPlayer.getCharacter() || '👨‍🚀';
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
/* solar-ui-fit-frame */
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

export function classifyPage(file, html) {
  if (file === "004-Intro-SolarSystemDefender.html") return "intro-game";
  if (file === "042-Outtro-SpaceMissionSurvival.html") return "outro-game";
  if (file === "005-OurSolarSystem-AllPlanets.html") return "all-planets";
  if (html.includes('class="planet-svg-panel"') || html.includes("class='planet-svg-panel'")) return "planet-svg";
  if (/Quiz\.html$/i.test(file)) return "quiz";
  if (file === "003-Character-Selection.html") return "character";
  return "reading";
}

export function bodyClassForType(type, existing = "") {
  const want =
    type === "intro-game" || type === "outro-game"
      ? "big-game-page"
      : type === "all-planets"
        ? "all-planets-page"
        : type === "planet-svg"
          ? "big-planet-page"
          : type === "reading" || type === "quiz" || type === "character"
            ? "reading-page"
            : "";
  if (!want) return existing;
  const parts = new Set(existing.split(/\s+/).filter(Boolean));
  parts.add(want);
  return [...parts].join(" ");
}
