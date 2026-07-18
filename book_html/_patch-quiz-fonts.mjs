import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)));

const QUIZ_FONT_CSS = `/* quiz-readability-boost */
.quiz-card{padding:16px !important;}
.question{font-size:20px !important;line-height:1.45 !important;}
.quiz-card .option,.options .option{font-size:18px !important;line-height:1.4 !important;padding:12px 16px !important;}
.feedback{font-size:17px !important;line-height:1.45 !important;}
.competitor-name{font-size:16px !important;}
.competitor-score{font-size:22px !important;}
.vs-divider{font-size:22px !important;}
.competitor-icon{font-size:34px !important;}
.player-info{font-size:18px !important;}
.container > .header .subtitle,.header .subtitle,.subtitle{font-size:18px !important;}
.container > .header h1,.header h1{font-size:28px !important;}
.podium-name{font-size:16px !important;}
.podium-score{font-size:18px !important;}
.score-label{font-size:16px !important;}
.score-card .message{font-size:20px !important;}
.retry-btn{font-size:18px !important;}
.quiz-card .options,.options{gap:10px !important;}
.q-label{font-size:17px !important;}
.q-text{font-size:22px !important;line-height:1.6 !important;}
.card .option,.option{font-size:20px !important;line-height:1.45 !important;padding:14px 18px !important;}
.card .scene,.scene{font-size:20px !important;}
.explain,.explanation{font-size:18px !important;line-height:1.5 !important;}
`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      walk(fp, out);
    } else if (/Quiz\.html$|\.quiz\.html$|QuizTime\.html$|quiz-\.html$/i.test(name)) {
      out.push(fp);
    }
  }
  return out;
}

function patchQuizFont(html) {
  const marker = "/* quiz-readability-boost */";
  if (html.includes(marker)) {
    return html.replace(/\/\* quiz-readability-boost \*\/[\s\S]*?(?=\n\s*<\/style>)/, QUIZ_FONT_CSS.trim());
  }
  return html.replace(/\n(\s*)<\/style>/, `\n${QUIZ_FONT_CSS}$1</style>`);
}

let changed = 0;
for (const fp of walk(root)) {
  if (path.basename(fp) === "_patch-quiz-fonts.mjs") continue;
  const original = fs.readFileSync(fp, "utf8");
  const next = patchQuizFont(original);
  if (next !== original) {
    fs.writeFileSync(fp, next, "utf8");
    changed++;
    console.log("patched", path.relative(root, fp));
  }
}
console.log("done", changed, "quiz files");
