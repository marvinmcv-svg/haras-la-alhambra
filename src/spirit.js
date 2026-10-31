// Spirit: the chat widget. Talks to /api/spirit; if that is unreachable (local dev, no API key),
// it answers the most common questions from the rates file so the visitor is never left hanging.
import { categories, formatPrice } from './data/services.js';

const STORE = 'hla-spirit';
const INSTAGRAM = 'https://www.instagram.com/haraslaalhambra.bo/';

const copy = {
  es: {
    error: 'Ahora mismo no puedo responder. Escríbanos por <a href="' + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a> y el equipo le atenderá.',
    refusal: 'Eso no lo puedo responder, pero el equipo sí: escríbanos por <a href="' + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a>.',
    thinking: 'Spirit está escribiendo',
  },
  en: {
    error: "I can't answer right now. Message us on <a href=\"" + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a> and the team will help you.',
    refusal: "I can't answer that one, but the team can: message us on <a href=\"" + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a>.',
    thinking: 'Spirit is typing',
  },
};

// Offline answers, matched by keyword.
function localAnswer(q, lang) {
  const t = q.toLowerCase();
  const pick = (id) => categories.find((c) => c.id === id);
  const list = (id) => pick(id).items.map((i) => `${i[lang]}: ${formatPrice(i, lang)}${i.price == null ? '' : ' ' + i.unit[lang]}`).join('<br />');
  const es = lang === 'es';
  if (/clase|lesson|escuela|school|pony|aprender|learn|curso|camp/.test(t)) {
    return (es ? 'Estas son las tarifas de referencia de la escuela:<br />' : 'These are the school\'s reference rates:<br />') + list('educacion')
      + (es ? '<br />Más detalles en <a href="/educacion/">Educación</a>.' : '<br />More on the <a href="/educacion/">Education</a> page.');
  }
  if (/pensi|board|box|establo|stable|entren|train|potro/.test(t)) {
    return (es ? 'Para su caballo ofrecemos:<br />' : 'For your horse we offer:<br />') + list('caballos');
  }
  if (/event|gala|cena|dinner|boda|wedding|fiesta|party|show|espect/.test(t)) {
    return (es ? 'Organizamos galas, cenas bajo carpas, espectáculos y paseos de caballos entre los invitados:<br />' : 'We host galas, dinners under canopies, shows and horses walking among guests:<br />')
      + list('experiencias') + (es ? '<br />Vea más en <a href="/noches/">Noches</a>.' : '<br />See more on <a href="/noches/">Nights</a>.');
  }
  if (/visit|cita|appoint|dónde|donde|where|llegar|direc|ubica|locat/.test(t)) {
    return es
      ? 'Estamos en la Carretera a Porongo, Cruce Los Batos (Km 5), Urubó. Las visitas son con cita previa: escríbanos por <a href="' + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a>.'
      : 'We are on the road to Porongo, Cruce Los Batos (Km 5), Urubó. Visits are by appointment: message us on <a href="' + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a>.';
  }
  if (/precio|tarifa|cuesta|cost|price|rate/.test(t)) {
    return es ? 'Todas las tarifas están en <a href="/servicios/">Servicios y tarifas</a>. ¿Le interesa algo en particular?' : 'All rates are on <a href="/servicios/">Services &amp; rates</a>. Anything in particular?';
  }
  return null;
}

const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Light formatting for model replies: **bold**, line breaks and on-site links.
const format = (s) => escape(s)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/(^|\s)(\/[a-z-]+\/)/g, '$1<a href="$2">$2</a>')
  .replace(/\n/g, '<br />');

export function initSpirit(lang) {
  const root = document.querySelector('.spirit');
  if (!root) return;
  const t = copy[lang] || copy.es;
  const toggle = root.querySelector('.spirit__toggle');
  const panel = root.querySelector('.spirit__panel');
  const log = root.querySelector('.spirit__log');
  const form = root.querySelector('.spirit__form');
  const input = form.querySelector('input');
  let history = [];
  let busy = false;

  try { history = JSON.parse(sessionStorage.getItem(STORE) || '[]'); } catch {}
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-20))); } catch {} };

  const bubble = (html, who) => {
    const p = document.createElement('p');
    p.className = `spirit__msg spirit__msg--${who}`;
    p.innerHTML = html;
    log.append(p);
    log.scrollTop = log.scrollHeight;
    return p;
  };
  history.forEach((m) => bubble(m.role === 'user' ? escape(m.content) : format(m.content), m.role === 'user' ? 'user' : 'bot'));

  const setOpen = (open) => {
    root.dataset.state = open ? 'open' : 'closed';
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open) setTimeout(() => input.focus(), 50);
  };
  toggle.addEventListener('click', () => setOpen(root.dataset.state !== 'open'));
  root.querySelector('.spirit__close').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.dataset.state === 'open') setOpen(false); });
  // Let the panel scroll on its own instead of the page (Lenis listens to the wheel globally).
  panel.setAttribute('data-lenis-prevent', '');

  async function ask(q) {
    if (busy || !q.trim()) return;
    busy = true;
    bubble(escape(q), 'user');
    history.push({ role: 'user', content: q });
    save();
    const typing = bubble(`<span class="spirit__dots" aria-label="${t.thinking}"><i></i><i></i><i></i></span>`, 'bot');
    let reply = null;
    let html = null;
    try {
      const res = await fetch('/api/spirit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = res.ok ? await res.json() : null;
      if (data?.reply) reply = data.reply;
      else if (data?.reason === 'refusal') html = t.refusal;
    } catch {}
    if (!reply && !html) html = localAnswer(q, lang) || t.error;
    typing.innerHTML = reply ? format(reply) : html;
    history.push({ role: 'assistant', content: reply || typing.textContent });
    save();
    log.scrollTop = log.scrollHeight;
    busy = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = '';
    ask(q);
  });
  root.querySelectorAll('.spirit__chips button').forEach((chip) => {
    chip.addEventListener('click', () => ask(chip.textContent));
  });
}
