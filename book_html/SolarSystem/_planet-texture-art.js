/* Planet standalone art — pure SVG gradients (no external assets) */
const StylizedPlanet = {
  NS: "http://www.w3.org/2000/svg",
  FILES: {
    sun: 1,
    mercury: 1,
    venus: 1,
    earth: 1,
    mars: 1,
    jupiter: 1,
    saturn: 1,
    uranus: 1,
    neptune: 1,
  },
  GRADS: {
    sun: ["#fff9c4", "#ffeb3b", "#ff9800", "#e65100"],
    mercury: ["#eceff1", "#b0bec5", "#78909c", "#455a64"],
    venus: ["#fff8e1", "#ffcc80", "#ffb74d", "#ef6c00"],
    earth: ["#b3e5fc", "#4fc3f7", "#0288d1", "#01579b"],
    mars: ["#ffccbc", "#ff8a65", "#e64a19", "#bf360c"],
    jupiter: ["#ffe0b2", "#ffb74d", "#fb8c00", "#e65100", "#6d4c41"],
    saturn: ["#fff8e1", "#ffe082", "#ffb300", "#ff8f00"],
    uranus: ["#b2ebf2", "#4dd0e1", "#00acc1", "#006064"],
    neptune: ["#90caf9", "#42a5f5", "#1e88e5", "#0d47a1"],
  },
  el(tag, a) {
    const e = document.createElementNS(this.NS, tag);
    for (const k in a) e.setAttribute(k, a[k]);
    return e;
  },
  svgRoot(g) {
    return g.ownerSVGElement || document.getElementById("planetSvg") || document.getElementById("solarSvg");
  },
  ensureClip(svg, id, r) {
    if (svg.querySelector("#" + id)) return "url(#" + id + ")";
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = this.el("defs", {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const cp = this.el("clipPath", { id: id });
    cp.appendChild(this.el("circle", { r: String(r) }));
    defs.appendChild(cp);
    return "url(#" + id + ")";
  },
  ensureShading(svg) {
    if (svg.querySelector("#sphereShade")) return;
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = this.el("defs", {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const rg = this.el("radialGradient", { id: "sphereShade", cx: "35%", cy: "32%", r: "65%" });
    rg.appendChild(this.el("stop", { offset: "0%", "stop-color": "#ffffff", "stop-opacity": "0.22" }));
    rg.appendChild(this.el("stop", { offset: "55%", "stop-color": "#000000", "stop-opacity": "0" }));
    rg.appendChild(this.el("stop", { offset: "100%", "stop-color": "#000000", "stop-opacity": "0.45" }));
    defs.appendChild(rg);
  },
  ensureSunGlow(svg) {
    if (svg.querySelector("#sunCorona")) return;
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = this.el("defs", {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const rg = this.el("radialGradient", { id: "sunCorona", cx: "50%", cy: "50%", r: "50%" });
    rg.appendChild(this.el("stop", { offset: "70%", "stop-color": "#ff9800", "stop-opacity": "0" }));
    rg.appendChild(this.el("stop", { offset: "100%", "stop-color": "#ff9800", "stop-opacity": "0.55" }));
    defs.appendChild(rg);
  },
  ensurePlanetGrad(svg, id, type) {
    if (svg.querySelector("#" + id)) return;
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = this.el("defs", {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const stops = this.GRADS[type] || this.GRADS.earth;
    const rg = this.el("radialGradient", { id: id, cx: "38%", cy: "34%", r: "68%" });
    stops.forEach((color, i) => {
      rg.appendChild(this.el("stop", {
        offset: String(Math.round((i / Math.max(1, stops.length - 1)) * 100)) + "%",
        "stop-color": color,
      }));
    });
    defs.appendChild(rg);
  },
  ensureSaturnRingClips(svg, r) {
    if (svg.querySelector("#saturnRingBack")) return;
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = this.el("defs", {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const pad = r * 3;
    const back = this.el("clipPath", { id: "saturnRingBack" });
    back.appendChild(this.el("rect", { x: String(-pad), y: String(-pad), width: String(pad * 2), height: String(pad) }));
    defs.appendChild(back);
    const front = this.el("clipPath", { id: "saturnRingFront" });
    front.appendChild(this.el("rect", { x: String(-pad), y: "0", width: String(pad * 2), height: String(pad) }));
    defs.appendChild(front);
  },
  ringEllipses(g, rx, ry, sw, tilt, clipUrl) {
    const S = this;
    const grp = S.el("g", { transform: "rotate(" + tilt + ")", "clip-path": clipUrl || "" });
    const bands = [
      [1, "rgba(200,170,120,0.55)", 1],
      [0.88, "rgba(230,205,160,0.45)", 0.55],
      [0.76, "rgba(170,140,90,0.35)", 0.35],
    ];
    bands.forEach(([scale, color, wScale]) => {
      grp.appendChild(S.el("ellipse", {
        rx: String(rx * scale),
        ry: String(ry * scale),
        fill: "none",
        stroke: color,
        "stroke-width": String(Math.max(0.8, sw * wScale)),
      }));
    });
    g.appendChild(grp);
  },
  addDetail(g, type, r, clip) {
    const S = this;
    if (type === "earth") {
      g.appendChild(S.el("ellipse", {
        cx: String(-r * 0.2),
        cy: String(-r * 0.15),
        rx: String(r * 0.35),
        ry: String(r * 0.22),
        fill: "rgba(76,175,80,0.75)",
        "clip-path": clip,
        "pointer-events": "none",
      }));
      g.appendChild(S.el("ellipse", {
        cx: String(r * 0.25),
        cy: String(r * 0.2),
        rx: String(r * 0.28),
        ry: String(r * 0.18),
        fill: "rgba(56,142,60,0.7)",
        "clip-path": clip,
        "pointer-events": "none",
      }));
    }
    if (type === "jupiter") {
      for (let i = -2; i <= 2; i++) {
        g.appendChild(S.el("ellipse", {
          cx: "0",
          cy: String(i * r * 0.22),
          rx: String(r * 0.92),
          ry: String(Math.max(2, r * 0.08)),
          fill: "rgba(109,76,65,0.35)",
          "clip-path": clip,
          "pointer-events": "none",
        }));
      }
    }
    if (type === "mars") {
      g.appendChild(S.el("circle", {
        cx: String(r * 0.15),
        cy: String(-r * 0.1),
        r: String(r * 0.12),
        fill: "rgba(255,255,255,0.25)",
        "clip-path": clip,
        "pointer-events": "none",
      }));
    }
  },
  sphere(g, type, r, clip) {
    const S = this;
    const svg = S.svgRoot(g);
    const gradId = "planetFill_" + type;
    if (svg) {
      S.ensurePlanetGrad(svg, gradId, type);
      S.ensureShading(svg);
    }
    g.appendChild(S.el("circle", {
      r: String(r),
      fill: "url(#" + gradId + ")",
      "clip-path": clip,
    }));
    S.addDetail(g, type, r, clip);
    g.appendChild(S.el("circle", {
      r: String(r),
      fill: "url(#sphereShade)",
      "clip-path": clip,
      "pointer-events": "none",
    }));
    g.appendChild(S.el("circle", {
      r: String(r),
      fill: "rgba(0,0,0,0.001)",
      "pointer-events": "all",
      style: "cursor:pointer",
    }));
  },
  drawSaturn(g, r, clip, svg) {
    const S = this;
    const tilt = -18;
    const rx = r * 2.15;
    const ry = r * 0.5;
    const sw = Math.max(1, r * 0.1);
    if (svg) S.ensureSaturnRingClips(svg, r);
    S.ringEllipses(g, rx, ry, sw, tilt, "url(#saturnRingBack)");
    S.sphere(g, "saturn", r, clip);
    S.ringEllipses(g, rx, ry, sw, tilt, "url(#saturnRingFront)");
  },
  drawSun(g, r, clip, svg) {
    const S = this;
    if (svg) S.ensureSunGlow(svg);
    g.appendChild(S.el("circle", { r: String(r * 1.35), fill: "url(#sunCorona)", "pointer-events": "none" }));
    S.sphere(g, "sun", r, clip);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      g.appendChild(S.el("line", {
        x1: String(Math.cos(a) * r * 1.05),
        y1: String(Math.sin(a) * r * 1.05),
        x2: String(Math.cos(a) * r * 1.28),
        y2: String(Math.sin(a) * r * 1.28),
        stroke: "#ffc107",
        "stroke-width": String(Math.max(1, r * 0.04)),
        opacity: "0.55",
        "pointer-events": "none",
      }));
    }
  },
  draw(g, type, r) {
    r = r || 88;
    const S = this;
    const svg = S.svgRoot(g);
    const clipId = r === 88 ? "globe" : "globe-r" + Math.round(r * 10);
    const clip = svg ? S.ensureClip(svg, clipId, r) : "";
    if (svg) S.ensureShading(svg);
    if (type === "saturn") {
      S.drawSaturn(g, r, clip, svg);
      return;
    }
    if (type === "sun") {
      S.drawSun(g, r, clip, svg);
      return;
    }
    if (S.FILES[type]) {
      S.sphere(g, type, r, clip);
      return;
    }
    g.appendChild(S.el("circle", { r: String(r), fill: "#888" }));
  },
};
