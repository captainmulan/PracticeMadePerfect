const fs = require("fs");
const path = require("path");

const dir = __dirname;
const planetArt = fs.readFileSync(path.join(dir, "_planet-texture-art.js"), "utf8").trim();
const playerScript = fs.readFileSync(path.join(dir, "_solar-player.js"), "utf8").trim();
const playerTag = `<script>\n${playerScript}\n</script>`;

const artStartMarkers = ["/* Planet texture art", "/* Planet standalone art"];
const artEndMarkers = ["\nfunction makePlanetViewer", "\n\n  /* ── Solar System Viewer", "\n\n  /* ── Order the Planets"];

function findArtStart(html) {
  for (const marker of artStartMarkers) {
    const idx = html.indexOf(marker);
    if (idx !== -1) return idx;
  }
  return -1;
}

function replacePlanetArt(html) {
  const start = findArtStart(html);
  if (start === -1) return html;
  let end = -1;
  for (const marker of artEndMarkers) {
    const idx = html.indexOf(marker, start);
    if (idx !== -1 && (end === -1 || idx < end)) end = idx;
  }
  if (end === -1) return html;
  return html.slice(0, start) + planetArt + html.slice(end);
}

function injectPlayer(html) {
  html = html.replace(/<script>\s*\(function \(w\) \{[\s\S]*?\}\)\(window\);\s*<\/script>\s*/g, "");
  if (html.includes("</head>")) {
    return html.replace("</head>", `${playerTag}\n</head>`);
  }
  return html;
}

function patchPlayerStorage(html) {
  return html
    .replace(/localStorage\.getItem\('userName'\)/g, "SolarPlayer.getUserName()")
    .replace(/localStorage\.getItem\("userName"\)/g, "SolarPlayer.getUserName()")
    .replace(/localStorage\.getItem\('userCharacter'\)/g, "SolarPlayer.getCharacter()")
    .replace(/localStorage\.getItem\("userCharacter"\)/g, "SolarPlayer.getCharacter()");
}

function patchCharacterPage(html) {
  if (!html.includes("Choose Your Explorer")) return html;
  let next = html;

  next = next.replace(/\n    \.start-btn:hover\{[\s\S]*?\n    \}/, "");
  next = next.replace(/\n  <button class="start-btn"[\s\S]*?<\/button>/, "");
  next = next.replace(/\nfunction startAdventure\(\) \{[\s\S]*?\}\n/, "\n");

  if (!next.includes("overflow-y:auto")) {
    next = next.replace(
      "overflow-x:hidden;",
      "overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;",
    );
  }

  next = next.replace(
    /padding:24px 16px 40px;/,
    "padding:16px 14px 20px;",
  );
  next = next.replace(/margin-bottom:30px;/g, "margin-bottom:14px;");
  next = next.replace(/font-size:36px;/, "font-size:28px;");
  next = next.replace(/font-size:18px;\n    \}\n input/, "font-size:16px;\n    }\n input");
  next = next.replace(/padding:24px;\n      margin-bottom:24px;/, "padding:14px;\n      margin-bottom:12px;");
  next = next.replace(/font-size:80px;/, "font-size:56px;");
  next = next.replace(/font-size:24px;\n      color:#ffd700;/, "font-size:18px;\n      color:#ffd700;");
  next = next.replace(/padding:16px 20px;\n      border:3px/, "padding:10px 12px;\n      border:2px");
  next = next.replace(/font-size:20px;\n      font-family/, "font-size:16px;\n      font-family");
  next = next.replace(/margin-bottom:30px;\n      outline/, "margin-bottom:12px;\n      outline");
  next = next.replace(/gap:20px;\n      margin-bottom:30px;/, "gap:8px;\n      margin-bottom:8px;");
  next = next.replace(/padding:24px;\n      cursor:pointer;\n      transition:0\.3s;\n      font-size:50px;/,
    "padding:10px 4px;\n      cursor:pointer;\n      transition:0.3s;\n      font-size:34px;");
  next = next.replace(
    /min-height:100vh;\n      display:flex;\n      flex-direction:column;\n      justify-content:center;/,
    "min-height:auto;\n      display:flex;\n      flex-direction:column;\n      justify-content:flex-start;",
  );

  if (!next.includes("@media (max-width: 480px)")) {
    next = next.replace(
      "  </style>\n<script>",
      `    @media (max-width: 480px) {
      .container{padding:10px 10px 14px;}
      h1{font-size:22px;margin-bottom:6px;}
      .subtitle{font-size:14px;}
      .preview-section{padding:10px;margin-bottom:10px;}
      .preview-character{font-size:44px;margin-bottom:6px;}
      .preview-name{font-size:16px;}
      input[type="text"]{padding:8px 10px;font-size:15px;margin-bottom:10px;}
      .character-grid{gap:6px;margin-bottom:6px;}
      .character-option{padding:8px 2px;font-size:28px;border-width:2px;border-radius:12px;}
      .character-name{font-size:10px;margin-top:2px;}
    }
  </style>
<script>`,
    );
  }

  if (!next.includes("function persistPlayer()")) {
    next = next.replace(
      "<script>\nlet selectedCharacter",
      `<script>
function persistPlayer() {
  const userName = document.getElementById('userName').value.trim() || 'Explorer';
  SolarPlayer.save(userName, selectedCharacter, selectedCharacterName);
}

let selectedCharacter`,
    );
  }

  if (!next.includes("persistPlayer();\n  document.getElementById('previewCharacter')")) {
    next = next.replace(
      /function updatePreview\(\) \{\n  const userName = document\.getElementById\('userName'\)\.value[^;]*;/,
      "function updatePreview() {\n  const userName = document.getElementById('userName').value.trim() || 'Explorer';\n  persistPlayer();",
    );
  }

  if (!next.includes("selectedCharacterName = name;\n  updatePreview();\n  persistPlayer();")) {
    next = next.replace(
      "  selectedCharacterName = name;\n  updatePreview();",
      "  selectedCharacterName = name;\n  updatePreview();\n  persistPlayer();",
    );
  }

  return next;
}

function patchIntroGame(html) {
  if (!html.includes("Solar System Defender")) return html;
  let next = html;

  if (!next.includes("game-stage-overlay-v2")) {
    next = next.replace(
      /\.game-stage \{[\s\S]*?\n        \}\n        #gameCanvas/,
      `.game-stage {
            position: relative;
            width: 100%;
            max-width: 700px;
            aspect-ratio: 700 / 600;
            max-height: 300px;
            margin: 0 auto;
            overflow: hidden;
            border: 2px solid rgba(255, 200, 0, 0.5);
            border-radius: 12px;
            box-shadow: 0 0 30px rgba(255, 200, 0, 0.2);
            box-sizing: border-box;
        }
        #gameCanvas`,
    );
    next = next.replace(
      /#gameCanvas \{[\s\S]*?\n        \}\n        \.ui-container/,
      `#gameCanvas {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 0;
            box-shadow: none;
        }
        .ui-container`,
    );
    next = next.replace(
      /\.start-screen, \.game-over-screen \{[\s\S]*?\n        \}\n        \.start-screen h1/,
      `.start-screen, .game-over-screen {
            position: absolute;
            left: 10px;
            right: 10px;
            top: 10px;
            bottom: 10px;
            width: auto;
            height: auto;
            margin: 0;
            overflow-x: hidden;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.88);
            padding: 10px 8px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid rgba(255, 200, 0, 0.6);
            z-index: 100;
            box-sizing: border-box;
        }
        /* game-stage-overlay-v2 */
        .start-screen h1`,
    );
    next = next.replace(
      /\.start-screen h1, \.game-over-screen h1 \{[\s\S]*?\n        \}\n        \.start-screen p/,
      `.start-screen h1, .game-over-screen h1 {
            color: #ffd700;
            margin-bottom: 8px;
            font-size: clamp(16px, 4.5vw, 32px);
            line-height: 1.15;
            max-width: 100%;
        }
        .start-screen p`,
    );
    next = next.replace(
      /\.start-screen p, \.game-over-screen p \{[\s\S]*?\n        \}\n        \.btn \{/,
      `.start-screen p, .game-over-screen p {
            color: #ccc;
            margin-bottom: 12px;
            font-size: clamp(11px, 3.2vw, 16px);
            line-height: 1.4;
            max-width: 100%;
            word-break: break-word;
        }
        .btn {`,
    );
    next = next.replace(
      /\.btn \{[\s\S]*?\n        \}\n        \.btn:hover/,
      `.btn {
            padding: 10px 18px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, #ff6b6b, #ff9500);
            color: white;
            font-size: clamp(14px, 3.8vw, 20px);
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.1s ease;
            max-width: 100%;
        }
        .btn:hover`,
    );
    next = next.replace(
      /@media \(max-width: 600px\) \{[\s\S]*?\.game-stage \{ max-height: min\(46vh, 320px\); \}\s*\}/,
      `@media (max-width: 600px) {
            .game-shell { padding: 6px 8px 12px; }
            .title { font-size: 15px !important; margin-bottom: 6px !important; line-height: 1.35; }
            .ui-container { margin-bottom: 6px; gap: 4px; }
            .ui-item { font-size: 12px; padding: 5px 8px; }
            .start-screen, .game-over-screen {
                left: 8px;
                right: 8px;
                top: 8px;
                bottom: 8px;
                padding: 8px 6px;
            }
            .start-screen h1, .game-over-screen h1 { margin-bottom: 6px; }
            .start-screen p, .game-over-screen p { margin-bottom: 10px; }
            .btn { padding: 8px 14px; }
            .touch-controls { gap: 12px; margin-top: 6px; }
            .touch-btn { width: 56px; height: 56px; font-size: 22px; }
            .game-stage { max-height: 260px; }
        }`,
    );
  }

  return next;
}

function patchSolarPerspective(html) {
  if (!html.includes("Our Solar System") || !html.includes("const Solar =")) return html;
  if (html.includes("ORBIT_TILT")) return html;

  let next = html.replace(
    "    angles: {}, spinAngles: {}, sunSpin: 0, selected: null,",
    "    angles: {}, spinAngles: {}, sunSpin: 0, selected: null,\n    ORBIT_TILT: 0.52,",
  );

  next = next.replace(
    /draw\(\)\{\s*while \(this\.viewG\.firstChild\)[\s\S]*?this\.viewG\.appendChild\(pg\);\s*\}\);\s*\}/,
    `draw(){
      while (this.viewG.firstChild) this.viewG.removeChild(this.viewG.firstChild);
      const cx = 300, cy = 300;
      const rot = this.rot + this.drag;
      const tilt = this.ORBIT_TILT || 0.52;
      this.viewG.setAttribute('transform', 'translate(' + cx + ',' + cy + ') rotate(' + rot + ') scale(' + this.zoom + ')');

      PLANETS.forEach(p => {
        this.viewG.appendChild(el('ellipse', {
          cx:0, cy:0, rx:p.orbitR, ry:p.orbitR * tilt,
          fill:'none', stroke:'rgba(255,255,255,0.14)', 'stroke-width':1
        }));
      });

      const sunG = el('g', {id:'sunHit', class:'planet-hit', style:'cursor:pointer'});
      this.drawSun(sunG);
      this.viewG.appendChild(sunG);

      const drawList = PLANETS.map(p => {
        const ang = this.angles[p.id];
        const px = Math.cos(ang) * p.orbitR;
        const py = Math.sin(ang) * p.orbitR * tilt;
        const depth = (Math.sin(ang) + 1) / 2;
        const scale = 0.72 + depth * 0.65;
        return { p, px, py, scale, ang, depth };
      }).sort((a, b) => a.py - b.py);

      drawList.forEach(({ p, px, py, scale }) => {
        const pg = el('g', {
          class:'planet-hit',
          transform:'translate(' + px + ',' + py + ') scale(' + scale + ') rotate(' + (this.spinAngles[p.id] || 0) + ')',
          'data-id': p.id
        });
        this.drawPlanetBody(pg, p, p.size);
        this.viewG.appendChild(pg);
      });
    }`,
  );

  if (!next.includes(".svg-wrap::after")) {
    next = next.replace(
      ".svg-wrap:active{cursor:grabbing;}",
      `.svg-wrap{position:relative;}
    .svg-wrap:active{cursor:grabbing;}
    .svg-wrap::after{
      content:'';
      position:absolute;
      inset:0;
      pointer-events:none;
      border-radius:16px;
      box-shadow:inset 0 -40px 60px rgba(0,0,0,0.55), inset 0 0 0 3px rgba(255,215,0,0.25);
      background:linear-gradient(180deg, rgba(10,8,32,0.12) 0%, rgba(10,8,32,0) 35%, rgba(10,8,32,0.45) 100%);
    }`,
    );
  }

  return next;
}

function patchQuizContinue(html) {
  if (!html.includes("continue-btn") && !html.includes("continueToNext")) return html;
  let next = html;

  next = next.replace(/\s*<button class="continue-btn" onclick="continueToNext\(\)">➡️ Continue<\/button>/g, "");
  next = next.replace(/\.retry-btn,\s*\.continue-btn/g, ".retry-btn");
  next = next.replace(/\.retry-btn,\.continue-btn/g, ".retry-btn");
  next = next.replace(/\.continue-btn\{[^}]+\}/g, "");
  next = next.replace(/\.continue-btn:hover\{[^}]+\}/g, "");
  next = next.replace(/function continueToNext\(\) \{[\s\S]*?\}\n\n/g, "");
  next = next.replace(/function continueToNext\(\) \{ alert\('Great job! Continue to the next chapter using the navigation arrows!'\); \}\n/g, "");

  return next;
}

function getQuizBotInfo(html) {
  const botVars = html.match(/const botName = '([^']+)';[\s\S]*?const botCharacter = '([^']+)';/);
  if (botVars) return { name: botVars[1], icon: botVars[2] };
  const botName = html.match(/id="podium-name-2">([^<]+)</);
  const botIcon = html.match(/id="podium-char-2">([^<]+)</);
  if (botName && botIcon) return { name: botName[1], icon: botIcon[1] };
  const compact = html.match(/\{ name: '([^']+)', character: '([^']+)', score: computerScore/);
  if (compact) return { name: compact[1], icon: compact[2] };
  return { name: "SolarBot", icon: "🤖" };
}

const QUIZ_LIVE_SCORE_CSS = `
    .competition-bar{
      display:flex;
      justify-content:space-between;
      align-items:center;
      background:#1a1735;
      border-radius:12px;
      padding:10px;
      margin-bottom:12px;
    }
    .competition-bar.hidden{display:none;}
    .competitor{
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:4px;
    }
    .competitor-icon{font-size:28px;}
    .competitor-name{font-size:12px;color:#c4b5fd;}
    .competitor-score{font-size:18px;font-weight:bold;color:#ffd700;}
    .vs-divider{font-size:18px;color:#a78bfa;font-weight:bold;}`;

function patchQuizLiveScore(html) {
  if (!html.includes("scoreCard") && !html.includes("score-card")) return html;
  if (!html.includes("-Quiz.html") && !html.match(/Quiz\.html/)) {
    // filename not in html; still process if score card exists
  }
  let next = html;
  const bot = getQuizBotInfo(html);

  if (!next.includes(".competition-bar{")) {
    if (next.includes(".player-info span:first-child{")) {
      next = next.replace(
        /(\.player-info span:first-child\{[\s\S]*?\})\s+\.quiz-card/,
        `$1${QUIZ_LIVE_SCORE_CSS}
    .quiz-card`,
      );
    } else {
      next = next.replace(
        /\.quiz-card\{/,
        `.competition-bar{display:flex;justify-content:space-between;align-items:center;background:#1a1735;border-radius:12px;padding:10px;margin-bottom:12px;}
    .competition-bar.hidden{display:none;}
    .competitor{display:flex;flex-direction:column;align-items:center;gap:4px;}
    .competitor-icon{font-size:28px;}
    .competitor-name{font-size:12px;color:#c4b5fd;}
    .competitor-score{font-size:18px;font-weight:bold;color:#ffd700;}
    .vs-divider{font-size:18px;color:#a78bfa;font-weight:bold;}
    .quiz-card{`,
      );
    }
  } else if (!next.includes(".competition-bar.hidden")) {
    next = next.replace(/(\.competition-bar\{[^}]+\})/, "$1\n    .competition-bar.hidden{display:none;}");
  }

  if (!next.includes('id="liveScoreBar"')) {
    const bar = `  <div class="competition-bar" id="liveScoreBar">
    <div class="competitor">
      <div class="competitor-icon" id="playerIcon">👨‍🚀</div>
      <div class="competitor-name" id="playerName2">Explorer</div>
      <div class="competitor-score" id="playerScore">0</div>
    </div>
    <div class="vs-divider">VS</div>
    <div class="competitor">
      <div class="competitor-icon" id="botIcon">${bot.icon}</div>
      <div class="competitor-name" id="botName">${bot.name}</div>
      <div class="competitor-score" id="computerScore">0</div>
    </div>
  </div>

`;
    next = next.replace(/(<div class="header">[\s\S]*?<\/div>\s*\n)(  <div class="quiz-card)/, `$1${bar}$2`);
  }

  if (!next.includes("getElementById('computerScore').textContent = computerScore")) {
    next = next.replace(
      /if \(computerCorrect\) \{\s*computerScore\+\+;\s*\}/g,
      "if (computerCorrect) {\n    computerScore++;\n    document.getElementById('computerScore').textContent = computerScore;\n  }",
    );
    next = next.replace(
      /computerScore\+\+;\s*document\.getElementById\('computerScore'\)/g,
      "computerScore++;\n    document.getElementById('computerScore')",
    );
  }

  if (!next.includes("getElementById('playerScore').textContent = score")) {
    next = next.replace(
      /(feedback\.className = 'feedback show correct';\s*)score\+\+;/g,
      "$1score++;\n    document.getElementById('playerScore').textContent = score;",
    );
    next = next.replace(
      /(feedback\.className = 'feedback show correct'; score\+\+;)/g,
      "$1 document.getElementById('playerScore').textContent = score;",
    );
  }

  if (!next.includes("liveScoreBar').classList.add('hidden')")) {
    next = next.replace(
      /podium\.style\.display = 'flex';\s*\n\s*scoreCard\.classList\.add\('show'\);/,
      `document.getElementById('liveScoreBar').classList.add('hidden');
  document.querySelectorAll('.quiz-card').forEach(c => c.classList.remove('active'));
  podium.style.display = 'flex';
  scoreCard.classList.add('show');`,
    );
    next = next.replace(
      /document\.getElementById\('scoreCard'\)\.classList\.add\('show'\);(?![\s\S]*liveScoreBar)/,
      `document.getElementById('liveScoreBar').classList.add('hidden');
  document.querySelectorAll('.quiz-card').forEach(c => c.classList.remove('active'));
  document.getElementById('scoreCard').classList.add('show');`,
    );
  }

  if (!next.includes("liveScoreBar').classList.remove('hidden')")) {
    next = next.replace(
      /document\.getElementById\('scoreCard'\)\.classList\.remove\('show'\);/,
      `document.getElementById('scoreCard').classList.remove('show');
  document.getElementById('liveScoreBar').classList.remove('hidden');
  document.getElementById('playerScore').textContent = '0';
  document.getElementById('computerScore').textContent = '0';`,
    );
  }

  return next;
}

function patchQuiz(html) {
  return html;
}

function patchPlanetViewerMobile(html) {
  if (!html.includes("function makePlanetViewer")) return html;
  let next = html;

  const zoomFn = `function defaultPlanetZoom(svg, planetType) {
  const w = svg ? (svg.clientWidth || svg.getBoundingClientRect().width || 320) : 320;
  let zoom = w <= 360 ? 1.72 : w <= 480 ? 1.5 : w <= 640 ? 1.28 : 1.12;
  const fitRadius = 168;
  const bodyR = 88;
  if (planetType === "sun") {
    zoom = Math.min(zoom, fitRadius / (bodyR * 1.5));
  } else if (planetType === "saturn") {
    zoom = Math.min(zoom, fitRadius / (bodyR * 2.28));
  } else if (planetType === "meteor") {
    zoom = Math.min(zoom, fitRadius / (bodyR * 1.35));
  } else if (planetType === "blackhole") {
    zoom = Math.min(zoom, fitRadius / (bodyR * 1.92));
  }
  return Math.round(zoom * 100) / 100;
}`;

  if (next.includes("function defaultPlanetZoom")) {
    next = next.replace(/function defaultPlanetZoom\(svg[^)]*\) \{[\s\S]*?\n\}/, zoomFn);
  } else {
    next = next.replace("function makePlanetViewer", zoomFn + "\nfunction makePlanetViewer");
  }

  next = next.replace(/\s*S\.zoom = defaultPlanetZoom\(this\.svg[^;]*\);\s*/g, "\n");
  next = next.replace(
    /if \(!this\.svg \|\| !this\.g \|\| !this\.info\) return;\s*const S = this;/,
    "if (!this.svg || !this.g || !this.info) return;\n      const S = this;\n      S.zoom = defaultPlanetZoom(this.svg, planetType);",
  );

  next = next.replace(/zoom: 1, rot: 0, drag: 0, ang: 0\.08,/g, "zoom: 1.28, rot: 0, drag: 0, ang: 0.08,");
  next = next.replace(/zoom: 1, rot: 0, drag: 0, ang: 0,/g, "zoom: 1.28, rot: 0, drag: 0, ang: 0.08,");
  next = next.replace(
    /\.svg-viewport\{width:100%;aspect-ratio:1;max-height:340px;/g,
    ".svg-viewport{width:100%;aspect-ratio:1;max-height:min(72vw,260px);",
  );
  return next;
}

function patchSunClimbStartBottom(html) {
  if (!html.includes("function buildSunPlatforms")) return html;
  let next = html;

  if (!next.includes("let sunStartPlat")) {
    next = next.replace(
      "let sunPlayer, sunPlatforms = [], sunFlares = [], sunCamY = 0;",
      "let sunPlayer, sunPlatforms = [], sunFlares = [], sunCamY = 0;\nlet sunStartPlat = null;",
    );
  }

  if (!next.includes("function sunBottomCamY")) {
    next = next.replace(
      "function endSunClimb(won) {",
      `function sunBottomCamY(plat, canvasH) {
  if (!plat) return 0;
  return Math.max(0, plat.y + plat.h - canvasH + 6);
}

function playerTouchesSun(p) {
  const sun = sunPlatforms.find(pl => pl.isSun);
  if (!sun) return false;
  const cx = sun.x + sun.width / 2;
  const cy = sun.y;
  const hitR = 72;
  const dx = p.x - cx;
  const dy = p.y - cy;
  return dx * dx + dy * dy <= hitR * hitR;
}

function endSunClimb(won) {`,
    );
  }

  next = next.replace(
    /sunCamY = Math\.max\(0, startPlat\.y - sunCanvas\.height \+ 72\);/g,
    "sunStartPlat = startPlat;\n  sunCamY = sunBottomCamY(startPlat, sunCanvas.height);",
  );
  next = next.replace(
    /sunCamY = Math\.max\(0, startPlat\.y \+ startPlat\.h - sunCanvas\.height \+ 12\);/g,
    "sunStartPlat = startPlat;\n  sunCamY = sunBottomCamY(startPlat, sunCanvas.height);",
  );
  next = next.replace(
    /sunCamY = Math\.max\(0, sp\.y - sunCanvas\.height \+ 72\);/g,
    "sunStartPlat = sp;\n    sunCamY = sunBottomCamY(sp, sunCanvas.height);",
  );
  next = next.replace(
    /sunCamY = Math\.max\(0, sp\.y \+ sp\.h - sunCanvas\.height \+ 12\);/g,
    "sunStartPlat = sp;\n    sunCamY = sunBottomCamY(sp, sunCanvas.height);",
  );
  next = next.replace(/let y = h - 36;\s*plats\.push\(\{ x: w \* 0\.5 - 58, y: y,/, "let y = h - 20;\n  plats.push({ x: w * 0.5 - 58, y: y,");
  next = next.replace(/let y = h - 24;\s*plats\.push\(\{ x: w \* 0\.5 - 58, y: y,/, "let y = h - 20;\n  plats.push({ x: w * 0.5 - 58, y: y,");

  if (!next.includes("if (playerTouchesSun(p))")) {
    next = next.replace(
      /p\.x = Math\.max\(p\.w, Math\.min\(sunCanvas\.width - p\.w, p\.x\)\);\s*p\.onGround = false;\s*sunPlatforms\.forEach\(pl => \{\s*if \(p\.vy >= 0/,
      `p.x = Math.max(p.w, Math.min(sunCanvas.width - p.w, p.x));
  if (playerTouchesSun(p)) { endSunClimb(true); return; }
  p.onGround = false;
  sunPlatforms.forEach(pl => {
    if (pl.isSun) return;
    if (p.vy >= 0`,
    );
    next = next.replace(/\s*if \(pl\.isSun\) endSunClimb\(true\);\s*\n\s*\}/, "\n    }");
  }

  if (next.includes("p.y - sunCanvas.height * 0.55")) {
    next = next.replace(
      /const targetCam = Math\.max\(0, p\.y - sunCanvas\.height \* 0\.55\);\s*sunCamY \+= \(targetCam - sunCamY\) \* 0\.15;/,
      `const bottomCam = sunBottomCamY(sunStartPlat, sunCanvas.height);
  const followCam = Math.max(0, p.y - sunCanvas.height * 0.52);
  const stillNearStart = p.y > sunCanvas.height * 0.62;
  const targetCam = stillNearStart ? bottomCam : Math.max(bottomCam, followCam);
  sunCamY += (targetCam - sunCamY) * 0.15;`,
    );
  }

  next = next.replace(
    "Jump on solar platforms like Mario! Move ← → and jump up to reach the Sun. Dodge solar flares!",
    "Jump on solar platforms! Move ← → and jump up. Touch any part of the Sun to win!",
  );
  next = next.replace(
    "Use ← → to move, ↑ or Jump to leap onto platforms. Reach the Sun at the top!",
    "Use ← → to move and Jump to climb. Touch any part of the Sun at the top to win!",
  );

  return next;
}

function patchSunClimbGame(html) {
  if (!html.includes("function buildSunPlatforms")) return html;
  if (html.includes("isStart: true")) return html;
  let next = html;

  next = next.replace(
    /function buildSunPlatforms\(w, h\) \{[\s\S]*?\n\}/,
    `function buildSunPlatforms(w, h) {
  const plats = [{ x: w / 2 - 52, y: 0, width: 104, h: 14, isSun: true }];
  const gapMin = 36;
  const gapMax = 46;
  const steps = Math.max(32, Math.round(h * 3.2 / gapMin));
  let y = h - 24;
  plats.push({ x: w * 0.5 - 58, y: y, width: Math.min(w - 20, 116), h: 14, isStart: true });
  for (let i = 0; i < steps; i++) {
    const pw = Math.max(52, 58 + Math.random() * Math.min(90, w * 0.38));
    const x = Math.random() * Math.max(8, w - pw - 12) + 6;
    y -= gapMin + Math.random() * (gapMax - gapMin);
    plats.push({ x: x, y: y, width: pw, h: 14 });
  }
  return plats;
}`,
  );

  next = next.replace(
    /sunPlatforms = buildSunPlatforms\(sunCanvas\.width, sunCanvas\.height\);\s*const bottom = sunPlatforms\.filter\(p => !p\.isSun\)\.reduce\([\s\S]*?onGround: true\s*\};/,
    `sunPlatforms = buildSunPlatforms(sunCanvas.width, sunCanvas.height);
  const startPlat = sunPlatforms.find(p => p.isStart) || sunPlatforms.filter(p => !p.isSun).reduce((a, b) => (a.y > b.y ? a : b));
  sunPlayer = {
    x: startPlat.x + startPlat.width / 2,
    y: startPlat.y - 14,
    w: 24, h: 28, vx: 0, vy: 0, onGround: true
  };
  sunCamY = Math.max(0, startPlat.y + startPlat.h - sunCanvas.height + 12);`,
  );

  next = next.replace(
    /const grav = 0\.55;\s*const jumpV = -11;\s*const speed = 5;/,
    "const grav = 0.58;\n  const jumpV = -10.2;\n  const speed = 4.8;",
  );

  next = next.replace(
    /if \(sunLives <= 0\) \{ endSunClimb\(false\); return; \}\s*p\.x = sunCanvas\.width \/ 2; p\.y = sunCanvas\.height - 60; p\.vy = 0;\s*sunCamY = Math\.max\(0, sunCamY - 200\);/,
    `if (sunLives <= 0) { endSunClimb(false); return; }
    const sp = sunPlatforms.find(p => p.isStart) || sunPlatforms.filter(p => !p.isSun).reduce((a, b) => (a.y > b.y ? a : b));
    p.x = sp.x + sp.width / 2;
    p.y = sp.y - 14;
    p.vy = 0;
    sunCamY = Math.max(0, sp.y + sp.h - sunCanvas.height + 12);`,
  );

  return next;
}

function patchSunPage(html) {
  if (!html.includes("Climb to the Sun")) return html;
  let next = html;

  next = next.replace(/\s*<span id="sunGameScore">Height: 0m<\/span>\s*/g, "\n        ");
  next = next.replace(
    /function updateSunHud\(\) \{[\s\S]*?\}/,
    "function updateSunHud() {\n  document.getElementById('sunGameTimer').textContent = '⏱ ' + sunTime + 's | ' + '❤️'.repeat(sunLives) + '🖤'.repeat(Math.max(0, 3 - sunLives));\n}",
  );

  next = next.replace(
    /drawSun\(g, r, clip, svg\) \{[\s\S]*?for \(let i = 0; i < 8; i\+\+\) \{[\s\S]*?\}\s*\}/,
    `drawSun(g, r, clip, svg) {
    const S = this;
    if (svg) S.ensureSunGlow(svg);
    g.appendChild(S.el("circle", { r: String(r * 1.45), fill: "url(#sunCorona)", "pointer-events": "none" }));
    g.appendChild(S.el("circle", { r: String(r * 1.2), fill: "rgba(255,193,7,0.18)", "pointer-events": "none" }));
    S.texturedDisc(g, "sun", r, clip) || S.sphere(g, "sun", r, clip);
  }`,
  );

  return next;
}

function patchMercuryGame(html) {
  if (!html.includes("Meteor Dodge!")) return html;
  if (html.includes('id="gameLives"')) return html;

  let next = html.replace(
    /<div class="game-score" id="gameScore">Score: 0<\/div>\s*<div class="game-timer" id="gameTimer">Time: 30s<\/div>/,
    `<div class="game-score" id="gameScore">Score: 0</div>
    <div class="game-timer" id="gameTimer">Time: 30s</div>
    <div class="game-timer" id="gameLives">❤️❤️❤️</div>`,
  );

  next = next.replace(
    "let gameScore = 0;\nlet gameTime = 30;",
    "let gameScore = 0;\nlet gameTime = 30;\nlet gameLives = 3;",
  );

  next = next.replace(
    "  gameScore = 0;\n  gameTime = 30;\n  meteors = [];",
    `  gameScore = 0;
  gameTime = 30;
  gameLives = 3;
  meteors = [];
  document.getElementById('gameLives').textContent = '❤️'.repeat(gameLives);`,
  );

  next = next.replace(
    `    if (isColliding(player, meteor)) {
      meteors.splice(index, 1);
      gameScore -= 5;
      document.getElementById('gameScore').textContent = 'Score: ' + gameScore;
    }`,
    `    if (isColliding(player, meteor)) {
      meteors.splice(index, 1);
      gameLives--;
      document.getElementById('gameLives').textContent = '❤️'.repeat(Math.max(0, gameLives)) + '🖤'.repeat(Math.max(0, 3 - gameLives));
      if (gameLives <= 0) {
        endGame();
        return;
      }
    }`,
  );

  return next;
}

function patchPlanetViewerSpin(html) {
  if (!html.includes("function makePlanetViewer")) return html;
  if (html.includes("ang: 0.08")) return html;
  return html.replace(
    "facts: facts, fi: 0, spin: true, zoom: 1, rot: 0, drag: 0, ang: 0,",
    "facts: facts, fi: 0, spin: true, zoom: 1, rot: 0, drag: 0, ang: 0.08,",
  );
}

const DESKTOP_FIT_MARKER = "/* solar-desktop-fit */";

const DESKTOP_FIT_CSS = `${DESKTOP_FIT_MARKER}
html, body {
  height: 100%;
  min-height: 0 !important;
}
body:has(.character-grid),
body:has(.game-shell),
body:has(#solarSvg),
body:has(.fire-btn),
body:has(.planet-game) {
  overflow: hidden !important;
}
.container,
.game-shell {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
body:has(.game-shell) .game-shell {
  padding: 4px 8px 6px;
}
body:has(.game-shell) .game-shell .title {
  display: none;
}
body:has(.game-shell) .ui-container {
  margin-bottom: 4px;
  padding: 4px 8px;
  flex-shrink: 0;
}
body:has(.game-shell) .game-stage {
  flex: 1 1 auto;
  min-height: 0 !important;
  height: auto !important;
  max-height: none !important;
  width: 100%;
  aspect-ratio: 7 / 6;
}
body:has(.game-shell) .touch-controls {
  flex-shrink: 0;
  margin-top: 4px;
}
body:has(#solarSvg) .container {
  padding: 8px 12px 10px;
}
body:has(#solarSvg) .solar-panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
  padding: 8px;
}
body:has(#solarSvg) .svg-wrap {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
  aspect-ratio: unset;
  height: auto;
}
body:has(#solarSvg) #solarSvg {
  min-height: 0;
  height: 100%;
}
body:has(#solarSvg) .minigame-panel {
  flex-shrink: 0;
  max-height: 34%;
  overflow-y: auto;
}
body:has(.fire-btn) .container {
  padding: 4px 12px 6px;
}
body:has(.fire-btn) .game-wrap {
  flex: 1 1 auto;
  min-height: 0 !important;
  height: auto !important;
  max-height: none !important;
}
body:has(.fire-btn) .fire-btn {
  flex-shrink: 0;
}
body:has(.character-grid) .container {
  padding: 8px 12px 10px;
  justify-content: center;
}
body:has(.character-grid) .header {
  margin-bottom: 8px;
  flex-shrink: 0;
}
body:has(.character-grid) .preview-section {
  padding: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
body:has(.character-grid) .preview-character {
  font-size: 36px;
  margin-bottom: 4px;
}
body:has(.character-grid) input[type="text"] {
  margin-bottom: 8px;
  flex-shrink: 0;
}
body:has(.character-grid) .character-grid {
  gap: 6px;
  margin-bottom: 0;
  flex-shrink: 0;
}
body:has(.character-grid) .character-option {
  padding: 6px 2px;
  font-size: 26px;
  border-width: 2px;
  border-radius: 12px;
}
body:has(.character-grid) .character-name {
  font-size: 10px;
  margin-top: 2px;
}
@media (min-width: 640px), (min-width: 768px) and (max-width: 1024px) {
  body:has(.character-grid) .container {
    padding: 6px 12px 8px;
    justify-content: center;
  }
  body:has(.character-grid) h1 {
    font-size: 20px;
    margin-bottom: 4px;
  }
  body:has(.character-grid) .header {
    margin-bottom: 6px;
    flex-shrink: 0;
  }
  body:has(.character-grid) .subtitle {
    font-size: 13px;
  }
  body:has(.character-grid) .preview-section {
    padding: 6px 8px;
    margin-bottom: 6px;
    flex-shrink: 0;
  }
  body:has(.character-grid) .preview-character {
    font-size: 32px;
    margin-bottom: 2px;
  }
  body:has(.character-grid) .preview-name {
    font-size: 15px;
  }
  body:has(.character-grid) input[type="text"] {
    padding: 6px 10px;
    margin-bottom: 6px;
    font-size: 14px;
    flex-shrink: 0;
  }
  body:has(.character-grid) .character-grid {
    gap: 6px;
    margin-bottom: 0;
    flex-shrink: 0;
  }
  body:has(.character-grid) .character-option {
    padding: 4px 2px;
    font-size: 24px;
    border-width: 2px;
    border-radius: 10px;
  }
  body:has(.character-grid) .character-name {
    font-size: 9px;
    margin-top: 1px;
  }
  body:has(.game-shell) .ui-item {
    font-size: 13px;
    padding: 4px 8px;
  }
  body:has(.game-shell) .touch-controls {
    gap: 10px;
  }
  body:has(#solarSvg) .header {
    margin-bottom: 6px;
    flex-shrink: 0;
  }
  body:has(#solarSvg) h1 {
    font-size: 20px;
    margin-bottom: 4px;
  }
  body:has(#solarSvg) .subtitle {
    font-size: 13px;
  }
  body:has(#solarSvg) .info-panel,
  body:has(#solarSvg) .nav-hint {
    display: none;
  }
  body:has(.fire-btn) .header {
    margin-bottom: 4px;
    flex-shrink: 0;
  }
  body:has(.fire-btn) .header h1 {
    font-size: 20px;
    margin-bottom: 2px;
  }
  body:has(.fire-btn) .header .subtitle {
    display: none;
  }
  body:has(.fire-btn) .hud {
    padding: 6px 10px;
    margin-bottom: 4px;
    font-size: 12px;
    flex-shrink: 0;
  }
  body:has(.fire-btn) .game-wrap {
    margin-bottom: 4px;
  }
  body:has(.fire-btn) .fire-btn {
    padding: 10px;
    font-size: 14px;
    margin-bottom: 0;
  }
  body:has(.fire-btn) .instructions,
  body:has(.fire-btn) .nav-hint {
    display: none;
  }
  .planet-svg-panel .svg-viewport,
  .svg-viewport {
    max-height: 220px !important;
    min-height: 0 !important;
  }
  .planet-game .game-canvas,
  .game-canvas-wrap {
    height: 220px !important;
    min-height: 180px !important;
    max-height: 220px !important;
  }
  .planet-game {
    padding: 10px;
    margin-top: 10px;
    flex-shrink: 0;
  }
  .planet-game h2 {
    margin-bottom: 8px;
    font-size: 17px;
  }
  .planet-game p {
    margin-bottom: 8px;
    font-size: 12px;
  }
  .touch-controls {
    margin-top: 6px;
    grid-template-columns: repeat(3, 48px);
    grid-template-rows: repeat(3, 48px);
    gap: 6px;
  }
  .touch-btn {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
}
@media (max-height: 760px) {
  body:has(.character-grid) .preview-character {
    font-size: 28px;
  }
  body:has(.character-grid) .character-option {
    font-size: 22px;
    padding: 3px 2px;
  }
  body:has(.game-shell) .touch-btn {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
  body:has(.fire-btn) .header h1 {
    font-size: 18px;
  }
}`;

function patchDesktopGameFit(html) {
  let next = html;

  next = next.replace(
    /\.game-canvas\{\s*position:relative;\s*height:50vh;\s*min-height:300px;\s*max-height:500px;/g,
    ".game-canvas{position:relative;width:100%;height:280px;min-height:220px;max-height:280px;",
  );
  next = next.replace(
    /\.game-canvas\{\s*position:relative;\s*height:60vh;\s*min-height:350px;\s*max-height:500px;/g,
    ".game-canvas{position:relative;width:100%;height:280px;min-height:220px;max-height:280px;",
  );
  next = next.replace(
    /\.game-canvas\{\s*position:relative;\s*height:50vh;\s*min-height:300px;\s*max-height:500px;/g,
    ".game-canvas{position:relative;width:100%;height:280px;min-height:220px;max-height:280px;",
  );
  next = next.replace(
    /height:50vh;\s*min-height:300px;\s*max-height:500px;/g,
    "width:100%;height:280px;min-height:220px;max-height:280px;",
  );
  next = next.replace(
    /height:60vh;\s*min-height:350px;\s*max-height:500px;/g,
    "width:100%;height:280px;min-height:220px;max-height:280px;",
  );

  next = next.replace(
    /\.svg-viewport\{width:100%;aspect-ratio:1;min-height:min\(72vw,340px\);max-height:min\(78vw,380px\);/g,
    ".svg-viewport{width:100%;aspect-ratio:1;max-height:min(72vw,260px);",
  );
  next = next.replace(
    /\.svg-viewport\{width:100%;aspect-ratio:1;max-height:340px;/g,
    ".svg-viewport{width:100%;aspect-ratio:1;max-height:min(72vw,260px);",
  );

  next = next.replace(
    /max-height: min\(52vh, 420px\)/g,
    "max-height: 300px",
  );
  next = next.replace(
    /max-height: min\(42vh, 300px\)/g,
    "max-height: 300px",
  );
  next = next.replace(
    /\.game-stage \{ max-height: min\(46vh, 320px\); \}/g,
    ".game-stage { max-height: min(40vh, 260px); }",
  );

  next = next.replace(
    /\.game-wrap\{\s*position:relative;height:52vh;min-height:340px;max-height:520px;/g,
    ".game-wrap{position:relative;height:280px;min-height:220px;max-height:280px;",
  );
  next = next.replace(
    /height:52vh;min-height:340px;max-height:520px;/g,
    "height:280px;min-height:220px;max-height:280px;",
  );

  next = next.replace(
    /\.game-canvas-wrap\{position:relative;height:360px;/g,
    ".game-canvas-wrap{position:relative;height:280px;min-height:220px;max-height:280px;",
  );
  next = next.replace(
    /\.game-canvas-wrap\{position:relative;height:280px;min-height:220px;max-height:280px;min-height:220px;max-height:280px;/g,
    ".game-canvas-wrap{position:relative;height:280px;min-height:220px;max-height:280px;",
  );

  if (next.includes("id=\"solarSvg\"") || next.includes("id='solarSvg'")) {
    next = next.replace(/max-height:420px;/g, "max-height:280px;");
    next = next.replace(
      /#solarSvg\{display:block;width:100%;height:100%;min-height:300px;\}/g,
      "#solarSvg{display:block;width:100%;height:100%;min-height:0;}",
    );
    next = next.replace(
      /\.container\{\s*max-width:640px;\s*margin:auto;\s*padding:24px 16px 40px;/g,
      ".container{max-width:640px;margin:auto;padding:12px 14px 16px;height:100%;display:flex;flex-direction:column;overflow:hidden;",
    );
  }

  if (next.includes("Choose Your Explorer")) {
    next = next.replace(/gap:20px;\s*margin-bottom:14px;/g, "gap:8px;margin-bottom:8px;");
  }

  if (next.includes("Solar System Defender") && next.includes("function resizeCanvas()")) {
    next = next.replace(
      /function resizeCanvas\(\) \{[\s\S]*?\n        \}/,
      `function resizeCanvas() {
            const stage = document.querySelector('.game-stage');
            if (!stage) return;
            const w = stage.clientWidth;
            const h = stage.clientHeight;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
        }`,
    );
  }

  if (next.includes(DESKTOP_FIT_MARKER)) {
    next = next.replace(/\/\* solar-desktop-fit \*\/[\s\S]*?(?=\n  <\/style>|\n<\/style>)/, DESKTOP_FIT_CSS);
  } else if (next.includes("</style>")) {
    next = next.replace("</style>", `${DESKTOP_FIT_CSS}\n  </style>`);
  }

  return next;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
let changed = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;
  html = replacePlanetArt(html);
  html = patchCharacterPage(html);
  html = patchIntroGame(html);
  html = patchSolarPerspective(html);
  html = patchQuiz(html);
  html = patchQuizLiveScore(html);
  html = patchQuizContinue(html);
  html = patchSunPage(html);
  html = patchSunClimbGame(html);
  html = patchSunClimbStartBottom(html);
  if (file === "011-Mercury.html") html = patchMercuryGame(html);
  html = patchPlanetViewerSpin(html);
  html = patchPlanetViewerMobile(html);
  html = patchDesktopGameFit(html);
  html = patchPlayerStorage(html);
  html = injectPlayer(html);
  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    changed++;
    console.log("updated", file);
  }
}
console.log("done:", changed, "files");
