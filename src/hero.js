// Home hero: the film plays through the letters of ALHAMBRA, cut out of a sheet of paper.
// On scroll the camera flies into the stem of the "H" (the paper zooms in) while the film
// pulls back (zooms out), until the film fills the screen and the headline arrives.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const NS = 'http://www.w3.org/2000/svg';
const FONT_WEIGHT = 700;
const CAP = 0.63; // cap height of Cormorant Garamond, in em
const STEP = 0.84; // line step for stacked letters, in em

export function createHero({ reduceMotion }) {
  const hero = document.querySelector('.hero');
  if (!hero) return null;
  const svg = hero.querySelector('.hero__paper');
  const text = hero.querySelector('.hero__letters');
  const nav = document.querySelector('.nav');

  /* Fit the letters to the screen: one line when wide, three stacked lines on phones. */
  function layout() {
    const W = svg.clientWidth;
    const H = svg.clientHeight;
    if (!W || !H) return;
    const portrait = W / H < 0.85;
    const lines = portrait ? ['AL', 'HAM', 'BRA'] : ['ALHAMBRA'];

    text.textContent = '';
    text.setAttribute('font-size', 100);
    text.setAttribute('text-anchor', 'middle');
    const spans = lines.map((line) => {
      const t = document.createElementNS(NS, 'tspan');
      t.textContent = line;
      text.append(t);
      return t;
    });
    const widest = Math.max(...spans.map((s) => s.getComputedTextLength()));
    const blockOf = (fs) => ((lines.length - 1) * STEP + CAP) * fs;
    let fs = (100 * W * (portrait ? 0.88 : 0.92)) / widest;
    fs = Math.min(fs, (H * (portrait ? 0.6 : 0.52)) / ((lines.length - 1) * STEP + CAP));
    text.setAttribute('font-size', fs.toFixed(2));

    const firstBaseline = H * 0.5 - blockOf(fs) / 2 + CAP * fs;
    spans.forEach((s, i) => {
      s.setAttribute('x', (W / 2).toFixed(1));
      s.setAttribute('y', (firstBaseline + i * STEP * fs).toFixed(1));
    });

    // Fly into the left stem of the H.
    const lineIndex = portrait ? 1 : 0;
    const charIndex = portrait ? 0 : 2;
    const charStart = spans[lineIndex].getExtentOfChar(charIndex).x;
    const origin = findStem(lines[lineIndex][charIndex], charStart, fs, W / 2, firstBaseline + lineIndex * STEP * fs);
    gsap.set(svg, { transformOrigin: `${origin.x}px ${origin.y}px` });
  }

  /* Draw the letter on a canvas and find the middle of its widest vertical stroke. */
  function findStem(char, charStart, fs, centerX, baseline) {
    const fallback = { x: centerX, y: baseline - CAP * fs * 0.5 };
    try {
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      ctx.font = `${FONT_WEIGHT} ${fs}px "Cormorant Garamond"`;
      const charW = Math.ceil(ctx.measureText(char).width) + 4;
      const charH = Math.ceil(fs);
      ctx.canvas.width = charW;
      ctx.canvas.height = charH;
      ctx.font = `${FONT_WEIGHT} ${fs}px "Cormorant Garamond"`;
      ctx.fillStyle = '#000';
      ctx.fillText(char, 2, charH * 0.85);
      const rowY = Math.round(charH * 0.85 - CAP * fs * 0.72); // above the crossbar
      const row = ctx.getImageData(0, rowY, charW, 1).data;
      let best = { start: 0, len: 0 };
      let run = null;
      for (let x = 0; x <= charW; x++) {
        const inside = x < charW && row[x * 4 + 3] > 160;
        if (inside && !run) run = { start: x, len: 0 };
        if (inside) run.len++;
        if (!inside && run) { if (run.len > best.len) best = run; run = null; }
      }
      if (!best.len) return fallback;
      return { x: charStart - 2 + best.start + best.len / 2, y: baseline - CAP * fs * 0.72 };
    } catch {
      return fallback;
    }
  }

  layout();
  document.fonts?.load(`${FONT_WEIGHT} 100px "Cormorant Garamond"`).then(() => { layout(); ScrollTrigger.refresh(); });

  if (reduceMotion) return { intro: () => {} };

  nav?.classList.add('is-light');
  ScrollTrigger.addEventListener('refreshInit', layout);

  /* Scroll: zoom into the letter, zoom out of the film. */
  gsap.timeline({
    scrollTrigger: {
      trigger: hero, start: 'top top', end: '+=190%', scrub: 1, pin: true, anticipatePin: 1,
      onUpdate: (self) => nav?.classList.toggle('is-light', self.progress < 0.42),
    },
  })
    .to('.hero__frame', { opacity: 0, y: -20, duration: 0.18, ease: 'none' }, 0)
    .to(svg, { scale: 90, duration: 1, ease: 'power3.in' }, 0)
    .to('.hero__sheet', { opacity: 0, duration: 0.18, ease: 'none' }, 0.82)
    .fromTo('.hero__video', { scale: 1.32 }, { scale: 1, duration: 1.15, ease: 'power2.out' }, 0)
    .to('.hero__veil', { opacity: 1, duration: 0.3, ease: 'none' }, 0.78)
    .fromTo('.hero__copy', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.95)
    .fromTo('.hero__copy .hero__title', { letterSpacing: '0.04em' }, { letterSpacing: '-0.02em', duration: 0.4, ease: 'power2.out' }, 0.95)
    .to({}, { duration: 0.4 });

  /* Intro after the loader: the letters ink in and settle, the film eases back. */
  const intro = () => {
    const W = svg.clientWidth;
    const H = svg.clientHeight;
    return gsap.timeline({ defaults: { ease: 'expo.out' } })
      .fromTo(text, { attr: { 'fill-opacity': 0 } }, { attr: { 'fill-opacity': 1 }, duration: 1.6, ease: 'power2.inOut' })
      .fromTo(text, { scale: 1.12, svgOrigin: `${W / 2} ${H / 2}` }, { scale: 1, svgOrigin: `${W / 2} ${H / 2}`, duration: 2.4 }, 0)
      .fromTo('.hero__film', { scale: 1.25 }, { scale: 1, duration: 2.8 }, 0)
      .from('.hero__frame > *', { y: 16, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.6)
      .from('.nav', { opacity: 0, duration: 1.2 }, 0.8);
  };
  return { intro };
}
