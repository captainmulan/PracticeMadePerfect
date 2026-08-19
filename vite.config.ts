import { cpSync, existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOK_HTML_ROOT = path.resolve(__dirname, "book_html");

const BOOK_HTML_MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".epub": "application/epub+zip",
};

function safeBookHtmlPath(relativePath: string): string | null {
  const rel = decodeURIComponent(relativePath.split("?")[0]).replace(/^\/+/, "");
  const filePath = path.resolve(BOOK_HTML_ROOT, rel);
  if (filePath !== BOOK_HTML_ROOT && !filePath.startsWith(`${BOOK_HTML_ROOT}${path.sep}`)) {
    return null;
  }
  return filePath;
}

async function resolveBookHtmlFile(filePath: string): Promise<string | null> {
  if (existsSync(filePath)) {
    return filePath;
  }
  const withPdf = `${filePath}.pdf`;
  if (existsSync(withPdf)) {
    return withPdf;
  }
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    return null;
  }
  const pdfs = readdirSync(dir).filter((name) => name.toLowerCase().endsWith(".pdf"));
  if (pdfs.length === 0) {
    return null;
  }
  return path.resolve(dir, pdfs[0]);
}

async function serveBookHtml(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  if (!req.url?.startsWith("/book_html/")) {
    next();
    return;
  }

  const requested = safeBookHtmlPath(req.url.slice("/book_html/".length));
  if (!requested) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  try {
    const filePath = await resolveBookHtmlFile(requested);
    if (!filePath) {
      next();
      return;
    }
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", BOOK_HTML_MIME[ext] ?? "application/octet-stream");
    res.end(data);
  } catch {
    next();
  }
}

function bookHtmlStaticPlugin(): Plugin {
  return {
    name: "book-html-static",
    configureServer(server) {
      server.middlewares.use(serveBookHtml);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveBookHtml);
    },
    closeBundle() {
      if (!existsSync(BOOK_HTML_ROOT)) {
        return;
      }
      const dest = path.resolve(__dirname, "dist/book_html");
      cpSync(BOOK_HTML_ROOT, dest, { recursive: true });
      console.log(`Copied book_html -> ${dest}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), bookHtmlStaticPlugin()],
  server: {
    port: 4173,
  },
});
