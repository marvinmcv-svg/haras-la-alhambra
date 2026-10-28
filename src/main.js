import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { getLang, setLang, applyLang } from './i18n.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ---------- Language ---------- */
const lang = getLang();
applyLang(lang);
$('.lang').addEventListener('click', () => {
  setLang(lang === 'es' ? 'en' : 'es');
  try { sessionStorage.setItem('hla-seen', '1'); } catch {}
  location.href = location.pathname + location.hash;
});
$('.year').textContent = new Date().getFullYear();

/* ---------- Media: show a labelled placeholder until real files are dropped in ---------- */
$$('.media').forEach((frame) => {
  const el = frame.querySelector('img, video');
  if (!el) return;
  const ok = () => frame.classList.add('is-loaded');
  const missing = () => frame.classList.add('is-missing');
  if (el.tagName === 'IMG') {
    if (el.complete) (el.naturalWidth ? ok : missing)();
    el.addEventListener('load', ok);
    el.addEventListener('error', missing);
  } else {
    el.addEventListener('loadeddata', ok);
    const src = el.querySelector('source');
    (src || el).addEventListener('error', () => {
      // Poster may still exist even if the clip does not.
      if (!el.poster) return missing();
      const probe = new Image();
      probe.onload = ok;
      probe.onerror = missing;
      probe.src = el.poster;
    });
  }
});

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.8 });
    else target.scrollIntoView();
  });
});

/* ---------- Nav, progress ---------- */
const nav = $('.nav');
let lastY = 0;
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    nav.classList.toggle('is-scrolled', y > 60);
    nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.8);
    lastY = y;
    gsap.set('.progress span', { scaleX: self.progress });
  },
});

/* ---------- Cursor ---------- */
if (finePointer && !reduceMotion) {
  document.body.classList.add('has-cursor');
  const cursor = $('.cursor');
  const label = $('.cursor__label');
  const dotX = gsap.quickTo('.cursor__dot', 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo('.cursor__dot', 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo('.cursor__ring', 'x', { duration: 0.55, ease: 'power3' });
  const ringY = gsap.quickTo('.cursor__ring', 'y', { duration: 0.55, ease: 'power3' });
  gsap.set(cursor, { autoAlpha: 0 });
  window.addEventListener('pointermove', (e) => {
    dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY);
  });
  window.addEventListener('pointermove', (e) => {
    gsap.set(['.cursor__dot', '.cursor__ring'], { x: e.clientX, y: e.clientY });
    gsap.to(cursor, { autoAlpha: 1, duration: 0.4 });
  }, { once: true });
  const viewWord = lang === 'en' ? 'View' : 'Ver';
  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    const view = t.closest('[data-cursor="view"]');
    const hover = t.closest('a, button, [data-cursor="hover"]');
    cursor.classList.toggle('is-view', !!view && !hover);
    cursor.classList.toggle('is-hover', !!hover);
    label.textContent = view ? viewWord : '';
  });
  document.addEventListener('pointerleave', () => gsap.to(cursor, { autoAlpha: 0, duration: 0.3 }));
  document.addEventListener('pointerenter', () => gsap.to(cursor, { autoAlpha: 1, duration: 0.3 }));
}

/* ---------- Magnetic buttons ---------- */
if (finePointer && !reduceMotion) {
  $$('.magnetic').forEach((btn) => {
    const inner = btn.querySelector('span') || btn;
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const ixTo = inner !== btn ? gsap.quickTo(inner, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' }) : null;
    const iyTo = inner !== btn ? gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' }) : null;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * 0.35); yTo(dy * 0.45);
      ixTo?.(dx * 0.15); iyTo?.(dy * 0.15);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); ixTo?.(0); iyTo?.(0); });
  });
}

/* ---------- Loader → hero intro ---------- */
const heroSplit = SplitText.create('.hero__word', { type: 'chars', charsClass: 'char' });

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__media', { clipPath: 'inset(18% 30% 18% 30% round 40vw 40vw 0 0)', duration: 2.2, ease: 'expo.inOut' })
    .from('.hero__video', { scale: 1.6, duration: 2.6, ease: 'expo.inOut' }, '<')
    .from(heroSplit.chars, { yPercent: 115, rotate: 6, opacity: 0, duration: 1.6, stagger: 0.045 }, '-=1.3')
    .from('.hero__line--small', { yPercent: 100, opacity: 0, duration: 1.2 }, '<0.2')
    .from(['.hero__eyebrow', '.hero__sub', '.hero__scroll'], { y: 24, opacity: 0, duration: 1.4, stagger: 0.1 }, '<0.3')
    .from('.nav', { opacity: 0, duration: 1.4 }, '<');
  return tl;
}

let seen = false;
try { seen = sessionStorage.getItem('hla-seen') === '1'; } catch {}

function done() {
  document.body.classList.remove('is-loading');
  try { sessionStorage.setItem('hla-seen', '1'); } catch {}
  ScrollTrigger.refresh();
}

if (reduceMotion) {
  document.documentElement.classList.add('no-loader', 'reduced');
  done();
} else if (seen) {
  document.documentElement.classList.add('no-loader');
  done();
  intro();
} else {
  const counter = { v: 0 };
  const arch = $$('.loader__arch path');
  arch.forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.timeline()
    .to(arch, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', stagger: 0.2 }, 0)
    .from('.loader__mark', { opacity: 0, y: 12, duration: 1, ease: 'power3.out' }, 0.4)
    .to(counter, {
      v: 100, duration: 2.2, ease: 'power3.inOut',
      onUpdate: () => { $('.loader__num').textContent = String(Math.round(counter.v)).padStart(2, '0'); },
    }, 0)
    .to(['.loader__inner'], { opacity: 0, duration: 0.5 }, '+=0.15')
    .to('.loader__panel--top', { yPercent: -100, duration: 1.3, ease: 'expo.inOut' })
    .to('.loader__panel--bottom', { yPercent: 100, duration: 1.3, ease: 'expo.inOut' }, '<')
    .add(() => { done(); intro(); }, '<0.15')
    .set('.loader', { display: 'none' });
}

if (!reduceMotion) {
  /* ---------- Hero: cinematic scroll — the frame closes into a Moorish arch ---------- */
  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=120%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
  });
  heroTl
    .fromTo('.hero__media',
      { clipPath: 'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)' },
      { clipPath: () => {
        // A wider arch on portrait screens so it never collapses into a sliver.
        const side = window.innerWidth < window.innerHeight ? 10 : 31;
        return `inset(12% ${side}% 7% ${side}% round 40vw 40vw 0vw 0vw)`;
      }, ease: 'none' }, 0)
    .to('.hero__video', { scale: 1.02, ease: 'none' }, 0)
    .to(heroSplit.chars, {
      yPercent: (i) => -40 - (i % 3) * 25, opacity: 0, ease: 'none',
      stagger: { each: 0.02, from: 'center' },
    }, 0)
    .to(['.hero__eyebrow', '.hero__sub', '.hero__line--small', '.hero__scroll'], { opacity: 0, y: -40, ease: 'none' }, 0);

  /* ---------- Manifesto: words ignite as you read ---------- */
  const words = SplitText.create('[data-words]', { type: 'words', wordsClass: 'word' });
  gsap.fromTo(words.words, { opacity: 0.12 }, {
    opacity: 1, ease: 'none', stagger: 0.1,
    scrollTrigger: { trigger: '.manifesto', start: 'top 70%', end: 'bottom 60%', scrub: true },
  });

  /* ---------- Masked line reveals on headlines ---------- */
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });

  $$('[data-fade]').forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ---------- Clip-path image reveals ---------- */
  $$('.reveal-media').forEach((frame) => {
    const img = frame.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 80%', once: true } });
    tl.from(frame, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut' })
      .from(img, { scale: 1.5, duration: 2.4, ease: 'expo.out' }, '<0.2');
  });
  gsap.to('.philosophy__media img', {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.philosophy__media', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const from = end > 1000 ? end - 60 : 0;
    const obj = { v: from };
    gsap.to(obj, {
      v: end, duration: 2.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
  });

  /* ---------- Parallax collage ---------- */
  $$('[data-speed]').forEach((el) => {
    gsap.to(el, {
      yPercent: +el.dataset.speed * 100, ease: 'none',
      scrollTrigger: { trigger: '.estate__gallery', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const mm = gsap.matchMedia();

  /* ---------- Lineages: pinned horizontal journey (desktop) ---------- */
  mm.add('(min-width: 861px)', () => {
    const track = $('.lineages__track');
    const distance = () => track.scrollWidth - window.innerWidth;
    const horizontal = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '.lineages', start: 'top top', end: () => '+=' + distance(),
        scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    $$('.breed').forEach((breed) => {
      gsap.fromTo(breed.querySelector('.breed__media img'), { xPercent: -8 }, {
        xPercent: 8, ease: 'none',
        scrollTrigger: { trigger: breed, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
      });
      gsap.from(breed.querySelector('.breed__media'), {
        clipPath: 'inset(0% 0% 0% 100%)', ease: 'none',
        scrollTrigger: { trigger: breed, containerAnimation: horizontal, start: 'left 95%', end: 'left 40%', scrub: true },
      });
      gsap.from(breed.querySelectorAll('.breed__copy > *'), {
        x: 80, opacity: 0, stagger: 0.06, ease: 'none',
        scrollTrigger: { trigger: breed, containerAnimation: horizontal, start: 'left 80%', end: 'left 30%', scrub: true },
      });
    });
  });

  mm.add('(max-width: 860px)', () => {
    $$('.breed__media').forEach((frame) => {
      gsap.from(frame, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: frame, start: 'top 85%', once: true } });
    });
  });

  /* ---------- Marquee: velocity-aware kinetic type ---------- */
  const row = $('.marquee__row');
  const loop = gsap.to(row, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  const skewTo = gsap.quickTo(row, 'skewX', { duration: 0.6, ease: 'power3' });
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity();
      const boost = gsap.utils.clamp(-6, 6, v / 300);
      gsap.to(loop, { timeScale: (self.direction === 1 ? 1 : -1) * (1 + Math.abs(boost)), duration: 0.3, overwrite: true });
      skewTo(gsap.utils.clamp(-8, 8, -v / 250));
    },
    onLeave: () => skewTo(0),
    onLeaveBack: () => skewTo(0),
  });

  /* ---------- Slow-motion chapters: pinned crossfade ---------- */
  const layers = $$('.slowmo__layer');
  const captions = $$('.slowmo__caption');
  const dots = $$('.slowmo__dots i');
  const videos = layers.map((l) => l.querySelector('video'));
  videos.forEach((v) => {
    v.addEventListener('loadedmetadata', () => { v.playbackRate = 0.5; });
    v.playbackRate = 0.5;
  });
  const playOnly = (i) => videos.forEach((v, j) => {
    if (j === i) { v.playbackRate = 0.5; v.play().catch(() => {}); } else v.pause();
  });
  const slowTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.slowmo', start: 'top top', end: '+=300%', scrub: 1, pin: '.slowmo__stage', anticipatePin: 1,
      onEnter: () => playOnly(0), onEnterBack: () => playOnly(0),
      onLeave: () => playOnly(-1), onLeaveBack: () => playOnly(-1),
      onUpdate: (self) => {
        const p = self.progress * layers.length;
        dots.forEach((d, i) => d.style.setProperty('--p', gsap.utils.clamp(0, 1, p - i)));
        const active = Math.min(layers.length - 1, Math.floor(p));
        if (active !== slowTl._active) { slowTl._active = active; playOnly(active); }
      },
    },
  });
  layers.forEach((layer, i) => {
    const vid = videos[i];
    slowTl.fromTo(vid, { scale: 1.15 }, { scale: 1, ease: 'none', duration: 1 }, i);
    if (i === 0) return;
    slowTl
      .fromTo(layer, { opacity: 0, clipPath: 'inset(0% 0% 0% 100%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.6 }, i - 0.3)
      .to(captions[i - 1], { opacity: 0, y: -40, ease: 'power2.in', duration: 0.3 }, i - 0.3)
      .fromTo(captions[i], { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, i);
  });

  /* ---------- C.E.L.A.: cursor-tracking floating image ---------- */
  if (finePointer) {
    const float = $('.float-img');
    const inner = $('.float-img__inner');
    const xTo = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(float, 'y', { duration: 0.7, ease: 'power3' });
    const rTo = gsap.quickTo(float, 'rotation', { duration: 0.9, ease: 'power3' });
    let lastX = 0;
    const w = () => float.offsetWidth;
    const h = () => float.offsetHeight;
    $('.services').addEventListener('pointermove', (e) => {
      xTo(e.clientX - w() / 2);
      yTo(e.clientY - h() / 2);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
    $$('.service').forEach((item) => {
      // Preload so the swap is instant.
      const img = new Image();
      img.src = item.dataset.img;
      item.addEventListener('pointerenter', () => {
        if (img.complete && img.naturalWidth) inner.style.backgroundImage = `url(${item.dataset.img})`;
        else inner.style.backgroundImage = '';
        gsap.fromTo(inner, { scale: 1.3 }, { scale: 1, duration: 0.9, ease: 'expo.out' });
        gsap.to(float, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
      });
    });
    $('.services').addEventListener('pointerleave', () => {
      gsap.to(float, { opacity: 0, scale: 0.6, duration: 0.5, ease: 'expo.out' });
    });
  }

  /* ---------- Visit: slow zoom-out ---------- */
  gsap.fromTo('.visit__media img', { scale: 1.3 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });

  /* ---------- Footer: letters rise into place ---------- */
  const footSplit = SplitText.create('.footer__big', { type: 'chars', charsClass: 'char' });
  gsap.from(footSplit.chars, {
    yPercent: 100, opacity: 0, ease: 'none', stagger: 0.05,
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
}

window.addEventListener('load', () => ScrollTrigger.refresh());
