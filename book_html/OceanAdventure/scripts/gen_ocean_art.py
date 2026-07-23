#!/usr/bin/env python3
"""Generate kid-friendly ocean chapter PNG illustrations (960x540, 16:9)."""
from __future__ import annotations

import math
import random
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
W, H = 960, 540

CHAPTERS = [
    "overview",
    "sunlight",
    "twilight",
    "midnight",
    "abyss",
    "coral-reefs",
    "marine-mammals",
    "fish",
]
MAIN_SLOTS = ["main-1", "main-2", "main-3", "explain-1", "explain-2", "explain-3"]
VIEW_SLOTS = ["view-1", "view-2", "view-3", "view-4"]


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def gradient_bg(draw: ImageDraw.ImageDraw, c1, c2, c3=None) -> None:
    for y in range(H):
        t = y / H
        if c3 and t > 0.5:
            tt = (t - 0.5) * 2
            r = int(lerp(c2[0], c3[0], tt))
            g = int(lerp(c2[1], c3[1], tt))
            b = int(lerp(c2[2], c3[2], tt))
        else:
            tt = t * 2 if c3 else t
            r = int(lerp(c1[0], c2[0], tt))
            g = int(lerp(c1[1], c2[1], tt))
            b = int(lerp(c1[2], c2[2], tt))
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def font(size: int):
    for name in ("arial.ttf", "Arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def add_noise(img: Image.Image, amount: int = 6) -> Image.Image:
    px = img.load()
    rng = random.Random(42)
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y][:3]
            n = rng.randint(-amount, amount)
            px[x, y] = (
                max(0, min(255, r + n)),
                max(0, min(255, g + n)),
                max(0, min(255, b + n)),
            )
    return img.filter(ImageFilter.GaussianBlur(radius=0.5))


def caption(draw, title: str, subtitle: str = "") -> None:
    f1 = font(26)
    f2 = font(17)
    draw.rounded_rectangle([20, H - 86, W - 20, H - 18], 14, fill=(0, 20, 40, 180))
    draw.text((36, H - 76), title, fill=(220, 248, 255), font=f1)
    if subtitle:
        draw.text((36, H - 44), subtitle, fill=(100, 255, 218), font=f2)


def draw_bubbles(draw, rng, count=35, y_min=0, y_max=None):
    y_max = y_max or H
    for _ in range(count):
        x = rng.randint(20, W - 20)
        y = rng.randint(y_min, y_max)
        r = rng.randint(3, 14)
        draw.ellipse([x, y, x + r, y + r], outline=(180, 230, 255, 120), width=1)
        draw.ellipse([x + 1, y + 1, x + r // 2, y + r // 2], fill=(220, 245, 255, 60))


def draw_fish_silhouette(draw, x, y, size, color, flip=False):
    s = size
    pts = [(x, y), (x + s * 0.6, y - s * 0.25), (x + s, y), (x + s * 0.6, y + s * 0.25)]
    if flip:
        pts = [(2 * x + s - px, py) for px, py in pts]
    draw.polygon(pts, fill=color)
    draw.polygon([(x + (s if not flip else 0), y), (x + (s * 1.2 if not flip else -s * 0.2), y - s * 0.35),
                  (x + (s if not flip else 0), y - s * 0.1)], fill=color)


def draw_coral_cluster(draw, x, base_y, scale, hue):
    colors = [(220, 100, 120), (255, 140, 100), (180, 80, 140), (240, 160, 120)]
    c = colors[hue % len(colors)]
    for i in range(5):
        bx = x + i * scale * 0.35
        h = scale * (0.6 + i * 0.15)
        draw.line([(bx, base_y), (bx, base_y - h)], fill=c, width=int(scale * 0.12))
        draw.ellipse([bx - scale * 0.15, base_y - h - scale * 0.1, bx + scale * 0.15, base_y - h + scale * 0.2], fill=c)


def draw_whale(draw, x, y, size, color):
    s = size
    draw.ellipse([x - s, y - s * 0.35, x + s * 0.8, y + s * 0.35], fill=color)
    draw.polygon([(x - s, y), (x - s * 1.4, y - s * 0.5), (x - s * 1.1, y)], fill=color)
    draw.polygon([(x + s * 0.5, y + s * 0.2), (x + s * 0.9, y + s * 0.5), (x + s * 0.5, y + s * 0.35)], fill=color)


def draw_submarine(draw, x, y, scale):
    s = scale
    draw.rounded_rectangle([x - s, y - s * 0.35, x + s, y + s * 0.35], int(s * 0.3), fill=(70, 85, 95))
    draw.rounded_rectangle([x - s * 0.25, y - s * 0.75, x + s * 0.25, y - s * 0.35], 8, fill=(55, 70, 80))
    for i in range(3):
        draw.ellipse([x - s * 0.55 + i * s * 0.35, y - s * 0.08, x - s * 0.35 + i * s * 0.35, y + s * 0.12],
                     fill=(120, 200, 230))


def draw_sonar_rings(draw, cx, cy, max_r):
    for i in range(1, 6):
        r = max_r * i / 5
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(60, 200, 140, 180), width=2)
    draw.line([(cx - max_r, cy), (cx + max_r, cy)], fill=(40, 120, 90), width=1)
    draw.line([(cx, cy - max_r), (cx, cy + max_r)], fill=(40, 120, 90), width=1)


def draw_depth_bands(draw):
    zones = [
        (0, 0.2, (12, 122, 148), "Sunlight"),
        (0.2, 0.4, (6, 74, 102), "Twilight"),
        (0.4, 0.6, (3, 31, 50), "Midnight"),
        (0.6, 0.8, (2, 12, 20), "Abyss"),
        (0.8, 1.0, (1, 4, 8), "Hadal"),
    ]
    for top, bot, col, label in zones:
        y0 = int(H * top)
        y1 = int(H * bot)
        draw.rectangle([0, y0, W, y1], fill=col)
        draw.text((24, y0 + 8), label, fill=(180, 220, 240), font=font(16))


def render_view(chapter: str, slot: str) -> Image.Image:
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    rng = random.Random(hash((chapter, slot, "view")) & 0xFFFFFFFF)

    if slot == "view-1":
        draw_depth_bands(draw)
        for i in range(8):
            draw_fish_silhouette(draw, 120 + i * 90, int(H * 0.15 + i * 0.08 * H), 28 + i * 3, (180, 230, 255, 100), i % 2 == 0)
        draw_bubbles(draw, rng, 25, 0, int(H * 0.5))
        caption(draw, "Ocean Depth Chart", "Five zones from surface to trench")
    elif slot == "view-2":
        gradient_bg(draw, (135, 206, 235), (30, 100, 160), (5, 40, 80))
        draw.rectangle([0, 0, W, int(H * 0.28)], fill=(135, 206, 235))
        draw.ellipse([W - 120, 40, W - 40, 120], fill=(255, 240, 180))
        draw.polygon([(W // 2 - 80, int(H * 0.26)), (W // 2 + 80, int(H * 0.26)),
                      (W // 2 + 60, int(H * 0.32)), (W // 2 - 60, int(H * 0.32))], fill=(60, 70, 80))
        for z, col in [(0.35, (12, 90, 120)), (0.55, (6, 50, 70)), (0.75, (3, 25, 40)), (0.92, (2, 8, 14))]:
            draw.rectangle([0, int(H * 0.28), W, int(H * z)], fill=col)
        draw_bubbles(draw, rng)
        caption(draw, "Surface & Depth", "Waves, ships, and zones below")
    elif slot == "view-3":
        gradient_bg(draw, (2, 12, 8), (1, 8, 6))
        draw_sonar_rings(draw, W // 2, H // 2 - 20, 200)
        draw_submarine(draw, W // 2, H // 2 - 20, 45)
        for _ in range(12):
            ang = rng.random() * math.pi * 2
            r = rng.randint(40, 180)
            bx = W // 2 + int(math.cos(ang) * r)
            by = H // 2 - 20 + int(math.sin(ang) * r)
            draw.ellipse([bx - 4, by - 4, bx + 4, by + 4], fill=(80, 255, 160))
        caption(draw, "Sonar Map", "Depth rings from surface to trench")
    else:
        gradient_bg(draw, (2, 8, 14), (1, 4, 8))
        cx, cy = W // 2, H // 2 - 30
        R = 160
        draw.ellipse([cx - R - 20, cy - R - 20, cx + R + 20, cy + R + 20], fill=(30, 38, 45))
        draw.ellipse([cx - R, cy - R, cx + R, cy + R], fill=(8, 40, 70))
        draw_coral_cluster(draw, cx - 60, cy + R - 30, 50, 0)
        draw_fish_silhouette(draw, cx + 40, cy + 20, 35, (200, 230, 255), True)
        draw_bubbles(draw, rng, 15, cy - R, cy + R)
        caption(draw, "Sub Porthole", "Peeking into the deep")

    return add_noise(img)


def render(chapter: str, slot: str) -> Image.Image:
    if slot.startswith("view-"):
        return render_view(chapter, slot)

    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    rng = random.Random(hash((chapter, slot)) & 0xFFFFFFFF)
    idx = MAIN_SLOTS.index(slot)

    themes = {
        "overview": ([5, 30, 80], [10, 80, 140], [2, 20, 50]),
        "sunlight": ([20, 120, 180], [10, 80, 140], [5, 50, 100]),
        "twilight": ([8, 50, 90], [4, 30, 60], [2, 15, 35]),
        "midnight": ([2, 20, 45], [1, 10, 25], [0, 4, 12]),
        "abyss": ([1, 8, 18], [0, 4, 10], [0, 2, 6]),
        "coral-reefs": ([5, 60, 100], [20, 100, 140], [8, 70, 110]),
        "marine-mammals": ([8, 70, 120], [15, 90, 150], [5, 50, 90]),
        "fish": ([10, 80, 130], [20, 100, 160], [8, 60, 110]),
    }
    gradient_bg(draw, *themes.get(chapter, themes["overview"]))

    cx, cy = W // 2, H // 2 - 30

    titles_map = {
        "overview": [
            ("A World Under Waves", "71% of Earth is ocean"),
            ("Layers of the Deep", "Five ocean zones"),
            ("One Connected Blue", "Currents link the seas"),
            ("Why the Ocean Matters", "Oxygen and climate"),
            ("Salt and Sound", "Salinity and whale song"),
            ("Protecting Our Blue Home", "Clean oceans for all"),
        ],
        "sunlight": [
            ("Sunlit Surface", "Epipelagic zone 0–200 m"),
            ("Coral Cities", "Rainforests of the sea"),
            ("Life in the Light", "Phytoplankton and fish"),
            ("Photosynthesis at Sea", "Tiny plants, big impact"),
            ("Reef Builders", "Coral polyps at work"),
            ("Warm Shallow Seas", "Where most fishing happens"),
        ],
        "twilight": [
            ("The Dim Zone", "Mesopelagic 200–1000 m"),
            ("Eyes in the Gloom", "Big eyes, big catches"),
            ("Daily Migration", "Up at night, down by day"),
            ("Blue Light Only", "Red disappears fast"),
            ("Squid and Jellyfish", "Twilight hunters"),
            ("Vertical Commute", "Largest migration on Earth"),
        ],
        "midnight": [
            ("Midnight Zone", "Bathypelagic 1000–4000 m"),
            ("Bioluminescence", "Living light in the dark"),
            ("Anglerfish Lure", "Glow to hunt"),
            ("No Sunlight", "Total darkness below"),
            ("Pressure Increases", "Crushing deep water"),
            ("Strange Shapes", "Adapted for the abyss"),
        ],
        "abyss": [
            ("The Abyssal Plain", "Flat deep seafloor"),
            ("Hydrothermal Vents", "Hot chimneys of life"),
            ("Sunken Secrets", "Shipwrecks and bones"),
            ("Cold and Slow", "Life moves slowly here"),
            ("Chemosynthesis", "Energy without sun"),
            ("Trench Edges", "Gateway to the hadal zone"),
        ],
        "coral-reefs": [
            ("Reef Rainbow", "Biodiversity hotspot"),
            ("Coral Polyps", "Tiny builders"),
            ("Reef Residents", "Fish, crabs, turtles"),
            ("Symbiosis", "Coral and algae partners"),
            ("Reef Threats", "Warm water and pollution"),
            ("Protect the Reef", "Marine parks help"),
        ],
        "marine-mammals": [
            ("Whales and Dolphins", "Breathing air, living sea"),
            ("Blubber and Blowholes", "Warm and breathing"),
            ("Echolocation", "Sound maps in the dark"),
            ("Migration Routes", "Long ocean journeys"),
            ("Seal and Sea Lion", "Flippered swimmers"),
            ("Protect Mammals", "Quiet seas matter"),
        ],
        "fish": [
            ("School of Silver", "Safety in numbers"),
            ("Gills and Scales", "Breathing underwater"),
            ("Sharks and Rays", "Ancient cartilaginous fish"),
            ("Camouflage", "Hide or hunt"),
            ("Reef Fish", "Colorful neighbors"),
            ("Sustainable Catch", "Fish for the future"),
        ],
    }

    if chapter == "sunlight":
        draw.ellipse([cx - 80, 60, cx + 80, 220], fill=(255, 240, 160))
        draw_coral_cluster(draw, cx - 120, H - 80, 70, idx)
        draw_coral_cluster(draw, cx + 60, H - 70, 55, idx + 1)
        for i in range(6):
            draw_fish_silhouette(draw, 80 + i * 130, 200 + (i % 3) * 40, 30, (255, 220, 100), i % 2)
    elif chapter == "twilight":
        draw.rectangle([0, 0, W, 80], fill=(30, 80, 120))
        draw_whale(draw, cx, cy, 100, (40, 80, 120))
        for i in range(5):
            draw.ellipse([100 + i * 160, 280 + i * 20, 130 + i * 160, 310 + i * 20], fill=(180, 120, 220, 80))
    elif chapter == "midnight":
        for _ in range(20):
            x, y = rng.randint(0, W), rng.randint(0, H - 100)
            draw.ellipse([x, y, x + 3, y + 3], fill=(120, 200, 255))
        draw.polygon([(cx, cy - 40), (cx + 50, cy + 30), (cx - 10, cy + 20)], fill=(60, 40, 80))
        draw.ellipse([cx - 5, cy - 50, cx + 15, cy - 30], fill=(200, 255, 100))
    elif chapter == "abyss":
        draw.rectangle([0, H - 60, W, H], fill=(30, 28, 26))
        draw.rectangle([cx - 15, H - 90, cx + 15, H - 60], fill=(80, 70, 60))
        draw.ellipse([cx - 30, H - 120, cx + 30, H - 80], fill=(160, 180, 190, 100))
        draw_fish_silhouette(draw, cx + 100, cy, 25, (100, 110, 120), True)
    elif chapter == "coral-reefs":
        for i in range(8):
            draw_coral_cluster(draw, 60 + i * 100, H - 60 - (i % 3) * 20, 45 + (i % 4) * 10, i)
        for i in range(7):
            draw_fish_silhouette(draw, 70 + i * 120, 220 + (i % 2) * 50, 22, (255, 180, 140), i % 2)
    elif chapter == "marine-mammals":
        draw_whale(draw, cx - 40, cy, 130, (50, 90, 140))
        draw_whale(draw, cx + 100, cy + 40, 70, (70, 110, 160))
        draw_bubbles(draw, rng, 20, cy - 80, cy + 80)
    elif chapter == "fish":
        for i in range(10):
            draw_fish_silhouette(draw, 50 + i * 85, 180 + (i % 4) * 35, 20 + (i % 3) * 5, (200, 230, 255), i % 2)
    else:
        draw_depth_bands(draw)
        draw_bubbles(draw, rng)

    title, sub = titles_map.get(chapter, titles_map["overview"])[idx]
    caption(draw, title, sub)
    draw_bubbles(draw, rng, 20)
    return add_noise(img)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    hero = ASSETS / "ocean-overview-hero.png"
    v1 = ASSETS / "overview-view-1.png"
    if hero.exists() and not v1.exists():
        shutil.copy(hero, v1)
        print("Copied ocean-overview-hero.png -> overview-view-1.png")

    count = 0
    for chapter in CHAPTERS:
        for slot in MAIN_SLOTS:
            out = ASSETS / f"{chapter}-{slot}.png"
            render(chapter, slot).save(out, optimize=True)
            count += 1
            print("Wrote", out.name)
        if chapter == "overview":
            for slot in VIEW_SLOTS:
                out = ASSETS / f"{chapter}-{slot}.png"
                if slot == "view-1" and v1.exists():
                    if not out.exists() or out.stat().st_mtime < v1.stat().st_mtime:
                        shutil.copy(v1, out)
                    print("Using", out.name, "(hero copy)")
                else:
                    render(chapter, slot).save(out, optimize=True)
                    print("Wrote", out.name)
                count += 1
    print(f"Done — {count} PNG files in assets/")


if __name__ == "__main__":
    main()
