// Spanish is written in the HTML. English sits next to it on the same element:
// data-en (inner HTML), data-en-placeholder, data-en-alt, data-en-aria-label.

const KEY = 'hla-lang';

export function getLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'es') return q;
    return localStorage.getItem(KEY) || 'es';
  } catch {
    return 'es';
  }
}

export function setLang(lang) {
  try { localStorage.setItem(KEY, lang); } catch {}
}

export function applyLang(lang, root = document) {
  document.documentElement.lang = lang;
  root.querySelectorAll('[data-lang]').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.lang === lang);
  });
  if (lang !== 'en') return;
  root.querySelectorAll('[data-en]').forEach((el) => { el.innerHTML = el.dataset.en; });
  for (const attr of ['placeholder', 'alt', 'aria-label']) {
    root.querySelectorAll(`[data-en-${attr}]`).forEach((el) => el.setAttribute(attr, el.getAttribute(`data-en-${attr}`)));
  }
}
