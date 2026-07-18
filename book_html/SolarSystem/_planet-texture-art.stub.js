const StylizedPlanet = {
  NS: "http://www.w3.org/2000/svg",
  TEXTURES: PLANET_TEXTURE_DATA,
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
    rg.appendChild(this.el("stop", { offset: "0%", "stop-color": "#ffffff", "stop-opacity": "0.18" }));
    rg.appendChild(this.el("stop", { offset: "55%", "stop-color": "#000000", "stop-opacity": "0" }));
    rg.appendChild(this.el("stop", { offset: "100%", "stop-color": "#000000", "stop-opacity": "0.42" }));
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
    rg.appendChild(this.el("stop", { offset: "55%", "stop-color": "#ff9800", "stop-opacity": "0" }));
    rg.appendChild(this.el("stop", { offset: "85%", "stop-color": "#ff9800", "stop-opacity": "0.35" }));
    rg.appendChild(this.el("stop", { offset: "100%", "stop-color": "#ffc107", "stop-opacity": "0.65" }));
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
      [1.0, "rgba(210,185,140,0.62)", 1.0],
      [0.92, "rgba(235,215,175,0.55)", 0.75],
      [0.84, "rgba(185,155,105,0.48)", 0.55],
      [0.76, "rgba(225,205,165,0.42)", 0.45],
      [0.68, "rgba(170,140,95,0.36)", 0.35],
    ];
    bands.forEach(([scale, color, wScale]) => {
      grp.appendChild(S.el("ellipse", {
        cx: "0",
        cy: "0",
        rx: String(rx * scale),
        ry: String(ry * scale),
        fill: "none",
        stroke: color,
        "stroke-width": String(Math.max(0.8, sw * wScale)),
      }));
    });
    grp.appendChild(S.el("ellipse", {
      cx: "0",
      cy: "0",
      rx: String(rx * 0.79),
      ry: String(ry * 0.79),
      fill: "none",
      stroke: "rgba(8,6,20,0.55)",
      "stroke-width": String(Math.max(1.2, sw * 0.55)),
    }));
    g.appendChild(grp);
  },
  texturedDisc(g, type, r, clip) {
    const S = this;
    const tex = S.TEXTURES[type];
    if (!tex) return false;
    g.appendChild(S.el("image", {
      href: tex,
      x: String(-r),
      y: String(-r),
      width: String(r * 2),
      height: String(r * 2),
      preserveAspectRatio: "xMidYMid slice",
      "clip-path": clip,
    }));
    return true;
  },
  drawSaturn(g, r, clip, svg) {
    const S = this;
    const tilt = -18;
    const rx = r * 2.15;
    const ry = r * 0.48;
    const sw = Math.max(1, r * 0.09);
    if (svg) S.ensureSaturnRingClips(svg, r);
    S.ringEllipses(g, rx, ry, sw, tilt, "url(#saturnRingBack)");
    S.texturedDisc(g, "saturn", r, clip) || S.sphere(g, "saturn", r, clip);
    S.ringEllipses(g, rx, ry, sw, tilt, "url(#saturnRingFront)");
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
  sphere(g, type, r, clip) {
    const S = this;
    const svg = S.svgRoot(g);
    if (svg) S.ensureShading(svg);
    if (S.texturedDisc(g, type, r, clip)) {
      g.appendChild(S.el("circle", {
        r: String(r),
        fill: "url(#sphereShade)",
        "clip-path": clip,
        "pointer-events": "none",
      }));
    } else {
      g.appendChild(S.el("circle", { r: String(r), fill: "#888", "clip-path": clip }));
    }
    g.appendChild(S.el("circle", {
      r: String(r),
      fill: "rgba(0,0,0,0.001)",
      "pointer-events": "all",
      style: "cursor:pointer",
    }));
  },
  drawSun(g, r, clip, svg) {
    const S = this;
    if (svg) S.ensureSunGlow(svg);
    g.appendChild(S.el("circle", { r: String(r * 1.45), fill: "url(#sunCorona)", "pointer-events": "none" }));
    g.appendChild(S.el("circle", { r: String(r * 1.2), fill: "rgba(255,193,7,0.18)", "pointer-events": "none" }));
    S.texturedDisc(g, "sun", r, clip) || S.sphere(g, "sun", r, clip);
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
    if (S.TEXTURES[type]) {
      S.sphere(g, type, r, clip);
      return;
    }
    g.appendChild(S.el("circle", { r: String(r), fill: "#888" }));
  },
};
