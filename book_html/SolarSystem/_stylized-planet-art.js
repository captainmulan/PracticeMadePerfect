/* Planet texture art — NASA-style sphere maps (Solar System Scope textures, CC BY 4.0) */
const StylizedPlanet = {
  NS: 'http://www.w3.org/2000/svg',
  BASE: 'assets/planets/',
  FILES: {
    sun: 'sun.jpg',
    mercury: 'mercury.jpg',
    venus: 'venus.jpg',
    earth: 'earth.jpg',
    mars: 'mars.jpg',
    jupiter: 'jupiter.jpg',
    saturn: 'saturn.jpg',
    uranus: 'uranus.jpg',
    neptune: 'neptune.jpg'
  },
  el(tag, a) {
    const e = document.createElementNS(this.NS, tag);
    for (const k in a) e.setAttribute(k, a[k]);
    return e;
  },
  svgRoot(g) {
    return g.ownerSVGElement || document.getElementById('planetSvg') || document.getElementById('solarSvg');
  },
  ensureClip(svg, id, r) {
    if (svg.querySelector('#' + id)) return 'url(#' + id + ')';
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = this.el('defs', {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const cp = this.el('clipPath', { id: id });
    cp.appendChild(this.el('circle', { r: String(r) }));
    defs.appendChild(cp);
    return 'url(#' + id + ')';
  },
  ensureShading(svg) {
    if (svg.querySelector('#sphereShade')) return;
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = this.el('defs', {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const rg = this.el('radialGradient', { id: 'sphereShade', cx: '35%', cy: '32%', r: '65%' });
    rg.appendChild(this.el('stop', { offset: '0%', 'stop-color': '#ffffff', 'stop-opacity': '0.22' }));
    rg.appendChild(this.el('stop', { offset: '55%', 'stop-color': '#000000', 'stop-opacity': '0' }));
    rg.appendChild(this.el('stop', { offset: '100%', 'stop-color': '#000000', 'stop-opacity': '0.45' }));
    defs.appendChild(rg);
  },
  ensureSunGlow(svg) {
    if (svg.querySelector('#sunCorona')) return;
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = this.el('defs', {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const rg = this.el('radialGradient', { id: 'sunCorona', cx: '50%', cy: '50%', r: '50%' });
    rg.appendChild(this.el('stop', { offset: '70%', 'stop-color': '#ff9800', 'stop-opacity': '0' }));
    rg.appendChild(this.el('stop', { offset: '100%', 'stop-color': '#ff9800', 'stop-opacity': '0.55' }));
    defs.appendChild(rg);
  },
  tex(type) {
    return this.BASE + (this.FILES[type] || 'earth.jpg');
  },
  sphere(g, type, r, clip) {
    const S = this;
    g.appendChild(S.el('image', {
      href: S.tex(type),
      x: String(-r), y: String(-r),
      width: String(r * 2), height: String(r * 2),
      'clip-path': clip,
      preserveAspectRatio: 'xMidYMid slice'
    }));
    g.appendChild(S.el('circle', {
      r: String(r), fill: 'url(#sphereShade)', 'clip-path': clip, 'pointer-events': 'none'
    }));
  },
  drawSaturn(g, r, clip, svg) {
    const S = this;
    const tilt = -20;
    const rx = r * 2.05;
    const ry = r * 0.5;
    g.appendChild(S.el('image', {
      href: S.BASE + 'saturn_rings.png',
      x: String(-rx), y: String(-ry),
      width: String(rx * 2), height: String(ry * 2),
      transform: 'rotate(' + tilt + ')',
      opacity: '0.92'
    }));
    S.sphere(g, 'saturn', r, clip);
    g.appendChild(S.el('ellipse', {
      rx: String(rx), ry: String(ry),
      fill: 'none', stroke: 'rgba(210,180,130,0.35)',
      'stroke-width': String(Math.max(0.5, r * 0.06)),
      transform: 'rotate(' + tilt + ')',
      'pointer-events': 'none'
    }));
  },
  drawSun(g, r, clip, svg) {
    const S = this;
    if (svg) S.ensureSunGlow(svg);
    g.appendChild(S.el('circle', { r: String(r * 1.35), fill: 'url(#sunCorona)', 'pointer-events': 'none' }));
    S.sphere(g, 'sun', r, clip);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      g.appendChild(S.el('line', {
        x1: String(Math.cos(a) * r * 1.05), y1: String(Math.sin(a) * r * 1.05),
        x2: String(Math.cos(a) * r * 1.28), y2: String(Math.sin(a) * r * 1.28),
        stroke: '#ffc107', 'stroke-width': String(Math.max(1, r * 0.04)), opacity: '0.55',
        'pointer-events': 'none'
      }));
    }
  },
  draw(g, type, r) {
    r = r || 88;
    const S = this;
    const svg = S.svgRoot(g);
    const clipId = r === 88 ? 'globe' : 'globe-r' + Math.round(r * 10);
    const clip = svg ? S.ensureClip(svg, clipId, r) : '';
    if (svg) S.ensureShading(svg);
    if (type === 'saturn') {
      S.drawSaturn(g, r, clip, svg);
      return;
    }
    if (type === 'sun') {
      S.drawSun(g, r, clip, svg);
      return;
    }
    if (S.FILES[type]) {
      S.sphere(g, type, r, clip);
      return;
    }
    g.appendChild(S.el('circle', { r: String(r), fill: '#888' }));
  }
};

function makePlanetViewer(planetType, facts, label) {
  return {
    facts: facts, fi: 0, spin: true, zoom: 1, rot: 0, drag: 0, ang: 0,
    init() {
      this.svg = document.getElementById('planetSvg');
      this.g = document.getElementById('planetGroup');
      this.info = document.getElementById('planetInfo');
      if (!this.svg || !this.g || !this.info) return;
      this.svg.addEventListener('click', () => this.nextFact());
      const btnSpin = document.getElementById('btnSpin');
      btnSpin.onclick = () => {
        this.spin = !this.spin;
        btnSpin.textContent = this.spin ? 'Stop' : 'Spin';
        btnSpin.classList.toggle('active', !this.spin);
      };
      btnSpin.textContent = 'Stop';
      document.getElementById('btnZoomIn').onclick = () => { this.zoom = Math.min(2.2, this.zoom + 0.15); };
      document.getElementById('btnZoomOut').onclick = () => { this.zoom = Math.max(0.55, this.zoom - 0.15); };
      document.getElementById('btnRotL').onclick = () => { this.rot -= 18; };
      document.getElementById('btnRotR').onclick = () => { this.rot += 18; };
      let lx = 0, drag = false;
      this.svg.onmousedown = e => { drag = true; lx = e.clientX; };
      window.onmousemove = e => { if (drag) { this.drag += (e.clientX - lx) * 0.35; lx = e.clientX; } };
      window.onmouseup = () => { if (drag) { this.rot += this.drag; this.drag = 0; drag = false; } };
      this.svg.ontouchstart = e => { drag = true; lx = e.touches[0].clientX; };
      this.svg.ontouchmove = e => { if (drag) { this.drag += (e.touches[0].clientX - lx) * 0.35; lx = e.touches[0].clientX; } };
      this.svg.ontouchend = () => { if (drag) { this.rot += this.drag; this.drag = 0; drag = false; } };
      const loop = () => { if (this.spin) this.ang += 0.012; this.draw(); requestAnimationFrame(loop); };
      this.draw();
      loop();
    },
    nextFact() {
      this.fi = (this.fi + 1) % this.facts.length;
      this.info.innerHTML = '<strong>' + label + '</strong><br>' + this.facts[this.fi];
    },
    draw() {
      while (this.g.firstChild) this.g.removeChild(this.g.firstChild);
      this.g.setAttribute('transform', 'translate(200,200) rotate(' + (this.rot + this.drag) + ') scale(' + this.zoom + ') rotate(' + this.ang + ')');
      StylizedPlanet.draw(this.g, planetType, 88);
    }
  };
}
