const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const SVG_NS = 'http://www.w3.org/2000/svg';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;


function initLoader(onDone) {
  const loader = $('#loader');
  const count  = $('#loaderCount');
  const word   = $('.loader__word');
  document.body.classList.add('is-locked');

  let value = 0;
  const timer = setInterval(() => {
    value += Math.ceil(Math.random() * 7);
    if (value >= 100) value = 100;
    count.textContent = value;
    word.style.backgroundSize = `100% ${value}%`;

    if (value === 100) {
      clearInterval(timer);
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.remove('is-locked');
        onDone();
      }, 350);
    }
  }, 45);
}


function initRoughBoil() {
  if (reduceMotion || innerWidth < 860) return;
  const noise = $('#roughNoise');
  let seed = 1;
  setInterval(() => {
    seed = seed % 6 + 1;
    noise.setAttribute('seed', seed);
  }, 170);
}


function initTyped() {
  const el = $('#typed');
  const words = ['веб-разработчик', 'студент из Алматы', 'пишу на Java', 'делаю сайты, от которых мурашки'];
  if (reduceMotion) { el.textContent = words[0]; return; }

  let w = 0, i = 0, deleting = false;
  function tick() {
    const word = words[w];
    el.textContent = word.slice(0, i);

    if (!deleting && i === word.length) { deleting = true; return setTimeout(tick, 1600); }
    if (deleting && i === 0)            { deleting = false; w = (w + 1) % words.length; }

    i += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 35 : 80);
  }
  tick();
}


function initTimer() {
  const el = $('#timer');
  const start = Date.now();
  const pad = n => String(n).padStart(2, '0');

  setInterval(() => {
    const sec = Math.floor((Date.now() - start) / 1000);
    el.textContent = `${pad(Math.floor(sec / 60) % 100)}:${pad(sec % 60)}`;
  }, 1000);
}


function initSigil() {
  const sigil  = $('#sigil');
  const spikes = $('#spikes');
  const pupils = $$('.pupil', sigil);

  const COUNT = 34, CX = 300, CY = 300, R0 = 150;
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
    const length = 40 + Math.random() * 150 + (i % 3 === 0 ? 70 : 0);
    const half = 0.035;
    const p = (a, r) => `${CX + Math.cos(a) * r},${CY + Math.sin(a) * r}`;

    const spike = document.createElementNS(SVG_NS, 'polygon');
    spike.setAttribute('points', `${p(angle - half, R0)} ${p(angle + half, R0)} ${p(angle, R0 + length)}`);
    spike.setAttribute('fill', '#d10a0a');
    spikes.appendChild(spike);
  }

  function look(dx, dy) {
    const max = 9;
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(len / 250, 1) * max;
    pupils.forEach(p => { p.style.translate = `${(dx / len) * k}px ${(dy / len) * k * 0.8}px`; });
  }

  if (hasMouse) {
    addEventListener('mousemove', e => {
      const r = sigil.getBoundingClientRect();
      look(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    });
  } else {
    setInterval(() => look((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300), 1800);
  }
}


function initBranches() {
  $$('.branch').forEach(svg => {
    const group = $('.thorns', svg);

    $$('.branch__path', svg).forEach(path => {
      const length = path.getTotalLength();
      let side = 1;

      for (let d = 28; d < length - 10; d += 30 + Math.random() * 12) {
        const a = path.getPointAtLength(d);
        const b = path.getPointAtLength(d + 3);
        const tx = b.x - a.x, ty = b.y - a.y;
        const tl = Math.hypot(tx, ty) || 1;
        const nx = (-ty / tl) * side, ny = (tx / tl) * side;
        const size = 11 + Math.random() * 12;

        const thorn = document.createElementNS(SVG_NS, 'polygon');
        thorn.setAttribute('points', [
          `${a.x - (tx / tl) * 4},${a.y - (ty / tl) * 4}`,
          `${a.x + (tx / tl) * 4},${a.y + (ty / tl) * 4}`,
          `${a.x + nx * size + (tx / tl) * 7},${a.y + ny * size + (ty / tl) * 7}`
        ].join(' '));
        group.appendChild(thorn);
        side *= -1;
      }
    });
  });
}

function growBranches() {
  $$('.branch').forEach(b => b.classList.add('is-grown'));
}


function initLeaves() {
  const canvas = $('#leaves');
  if (reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, leaves = [];

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    const amount = w < 700 ? 18 : 40;
    leaves = Array.from({ length: amount }, () => newLeaf(true));
  }

  function newLeaf(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      size: Math.random() * 6 + 4,
      vy: Math.random() * 0.8 + 0.35,
      sway: Math.random() * 1.5 + 0.5,
      phase: Math.random() * 6.28,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.05,
      alpha: Math.random() * 0.5 + 0.45
    };
  }

  function drawLeaf(l) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? l.size : l.size * 0.42;
      const a = (i / 10) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(200, 8, 8, ${l.alpha})`;
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const l of leaves) {
      l.phase += 0.02;
      l.y += l.vy;
      l.x += Math.sin(l.phase) * l.sway;
      l.rot += l.vr;
      if (l.y > h + 20) Object.assign(l, newLeaf(false));
      drawLeaf(l);
    }
    requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', resize);
  frame();
}


function initCursor() {
  if (!hasMouse) return;
  document.body.classList.add('has-cursor');

  const ring = $('#cursor');
  const dot  = $('#cursorDot');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  (function loop() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  $$('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}


function initParallax() {
  if (!hasMouse || reduceMotion) return;
  const photo = $('#heroPhoto img');

  addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth  - 0.5) * 24;
    const y = (e.clientY / innerHeight - 0.5) * 24;
    photo.style.translate = `${-x}px ${-y}px`;
  });
}


function initScroll() {
  const header   = $('#header');
  const progress = $('#progress');
  const toTop    = $('#toTop');
  const ring     = $('#toTopRing');
  const CIRCLE   = 132;

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;

    progress.style.width = `${p * 100}%`;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > 500);
    ring.style.strokeDashoffset = CIRCLE - CIRCLE * p;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}


function initMenu() {
  const burger = $('#burger');
  const menu   = $('#menu');

  function toggle(open) {
    burger.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('is-locked', open);
  }

  burger.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  addEventListener('resize', () => { if (innerWidth > 860) toggle(false); });
}


function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => io.observe(el));

  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      let n = 0;
      const step = setInterval(() => {
        n++;
        el.textContent = n;
        if (n >= target) clearInterval(step);
      }, 220);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });

  $$('[data-count]').forEach(el => counterIO.observe(el));
}


function initTilt() {
  if (!hasMouse || reduceMotion) return;

  $$('.work').forEach(card => {
    const img = $('.work__img', card);

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;

      img.style.transform = `rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 12}deg) scale(1.02)`;
      img.style.setProperty('--gx', `${x * 100}%`);
      img.style.setProperty('--gy', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => { img.style.transform = ''; });
  });

  $$('.skill').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}


function initMagnetic() {
  if (!hasMouse || reduceMotion) return;

  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}


$('#year').textContent = new Date().getFullYear();

initCursor();
initScroll();
initMenu();
initReveal();
initTilt();
initMagnetic();
initLeaves();
initParallax();
initSigil();
initBranches();
initRoughBoil();
initTimer();

initLoader(() => {
  initTyped();
  growBranches();
});
