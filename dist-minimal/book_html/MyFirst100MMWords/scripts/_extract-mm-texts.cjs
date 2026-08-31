/* Extract unique Myanmar strings for TTS caching */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function collectFromJs(file) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  const out = new Set();
  const re = /\bmm:\s*"((?:\\.|[^"\\])*)"/g;
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

function collectFromHtml() {
  const out = new Set();
  for (const name of fs.readdirSync(root)) {
    if (!name.endsWith(".html")) continue;
    const src = fs.readFileSync(path.join(root, name), "utf8");
    const re = /data-mm="([^"]*)"/g;
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

const all = new Set([
  ...collectFromJs("_mmwords-data.js"),
  ...collectFromJs("_mmwords-sentence-lines.js"),
  ...collectFromHtml(),
  "ကျေးဇူးတင်ပါတယ်",
]);

const list = [...all].filter(Boolean).sort((a, b) => a.localeCompare(b, "my"));
console.log(JSON.stringify({ count: list.length, texts: list }, null, 0));
