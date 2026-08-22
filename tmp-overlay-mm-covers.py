from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
FONT = Path(r"C:\Windows\Fonts\mmrtextb.ttf")
FONT_REG = Path(r"C:\Windows\Fonts\mmrtext.ttf")

MM_TITLES = {
    "english-american-idioms-meaning-way-of-uses": "အင်္ဂလိပ် အမေရိကန် အီဒီယမ်များ",
    "english-writing-upper-intermediate-part-3": "အထက်အလယ်တန်း အင်္ဂလိပ်စာ ရေးသားခြင်း",
    "high-school-english-grammar-and-composation": "အထက်တန်း အင်္ဂလိပ် သဒ္ဒါနှင့် စာရေးသားခြင်း",
    "how-to-write-in-english": "အင်္ဂလိပ်လို ဘယ်လိုရေးမယ်",
    "modern-american-english-speaking-and-grammar": "ခေတ်မီ အမေရိကန် အင်္ဂလိပ် စကားပြောနှင့် သဒ္ဒါ",
    "practice-with-exercises": "လေ့ကျင့်ခန်းများဖြင့် လေ့ကျင့်ရန်",
    "speak-english-for-nurses": "သူနာပြုအတွက် အင်္ဂလိပ် စကားပြော",
    "the-easiest-idioms": "အလွယ်ဆုံး အီဒီယမ်များ",
    "the-good-grammar-book-with-answers": "အဖြေပါ အင်္ဂလိပ် သဒ္ဒါစာအုပ်",
    "the-most-beautiful-idiom": "အလှပဆုံး အီဒီယမ်များ",
    "writing-method-essay-and-letter": "ဆရာလွတ် အင်္ဂလိပ်စာရေးနည်း",
    "modern-japanese-language-conversation": "ခေတ်မီ ဂျပန်ဘာသာစကားပြော",
    "the-easiest-way-to-speak-japanese": "အလွယ်ကူဆုံး ဂျပန်စကားပြော",
    "speak-thai-burmese-and-english-daily": "ယိုးဒယား မြန်မာ အင်္ဂလိပ် စကားပြော",
}

BADGE = "မြန်မာဘာသာ"


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.ImageDraw) -> list[str]:
    words = text.split()
    if not words:
        return [text]
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def overlay(path: Path, mm_title: str) -> Image.Image:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    overlay_img = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay_img)
    bar_h = int(h * 0.28)
    draw.rectangle((0, h - bar_h, w, h), fill=(12, 18, 32, 210))
    badge_font = ImageFont.truetype(str(FONT_REG if FONT_REG.exists() else FONT), max(18, int(h * 0.035)))
    title_font = ImageFont.truetype(str(FONT if FONT.exists() else FONT_REG), max(28, int(h * 0.055)))
    pad = int(w * 0.07)
    badge = f"[{BADGE}]"
    draw.text((pad, h - bar_h + int(h * 0.025)), badge, font=badge_font, fill=(255, 214, 102, 255))
    lines = wrap_text(mm_title, title_font, w - pad * 2, draw)
    y = h - bar_h + int(h * 0.09)
    for line in lines[:3]:
        draw.text((pad, y), line, font=title_font, fill=(255, 255, 255, 255))
        y += int(title_font.size * 1.25)
    return Image.alpha_composite(img, overlay_img).convert("RGB")


def main() -> None:
    for book_id, mm_title in MM_TITLES.items():
        src = COVERS / f"{book_id}.webp"
        if not src.exists():
            print("missing", src)
            continue
        rgb = overlay(src, mm_title)
        rgb.save(src, "WEBP", quality=88, method=6)
        thumb = rgb.copy()
        thumb.thumbnail((400, 600))
        thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=82, method=6)
        print("updated", book_id)


if __name__ == "__main__":
    main()
