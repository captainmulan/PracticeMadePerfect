"""Login admin, import catalog JSON, verify home + readers."""
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright

EXPORT = Path(r"C:\Users\65966\PracticeMadePerfect\public\data\indexeddb-export.json")
BASE = "http://127.0.0.1:5173"


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        page = browser.new_page(viewport={"width": 1400, "height": 900})
        page.on("dialog", lambda d: d.accept("admin123"))
        page.goto(f"{BASE}/admin", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(800)
        if page.locator("input[type='password']").count():
            page.fill("input[type='password']", "admin123")
            page.click("button:has-text('Login')")
            page.wait_for_timeout(1200)

        page.click("button:has-text('System')")
        page.wait_for_timeout(800)

        json_db = page.locator("input[type='file'][accept='.json']")
        print("json_db_inputs", json_db.count())
        json_db.first.set_input_files(str(EXPORT))
        print("uploaded json db")
        try:
            page.wait_for_function(
                "() => document.body.innerText.includes('IndexedDB JSON imported') || document.body.innerText.includes('Import failed')",
                timeout=90000,
            )
        except Exception as e:
            print("wait_import", e)
        print("after_wait", page.inner_text("body")[-500:].replace("\n", " | "))
        page.wait_for_timeout(2500)
        print("url_after", page.url)
        body = page.inner_text("body")
        print("msg", body[-400:].replace("\n", " | "))

        page.goto(f"{BASE}/", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2500)
        home = page.inner_text("body")
        for label in ["56/10", "56/11", "56/13", "56/14", "56/15", "56/16"]:
            print("HOME", label, label in home)

        for cid, tag in [
            ("shwe-thway-journal-vol-56-no-10", "FIRST"),
            ("shwe-thway-journal-vol-56-no-16", "LAST"),
        ]:
            page.goto(f"{BASE}/courses/{cid}", wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(3500)
            print(tag, "url", page.url)
            txt = page.inner_text("body")
            print(tag, "has Page", "Page" in txt, "err", "Unable" in txt or "error" in txt.lower())
            print(tag, "iframe", page.locator("iframe").count())

        browser.close()


if __name__ == "__main__":
    main()
