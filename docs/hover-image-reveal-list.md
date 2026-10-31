# Hover Image Reveal List

**What it's called:** a *Hover Image Reveal List*. You'll also see it called a *cursor-follow image reveal*, a *floating image hover list* or an *image-trail menu*. It is the numbered 01–06 list in the Centro Ecuestre chapter of Haras La Alhambra.

**What it does:**

- **Desktop (mouse):** a list of large, numbered rows. When you hover a row, a framed photo appears and floats after the cursor with a slight lag. It tilts in the direction you move and swaps to that row's photo with a quick zoom-out. When you leave the list, the photo shrinks away.
- **Phones and tablets (touch):** there is no hover, so the photo becomes a sticky frame beside the list. As you scroll, whichever row crosses the middle of the screen becomes active: its title turns italic and gold, and the frame crossfades to its photo.

---

## Prompt to replicate it

Copy everything inside the block into Claude (or another coding assistant) and change the bracketed parts:

```text
Build a "Hover Image Reveal List" section for my website using HTML, CSS and vanilla JavaScript with GSAP 3 (and its ScrollTrigger plugin).

Content: a list of [6] items. Each item has a two-digit number (01, 02, …), a title, a one-line description and an image URL stored in a data-img attribute. Items: [list your items: title — description — image path].

Layout (desktop, wider than 960px and with a mouse):
- A full-width list with a thin top border; each row is a 4-column grid: number (80px) | title (large serif) | description (small, muted) | arrow (40px).
- Rows have generous vertical padding and a thin bottom border.
- On row hover: a soft gold gradient wipes up behind the row, the title slides 16px to the right and turns italic, the description brightens, and an arrow fades in from the left.

Floating image (desktop):
- One fixed-position element (about 21vw wide, clamped between 240px and 340px, 4:5 aspect ratio, arch-shaped top: border-radius 999px 999px 4px 4px, overflow hidden) with an inner div that holds the photo as a cover background and is inset by -10% so it can scale.
- It starts hidden (opacity 0, scale 0.6) and never captures pointer events.
- Use gsap.quickTo for x, y (0.7s, power3) and rotation (0.9s, power3) so it follows the cursor with a lag. Center it on the cursor, and set rotation from the horizontal mouse speed, clamped to ±10 degrees.
- On entering a row: swap the inner background to that row's image, animate the inner element from scale 1.25 to 1 (0.9s, expo.out) and show the frame (opacity 1, scale 1, 0.6s, expo.out).
- On leaving the whole list: hide it (opacity 0, scale 0.6, 0.5s).
- Preload every image when the page loads so swaps are instant.

Touch / narrow screens (max-width 960px OR hover: none). Use the exact same media query in CSS and JS:
- Lay the section out as a 2-column grid: the list on the left, and on the right (38% width) a position: sticky frame (top: 90px) with the same 4:5 arch shape.
- Inside the frame, stack one absolutely-positioned slide per item (background-image cover). Inactive slides: opacity 0, scale 1.12. Active slide: opacity 1, scale 1, with 0.7s opacity and 1.2s transform transitions.
- Rows become single-column with a min-height of about 34vh so each one has room to take over.
- Create one ScrollTrigger per row (start "top 55%", end "bottom 55%"). When it becomes active, mark that row and its slide as active (title italic and gold).
- Hide the floating image entirely in this mode.

Accessibility and polish:
- Skip the cursor-follow behaviour when prefers-reduced-motion is set.
- The frame and slides are decorative (aria-hidden="true"); the text list stays readable without them.
- Keep the photos cropped to 4:5 so the subject is never cut off inside the arch.

Deliver: the HTML for the section, the CSS, and the JS, ready to paste in. Match my site's colors: background [#0f0d0b], text [#f3ece1], accent [#c9a86e], serif headings [Cormorant Garamond], sans body [Manrope].
```

---

## Reference implementation

This is the code running on Haras La Alhambra, trimmed to the essentials.

### HTML

```html
<div class="services-wrap">
  <ul class="services">
    <li class="service" data-img="/media/cela-escuela.webp">
      <span class="service__num">01</span>
      <h3 class="service__title">Escuela de equitación</h3>
      <p class="service__desc">Para todas las edades. Del primer paso al primer concurso.</p>
      <span class="service__arrow">→</span>
    </li>
    <!-- …one <li> per item… -->
  </ul>
  <div class="services__sticky" aria-hidden="true"><div class="services__frame"></div></div>
</div>
<div class="float-img" aria-hidden="true"><div class="float-img__inner"></div></div>
```

### CSS

```css
.services { list-style: none; border-top: 1px solid rgba(243,236,225,.14); }
.service {
  position: relative; display: grid; grid-template-columns: 80px 1.2fr 1fr 40px; gap: 24px; align-items: center;
  padding: clamp(24px, 3vw, 40px) 0; border-bottom: 1px solid rgba(243,236,225,.14);
}
.service::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, rgba(194,160,103,.08), transparent);
  transform: scaleY(0); transform-origin: bottom; transition: transform .6s cubic-bezier(.22,1,.36,1);
}
.service:hover::before, .service.is-active::before { transform: scaleY(1); }
.service__title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(26px, 3vw, 50px); transition: transform .6s cubic-bezier(.22,1,.36,1); }
.service:hover .service__title { transform: translateX(16px); font-style: italic; }
.service__arrow { opacity: 0; transform: translateX(-10px); transition: all .6s cubic-bezier(.22,1,.36,1); }
.service:hover .service__arrow { opacity: 1; transform: none; }
.services__sticky { display: none; }

.float-img {
  position: fixed; top: 0; left: 0; z-index: 50; pointer-events: none;
  width: clamp(240px, 21vw, 340px); aspect-ratio: 4 / 5;
  border-radius: 999px 999px 4px 4px; overflow: hidden; opacity: 0; transform: scale(.6);
}
.float-img__inner { position: absolute; inset: -10%; background-size: cover; background-position: center; }

@media (max-width: 960px), (hover: none) {
  .services-wrap { display: grid; grid-template-columns: 1fr 38%; gap: 16px; align-items: start; }
  .services__sticky { display: block; position: sticky; top: 90px; }
  .services__frame { position: relative; aspect-ratio: 4 / 5; border-radius: 999px 999px 4px 4px; overflow: hidden; }
  .services__slide { position: absolute; inset: 0; background-size: cover; background-position: center;
    opacity: 0; transform: scale(1.12); transition: opacity .7s cubic-bezier(.22,1,.36,1), transform 1.2s cubic-bezier(.22,1,.36,1); }
  .services__slide.is-active { opacity: 1; transform: scale(1); }
  .service { grid-template-columns: 1fr; gap: 6px; min-height: 34vh; align-content: center; }
  .service__arrow, .float-img { display: none; }
  .service.is-active .service__title { font-style: italic; color: #e3c995; }
}
```

### JavaScript (GSAP 3 + ScrollTrigger)

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const services = [...document.querySelectorAll('.service')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
services.forEach((item) => { new Image().src = item.dataset.img; }); // preload

// Same breakpoint as the CSS that shows the sticky frame.
const stickyMode = matchMedia('(max-width: 960px), (hover: none)').matches;

if (!stickyMode && !reduceMotion) {
  const float = document.querySelector('.float-img');
  const inner = document.querySelector('.float-img__inner');
  const xTo = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'power3' });
  const yTo = gsap.quickTo(float, 'y', { duration: 0.7, ease: 'power3' });
  const rTo = gsap.quickTo(float, 'rotation', { duration: 0.9, ease: 'power3' });
  let lastX = 0;
  const list = document.querySelector('.services');
  list.addEventListener('pointermove', (e) => {
    xTo(e.clientX - float.offsetWidth / 2);
    yTo(e.clientY - float.offsetHeight / 2);
    rTo(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.5));
    lastX = e.clientX;
  });
  services.forEach((item) => item.addEventListener('pointerenter', () => {
    inner.style.backgroundImage = `url(${item.dataset.img})`;
    gsap.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 0.9, ease: 'expo.out' });
    gsap.to(float, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
  }));
  list.addEventListener('pointerleave', () => gsap.to(float, { opacity: 0, scale: 0.6, duration: 0.5, ease: 'expo.out' }));
} else {
  const frame = document.querySelector('.services__frame');
  const slides = services.map((item) => {
    const slide = document.createElement('div');
    slide.className = 'services__slide';
    slide.style.backgroundImage = `url(${item.dataset.img})`;
    frame.append(slide);
    return slide;
  });
  const activate = (i) => {
    services.forEach((s, j) => s.classList.toggle('is-active', i === j));
    slides.forEach((s, j) => s.classList.toggle('is-active', i === j));
  };
  activate(0);
  services.forEach((item, i) => ScrollTrigger.create({
    trigger: item, start: 'top 55%', end: 'bottom 55%',
    onToggle: (self) => { if (self.isActive) activate(i); },
  }));
}
```

### Tips

- Crop the photos to the frame's ratio (4:5 here) before uploading. That way the arch never cuts off the subject.
- Keep the list short (4–8 items). The effect works because each row gets a moment of its own.
- If your site uses a custom cursor, give the list `data-cursor="view"` so the cursor turns into a "View" bubble while the photo follows it.
