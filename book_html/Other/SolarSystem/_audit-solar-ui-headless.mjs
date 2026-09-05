/**
 * Visual + DOM audit for all Solar System HTML pages using headless Chrome (no npm deps).
 * Run: node book_html/SolarSystem/_audit-solar-ui-headless.mjs
 */
import fs from "fs";
import path from "path";
import http from "http";
import { spawn, execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { classifyPage } from "./_shared-ui-blocks.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, "_audit-output");
const shotDir = path.join(outDir, "screenshots");

const CHROME = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
].find((p) => p && fs.existsSync(p));

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];

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

async function waitForChrome(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Chrome CDP did not start");
}

async function cdpSend(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1e9);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error(`CDP timeout: ${method}`));
    }, 25000);

    const onMessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== id) return;
      clearTimeout(timer);
      ws.removeEventListener("message", onMessage);
      if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else resolve(msg.result);
    };

    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function auditWithCdp(base, file, viewport, chromePort) {
  const url = `${base}/${file}`;
  const create = await fetch(
    `http://127.0.0.1:${chromePort}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  );
  const target = await create.json();
  const html = fs.readFileSync(path.join(dir, file), "utf8");
  const type = classifyPage(file, html);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  await cdpSend(ws, "Page.enable");
  await cdpSend(ws, "Runtime.enable");
  await cdpSend(ws, "Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.name === "mobile",
  });
  await cdpSend(ws, "Page.navigate", { url });
  const waitMs = type === "intro-game" || type === "outro-game" ? 1800 : 900;
  await new Promise((r) => setTimeout(r, waitMs));

  const evalResult = await cdpSend(ws, "Runtime.evaluate", {
    expression: `(() => {
      const body = document.body;
      const htmlEl = document.documentElement;
      const pick =
        document.querySelector('.game-stage') ||
        document.querySelector('.svg-viewport') ||
        document.querySelector('.svg-wrap') ||
        document.querySelector('.game-wrap') ||
        document.querySelector('.container');
      const rect = pick ? pick.getBoundingClientRect() : { height: 0 };
      return {
        bodyOverflowY: body ? getComputedStyle(body).overflowY : 'unknown',
        bodyScrollable: htmlEl ? htmlEl.scrollHeight > htmlEl.clientHeight + 8 : false,
        hasScrollContent: htmlEl ? htmlEl.scrollHeight > window.innerHeight + 40 : false,
        mainHeight: rect.height,
        viewportH: window.innerHeight,
      };
    })()`,
    returnByValue: true,
  });

  if (evalResult.exceptionDetails) {
    throw new Error(JSON.stringify(evalResult.exceptionDetails));
  }
  const metrics = evalResult.result?.value;
  if (!metrics) throw new Error("no metrics");
  ws.close();

  const shotName = `${file.replace(".html", "")}_${viewport.name}.png`;
  const shotPath = path.join(shotDir, shotName);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      `--window-size=${viewport.width},${viewport.height}`,
      `--screenshot=${shotPath}`,
      "--hide-scrollbars",
      "--disable-gpu",
      url,
    ],
    { stdio: "ignore" },
  );

  await fetch(`http://127.0.0.1:${chromePort}/json/close/${target.id}`, { method: "GET" }).catch(
    () => {},
  );

  const issues = checksForPage(type, metrics);
  return { file, viewport: viewport.name, type, issues, metrics };
}

async function main() {
  if (!CHROME) {
    console.error("Chrome not found. Set CHROME_PATH or install Google Chrome.");
    process.exit(1);
  }

  fs.mkdirSync(shotDir, { recursive: true });
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html")).sort();
  const { server, base } = await startServer();

  const chromePort = 9222 + Math.floor(Math.random() * 1000);
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${chromePort}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore", detached: false },
  );

  try {
    await waitForChrome(chromePort);
    const results = [];

    for (const file of files) {
      for (const vp of VIEWPORTS) {
        try {
          const r = await auditWithCdp(base, file, vp, chromePort);
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

    const failed = results.filter((r) => r.issues?.length);
    const summary = {
      auditedAt: new Date().toISOString(),
      total: results.length,
      failed: failed.length,
      results,
    };
    fs.writeFileSync(path.join(outDir, "headless-report.json"), JSON.stringify(summary, null, 2));

    const md = [
      "# Solar System Headless UI Audit",
      "",
      `Pages: ${files.length} | Checks: ${results.length} | Failures: ${failed.length}`,
      "",
      "## Failures",
      "",
    ];
    for (const r of failed) {
      md.push(`- **${r.file}** (${r.viewport}): ${r.issues.join(", ")}`);
    }
    fs.writeFileSync(path.join(outDir, "headless-report.md"), md.join("\n"));
    console.log("\nReport:", path.join(outDir, "headless-report.md"));
    console.log("Screenshots:", shotDir);
    process.exit(failed.length ? 1 : 0);
  } finally {
    chrome.kill();
    server.close();
  }
}

main();
