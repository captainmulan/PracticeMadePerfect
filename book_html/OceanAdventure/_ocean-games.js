/**
 * Ocean Adventure — unique chapter mini-games (shared engine).
 * Each activity page calls OceanGame.boot({ game: '...', ... }).
 */
(function (w) {
  'use strict';

  var FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  var FACE_RE = /🐠|🐟|🐡|🦈|🐙|🦑|🐢|🐬|🐳|🦭|🐋|🦐|🤿/;

  var S = {
    cfg: null,
    canvas: null,
    ctx: null,
    running: false,
    score: 0,
    time: 0,
    lives: 0,
    timerId: null,
    animId: null,
    keys: { l: false, r: false, u: false, d: false },
    state: {},
  };

  function $(id) { return document.getElementById(id); }

  function viewSize() {
    var box = $('ogCanvasBox');
    var r = box ? box.getBoundingClientRect() : { width: 320, height: 280 };
    return { w: Math.max(280, r.width), h: Math.max(220, r.height) };
  }

  function resize() {
    var vs = viewSize();
    var dpr = Math.min(w.devicePixelRatio || 1, 2);
    S.canvas.width = Math.floor(vs.w * dpr);
    S.canvas.height = Math.floor(vs.h * dpr);
    S.canvas.style.width = vs.w + 'px';
    S.canvas.style.height = vs.h + 'px';
    S.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (S.state.player) {
      S.state.player.x = Math.min(Math.max(S.state.player.x, 30), vs.w - 30);
    }
    return vs;
  }

  function drawEmoji(ctx, emoji, x, y, size, flipX) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.font = 'bold ' + size + 'px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    if (flipX && FACE_RE.test(emoji)) {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.fillText(emoji, 0, 0);
    } else {
      ctx.fillText(emoji, x, y);
    }
    ctx.restore();
  }

  function drawRingIcon(x, y, icon, size, ring, flipX) {
    var ctx = S.ctx;
    var rad = size * 0.52;
    ctx.beginPath();
    ctx.arc(x, y, rad + 5, 0, Math.PI * 2);
    ctx.fillStyle = ring || 'rgba(0,20,40,0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawEmoji(ctx, icon, x, y + 1, size, flipX);
  }

  function drawBg(vs) {
    var g = S.ctx.createLinearGradient(0, 0, 0, vs.h);
    g.addColorStop(0, S.cfg.bgTop || '#0a3050');
    g.addColorStop(1, S.cfg.bgBot || '#041525');
    S.ctx.fillStyle = g;
    S.ctx.fillRect(0, 0, vs.w, vs.h);
    for (var i = 0; i < 12; i++) {
      S.ctx.fillStyle = 'rgba(255,255,255,' + (0.08 + (i % 3) * 0.05) + ')';
      S.ctx.beginPath();
      S.ctx.arc((i * 83) % vs.w, (i * 53 + Date.now() * 0.018) % vs.h, 1.2 + (i % 2), 0, Math.PI * 2);
      S.ctx.fill();
    }
  }

  function hud() {
    var el = $('ogScore');
    if (el) el.textContent = '⭐ ' + S.score;
    el = $('ogTimer');
    if (el) el.textContent = '⏱ ' + S.time + 's';
    el = $('ogLives');
    if (el) el.textContent = '❤️'.repeat(Math.max(0, S.lives));
    el = $('ogHint');
    if (el && S.state.hintText) el.textContent = S.state.hintText;
  }

  function loseLife() {
    S.lives--;
    hud();
    if (S.lives <= 0) end(false);
  }

  function addScore(n) {
    S.score += n;
    hud();
    if (S.cfg.goal && S.score >= S.cfg.goal) end(true);
  }

  function end(won) {
    S.running = false;
    clearInterval(S.timerId);
    cancelAnimationFrame(S.animId);
    var title = $('ogEndTitle');
    var stats = $('ogEndStats');
    if (title) title.textContent = won ? '🎉 Great job!' : '💫 Try again!';
    if (stats) {
      var goalTxt = S.cfg.winText || ('Goal: ' + S.cfg.goal);
      stats.textContent = 'Score: ' + S.score + ' | ' + goalTxt + ' | Time left: ' + S.time + 's';
    }
    var ov = $('ogEnd');
    if (ov) ov.style.display = 'flex';
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── Game: zone-sort (005) — catch zones in depth order ── */
  var ZONE_ORDER = ['☀️', '🌅', '🌙', '🕳️'];

  function initZoneSort(vs) {
    S.state = {
      player: { x: vs.w / 2, y: vs.h - 36, vx: 0, icon: S.cfg.player || '🤿' },
      items: [],
      spawn: 18,
      step: 0,
      hintText: 'Next: ☀️ Sunlight',
    };
  }

  function spawnZoneSort(vs) {
    var need = ZONE_ORDER[S.state.step % ZONE_ORDER.length];
    if (Math.random() < 0.38) {
      S.state.items.push({
        x: 28 + Math.random() * (vs.w - 56),
        y: -24,
        icon: pick(S.cfg.bad.length ? S.cfg.bad : ['🗑️']),
        bad: true,
        speed: 2 + Math.random() * 1.5,
        r: 20,
      });
    } else {
      var icon = Math.random() < 0.62 ? need : pick(ZONE_ORDER);
      S.state.items.push({
        x: 28 + Math.random() * (vs.w - 56),
        y: -24,
        icon: icon,
        need: icon === need,
        bad: false,
        speed: 1.6 + Math.random() * 1.4,
        r: 20,
      });
    }
  }

  function loopZoneSort(vs) {
    var p = S.state.player;
    if (S.keys.l) p.vx = -6; else if (S.keys.r) p.vx = 6; else p.vx *= 0.72;
    p.x = Math.max(30, Math.min(vs.w - 30, p.x + p.vx));
    S.state.spawn++;
    if (S.state.spawn > 22) { S.state.spawn = 0; spawnZoneSort(vs); }
    S.state.items.forEach(function (it, i) {
      it.y += it.speed;
      if (Math.hypot(p.x - it.x, p.y - it.y) < it.r + 18) {
        S.state.items.splice(i, 1);
        if (it.bad) loseLife();
        else if (it.need) {
          addScore(15);
          S.state.step++;
          S.state.hintText = 'Next: ' + ZONE_ORDER[S.state.step % ZONE_ORDER.length];
          hud();
        } else loseLife();
      } else if (it.y > vs.h + 30) S.state.items.splice(i, 1);
    });
    drawBg(vs);
    S.state.items.forEach(function (it) {
      drawRingIcon(it.x, it.y, it.icon, 32, it.bad ? 'rgba(120,20,20,0.75)' : (it.need ? 'rgba(255,193,7,0.5)' : 'rgba(0,40,80,0.78)'), false);
    });
    drawRingIcon(p.x, p.y, p.icon, 36, 'rgba(0,60,100,0.85)', p.vx < -0.4);
  }

  /* ── Game: sunbeam-snap (008) — tap fish in the sunbeam ── */
  function initSunbeam(vs) {
    S.state = {
      swimmers: [],
      spawn: 0,
      beamX: vs.w * 0.38,
      beamW: vs.w * 0.24,
      hintText: 'Tap creatures in the ☀️ beam!',
    };
  }

  function spawnSunbeam(vs) {
    var bad = Math.random() < 0.28;
    var pool = bad ? S.cfg.bad : S.cfg.good;
    var dir = Math.random() < 0.5 ? 1 : -1;
    S.state.swimmers.push({
      x: dir > 0 ? -30 : vs.w + 30,
      y: 50 + Math.random() * (vs.h - 100),
      icon: pick(pool),
      bad: bad,
      dir: dir,
      speed: 1.8 + Math.random() * 2.2,
      r: 22,
    });
  }

  function loopSunbeam(vs) {
    S.state.spawn++;
    if (S.state.spawn > 28) { S.state.spawn = 0; spawnSunbeam(vs); }
    S.state.swimmers.forEach(function (s, i) {
      s.x += s.speed * s.dir;
      if ((s.dir > 0 && s.x > vs.w + 40) || (s.dir < 0 && s.x < -40)) S.state.swimmers.splice(i, 1);
    });
    drawBg(vs);
    var bx = S.state.beamX;
    var bw = S.state.beamW;
    S.ctx.fillStyle = 'rgba(255,235,59,0.14)';
    S.ctx.fillRect(bx, 0, bw, vs.h);
    S.ctx.fillStyle = 'rgba(255,255,255,0.08)';
    S.ctx.fillRect(bx + bw * 0.2, 0, bw * 0.6, vs.h);
    S.state.swimmers.forEach(function (s) {
      drawEmoji(S.ctx, s.icon, s.x, s.y, 30, s.dir < 0);
    });
  }

  function tapSunbeam(x, y) {
    for (var i = S.state.swimmers.length - 1; i >= 0; i--) {
      var s = S.state.swimmers[i];
      if (Math.hypot(x - s.x, y - s.y) < s.r + 10) {
        var inBeam = s.x > S.state.beamX && s.x < S.state.beamX + S.state.beamW;
        S.state.swimmers.splice(i, 1);
        if (!inBeam) return;
        if (s.bad) loseLife();
        else addScore(12);
        return;
      }
    }
  }

  /* ── Game: glow-rhythm (011) — tap on the pulse beat ── */
  function initGlow(vs) {
    S.state = { pulses: [], spawn: 0, hintText: 'Tap when the glow is brightest!' };
  }

  function spawnGlow(vs) {
    var bad = Math.random() < 0.2;
    S.state.pulses.push({
      x: 40 + Math.random() * (vs.w - 80),
      y: 40 + Math.random() * (vs.h - 80),
      icon: bad ? pick(S.cfg.bad) : pick(S.cfg.good),
      bad: bad,
      t: 0,
      life: 120 + Math.random() * 40,
      r: 24,
    });
  }

  function loopGlow(vs) {
    S.state.spawn++;
    if (S.state.spawn > 32) { S.state.spawn = 0; spawnGlow(vs); }
    S.state.pulses.forEach(function (p, i) {
      p.t++;
      if (p.t > p.life) S.state.pulses.splice(i, 1);
    });
    drawBg(vs);
    S.state.pulses.forEach(function (p) {
      var phase = p.t / 28;
      var glow = 0.35 + Math.max(0, Math.sin(phase)) * 0.65;
      S.ctx.strokeStyle = 'rgba(100,255,218,' + glow + ')';
      S.ctx.lineWidth = 3 + glow * 4;
      S.ctx.beginPath();
      S.ctx.arc(p.x, p.y, p.r + 6 + glow * 10, 0, Math.PI * 2);
      S.ctx.stroke();
      S.ctx.globalAlpha = 0.5 + glow * 0.5;
      drawEmoji(S.ctx, p.icon, p.x, p.y, 28, false);
      S.ctx.globalAlpha = 1;
    });
  }

  function tapGlow(x, y) {
    for (var i = S.state.pulses.length - 1; i >= 0; i--) {
      var p = S.state.pulses[i];
      if (Math.hypot(x - p.x, y - p.y) < p.r + 14) {
        var phase = p.t / 28;
        var beat = Math.sin(phase);
        S.state.pulses.splice(i, 1);
        if (beat < 0.55) return;
        if (p.bad) loseLife();
        else addScore(10);
        return;
      }
    }
  }

  /* ── Game: sonar-ping (014) — tap fish when sonar reveals them ── */
  function initSonar(vs) {
    S.state = { pings: [], spawn: 0, hintText: 'Tap fast when sonar reveals a creature!' };
  }

  function spawnSonar(vs) {
    var bad = Math.random() < 0.25;
    S.state.pings.push({
      x: 50 + Math.random() * (vs.w - 100),
      y: 50 + Math.random() * (vs.h - 100),
      icon: bad ? pick(S.cfg.bad) : pick(S.cfg.good),
      bad: bad,
      r: 0,
      maxR: 55 + Math.random() * 25,
      reveal: false,
      caught: false,
    });
  }

  function loopSonar(vs) {
    S.state.spawn++;
    if (S.state.spawn > 48) { S.state.spawn = 0; spawnSonar(vs); }
    S.state.pings.forEach(function (p, i) {
      p.r += 1.8;
      if (p.r > 18 && p.r < p.maxR * 0.55) p.reveal = true;
      if (p.r > p.maxR) S.state.pings.splice(i, 1);
    });
    S.ctx.fillStyle = '#020810';
    S.ctx.fillRect(0, 0, vs.w, vs.h);
    S.state.pings.forEach(function (p) {
      S.ctx.strokeStyle = 'rgba(100,255,218,' + (0.35 - p.r / p.maxR * 0.3) + ')';
      S.ctx.lineWidth = 2;
      S.ctx.beginPath();
      S.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      S.ctx.stroke();
      if (p.reveal) {
        S.ctx.globalAlpha = Math.min(1, (p.maxR - p.r) / 30);
        drawEmoji(S.ctx, p.icon, p.x, p.y, 30, false);
        S.ctx.globalAlpha = 1;
      }
    });
  }

  function tapSonar(x, y) {
    for (var i = S.state.pings.length - 1; i >= 0; i--) {
      var p = S.state.pings[i];
      if (!p.reveal) continue;
      if (Math.hypot(x - p.x, y - p.y) < 30) {
        S.state.pings.splice(i, 1);
        if (p.bad) loseLife();
        else addScore(12);
        return;
      }
    }
  }

  /* ── Game: trench-pilot (017) — rise/fall through gaps ── */
  function initTrench(vs) {
    S.state = {
      player: { x: vs.w * 0.28, y: vs.h / 2, vy: 0, icon: '🤿' },
      gaps: [],
      scroll: 0,
      spawn: 0,
      hintText: '⬆️⬇️ Steer through trench gaps!',
    };
    S.state.gaps.push(makeGap(vs, vs.w + 40));
  }

  function makeGap(vs, x) {
    var gh = 70 + Math.random() * 50;
    var gy = 40 + Math.random() * (vs.h - gh - 80);
    return { x: x, gapY: gy, gapH: gh, w: 36 };
  }

  function loopTrench(vs) {
    var p = S.state.player;
    if (S.keys.u) p.vy = -4.5;
    else if (S.keys.d) p.vy = 4.5;
    else p.vy += 0.22;
    p.vy = Math.max(-5.5, Math.min(5.5, p.vy));
    p.y = Math.max(24, Math.min(vs.h - 24, p.y + p.vy));
    S.state.scroll += 2.2;
    S.state.spawn++;
    if (S.state.spawn > 40) {
      S.state.spawn = 0;
      S.state.gaps.push(makeGap(vs, vs.w + 20));
    }
    S.state.gaps.forEach(function (g, i) {
      g.x -= 2.2;
      if (g.x < -60) S.state.gaps.splice(i, 1);
    });
    var hitWall = false;
    S.state.gaps.forEach(function (g) {
      if (Math.abs(p.x - g.x) < 22) {
        if (p.y - 16 < g.gapY || p.y + 16 > g.gapY + g.gapH) hitWall = true;
      }
    });
    if (hitWall) loseLife();
    S.score = Math.floor(S.state.scroll / 8);
    hud();
    if (S.cfg.goal && S.score >= S.cfg.goal) end(true);
    S.ctx.fillStyle = '#000008';
    S.ctx.fillRect(0, 0, vs.w, vs.h);
    S.state.gaps.forEach(function (g) {
      S.ctx.fillStyle = '#1a1a2e';
      S.ctx.fillRect(g.x - 18, 0, 36, g.gapY);
      S.ctx.fillRect(g.x - 18, g.gapY + g.gapH, 36, vs.h);
    });
    drawRingIcon(p.x, p.y, p.icon, 28, 'rgba(0,60,100,0.85)', false);
  }

  /* ── Game: reef-match (020) — memory pairs ── */
  function initReefMatch(vs) {
    var icons = (S.cfg.good || ['🐠', '🪸', '🦐', '🐙']).slice(0, 4);
    var cards = [];
    icons.forEach(function (ic) { cards.push(ic, ic); });
    cards.sort(function () { return Math.random() - 0.5; });
    var cols = 4, rows = 2;
    var pad = 10;
    var cw = (vs.w - pad * (cols + 1)) / cols;
    var ch = (vs.h - pad * (rows + 1) - 20) / rows;
    S.state = {
      cards: cards.map(function (icon, i) {
        return {
          icon: icon,
          x: pad + (i % cols) * (cw + pad) + cw / 2,
          y: 30 + Math.floor(i / cols) * (ch + pad) + ch / 2,
          w: cw,
          h: ch,
          flip: false,
          matched: false,
        };
      }),
      picked: [],
      lock: false,
      hintText: 'Find all matching pairs!',
    };
  }

  function loopReefMatch(vs) {
    S.ctx.fillStyle = '#004d40';
    S.ctx.fillRect(0, 0, vs.w, vs.h);
    var matched = 0;
    S.state.cards.forEach(function (c) {
      if (c.matched) matched++;
      S.ctx.fillStyle = c.matched ? 'rgba(100,255,218,0.25)' : (c.flip ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.35)');
      S.ctx.strokeStyle = 'rgba(100,255,218,0.5)';
      S.ctx.lineWidth = 2;
      S.ctx.fillRect(c.x - c.w / 2 + 4, c.y - c.h / 2 + 4, c.w - 8, c.h - 8);
      S.ctx.strokeRect(c.x - c.w / 2 + 4, c.y - c.h / 2 + 4, c.w - 8, c.h - 8);
      if (c.flip || c.matched) drawEmoji(S.ctx, c.icon, c.x, c.y, Math.min(c.w, c.h) * 0.45, false);
      else {
        S.ctx.font = 'bold 22px ' + FONT;
        S.ctx.fillStyle = '#64ffda';
        S.ctx.fillText('?', c.x, c.y);
      }
    });
    if (matched === S.state.cards.length) end(true);
  }

  function tapReefMatch(x, y) {
    if (S.state.lock) return;
    for (var i = 0; i < S.state.cards.length; i++) {
      var c = S.state.cards[i];
      if (c.matched || c.flip) continue;
      if (x > c.x - c.w / 2 && x < c.x + c.w / 2 && y > c.y - c.h / 2 && y < c.y + c.h / 2) {
        c.flip = true;
        S.state.picked.push(c);
        if (S.state.picked.length === 2) {
          S.state.lock = true;
          var a = S.state.picked[0];
          var b = S.state.picked[1];
          if (a.icon === b.icon) {
            a.matched = b.matched = true;
            addScore(20);
            S.state.picked = [];
            S.state.lock = false;
          } else {
            setTimeout(function () {
              a.flip = b.flip = false;
              S.state.picked = [];
              S.state.lock = false;
            }, 650);
          }
        }
        return;
      }
    }
  }

  /* ── Game: breath-dive (023) — oxygen + vertical dive ── */
  function initBreath(vs) {
    S.state = {
      player: { x: vs.w / 2, y: 60, vy: 0, icon: S.cfg.player || '🐬' },
      o2: 100,
      items: [],
      hazards: [],
      spawn: 0,
      hintText: '⬆️ Surface for air! ⬇️ Dive for fish',
    };
  }

  function loopBreath(vs) {
    var p = S.state.player;
    if (S.keys.u) p.vy = -3.5;
    else if (S.keys.d) p.vy = 3.5;
    else p.vy *= 0.92;
    p.y = Math.max(36, Math.min(vs.h - 36, p.y + p.vy));
    var surface = p.y < vs.h * 0.18;
    if (surface) S.state.o2 = Math.min(100, S.state.o2 + 2.2);
    else S.state.o2 -= 0.45;
    if (S.state.o2 <= 0) loseLife();
    S.state.spawn++;
    if (S.state.spawn > 36) {
      S.state.spawn = 0;
      if (Math.random() < 0.7) {
        S.state.items.push({ x: 40 + Math.random() * (vs.w - 80), y: vs.h * 0.35 + Math.random() * (vs.h * 0.45), icon: pick(S.cfg.good), r: 18 });
      } else {
        S.state.hazards.push({ x: 40 + Math.random() * (vs.w - 80), y: vs.h * 0.35 + Math.random() * (vs.h * 0.45), icon: pick(S.cfg.bad), r: 18 });
      }
    }
    S.state.items.forEach(function (it, i) {
      if (Math.hypot(p.x - it.x, p.y - it.y) < 28) { S.state.items.splice(i, 1); addScore(10); }
    });
    S.state.hazards.forEach(function (it, i) {
      if (Math.hypot(p.x - it.x, p.y - it.y) < 26) { S.state.hazards.splice(i, 1); loseLife(); }
    });
    drawBg(vs);
    S.ctx.fillStyle = 'rgba(129,212,250,0.2)';
    S.ctx.fillRect(0, 0, vs.w, vs.h * 0.16);
    S.ctx.fillStyle = 'rgba(255,255,255,0.7)';
    S.ctx.font = '11px sans-serif';
    S.ctx.textAlign = 'left';
    S.ctx.fillText('O₂', 10, 18);
    S.ctx.fillStyle = S.state.o2 > 30 ? '#64ffda' : '#ff5252';
    S.ctx.fillRect(30, 10, (vs.w - 44) * (S.state.o2 / 100), 8);
    S.state.items.forEach(function (it) { drawEmoji(S.ctx, it.icon, it.x, it.y, 26, false); });
    S.state.hazards.forEach(function (it) { drawRingIcon(it.x, it.y, it.icon, 26, 'rgba(120,20,20,0.7)', false); });
    drawRingIcon(p.x, p.y, p.icon, 34, 'rgba(0,60,100,0.85)', p.vy > 0.5);
  }

  /* ── Game: school-run (026) — 3-lane dodge ── */
  function initSchool(vs) {
    var laneY = [vs.h * 0.45, vs.h * 0.58, vs.h * 0.71];
    S.state = {
      lane: 1,
      laneY: laneY,
      player: { icon: S.cfg.player || '🐠' },
      obstacles: [],
      treats: [],
      spawn: 0,
      hintText: '⬅️➡️ Switch lanes — dodge sharks!',
    };
  }

  function loopSchool(vs) {
    if (S.keys.l && !S.state.keyLock) {
      S.state.lane = Math.max(0, S.state.lane - 1);
      S.state.keyLock = true;
      setTimeout(function () { S.state.keyLock = false; }, 180);
    }
    if (S.keys.r && !S.state.keyLock) {
      S.state.lane = Math.min(2, S.state.lane + 1);
      S.state.keyLock = true;
      setTimeout(function () { S.state.keyLock = false; }, 180);
    }
    S.state.spawn++;
    if (S.state.spawn > 30) {
      S.state.spawn = 0;
      var lane = Math.floor(Math.random() * 3);
      if (Math.random() < 0.55) {
        S.state.obstacles.push({ lane: lane, x: vs.w + 20, icon: pick(S.cfg.bad), speed: 3 + Math.random() * 2 });
      } else {
        S.state.treats.push({ lane: lane, x: vs.w + 20, icon: pick(S.cfg.good), speed: 2.5 + Math.random() * 1.5 });
      }
    }
    var py = S.state.laneY[S.state.lane];
    var px = vs.w * 0.22;
    S.state.obstacles.forEach(function (o, i) {
      o.x -= o.speed;
      if (o.lane === S.state.lane && Math.abs(o.x - px) < 28) {
        S.state.obstacles.splice(i, 1);
        loseLife();
      } else if (o.x < -30) S.state.obstacles.splice(i, 1);
    });
    S.state.treats.forEach(function (t, i) {
      t.x -= t.speed;
      if (t.lane === S.state.lane && Math.abs(t.x - px) < 26) {
        S.state.treats.splice(i, 1);
        addScore(8);
      } else if (t.x < -30) S.state.treats.splice(i, 1);
    });
    drawBg(vs);
    S.state.laneY.forEach(function (ly, idx) {
      S.ctx.strokeStyle = idx === S.state.lane ? 'rgba(100,255,218,0.35)' : 'rgba(255,255,255,0.06)';
      S.ctx.lineWidth = idx === S.state.lane ? 2 : 1;
      S.ctx.beginPath();
      S.ctx.moveTo(0, ly);
      S.ctx.lineTo(vs.w, ly);
      S.ctx.stroke();
    });
    S.state.obstacles.forEach(function (o) {
      drawEmoji(S.ctx, o.icon, o.x, S.state.laneY[o.lane], 28, true);
    });
    S.state.treats.forEach(function (t) {
      drawEmoji(S.ctx, t.icon, t.x, S.state.laneY[t.lane], 24, true);
    });
    drawRingIcon(px, py, S.state.player.icon, 32, 'rgba(0,60,100,0.85)', false);
  }

  var GAMES = {
    'zone-sort': { init: initZoneSort, loop: loopZoneSort, tap: null, controls: 'lr' },
    'sunbeam-snap': { init: initSunbeam, loop: loopSunbeam, tap: tapSunbeam, controls: 'tap' },
    'glow-rhythm': { init: initGlow, loop: loopGlow, tap: tapGlow, controls: 'tap' },
    'sonar-ping': { init: initSonar, loop: loopSonar, tap: tapSonar, controls: 'tap' },
    'trench-pilot': { init: initTrench, loop: loopTrench, tap: null, controls: 'ud' },
    'reef-match': { init: initReefMatch, loop: loopReefMatch, tap: tapReefMatch, controls: 'tap' },
    'breath-dive': { init: initBreath, loop: loopBreath, tap: null, controls: 'ud' },
    'school-run': { init: initSchool, loop: loopSchool, tap: null, controls: 'lr' },
  };

  function mainLoop() {
    if (!S.running) return;
    var vs = resize();
    var g = GAMES[S.cfg.game];
    if (g) g.loop(vs);
    S.animId = requestAnimationFrame(mainLoop);
  }

  function canvasHit(e) {
    if (!S.running) return;
    var g = GAMES[S.cfg.game];
    if (!g || !g.tap) return;
    var r = S.canvas.getBoundingClientRect();
    var p = e.touches ? e.touches[0] : e;
    g.tap(p.clientX - r.left, p.clientY - r.top);
  }

  function bindControls(kind) {
    var L = $('ogLeftBtn');
    var R = $('ogRightBtn');
    var U = $('ogUpBtn');
    var D = $('ogDownBtn');
    function bindBtn(el, key, on) {
      if (!el || el._ogBound) return;
      el._ogBound = true;
      el.addEventListener('touchstart', function (e) { e.preventDefault(); S.keys[key] = true; });
      el.addEventListener('touchend', function () { S.keys[key] = false; });
      el.addEventListener('mousedown', function () { S.keys[key] = true; });
      el.addEventListener('mouseup', function () { S.keys[key] = false; });
    }
    if (kind === 'lr' || kind === 'school-run') {
      bindBtn(L, 'l');
      bindBtn(R, 'r');
    }
    if (kind === 'ud') {
      bindBtn(U, 'u');
      bindBtn(D, 'd');
    }
    if (!S.canvas._ogTap && (kind === 'tap' || GAMES[S.cfg.game] && GAMES[S.cfg.game].tap)) {
      S.canvas._ogTap = true;
      S.canvas.addEventListener('click', canvasHit);
      S.canvas.addEventListener('touchstart', function (e) { e.preventDefault(); canvasHit(e); }, { passive: false });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') S.keys.l = true;
      if (e.key === 'ArrowRight') S.keys.r = true;
      if (e.key === 'ArrowUp') S.keys.u = true;
      if (e.key === 'ArrowDown') S.keys.d = true;
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowLeft') S.keys.l = false;
      if (e.key === 'ArrowRight') S.keys.r = false;
      if (e.key === 'ArrowUp') S.keys.u = false;
      if (e.key === 'ArrowDown') S.keys.d = false;
    });
  }

  function startGame() {
    resize();
    S.running = true;
    S.score = 0;
    S.time = S.cfg.time;
    S.lives = S.cfg.lives;
    S.keys = { l: false, r: false, u: false, d: false };
    var vs = viewSize();
    var g = GAMES[S.cfg.game];
    if (g) g.init(vs);
    var start = $('ogStart');
    var end = $('ogEnd');
    if (start) start.style.display = 'none';
    if (end) end.style.display = 'none';
    hud();
    clearInterval(S.timerId);
    S.timerId = setInterval(function () {
      if (!S.running) return;
      S.time--;
      hud();
      if (S.time <= 0) {
        if (S.cfg.game === 'trench-pilot') end(S.score >= (S.cfg.goal || 50));
        else if (S.cfg.game === 'reef-match') end(S.state.cards && S.state.cards.every(function (c) { return c.matched; }));
        else end(S.score >= S.cfg.goal);
      }
    }, 1000);
    mainLoop();
  }

  w.OceanGame = {
    boot: function (cfg) {
      S.cfg = cfg;
      S.canvas = $('ogCanvas');
      if (!S.canvas) return;
      S.ctx = S.canvas.getContext('2d');
      var g = GAMES[cfg.game];
      bindControls(g ? g.controls : 'lr');
      w.ogStartGame = startGame;
      w.addEventListener('resize', function () { if (S.running) resize(); });
    },
  };
})(window);
