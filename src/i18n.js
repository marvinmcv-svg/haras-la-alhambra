// Spanish is written in the HTML. English sits next to it on the same element:
// data-en (inner HTML), data-en-placeholder, data-en-alt, data-en-aria-label.
// Portuguese, Arabic and Chinese are looked up by that English text in src/locales/*.json,
// which `npm run translate` fills in for any new or changed copy.
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';

export const LANGS = [
  { code: 'es', short: 'ES', name: 'Español', number: 'es-BO' },
  { code: 'en', short: 'EN', name: 'English', number: 'en-US' },
  { code: 'pt', short: 'PT', name: 'Português', number: 'pt-BR' },
  { code: 'ar', short: 'ع', name: 'العربية', number: 'en-US', rtl: true },
  { code: 'zh', short: '中', name: '中文', number: 'zh-CN' },
];
const DICTS = { pt, ar, zh };
const KEY = 'hla-lang';
let current = 'es';

export const langInfo = (code = current) => LANGS.find((l) => l.code === code) || LANGS[0];

export function getLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.some((l) => l.code === q)) return q;
    const saved = localStorage.getItem(KEY);
    return LANGS.some((l) => l.code === saved) ? saved : 'es';
  } catch {
    return 'es';
  }
}

export function setLang(lang) {
  try { localStorage.setItem(KEY, lang); } catch {}
}

// English source text → current language (Spanish callers pass their own text through pick()).
export const tr = (en) => (current === 'en' || current === 'es' ? en : DICTS[current]?.[en] ?? en);

// Pick the current language from an { es, en } pair.
export const pick = (o) => (current === 'es' ? o.es : tr(o.en));

export function applyLang(lang, root = document) {
  current = lang;
  const html = document.documentElement;
  html.lang = lang === 'zh' ? 'zh-Hans' : lang;
  html.dataset.lang = lang;
  root.querySelectorAll('[data-set-lang]').forEach((el) => {
    const on = el.dataset.setLang === lang;
    el.classList.toggle('is-active', on);
    el.setAttribute('aria-current', on ? 'true' : 'false');
  });
  root.querySelectorAll('.lang__current b').forEach((el) => { el.textContent = langInfo(lang).short; });
  if (lang === 'es') return;
  root.querySelectorAll('[data-en]').forEach((el) => { el.innerHTML = tr(el.dataset.en); });
  for (const attr of ['placeholder', 'alt', 'aria-label']) {
    root.querySelectorAll(`[data-en-${attr}]`).forEach((el) => el.setAttribute(attr, tr(el.getAttribute(`data-en-${attr}`))));
  }
}
