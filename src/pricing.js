// Renders the rate cards on /servicios/ from src/data/services.js.
import { categories, formatPrice } from './data/services.js';

export function initPricing(lang) {
  const root = document.querySelector('[data-pricing]');
  if (!root) return;
  root.innerHTML = categories.map((cat, ci) => `
    <section class="rates" id="${cat.id}" aria-labelledby="rates-${cat.id}">
      <header class="rates__head">
        <span class="rates__num">0${ci + 1}</span>
        <h2 class="h2" id="rates-${cat.id}" data-split>${cat[lang]}</h2>
      </header>
      <ul class="rates__grid tilt-group">
        ${cat.items.map((item) => `
          <li class="rate tilt${item.featured ? ' rate--featured' : ''}">
            <div class="rate__inner">
              ${item.featured ? `<span class="rate__flag">${lang === 'en' ? 'Most chosen' : 'El más elegido'}</span>` : ''}
              <h3 class="rate__title">${item[lang]}</h3>
              <p class="rate__desc">${item.desc[lang]}</p>
              <p class="rate__price">${formatPrice(item, lang)}</p>
              <p class="rate__unit">${item.price == null ? (lang === 'en' ? 'Tailored proposal' : 'Propuesta a medida') : item.unit[lang]}</p>
              <i class="pillar__glare"></i>
            </div>
          </li>`).join('')}
      </ul>
    </section>`).join('');
}
