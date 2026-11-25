// Lázaro: the chat widget. Talks to /api/spirit; if that is unreachable (local dev, no API key),
// it answers the most common questions from the rates file so the visitor is never left hanging.
import { categories } from './data/services.js';
import { UI } from './ui-strings.js';
import { pick, langInfo } from './i18n.js';

const STORE = 'hla-spirit';

const price = (item) => {
  if (item.price == null) return pick(UI.onRequest);
  if (item.price === 0) return pick(UI.free);
  return `${item.from ? pick(UI.from) + ' ' : ''}Bs ${item.price.toLocaleString(langInfo().number)}`;
};

// Offline answers, matched by keyword in any of the five languages.
function localAnswer(q) {
  const t = q.toLowerCase();
  const list = (id) => categories.find((c) => c.id === id).items
    .map((i) => `${pick(i)}: ${price(i)}${i.price == null ? '' : ' ' + pick(i.unit)}`).join('<br />');
  if (/clase|lesson|escuela|school|pony|aprender|learn|curso|camp|aula|escola|aprender|课|学|درس|دروس|تعلم|مدرسة/.test(t)) {
    return `${pick(UI.chatSchool)}<br />${list('educacion')}<br />${pick(UI.chatSchoolMore)}`;
  }
  if (/pensi|board|box|establo|stable|entren|train|potro|hospedagem|treino|寄养|马厩|训练|إقامة|إسطبل|تدريب/.test(t)) {
    return `${pick(UI.chatHorse)}<br />${list('caballos')}`;
  }
  if (/event|gala|cena|dinner|boda|wedding|fiesta|party|show|espect|casamento|festa|jantar|活动|婚礼|晚宴|حفل|زفاف|عشاء|مناسبة/.test(t)) {
    return `${pick(UI.chatEvents)}<br />${list('experiencias')}<br />${pick(UI.chatEventsMore)}`;
  }
  if (/visit|cita|appoint|dónde|donde|where|llegar|direc|ubica|locat|onde|chegar|endereço|参观|地址|在哪|زيارة|عنوان|أين|موقع/.test(t)) {
    return pick(UI.chatVisit);
  }
  if (/precio|tarifa|cuesta|cost|price|rate|preço|valor|quanto|价格|多少钱|费用|سعر|أسعار|تكلفة/.test(t)) {
    return pick(UI.chatRates);
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
    root.classList.add('is-thinking');
    const typing = bubble(`<span class="spirit__dots" aria-label="${pick(UI.chatTyping)}"><i></i><i></i><i></i></span>`, 'bot');
    let reply = null;
    let html = null;
    try {
      const res = await fetch('/api/spirit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, lang }),
      });
      const data = res.ok ? await res.json() : null;
      if (data?.reply) reply = data.reply;
      else if (data?.reason === 'refusal') html = pick(UI.chatRefusal);
    } catch {}
    if (!reply && !html) html = localAnswer(q) || pick(UI.chatError);
    root.classList.remove('is-thinking');
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
