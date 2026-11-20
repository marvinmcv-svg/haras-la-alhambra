// Renders the four service pillars on /servicios/ from src/data/services.js:
// a full-width photo band per pillar, then its offerings as floating cards.
import { categories } from './data/services.js';
import { UI } from './ui-strings.js';
import { pick, langInfo } from './i18n.js';

const INSTAGRAM = 'https://www.instagram.com/haraslaalhambra.bo/';

export function initPricing(lang) {
  const root = document.querySelector('[data-pricing]');
  if (!root) return;
  const amount = (item) => {
    if (item.price == null) return pick(UI.onRequest);
    const n = item.price.toLocaleString(langInfo(lang).number);
    return `${item.from ? `<small>${pick(UI.from)}</small>` : ''}Bs ${n}`;
  };

  const nav = `<nav class="pillar-nav" aria-label="${pick(UI.services)}">
    ${categories.map((cat) => `<a href="#${cat.id}">${pick(cat)}</a>`).join('')}
  </nav>`;

  root.innerHTML = nav + categories.map((cat, ci) => `
    <section class="svc" id="${cat.id}" aria-labelledby="svc-${cat.id}">
      <div class="svc__band media" data-label="${cat.id}">
        <img src="${cat.image}" alt="" loading="lazy" data-zoom style="--pos: ${cat.pos}" />
        <header class="svc__head">
          <span class="svc__num" aria-hidden="true">0${ci + 1}</span>
          <h2 class="svc__title" id="svc-${cat.id}" data-split>${pick(cat)}</h2>
          <p class="svc__intro" data-fade>${pick(cat.intro)}</p>
        </header>
      </div>
      <ul class="svc__cards">
        ${cat.items.map((item) => `
          <li class="svc-card${item.featured ? ' svc-card--featured' : ''}">
            ${item.featured ? `<span class="svc-card__flag">${pick(UI.mostChosen)}</span>` : ''}
            <h3 class="svc-card__title">${pick(item)}</h3>
            <p class="svc-card__desc">${pick(item.desc)}</p>
            <div class="svc-card__price">
              <p class="svc-card__amount">${amount(item)}</p>
              <p class="svc-card__unit">${item.price == null ? pick(UI.tailored) : pick(item.unit)}</p>
            </div>
            <a class="svc-card__cta" href="${INSTAGRAM}" target="_blank" rel="noopener"><span>${pick(UI.askAbout)}</span> <i>→</i></a>
          </li>`).join('')}
      </ul>
    </section>`).join('');

  // Highlight the pillar in view.
  const links = [...root.querySelectorAll('.pillar-nav a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.hash === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  root.querySelectorAll('.svc').forEach((s) => io.observe(s));
}
