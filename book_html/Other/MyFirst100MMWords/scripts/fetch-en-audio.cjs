/* Download English TTS MP3s for offline/local playback (Google translate_tts). */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "assets", "audio-en");
const manifestPath = path.join(outDir, "manifest.json");

function collectFromJs(file, key) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  const out = new Set();
  const re = new RegExp("\\b" + key + ":\\s*\"((?:\\\\.|[^\"\\\\])*)\"", "g");
  let m;
  while ((m = re.exec(src))) {
    try {
      out.add(JSON.parse('"' + m[1] + '"'));
    } catch (e) {
      out.add(m[1]);
    }
  }
  return out;
}

function collectFromHtml(attr) {
  const out = new Set();
  for (const name of fs.readdirSync(root)) {
    if (!name.endsWith(".html")) continue;
    const src = fs.readFileSync(path.join(root, name), "utf8");
    const re = new RegExp(attr + "=\"([^\"]*)\"", "g");
    let m;
    while ((m = re.exec(src))) {
      const t = m[1]
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .trim();
      if (t) out.add(t);
    }
  }
  return out;
}

function hashText(text) {
  return crypto.createHash("sha1").update(String(text), "utf8").digest("hex").slice(0, 16);
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "*/*",
          Referer: "https://translate.google.com/",
        },
        timeout: 20000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve, reject);
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode !== 200) {
            reject(new Error("HTTP " + res.statusCode + " (" + buf.length + " bytes)"));
            return;
          }
          if (buf.length < 200 || buf[0] !== 0xff) {
            reject(new Error("Not MP3 (" + buf.length + " bytes, first=" + (buf[0] || 0) + ")"));
            return;
          }
          resolve(buf);
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

function ttsUrl(text, mirror) {
  const q = encodeURIComponent(text);
  if (mirror === 0) {
    return "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=en&q=" + q;
  }
  return "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" + q;
}

async function downloadOne(text) {
  const id = hashText(text);
  const file = id + ".mp3";
  const dest = path.join(outDir, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 200) {
    return { text, file, cached: true };
  }
  let lastErr;
  for (let mirror = 0; mirror < 2; mirror++) {
    try {
      const buf = await fetchBuffer(ttsUrl(text, mirror));
      fs.writeFileSync(dest, buf);
      return { text, file, cached: false, bytes: buf.length };
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastErr || new Error("failed");
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const all = new Set([
    ...collectFromJs("_mmwords-data.js", "en"),
    ...collectFromJs("_mmwords-sentence-lines.js", "en"),
    ...collectFromHtml("data-en"),
    "Thank you very much",
  ]);
  const list = [...all].filter(Boolean);
  console.log("Unique EN strings:", list.length);

  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : {};
  let ok = 0;
  let fail = 0;
  for (let i = 0; i < list.length; i++) {
    const text = list[i];
    process.stdout.write("[" + (i + 1) + "/" + list.length + "] ");
    try {
      const r = await downloadOne(text);
      manifest[text] = r.file;
      ok++;
      console.log((r.cached ? "cached" : "saved") + " " + r.file + (r.bytes ? " " + r.bytes + "b" : ""));
    } catch (e) {
      fail++;
      console.log("FAIL " + text.slice(0, 50) + " :: " + e.message);
    }
    if (i % 5 === 4) await new Promise((r) => setTimeout(r, 250));
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  const mapJs =
    "/* Auto-generated — local English TTS map */\nwindow.MM_EN_AUDIO_MAP = " +
    JSON.stringify(manifest) +
    ";\n";
  fs.writeFileSync(path.join(root, "_mmwords-en-audio-map.js"), mapJs, "utf8");
  console.log("Done. ok=" + ok + " fail=" + fail + " manifest=" + Object.keys(manifest).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
