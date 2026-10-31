// Renders the four service pillars on /servicios/ from src/data/services.js:
// a full-width photo band per pillar, then its offerings as floating cards.
import { categories } from './data/services.js';

const INSTAGRAM = 'https://www.instagram.com/haraslaalhambra.bo/';

export function initPricing(lang) {
  const root = document.querySelector('[data-pricing]');
  if (!root) return;
  const en = lang === 'en';
  const amount = (item) => {
    if (item.price == null) return en ? 'On request' : 'A cotizar';
    const n = item.price.toLocaleString(en ? 'en-US' : 'es-BO');
    return `${item.from ? `<small>${en ? 'From' : 'Desde'}</small>` : ''}Bs ${n}`;
  };

  const nav = `<nav class="pillar-nav" aria-label="${en ? 'Services' : 'Servicios'}">
    ${categories.map((cat) => `<a href="#${cat.id}">${cat[lang]}</a>`).join('')}
  </nav>`;

  root.innerHTML = nav + categories.map((cat, ci) => `
    <section class="svc" id="${cat.id}" aria-labelledby="svc-${cat.id}">
      <div class="svc__band media" data-label="${cat.id}">
        <img src="${cat.image}" alt="" loading="lazy" data-zoom style="--pos: ${cat.pos}" />
        <header class="svc__head">
          <span class="svc__num" aria-hidden="true">0${ci + 1}</span>
          <h2 class="svc__title" id="svc-${cat.id}" data-split>${cat[lang]}</h2>
          <p class="svc__intro" data-fade>${cat.intro[lang]}</p>
        </header>
      </div>
      <ul class="svc__cards">
        ${cat.items.map((item) => `
          <li class="svc-card${item.featured ? ' svc-card--featured' : ''}">
            ${item.featured ? `<span class="svc-card__flag">${en ? 'Most chosen' : 'El más elegido'}</span>` : ''}
            <h3 class="svc-card__title">${item[lang]}</h3>
            <p class="svc-card__desc">${item.desc[lang]}</p>
            <div class="svc-card__price">
              <p class="svc-card__amount">${amount(item)}</p>
              <p class="svc-card__unit">${item.price == null ? (en ? 'Tailored proposal' : 'Propuesta a medida') : item.unit[lang]}</p>
            </div>
            <a class="svc-card__cta" href="${INSTAGRAM}" target="_blank" rel="noopener"><span>${en ? 'Ask about it' : 'Consultar'}</span> <i>→</i></a>
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
