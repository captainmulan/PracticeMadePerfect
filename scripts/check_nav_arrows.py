"""
Verify practice-workspace top-bar ←/→ circles are fully inside the bar
at iPhone XR size (414x896). Uses Python Playwright.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tmp-panel-diag" / "nav-arrows"
OUT.mkdir(parents=True, exist_ok=True)

# Minimal page that mirrors production top-bar CSS (course.css essentials).
HTML = r"""<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  html, body { margin:0; width:100%; height:100%; background:#cbd5e1; }
  .phone {
    width: 414px; height: 896px; margin: 0 auto; background: #e2e8f0;
    overflow: hidden; border-radius: 40px; position: relative;
  }
  .practice-workspace-top-bar {
    --pmp-nav-btn-bg: rgba(255,255,255,0.14);
    --pmp-nav-btn-border: 1px solid rgba(255,255,255,0.24);
    --pmp-nav-btn-color: #ffffff;
    --pmp-nav-btn-disabled: rgba(255,255,255,0.45);
    --pmp-nav-btn-size: 24px;
    --pmp-nav-side-pad: 32px;
    display: grid;
    grid-template-columns: var(--pmp-nav-btn-size) minmax(0, 1fr) var(--pmp-nav-btn-size);
    align-items: center;
    column-gap: 8px;
    color: #f8fafc;
    padding: 12px var(--pmp-nav-side-pad);
    border-radius: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: visible;
    min-height: 52px;
    background: linear-gradient(180deg, #a78bfa 0%, #6366f1 100%);
  }
  .chapter-nav-side { display:flex; align-items:center; justify-content:center; }
  .chapter-nav-side-left { justify-content:flex-start; }
  .chapter-nav-side-right { justify-content:flex-end; }
  .chapter-nav-center { display:inline-flex; align-items:center; gap:4px; justify-self:center; min-width:0; }
  .chapter-nav-button {
    width: var(--pmp-nav-btn-size) !important;
    height: var(--pmp-nav-btn-size) !important;
    min-width: var(--pmp-nav-btn-size) !important;
    min-height: var(--pmp-nav-btn-size) !important;
    padding: 0 !important; margin: 0 !important;
    border-radius: 999px !important;
    border: var(--pmp-nav-btn-border) !important;
    background: var(--pmp-nav-btn-bg) !important;
    color: var(--pmp-nav-btn-color) !important;
    font-size: 15px !important; font-weight: 700 !important;
    display: inline-flex !important; align-items: center !important; justify-content: center !important;
    box-sizing: border-box !important; flex-shrink: 0 !important;
  }
  .chapter-label { font-size: 0.85rem; font-weight: 800; white-space: nowrap; }
</style>
</head>
<body>
  <div class="phone" id="phone">
    <div class="practice-workspace-top-bar" id="bar">
      <div class="chapter-nav-side chapter-nav-side-left">
        <button class="chapter-nav-button" id="prev" type="button">←</button>
      </div>
      <div class="chapter-nav-center">
        <span>🏠</span>
        <span class="chapter-label">Page 11/35</span>
        <span>⚙️</span>
      </div>
      <div class="chapter-nav-side chapter-nav-side-right">
        <button class="chapter-nav-button" id="next" type="button">→</button>
      </div>
    </div>
  </div>
</body>
</html>
"""


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("FAIL: playwright not installed")
        return 2

    html_path = OUT / "nav-fixture.html"
    html_path.write_text(HTML, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 430, "height": 932})
        page.goto(html_path.as_uri())
        page.wait_for_selector("#prev")

        metrics = page.evaluate(
            """() => {
              const phone = document.getElementById('phone');
              const bar = document.getElementById('bar');
              const prev = document.getElementById('prev');
              const next = document.getElementById('next');
              const pr = phone.getBoundingClientRect();
              const br = bar.getBoundingClientRect();
              const a = prev.getBoundingClientRect();
              const b = next.getBoundingClientRect();
              const eps = 0.5;
              const R = 44; // iPhone continuous corner ≈ 40–47
              const clearCorner = (rect, side) => {
                // For top corners: at each y on the button, required inset from side.
                const y0 = Math.max(0, rect.top - pr.top);
                const y1 = Math.max(0, rect.bottom - pr.top);
                let maxNeed = 0;
                for (let y = y0; y <= y1; y += 1) {
                  if (y >= R) continue;
                  const dy = R - y;
                  const need = R - Math.sqrt(Math.max(0, R * R - dy * dy));
                  if (need > maxNeed) maxNeed = need;
                }
                const have = side === 'left' ? (rect.left - pr.left) : (pr.right - rect.right);
                return { need: maxNeed, have, ok: have + 0.5 >= maxNeed };
              };
              const prevCorner = clearCorner(a, 'left');
              const nextCorner = clearCorner(b, 'right');
              return {
                phone: {w: pr.width, h: pr.height, l: pr.left, r: pr.right, t: pr.top, b: pr.bottom},
                bar: {w: br.width, h: br.height, l: br.left, r: br.right, t: br.top, b: br.bottom},
                prev: {l: a.left, r: a.right, t: a.top, b: a.bottom, w: a.width, h: a.height},
                next: {l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height},
                prevInsideBar: a.left >= br.left - eps && a.right <= br.right + eps && a.top >= br.top - eps && a.bottom <= br.bottom + eps,
                nextInsideBar: b.left >= br.left - eps && b.right <= br.right + eps && b.top >= br.top - eps && b.bottom <= br.bottom + eps,
                prevInset: a.left - br.left,
                nextInset: br.right - b.right,
                prevCorner,
                nextCorner,
              };
            }"""
        )

        page.screenshot(path=str(OUT / "nav-arrows.png"), full_page=True)
        browser.close()

    print(metrics)
    ok = (
        metrics["prevInsideBar"]
        and metrics["nextInsideBar"]
        and metrics["prevInset"] >= 31.5
        and metrics["nextInset"] >= 31.5
        and metrics["prevCorner"]["ok"]
        and metrics["nextCorner"]["ok"]
        and abs(metrics["prev"]["w"] - 24) < 1.5
        and abs(metrics["next"]["w"] - 24) < 1.5
    )
    if ok:
        print("PASS: both arrows fully inside bar + clear of 44px corner mask")
        return 0
    print("FAIL: arrows not fully clear")
    return 1


if __name__ == "__main__":
    sys.exit(main())
