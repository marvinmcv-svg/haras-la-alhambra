import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { getLang, setLang, applyLang } from './i18n.js';
import { initSpirit } from './spirit.js';
import { initPricing } from './pricing.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ---------- Language ---------- */
const lang = getLang();
initPricing(lang);
applyLang(lang);
$('.lang')?.addEventListener('click', () => {
  setLang(lang === 'es' ? 'en' : 'es');
  try { sessionStorage.setItem('hla-seen', '1'); } catch {}
  location.reload();
});
$$('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- Current page in the nav ---------- */
const here = location.pathname.replace(/index\.html$/, '');
$$('.nav__links a, .menu__links a').forEach((a) => {
  if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
});

/* ---------- Media: labelled placeholder until the file loads ---------- */
$$('.media').forEach((frame) => {
  const el = frame.querySelector('img:not([aria-hidden]), video') || frame.querySelector('img');
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
      if (!el.poster) return missing();
      const probe = new Image();
      probe.onload = ok;
      probe.onerror = missing;
      probe.src = el.poster;
    });
  }
});

/* ---------- Smart fit: never crop a photo so hard that the horse or rider is lost ----------
   Full-screen images cover the frame when that only trims the edges; otherwise they are
   shown whole over a blurred copy of themselves. */
const smartFit = () => $$('[data-smart-fit]').forEach((img) => {
  if (!img.naturalWidth) return;
  const box = img.parentElement.getBoundingClientRect();
  const ia = img.naturalWidth / img.naturalHeight;
  const ba = box.width / box.height;
  const kept = Math.min(ia, ba) / Math.max(ia, ba); // share of the image left after covering
  img.classList.toggle('is-contained', kept < 0.78);
});
$$('[data-smart-fit]').forEach((img) => img.addEventListener('load', smartFit));
window.addEventListener('resize', smartFit);
smartFit();

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToHash = (hash) => {
  const target = hash && $(hash);
  if (!target) return false;
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  else target.scrollIntoView();
  return true;
};
$$('a[href*="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname) return;
    if (scrollToHash(url.hash)) { e.preventDefault(); closeMenu(); }
  });
});

/* ---------- Nav, progress, mobile menu ---------- */
const nav = $('.nav');
let lastY = 0;
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    nav.classList.toggle('is-scrolled', y > 60);
    nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.8 && !document.body.classList.contains('menu-open'));
    lastY = y;
    gsap.set('.progress span', { scaleX: self.progress });
  },
});

const burger = $('.burger');
const menu = $('#menu');
function closeMenu() {
  if (!document.body.classList.contains('menu-open')) return;
  document.body.classList.remove('menu-open');
  burger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  lenis?.start();
}
burger?.addEventListener('click', () => {
  const open = !document.body.classList.contains('menu-open');
  if (!open) return closeMenu();
  document.body.classList.add('menu-open');
  burger.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-hidden', 'false');
  lenis?.stop();
  if (!reduceMotion) gsap.fromTo('.menu__links a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.04, delay: 0.15 });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

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
    const hover = t.closest('a, button, input, [data-cursor="hover"]');
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
      xTo(dx * 0.3); yTo(dy * 0.4);
      ixTo?.(dx * 0.12); iyTo?.(dy * 0.12);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); ixTo?.(0); iyTo?.(0); });
  });
}

/* ---------- 3D tilt cards ---------- */
if (finePointer && !reduceMotion) {
  $$('.tilt').forEach((card) => {
    const inner = card.firstElementChild;
    const rx = gsap.quickTo(inner, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(inner, 'rotationY', { duration: 0.6, ease: 'power3' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 16);
      rx((0.5 - py) * 12);
      inner.style.setProperty('--gx', `${px * 100}%`);
      inner.style.setProperty('--gy', `${py * 100}%`);
    });
    card.addEventListener('pointerenter', () => card.classList.add('is-tilting'));
    card.addEventListener('pointerleave', () => { rx(0); ry(0); card.classList.remove('is-tilting'); });
  });
}

/* ---------- Lightbox for galleries ---------- */
const galleryItems = $$('[data-lightbox]');
if (galleryItems.length) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<button class="lightbox__close" type="button" aria-label="Cerrar">×</button><button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Anterior">←</button><figure><img alt="" /><figcaption></figcaption></figure><button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Siguiente">→</button>';
  document.body.append(box);
  const img = $('img', box);
  const cap = $('figcaption', box);
  let index = 0;
  const show = (i) => {
    index = (i + galleryItems.length) % galleryItems.length;
    const src = galleryItems[index].querySelector('img');
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    cap.textContent = src.alt;
  };
  const open = (i) => { show(i); box.classList.add('is-open'); box.setAttribute('aria-hidden', 'false'); lenis?.stop(); };
  const close = () => { box.classList.remove('is-open'); box.setAttribute('aria-hidden', 'true'); lenis?.start(); };
  galleryItems.forEach((item, i) => {
    item.tabIndex = 0;
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(i); });
  });
  $('.lightbox__close', box).addEventListener('click', close);
  $('.lightbox__nav--prev', box).addEventListener('click', () => show(index - 1));
  $('.lightbox__nav--next', box).addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
}

/* ---------- Loader → hero intro (home) or page intro (chapters) ---------- */
const hasLoader = !!$('.loader');
const heroSplit = $('.hero__word') ? SplitText.create('.hero__word', { type: 'chars', charsClass: 'char' }) : null;

function intro() {
  if (heroSplit) {
    return gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hero__media', { clipPath: 'inset(18% 30% 18% 30% round 40vw 40vw 0 0)', duration: 2, ease: 'expo.inOut' })
      .from('.hero__video', { scale: 1.4, duration: 2.4, ease: 'expo.inOut' }, '<')
      .from(heroSplit.chars, { yPercent: 100, opacity: 0, duration: 1.3, stagger: 0.035 }, '-=1.1')
      .from('.hero__line--small', { yPercent: 100, opacity: 0, duration: 1 }, '<0.15')
      .from(['.hero__eyebrow', '.hero__sub', '.hero__scroll'], { y: 18, opacity: 0, duration: 1.2, stagger: 0.08 }, '<0.25')
      .from('.nav', { opacity: 0, duration: 1.2 }, '<');
  }
  return gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.page-hero__media', { clipPath: 'inset(12% 8% 12% 8% round 24px)', duration: 1.6, ease: 'expo.inOut' })
    .from('.page-hero__media img', { scale: 1.25, duration: 2, ease: 'expo.out' }, '<')
    .from('.page-hero__content > *', { y: 30, opacity: 0, duration: 1.2, stagger: 0.08 }, '-=1.1');
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
} else if (seen || !hasLoader) {
  document.documentElement.classList.add('no-loader');
  done();
  if (heroSplit || $('.page-hero__media')) intro();
} else {
  const counter = { v: 0 };
  const arch = $$('.loader__arch path');
  arch.forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.timeline()
    .to(arch, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.2 }, 0)
    .from('.loader__mark', { opacity: 0, y: 12, duration: 1, ease: 'power3.out' }, 0.4)
    .to(counter, {
      v: 100, duration: 2, ease: 'power3.inOut',
      onUpdate: () => { $('.loader__num').textContent = String(Math.round(counter.v)).padStart(2, '0'); },
    }, 0)
    .to(['.loader__inner'], { opacity: 0, duration: 0.5 }, '+=0.15')
    .to('.loader__panel--top', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' })
    .to('.loader__panel--bottom', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, '<')
    .add(() => { done(); intro(); }, '<0.15')
    .set('.loader', { display: 'none' });
}

if (!reduceMotion) {
  /* ---------- Hero: the frame softly closes into a Moorish arch ---------- */
  if (heroSplit) {
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=100%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
    })
      .fromTo('.hero__media',
        { clipPath: 'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)' },
        { clipPath: () => {
          const side = window.innerWidth < window.innerHeight ? 8 : 28;
          return `inset(10% ${side}% 6% ${side}% round 40vw 40vw 0vw 0vw)`;
        }, ease: 'none' }, 0)
      .to('.hero__video', { scale: 1.04, ease: 'none' }, 0)
      .to('.hero__content', { y: -50, opacity: 0, ease: 'none' }, 0)
      .to('.hero__scroll', { opacity: 0, ease: 'none', duration: 0.3 }, 0);
  }

  /* ---------- Manifesto: words light up as you read ---------- */
  if ($('[data-words]')) {
    const words = SplitText.create('[data-words]', { type: 'words', wordsClass: 'word' });
    gsap.fromTo(words.words, { opacity: 0.18 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '[data-words]', start: 'top 75%', end: 'bottom 60%', scrub: true },
    });
  }

  /* ---------- Gentle line reveals on headlines ---------- */
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 100, duration: 1.1, ease: 'expo.out', stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }),
    });
  });

  $$('[data-fade]').forEach((el) => {
    gsap.from(el, { y: 24, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  /* ---------- Clip-path image reveals (end state is always the full photo) ---------- */
  $$('.reveal-media').forEach((frame) => {
    const img = frame.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } })
      .from(frame, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from(img, { scale: 1.25, duration: 2, ease: 'expo.out' }, '<0.15');
  });

  $$('.space, .gallery__item, .card-reveal').forEach((el, i) => {
    gsap.from(el, {
      clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  /* ---------- 3D cards fan in ---------- */
  $$('.pillars, .tilt-group').forEach((group) => {
    gsap.from(group.querySelectorAll('.tilt > *:first-child'), {
      rotationY: -28, rotationX: 10, z: -160, yPercent: 12, opacity: 0, transformOrigin: '50% 100%',
      duration: 1.6, ease: 'expo.out', stagger: 0.14,
      scrollTrigger: { trigger: group, start: 'top 80%', once: true },
    });
  });
  if (!finePointer) {
    // On touch screens the cards lean as they travel through the viewport.
    $$('.tilt').forEach((card) => {
      gsap.fromTo(card, { rotationX: 8 }, {
        rotationX: -8, ease: 'none', transformPerspective: 900,
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const obj = { v: end > 1000 ? end - 60 : 0 };
    gsap.to(obj, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
  });

  /* ---------- Gentle parallax (only on images framed with room to move) ---------- */
  $$('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const mm = gsap.matchMedia();

  /* ---------- Lineages: pinned horizontal journey (desktop) ---------- */
  if ($('.lineages__track')) {
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
        gsap.fromTo(breed.querySelector('.breed__media img'), { xPercent: -3 }, {
          xPercent: 3, ease: 'none',
          scrollTrigger: { trigger: breed, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
        });
        gsap.from(breed.querySelector('.breed__media'), {
          clipPath: 'inset(0% 0% 0% 100%)', ease: 'none',
          scrollTrigger: { trigger: breed, containerAnimation: horizontal, start: 'left 95%', end: 'left 45%', scrub: true },
        });
        gsap.from(breed.querySelectorAll('.breed__copy > *'), {
          x: 50, opacity: 0, stagger: 0.05, ease: 'none',
          scrollTrigger: { trigger: breed, containerAnimation: horizontal, start: 'left 80%', end: 'left 35%', scrub: true },
        });
      });
    });
    mm.add('(max-width: 860px)', () => {
      $$('.breed__media').forEach((frame) => {
        gsap.from(frame, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: frame, start: 'top 88%', once: true } });
      });
    });
  }

  /* ---------- Marquee: velocity-aware kinetic type ---------- */
  const row = $('.marquee__row');
  if (row) {
    const loop = gsap.to(row, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
    const skewTo = gsap.quickTo(row, 'skewX', { duration: 0.6, ease: 'power3' });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity();
        const boost = gsap.utils.clamp(-4, 4, v / 400);
        gsap.to(loop, { timeScale: (self.direction === 1 ? 1 : -1) * (1 + Math.abs(boost)), duration: 0.3, overwrite: true });
        skewTo(gsap.utils.clamp(-5, 5, -v / 400));
      },
      onLeave: () => skewTo(0),
      onLeaveBack: () => skewTo(0),
    });
  }

  /* ---------- A day at La Alhambra: pinned crossfade with slow push-ins ---------- */
  const layers = $$('.slowmo__layer');
  if (layers.length) {
    const captions = $$('.slowmo__caption');
    const dots = $$('.slowmo__dots i');
    const frames = layers.map((l) => l.querySelector('.slowmo__img, video'));
    const playOnly = (i) => frames.forEach((v, j) => {
      if (v.tagName !== 'VIDEO') return;
      if (j === i) { v.playbackRate = 0.5; v.play().catch(() => {}); } else v.pause();
    });
    let activeLayer = -1;
    const slowTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.slowmo', start: 'top top', end: '+=300%', scrub: 1, pin: '.slowmo__stage', anticipatePin: 1,
        onEnter: () => playOnly(0), onEnterBack: () => playOnly(activeLayer),
        onLeave: () => playOnly(-1), onLeaveBack: () => playOnly(-1),
        onRefresh: smartFit,
        onUpdate: (self) => {
          const p = self.progress * layers.length;
          dots.forEach((d, i) => d.style.setProperty('--p', gsap.utils.clamp(0, 1, p - i)));
          const active = Math.min(layers.length - 1, Math.floor(p));
          if (active !== activeLayer) { activeLayer = active; playOnly(active); }
        },
      },
    });
    layers.forEach((layer, i) => {
      slowTl.fromTo(frames[i], { scale: 1.06 }, { scale: 1, ease: 'none', duration: 1.3 }, Math.max(0, i - 0.3));
      if (i === 0) return;
      slowTl
        .fromTo(layer, { opacity: 0, clipPath: 'inset(0% 0% 0% 100%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.6 }, i - 0.3)
        .to(captions[i - 1], { opacity: 0, y: -30, ease: 'power2.in', duration: 0.3 }, i - 0.3)
        .fromTo(captions[i], { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, i);
    });
  }

  /* ---------- Nights: zoom through the grid into the centre frame ---------- */
  const grid = $('.nights__grid');
  if (grid) {
    const centre = $('.nights__tile--center');
    const outer = $$('.nights__tile:not(.nights__tile--center)');
    const coverScale = () => Math.max(window.innerWidth / centre.offsetWidth, window.innerHeight / centre.offsetHeight) * 1.02;
    $$('.nights__tile').forEach((tile, i) => {
      gsap.from(tile, {
        clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', delay: (i % 3) * 0.08 + Math.floor(i / 3) * 0.08,
        scrollTrigger: { trigger: '.nights', start: 'top 75%', once: true },
      });
    });
    gsap.timeline({
      scrollTrigger: {
        trigger: '.nights__stage', start: 'top top', end: '+=220%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    })
      .to(grid, { scale: coverScale, ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo(centre.querySelector('img'), { scale: 1.15 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .to(centre, { borderRadius: 0, duration: 0.6 }, 0.4)
      .to(outer, { opacity: 0, duration: 0.5, stagger: { each: 0.03, from: 'center' } }, 0.25)
      .to('.nights__overlay', { opacity: 1, duration: 0.3 }, 0.85)
      .from('.nights__overlay > *', { y: 40, opacity: 0, stagger: 0.08, duration: 0.35 }, 0.85)
      .set('.nights__overlay', { pointerEvents: 'auto' }, 1.2)
      .to({}, { duration: 0.35 });
  }

  /* ---------- Footer: letters rise into place ---------- */
  if ($('.footer__big')) {
    const footSplit = SplitText.create('.footer__big', { type: 'chars', charsClass: 'char' });
    gsap.from(footSplit.chars, {
      yPercent: 100, opacity: 0, ease: 'none', stagger: 0.05,
      scrollTrigger: { trigger: '.footer__big', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }

  /* ---------- Visit: slow zoom-out ---------- */
  if ($('.visit__media img')) {
    gsap.fromTo('.visit__media img', { scale: 1.2 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
}

/* ---------- C.E.L.A.: image reveal list ----------
   Desktop: a floating arch follows the cursor and swaps photos on hover.
   Touch: a sticky arch beside the list swaps photos as each row crosses the middle of the screen. */
const services = $$('.service');
if (services.length) {
  services.forEach((item) => { const img = new Image(); img.src = item.dataset.img; });

  // Same breakpoint as the CSS that shows the sticky arch.
  const stickyMode = window.matchMedia('(max-width: 960px), (hover: none)').matches;
  if (!stickyMode && !reduceMotion) {
    const float = $('.float-img');
    const inner = $('.float-img__inner');
    const xTo = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(float, 'y', { duration: 0.7, ease: 'power3' });
    const rTo = gsap.quickTo(float, 'rotation', { duration: 0.9, ease: 'power3' });
    let lastX = 0;
    const list = $('.services');
    list.addEventListener('pointermove', (e) => {
      xTo(e.clientX - float.offsetWidth / 2);
      yTo(e.clientY - float.offsetHeight / 2);
      rTo(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.5));
      lastX = e.clientX;
    });
    services.forEach((item) => {
      item.addEventListener('pointerenter', () => {
        inner.style.backgroundImage = `url(${item.dataset.img})`;
        gsap.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 0.9, ease: 'expo.out' });
        gsap.to(float, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
      });
    });
    list.addEventListener('pointerleave', () => gsap.to(float, { opacity: 0, scale: 0.6, duration: 0.5, ease: 'expo.out' }));
  } else {
    const frame = $('.services__frame');
    const slides = services.map((item, i) => {
      const slide = document.createElement('div');
      slide.className = 'services__slide';
      slide.style.backgroundImage = `url(${item.dataset.img})`;
      if (i === 0) slide.classList.add('is-active');
      frame.append(slide);
      return slide;
    });
    const activate = (i) => {
      services.forEach((s, j) => s.classList.toggle('is-active', i === j));
      slides.forEach((s, j) => s.classList.toggle('is-active', i === j));
    };
    activate(0);
    services.forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => { if (self.isActive) activate(i); },
      });
    });
  }
}

initSpirit(lang);

window.addEventListener('load', () => { smartFit(); ScrollTrigger.refresh(); });
if (location.hash) window.addEventListener('load', () => setTimeout(() => scrollToHash(location.hash), 300));
