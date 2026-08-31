/**
 * Static + HTTP DOM audit for Solar System HTML (no Playwright required).
 * Run: node book_html/SolarSystem/_audit-solar-ui-static.mjs
 */
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { classifyPage, AUDIT_MARKER } from "./_shared-ui-blocks.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, "_audit-output");

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const name = path.basename(decodeURIComponent(req.url || "/"));
      const fp = path.join(dir, name);
      if (!fs.existsSync(fp)) {
        res.writeHead(404);
        res.end("missing");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(fp).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, base: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

function staticChecks(file, html) {
  const issues = [];
  const type = classifyPage(file, html);

  if (!html.includes(AUDIT_MARKER)) issues.push("missing-audit-overrides");

  if (type === "reading" || type === "quiz" || type === "character") {
    if (!html.includes("reading-page")) issues.push("missing-reading-page-class");
    if (!html.includes("overflow-y: auto !important") && !html.includes("reading-page")) {
      issues.push("missing-scroll-override");
    }
  }
  if (type === "planet-svg" && !html.includes("big-planet-page")) issues.push("missing-big-planet-page");
  if (type === "all-planets" && !html.includes("all-planets-page")) issues.push("missing-all-planets-page");
  if ((type === "intro-game" || type === "outro-game") && !html.includes("big-game-page")) {
    issues.push("missing-big-game-page");
  }
  if (/Quiz\.html$/i.test(file)) {
    if (html.includes("getElementById('playerName')") && !html.includes('id="playerName"')) {
      issues.push("broken-quiz-player-load");
    }
    if (!html.includes("loadPlayerInfo")) issues.push("missing-loadPlayerInfo");
  }
  if (type === "planet-svg" && !html.includes("scroll-cue")) issues.push("missing-scroll-cue");

  return { type, issues };
}

async function domChecks(base, file, type) {
  const issues = [];
  const mobile = await fetch(`${base}/${file}`, {
    headers: { "User-Agent": "SolarAudit/1.0" },
  }).then((r) => r.text());

  // crude size hints from inline CSS when live DOM unavailable
  if (type === "planet-svg" && /max-height:\s*220px/.test(mobile)) {
    const hasLateOverride = mobile.lastIndexOf("big-planet-page") > mobile.lastIndexOf("max-height: 220px");
    if (!hasLateOverride) issues.push("220px-cap-after-big-planet");
  }
  return issues;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html")).sort();
  const { server, base } = await startServer();
  const results = [];

  for (const file of files) {
    const html = fs.readFileSync(path.join(dir, file), "utf8");
    const { type, issues } = staticChecks(file, html);
    const domIssues = await domChecks(base, file, type);
    const all = [...issues, ...domIssues];
    results.push({ file, type, issues: all });
    console.log(all.length ? `FAIL ${file}: ${all.join(", ")}` : `OK   ${file}`);
  }

  server.close();
  const failed = results.filter((r) => r.issues.length);
  fs.writeFileSync(
    path.join(outDir, "static-report.json"),
    JSON.stringify({ failed: failed.length, results }, null, 2),
  );
  process.exit(failed.length ? 1 : 0);
}

main();
