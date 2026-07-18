/**
 * Audit all Solar System HTML pages at mobile + desktop viewports.
 * Run: node book_html/SolarSystem/_audit-solar-ui.mjs
 * Requires: npx playwright install chromium (first run)
 */
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { classifyPage } from "./_shared-ui-blocks.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, "_audit-output");
const shotDir = path.join(outDir, "screenshots");

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = req.url === "/" ? "/002-Index.html" : req.url;
      const safe = path.normalize(decodeURIComponent(url)).replace(/^(\.\.[/\\])+/, "");
      const fp = path.join(dir, path.basename(safe));
      if (!fp.startsWith(dir) || !fs.existsSync(fp)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(fp).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

async function getPlaywright() {
  try {
    return await import("playwright");
  } catch {
    console.error("Playwright not installed. Run: npm install -D playwright");
    process.exit(1);
  }
}

function checksForPage(type, metrics) {
  const issues = [];
  const { bodyScrollable, mainHeight, viewportH, bodyOverflowY, hasScrollContent } = metrics;

  if (type === "reading" || type === "quiz" || type === "character") {
    if (hasScrollContent && !bodyScrollable && bodyOverflowY === "hidden") {
      issues.push("scroll-blocked");
    }
  }

  if (type === "planet-svg" || type === "all-planets") {
    const minMain = viewportH * 0.42;
    if (mainHeight > 0 && mainHeight < minMain) {
      issues.push(`main-too-small:${Math.round(mainHeight)}px<${Math.round(minMain)}px`);
    }
  }

  if (type === "intro-game") {
    const minStage = viewportH * 0.45;
    if (mainHeight > 0 && mainHeight < minStage) {
      issues.push(`stage-too-small:${Math.round(mainHeight)}px`);
    }
  }

  if (type === "outro-game") {
    const minWrap = viewportH * 0.45;
    if (mainHeight > 0 && mainHeight < minWrap) {
      issues.push(`game-wrap-too-small:${Math.round(mainHeight)}px`);
    }
  }

  return issues;
}

async function auditPage(page, base, file, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${base}/${file}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(400);

  const html = fs.readFileSync(path.join(dir, file), "utf8");
  const type = classifyPage(file, html);

  const metrics = await page.evaluate(() => {
    const body = document.body;
    const htmlEl = document.documentElement;
    const pick =
      document.querySelector(".game-stage") ||
      document.querySelector(".svg-viewport") ||
      document.querySelector(".svg-wrap") ||
      document.querySelector(".game-wrap") ||
      document.querySelector(".container");
    const rect = pick ? pick.getBoundingClientRect() : { height: 0 };
    return {
      bodyOverflowY: getComputedStyle(body).overflowY,
      bodyScrollable: htmlEl.scrollHeight > htmlEl.clientHeight + 8,
      hasScrollContent: htmlEl.scrollHeight > window.innerHeight + 40,
      mainHeight: rect.height,
      viewportH: window.innerHeight,
    };
  });

  const issues = checksForPage(type, metrics);
  const shotName = `${file.replace(".html", "")}_${viewport.name}.png`;
  await page.screenshot({
    path: path.join(shotDir, shotName),
    fullPage: issues.length > 0,
  });

  return { file, viewport: viewport.name, type, issues, metrics };
}

async function main() {
  fs.mkdirSync(shotDir, { recursive: true });
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .sort();

  const { chromium } = await getPlaywright();
  const { server, base } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  for (const file of files) {
    for (const vp of VIEWPORTS) {
      try {
        const r = await auditPage(page, base, file, vp);
        results.push(r);
        if (r.issues.length) {
          console.log("FAIL", file, vp.name, r.issues.join(", "));
        } else {
          console.log("OK  ", file, vp.name);
        }
      } catch (err) {
        console.log("ERR ", file, vp.name, err.message);
        results.push({ file, viewport: vp.name, issues: ["load-error"], error: String(err) });
      }
    }
  }

  await browser.close();
  server.close();

  const summary = {
    auditedAt: new Date().toISOString(),
    total: results.length,
    failed: results.filter((r) => r.issues?.length).length,
    results,
  };
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(summary, null, 2));

  const md = [
    "# Solar System UI Audit",
    "",
    `Pages: ${files.length} | Checks: ${results.length} | Failures: ${summary.failed}`,
    "",
    "## Failures",
    "",
  ];
  for (const r of results.filter((x) => x.issues?.length)) {
    md.push(`- **${r.file}** (${r.viewport}): ${r.issues.join(", ")}`);
  }
  fs.writeFileSync(path.join(outDir, "report.md"), md.join("\n"));
  console.log("\nReport:", path.join(outDir, "report.md"));
  console.log("Screenshots:", shotDir);
  process.exit(summary.failed > 0 ? 1 : 0);
}

main();
