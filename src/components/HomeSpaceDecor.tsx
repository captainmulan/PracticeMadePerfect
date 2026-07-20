import { useMemo, type CSSProperties } from "react";

type FloatKind = "rocket" | "planet";

type FloatConfig = {
  kind: FloatKind;
  emoji: string;
  sx: number;
  sy: number;
  mx: number;
  my: number;
  ex: number;
  ey: number;
  sr: number;
  er: number;
  dur: number;
  delay: number;
  size: string;
  flip: boolean;
};

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickPoint(rng: () => number): { x: number; y: number } {
  return { x: 4 + rng() * 92, y: 8 + rng() * 84 };
}

function buildFloat(
  rng: () => number,
  kind: FloatKind,
  emoji: string,
  size: string,
): FloatConfig {
  let start = pickPoint(rng);
  let end = pickPoint(rng);
  let guard = 0;
  while (Math.hypot(end.x - start.x, end.y - start.y) < 30 && guard < 12) {
    end = pickPoint(rng);
    guard += 1;
  }
  const mid = {
    x: (start.x + end.x) / 2 + (rng() - 0.5) * 28,
    y: (start.y + end.y) / 2 + (rng() - 0.5) * 22,
  };
  mid.x = Math.max(4, Math.min(96, mid.x));
  mid.y = Math.max(8, Math.min(92, mid.y));

  const sr = kind === "rocket" ? -55 + rng() * 70 : -25 + rng() * 50;
  const er = sr + (rng() - 0.5) * 40;

  return {
    kind,
    emoji,
    sx: start.x,
    sy: start.y,
    mx: mid.x,
    my: mid.y,
    ex: end.x,
    ey: end.y,
    sr,
    er,
    dur: 26 + rng() * 28,
    delay: rng() * 12,
    size,
    flip: rng() > 0.5,
  };
}

function buildFloats(region: "hero" | "shelf", sessionSeed: number): FloatConfig[] {
  const rng = mulberry32(hashSeed(`home-space-${region}`) ^ sessionSeed);
  return [
    buildFloat(rng, "rocket", "🚀", region === "hero" ? "1.85rem" : "2rem"),
    buildFloat(rng, "planet", "🪐", region === "hero" ? "2.1rem" : "2.45rem"),
  ];
}

function floatStyle(config: FloatConfig): CSSProperties {
  const flip = config.flip ? "scaleX(-1) " : "";
  return {
    ["--sx" as string]: `${config.sx}%`,
    ["--sy" as string]: `${config.sy}%`,
    ["--mx" as string]: `${config.mx}%`,
    ["--my" as string]: `${config.my}%`,
    ["--ex" as string]: `${config.ex}%`,
    ["--ey" as string]: `${config.ey}%`,
    ["--sr" as string]: `${flip}rotate(${config.sr}deg)`,
    ["--er" as string]: `${flip}rotate(${config.er}deg)`,
    ["--dur" as string]: `${config.dur}s`,
    ["--delay" as string]: `${config.delay}s`,
    ["--size" as string]: config.size,
  };
}

type HomeSpaceDecorProps = {
  region: "hero" | "shelf";
};

export default function HomeSpaceDecor({ region }: HomeSpaceDecorProps) {
  const floats = useMemo(() => {
    const sessionSeed = Math.floor(Math.random() * 0xffffffff);
    return buildFloats(region, sessionSeed);
  }, [region]);

  return (
    <div className="rocket-container home-space-decor" aria-hidden="true">
      {floats.map((item) => (
        <span
          key={`${region}-${item.kind}`}
          className={`space-float space-float-${item.kind}`}
          style={floatStyle(item)}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
