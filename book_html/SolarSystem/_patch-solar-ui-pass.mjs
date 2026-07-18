import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  AUDIT_MARKER,
  AUDIT_OVERRIDE_CSS,
  LOAD_PLAYER_FN,
  LOAD_PLAYER_IIFE,
  READING_PAGE_CSS,
  FIT_GAME_FRAME_SCRIPT,
  bodyClassForType,
  classifyPage,
} from "./_shared-ui-blocks.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));

function injectAuditOverrides(html) {
  if (html.includes(AUDIT_MARKER)) {
    return html.replace(
      /\/\* solar-ui-audit-overrides \*\/[\s\S]*?(?=\n  <\/style>|\n<\/style>)/,
      AUDIT_OVERRIDE_CSS.trim(),
    );
  }
  const block = `${READING_PAGE_CSS}\n${AUDIT_OVERRIDE_CSS}\n`;
  return html.replace("</style>", `${block}  </style>`);
}

function patchBodyClass(html, file) {
  const type = classifyPage(file, html);
  const m = html.match(/<body([^>]*)>/);
  if (!m) return html;
  const attrs = m[1];
  const cls = attrs.match(/class="([^"]*)"/);
  const existing = cls ? cls[1] : "";
  const nextClass = bodyClassForType(type, existing);
  if (cls) {
    if (cls[1] === nextClass) return html;
    return html.replace(/<body([^>]*)>/, `<body class="${nextClass}">`);
  }
  return html.replace("<body>", `<body class="${nextClass}">`);
}

function patchQuizPlayer(html, file) {
  if (!/Quiz\.html$/i.test(file)) return html;
  let next = html;
  next = next.replace(
    /\/\/ Load player info[\s\S]*?loadPlayerInfo\(\);\s*\n/,
    `// Load player info from page 3 character selection\n${LOAD_PLAYER_FN}\n\n`,
  );
  next = next.replace(
    /\(function loadPlayerInfo\(\) \{[\s\S]*?\}\)\(\);\s*\n/,
    `${LOAD_PLAYER_IIFE}\n`,
  );
  next = next.replace(
    /const userName = SolarPlayer\.getUserName\(\) \|\| 'Ariel';/g,
    "const userName = SolarPlayer.getUserName() || 'Explorer';",
  );
  return next;
}

function patchGameFrameFit(html, file) {
  const type = classifyPage(file, html);
  if (type !== "intro-game" && type !== "outro-game") return html;
  if (html.includes("solar-ui-fit-frame")) {
    return html.replace(
      /<script>\s*\/\* solar-ui-fit-frame \*\/[\s\S]*?<\/script>\s*/,
      FIT_GAME_FRAME_SCRIPT + "\n",
    );
  }
  return html.replace("</body>", `${FIT_GAME_FRAME_SCRIPT}\n</body>`);
}

let changed = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".html")) continue;
  const fp = path.join(dir, file);
  const original = fs.readFileSync(fp, "utf8");
  let html = original;
  html = patchBodyClass(html, file);
  html = patchQuizPlayer(html, file);
  html = injectAuditOverrides(html);
  html = patchGameFrameFit(html, file);
  if (html !== original) {
    fs.writeFileSync(fp, html, "utf8");
    changed++;
    console.log("patched", file);
  }
}
console.log("done", changed, "files");
