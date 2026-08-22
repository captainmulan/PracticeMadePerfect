import sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:5173"
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag")
OUT.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chrome")
    page = browser.new_page(viewport={"width": 900, "height": 1100})
    page.goto(f"{BASE}/courses/shwe-thway-journal-vol-56-no-10", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(2000)
    Path(OUT / "course10.txt").write_text(page.inner_text("body"), encoding="utf-8")
    page.screenshot(path=str(OUT / "course10.png"), full_page=True)
    # click likely start/read
    for name in ["Read", "Start", "Open", "Continue", "Tap", "Begin"]:
        loc = page.get_by_text(name, exact=False)
        if loc.count():
            print("click", name, loc.count())
            try:
                loc.first.click(timeout=2000)
                page.wait_for_timeout(2000)
                break
            except Exception as e:
                print("clickfail", e)
    page.screenshot(path=str(OUT / "course10b.png"), full_page=True)
    Path(OUT / "course10b.txt").write_text(page.inner_text("body"), encoding="utf-8")
    print("iframe", page.locator("iframe").count())
    print("buttons", page.locator("button").all_inner_texts()[:20])
    browser.close()
print("wrote", OUT)
