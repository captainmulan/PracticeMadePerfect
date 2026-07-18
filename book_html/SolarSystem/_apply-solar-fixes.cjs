const fs = require("fs");
const path = require("path");

const dir = __dirname;
const planetArt = fs.readFileSync(path.join(dir, "_planet-texture-art.js"), "utf8").trim();
const playerScript = fs.readFileSync(path.join(dir, "_solar-player.js"), "utf8").trim();
const playerTag = `<script>\n${playerScript}\n</script>`;

const artStart = "/* Planet texture art";
const artEndMarkers = ["\nfunction makePlanetViewer", "\n\n  /* ── Solar System Viewer", "\n\n  /* ── Order the Planets"];

function replacePlanetArt(html) {
  const start = html.indexOf(artStart);
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
  if (!next.includes("overflow-y:auto")) {
    next = next.replace(
      "overflow-x:hidden;",
      "overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;",
    );
  }
  if (!next.includes("@media (max-width: 480px)")) {
    next = next.replace(
      "  </style>\n</head>",
      `    @media (max-width: 480px) {
      .container{padding:12px 12px 24px;justify-content:flex-start;min-height:auto;}
      h1{font-size:26px;}
      .subtitle{font-size:15px;}
      .preview-section{padding:16px;margin-bottom:16px;}
      .preview-character{font-size:56px;}
      .preview-name{font-size:20px;}
      input[type="text"]{padding:12px 14px;font-size:17px;margin-bottom:16px;}
      .character-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:16px;}
      .character-option{padding:12px 6px;font-size:34px;border-width:3px;border-radius:14px;}
      .character-name{font-size:11px;margin-top:4px;}
      .start-btn{padding:14px 20px;font-size:18px;}
    }
  </style>
</head>`,
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

  next = next.replace(
    /function startAdventure\(\) \{[\s\S]*?\}/,
    `function startAdventure() {
  persistPlayer();
}`,
  );

  if (!next.includes("persistPlayer();")) {
    next = next.replace(
      "  selectedCharacterName = name;\n  updatePreview();",
      "  selectedCharacterName = name;\n  updatePreview();\n  persistPlayer();",
    );
  }

  if (!next.includes("persistPlayer();\n  document.getElementById('previewCharacter')")) {
    next = next.replace(
      /function updatePreview\(\) \{\n  const userName = document\.getElementById\('userName'\)\.value[^;]*;/,
      "function updatePreview() {\n  const userName = document.getElementById('userName').value.trim() || 'Explorer';\n  persistPlayer();",
    );
  }

  return next;
}

function patchIntroGame(html) {
  if (!html.includes("Solar System Defender")) return html;
  let next = html;
  if (!next.includes(".game-shell")) {
    next = next.replace(
      "        body {\n            font-family: 'Comic Sans MS', 'Comic Neue', system-ui, sans-serif;\n            background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a2a 100%);\n            color: #fff;\n            min-height: 100vh;\n            overflow: hidden;\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            justify-content: center;\n        }",
      `        body {
            font-family: 'Comic Sans MS', 'Comic Neue', system-ui, sans-serif;
            background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a2a 100%);
            color: #fff;
            min-height: 100vh;
            overflow-x: hidden;
            overflow-y: auto;
            margin: 0;
        }
        .game-shell {
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            padding: 8px 10px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-sizing: border-box;
        }
        .game-stage {
            position: relative;
            width: 100%;
            max-width: 700px;
        }`,
    );
    next = next.replace(
      "<body>\n    <div class=\"title\"",
      "<body>\n<div class=\"game-shell\">\n    <div class=\"title\"",
    );
    next = next.replace(
      "    <canvas id=\"gameCanvas\" width=\"700\" height=\"600\"></canvas>",
      "    <div class=\"game-stage\">\n    <canvas id=\"gameCanvas\" width=\"700\" height=\"600\"></canvas>",
    );
    next = next.replace(
      "    <div class=\"start-screen\" id=\"startScreen\">",
      "    <div class=\"start-screen\" id=\"startScreen\">",
    );
    next = next.replace(
      "    <div class=\"game-over-screen\" id=\"gameOverScreen\" style=\"display: none;\">",
      "    <div class=\"game-over-screen\" id=\"gameOverScreen\" style=\"display: none;\">",
    );
    next = next.replace(
      "    </div>\n\n    <script>",
      "    </div>\n    </div>\n</div>\n\n    <script>",
    );
    next = next.replace(
      "        .start-screen, .game-over-screen {\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            background: rgba(0, 0, 0, 0.85);\n            padding: 30px;\n            border-radius: 16px;\n            text-align: center;\n            border: 2px solid rgba(255, 200, 0, 0.6);\n            z-index: 100;\n        }",
      `        .start-screen, .game-over-screen {
            position: absolute;
            inset: 8px;
            margin: auto;
            width: calc(100% - 16px);
            max-width: 360px;
            max-height: calc(100% - 16px);
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: rgba(0, 0, 0, 0.88);
            padding: 16px 14px;
            border-radius: 14px;
            text-align: center;
            border: 2px solid rgba(255, 200, 0, 0.6);
            z-index: 100;
            box-sizing: border-box;
        }`,
    );
    next = next.replace(
      "        #gameCanvas {\n            display: block;\n            border: 2px solid rgba(255, 200, 0, 0.5);\n            border-radius: 12px;\n            box-shadow: 0 0 30px rgba(255, 200, 0, 0.2);\n        }",
      `        #gameCanvas {
            display: block;
            width: 100%;
            height: auto;
            max-height: min(52vh, 420px);
            border: 2px solid rgba(255, 200, 0, 0.5);
            border-radius: 12px;
            box-shadow: 0 0 30px rgba(255, 200, 0, 0.2);
        }`,
    );
    next = next.replace(
      "        @media (max-width: 600px) {\n            .ui-item {\n                font-size: 14px;\n                padding: 6px 12px;\n            }\n            .start-screen, .game-over-screen {\n                padding: 20px;\n            }\n            .start-screen h1, .game-over-screen h1 {\n                font-size: 24px;\n            }\n            .touch-btn {\n                width: 60px;\n                height: 60px;\n                font-size: 24px;\n            }\n        }",
      `        @media (max-width: 600px) {
            .game-shell { padding: 6px 8px 12px; }
            .title { font-size: 15px !important; margin-bottom: 6px !important; line-height: 1.35; }
            .ui-container { margin-bottom: 6px; gap: 4px; }
            .ui-item { font-size: 12px; padding: 5px 8px; }
            .start-screen h1, .game-over-screen h1 { font-size: 20px; margin-bottom: 8px; }
            .start-screen p, .game-over-screen p { font-size: 13px; margin-bottom: 12px; }
            .btn { padding: 10px 20px; font-size: 16px; }
            .touch-controls { gap: 12px; margin-top: 6px; }
            .touch-btn { width: 56px; height: 56px; font-size: 22px; }
            #gameCanvas { max-height: min(46vh, 320px); }
        }`,
    );
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
  html = patchPlayerStorage(html);
  html = injectPlayer(html);
  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    changed++;
    console.log("updated", file);
  }
}
console.log("done:", changed, "files");
