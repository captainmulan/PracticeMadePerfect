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
    g.appendChild(S.el('circle', {
      r: String(r), fill: 'rgba(0,0,0,0.001)', 'pointer-events': 'all', style: 'cursor:pointer'
    }));
  },
  ensureSaturnRingClips(svg, r) {
    if (svg.querySelector('#saturnRingBack')) return;
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = this.el('defs', {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const pad = r * 3;
    const back = this.el('clipPath', { id: 'saturnRingBack' });
    back.appendChild(this.el('rect', { x: String(-pad), y: String(-pad), width: String(pad * 2), height: String(pad) }));
    defs.appendChild(back);
    const front = this.el('clipPath', { id: 'saturnRingFront' });
    front.appendChild(this.el('rect', { x: String(-pad), y: '0', width: String(pad * 2), height: String(pad) }));
    defs.appendChild(front);
  },
  ringEllipses(g, rx, ry, sw, tilt, clipUrl) {
    const S = this;
    const grp = S.el('g', { transform: 'rotate(' + tilt + ')', 'clip-path': clipUrl || '' });
    const bands = [
      [1, 'rgba(200,170,120,0.55)', 1],
      [0.88, 'rgba(230,205,160,0.45)', 0.55],
      [0.76, 'rgba(170,140,90,0.35)', 0.35]
    ];
    bands.forEach(([scale, color, wScale]) => {
      grp.appendChild(S.el('ellipse', {
        rx: String(rx * scale), ry: String(ry * scale),
        fill: 'none', stroke: color,
        'stroke-width': String(Math.max(0.8, sw * wScale))
      }));
    });
    g.appendChild(grp);
  },
  drawSaturn(g, r, clip, svg) {
    const S = this;
    const tilt = -18;
    const rx = r * 2.15;
    const ry = r * 0.5;
    const sw = Math.max(1, r * 0.1);
    if (svg) S.ensureSaturnRingClips(svg, r);
    S.ringEllipses(g, rx, ry, sw, tilt, 'url(#saturnRingBack)');
    S.sphere(g, 'saturn', r, clip);
    S.ringEllipses(g, rx, ry, sw, tilt, 'url(#saturnRingFront)');
  },
  drawSun(g, r, clip, svg) {
    const S = this;
    if (svg) S.ensureSunGlow(svg);
    g.appendChild(S.el('circle', { r: String(r * 1.35), fill: 'url(#sunCorona)', 'pointer-events': 'none' }));
    S.sphere(g, 'sun', r, clip);
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
    dragMoved: false, startX: 0, startY: 0, lx: 0, dragging: false,
    init() {
      this.svg = document.getElementById('planetSvg');
      this.g = document.getElementById('planetGroup');
      this.info = document.getElementById('planetInfo');
      if (!this.svg || !this.g || !this.info) return;
      const S = this;
      const btnSpin = document.getElementById('btnSpin');
      btnSpin.onclick = () => {
        S.spin = !S.spin;
        btnSpin.textContent = S.spin ? 'Stop' : 'Spin';
        btnSpin.classList.toggle('active', !S.spin);
      };
      btnSpin.textContent = 'Stop';
      document.getElementById('btnZoomIn').onclick = () => { S.zoom = Math.min(2.2, S.zoom + 0.15); };
      document.getElementById('btnZoomOut').onclick = () => { S.zoom = Math.max(0.55, S.zoom - 0.15); };
      document.getElementById('btnRotL').onclick = () => { S.rot -= 18; };
      document.getElementById('btnRotR').onclick = () => { S.rot += 18; };
      const onDown = e => {
        S.dragging = true;
        S.dragMoved = false;
        const p = e.touches ? e.touches[0] : e;
        S.startX = S.lx = p.clientX;
        S.startY = p.clientY;
      };
      const onMove = e => {
        if (!S.dragging) return;
        const p = e.touches ? e.touches[0] : e;
        if (Math.hypot(p.clientX - S.startX, p.clientY - S.startY) > 12) S.dragMoved = true;
        if (S.dragging) { S.drag += (p.clientX - S.lx) * 0.35; S.lx = p.clientX; }
      };
      const onUp = e => {
        if (!S.dragging) return;
        const p = e.changedTouches ? e.changedTouches[0] : e;
        if (!S.dragMoved && p && S.hitPlanet(p.clientX, p.clientY)) S.nextFact();
        if (S.dragging) { S.rot += S.drag; S.drag = 0; S.dragging = false; }
      };
      this.svg.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      this.svg.addEventListener('touchstart', e => { onDown(e); }, { passive: true });
      this.svg.addEventListener('touchmove', e => { onMove(e); }, { passive: true });
      this.svg.addEventListener('touchend', onUp);
      const loop = () => { if (S.spin) S.ang += 0.012; S.draw(); requestAnimationFrame(loop); };
      this.draw();
      loop();
    },
    hitPlanet(clientX, clientY) {
      const pt = this.svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const m = this.g.getScreenCTM();
      if (!m) return false;
      const p = pt.matrixTransform(m.inverse());
      return p.x * p.x + p.y * p.y <= 88 * 88;
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
