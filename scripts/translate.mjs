// Fills src/locales/{pt,ar,zh}.json with translations of every English text on the site.
// Run after editing copy:  NVIDIA_API_KEY=... npm run translate
// Only new or changed texts are sent; existing translations are kept, removed texts are dropped.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import OpenAI from 'openai';
import { categories } from '../src/data/services.js';
import { UI } from '../src/ui-strings.js';

const root = resolve(import.meta.dirname, '..');
const LANGS = {
  pt: 'Brazilian Portuguese',
  ar: 'Modern Standard Arabic',
  zh: 'Simplified Chinese (Mandarin)',
};
const BATCH = 30;

/* ---------- Collect the English source texts, in page order ---------- */
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const htmlFiles = [
  'index.html',
  ...readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !['node_modules', 'dist', 'public', 'src', 'api', 'scripts', 'docs'].includes(d.name) && existsSync(resolve(root, d.name, 'index.html')))
    .map((d) => `${d.name}/index.html`),
  ...readdirSync(resolve(root, 'src/partials')).map((f) => `src/partials/${f}`),
];
const source = new Set();
for (const file of htmlFiles) {
  const html = readFileSync(resolve(root, file), 'utf8');
  for (const m of html.matchAll(/data-en(?:-[a-z-]+)?="([^"]*)"/g)) source.add(decode(m[1]));
}
for (const cat of categories) {
  source.add(cat.en);
  source.add(cat.intro.en);
  for (const item of cat.items) {
    source.add(item.en);
    source.add(item.unit.en);
    source.add(item.desc.en);
  }
}
for (const entry of Object.values(UI)) source.add(entry.en);
const texts = [...source].filter((t) => t.trim());

/* ---------- Translate what is missing ---------- */
const client = new OpenAI({ baseURL: 'https://integrate.api.nvidia.com/v1', apiKey: process.env.NVIDIA_API_KEY, timeout: 180_000, maxRetries: 2 });

const system = (language) => `You translate the website of Haras La Alhambra, a prestigious horse-breeding estate and equestrian center in Santa Cruz de la Sierra, Bolivia (Purebred Arabian and Pura Raza Española horses, riding school, boarding, gala nights). Translate each English text into ${language}.

Rules:
- Elegant, natural, premium tone, as a native copywriter would write it for a luxury equestrian brand. Address the reader politely.
- Keep every HTML tag and entity exactly as it is (for example <br />, <em>…</em>, <i>✦</i>, <b>…</b>, <a href="…">…</a>, &amp;); translate only the text between tags.
- Keep these names unchanged: Haras La Alhambra, La Alhambra, C.E.L.A., P.R.E., Lázaro, Urubó, Porongo, Cruce Los Batos, Santa Cruz de la Sierra, Instagram, Pony Club. Keep prices exactly as written, with the "Bs" symbol and Western digits (for example "Bs 1,900"); never translate or spell out the currency and never convert digits to another numeral system.
- Use the established name of each horse breed and equestrian term in ${language}.
- Short labels stay short; do not add explanations.

Reply with only a JSON object that maps each input number to its translation, e.g. {"1": "...", "2": "..."}.`;

const tags = (s) => (s.match(/<[^>]+>|&[a-z]+;/g) || []).map((t) => t.replace(/href="[^"]*"/, 'href')).sort().join('|');

async function translateBatch(lang, batch) {
  const input = Object.fromEntries(batch.map((t, i) => [String(i + 1), t]));
  const completion = await client.chat.completions.create({
    model: 'nvidia/nemotron-3-ultra-550b-a55b',
    messages: [
      { role: 'system', content: system(LANGS[lang]) },
      { role: 'user', content: JSON.stringify(input, null, 1) },
    ],
    temperature: 0.2,
    max_tokens: 12000,
    chat_template_kwargs: { enable_thinking: false },
  });
  const raw = completion.choices?.[0]?.message?.content ?? '';
  const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
  const out = {};
  batch.forEach((t, i) => {
    const v = json[String(i + 1)];
    if (typeof v === 'string' && v.trim() && tags(v) === tags(t)) out[t] = v.trim();
  });
  return out;
}

async function run(lang) {
  const file = resolve(root, `src/locales/${lang}.json`);
  const existing = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const missing = texts.filter((t) => !existing[t]);
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    try {
      Object.assign(existing, await translateBatch(lang, batch));
    } catch (error) {
      console.error(`${lang}: batch ${i / BATCH + 1} failed (${error.message}); retrying in halves`);
      for (const half of [batch.slice(0, BATCH / 2), batch.slice(BATCH / 2)]) {
        try { Object.assign(existing, await translateBatch(lang, half)); } catch (e) { console.error(`${lang}: ${e.message}`); }
      }
    }
    console.log(`${lang}: ${Math.min(i + BATCH, missing.length)}/${missing.length}`);
  }
  const ordered = Object.fromEntries(texts.filter((t) => existing[t]).map((t) => [t, existing[t]]));
  writeFileSync(file, JSON.stringify(ordered, null, 1) + '\n');
  const left = texts.filter((t) => !ordered[t]);
  console.log(`${lang}: ${Object.keys(ordered).length}/${texts.length} translated${left.length ? `; still missing: ${left.length} (shown in English)` : ''}`);
}

if (!process.env.NVIDIA_API_KEY) {
  console.error('Set NVIDIA_API_KEY to run the translator.');
  process.exit(1);
}
mkdirSync(resolve(root, 'src/locales'), { recursive: true });
console.log(`${texts.length} texts to cover`);
await Promise.all(Object.keys(LANGS).map(run));
