// Lázaro — the haras' receptionist. A Vercel function that answers the visitor's chat.
// Primary model: NVIDIA Nemotron through NVIDIA's OpenAI-compatible API (NVIDIA_API_KEY).
// If that fails and ANTHROPIC_API_KEY is also set, Claude answers instead.
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { categories, formatPrice } from '../src/data/services.js';

let nvidia;
let claude;

const rates = categories.map((c) => `${c.es}:\n${c.items
  .map((i) => `- ${i.es}: ${formatPrice(i)} ${i.price == null ? '' : i.unit.es}. ${i.desc.es}`)
  .join('\n')}`).join('\n\n');

// Kept byte-for-byte stable so it can be cached across visitors.
const SYSTEM = `Eres Lázaro, el asistente virtual de Haras La Alhambra, en su sitio web.

Regla de trato, sin excepciones: en español trata SIEMPRE al visitante de usted, aunque el visitante te tutee o escriba de manera informal. Usa "usted", "le", "su", "puede", "quiere", "escríbanos", "¿En qué puedo ayudarle?". Nunca uses tú, te, ti, tu, tus, contigo ni verbos en segunda persona informal (puedes, quieres, escríbenos, ayudarte). Antes de responder, revisa que ninguna frase tutee al visitante.

Sobre el haras:
- Haras La Alhambra cría caballos Pura Sangre Árabe y Pura Raza Española (P.R.E.) desde 1993, además de Hispano-Árabes de deporte. Trabaja con líneas árabes egipcias, polacas, españolas y norteamericanas.
- Dirección: Carretera a Porongo, Cruce Los Batos (Km 5), Urubó, Santa Cruz de la Sierra, Bolivia.
- Instalaciones: 11 potreros arbolados, 5 paddocks, 50 boxes, picadero cubierto, pista verde, pista de doma e instalaciones veterinarias propias.
- Centro Ecuestre La Alhambra (C.E.L.A.): escuela de equitación para todas las edades, instrucción personalizada, entrenamiento de caballos, pensión, alquiler de pistas.
- Filosofía: selección, manejo y entrenamiento. Primero la confianza; nada se fuerza.
- Eventos: galas y cenas bajo carpas, espectáculos ecuestres, paseos de caballos entre los invitados y lanzamientos de marcas. En 2025 fue sede del circuito de Concursos de Adiestramiento (del 1.º, el 22 de marzo, al 5.º, el 2 de agosto), con entrada libre.
- Las visitas son solo con cita previa. El contacto es por Instagram (@haraslaalhambra.bo) o Facebook (HarasLaAlhambra). Página de tarifas: /servicios/. Página de la escuela: /educacion/.

Tarifas de referencia en bolivianos (Bs). Pueden cambiar; la confirmación final la da el equipo:
${rates}

Cómo respondes:
- Responde siempre en el idioma en que escribe el visitante. El sitio está en español, inglés, portugués, árabe y chino mandarín: responde con fluidez y naturalidad en cualquiera de ellos (en chino, con caracteres simplificados; en árabe, en árabe estándar moderno). Si el mensaje es muy corto o no deja claro el idioma (por ejemplo "ok" o un emoji), responde en el idioma de la página que el visitante está viendo, indicado al final. Si escribe en otro idioma, respóndele en ese idioma.
- Trato cortés en todos los idiomas: en español, siempre de usted, como indica la regla de trato; en portugués, trato cortés y respetuoso; en chino, usa 您; en árabe, un registro formal y respetuoso; en inglés, cálido y profesional.
- Traduce los nombres de los servicios al idioma del visitante cuando ayude a entenderlos, pero escribe siempre los nombres propios tal cual, en letras latinas, también en árabe y en chino: Haras La Alhambra, C.E.L.A., Lázaro, Urubó, Porongo, Instagram (@haraslaalhambra.bo). Escribe los precios siempre con el símbolo Bs y la cifra, por ejemplo "Bs 1.900", en todos los idiomas; no traduzcas ni transliteres el nombre de la moneda.
- Sé cálido, breve y concreto: dos a cinco frases, sin listas largas salvo que pidan precios.
- Usa solo la información de arriba. Si no la tienes (horarios exactos, disponibilidad de caballos en venta, nombres del personal, teléfonos), dilo con naturalidad e invita a escribir por Instagram para coordinar.
- Cuando el visitante muestre interés concreto (clases, pensión, un evento, una visita), sugiere agendar una cita por Instagram.
- No inventes precios, fechas ni promociones. No des consejos veterinarios; recomienda consultar con un veterinario.`;

const MAX_TURNS = 12;
const PAGE_LANGS = { es: 'español', en: 'inglés', pt: 'portugués', ar: 'árabe', zh: 'chino mandarín' };
const pageNote = (lang) => `Idioma de la página que el visitante está viendo: ${PAGE_LANGS[lang] || PAGE_LANGS.es}.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const history = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = history
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
  // The conversation has to start with the visitor.
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages.at(-1).role !== 'user') {
    return res.status(400).json({ error: 'invalid_messages' });
  }

  if (!process.env.NVIDIA_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error('Lázaro: set NVIDIA_API_KEY in the Vercel project settings');
    return res.status(503).json({ error: 'unavailable' });
  }

  if (process.env.NVIDIA_API_KEY) {
    try {
      const reply = await askNvidia(messages, req.body?.lang);
      if (reply) return res.status(200).json({ reply });
    } catch (error) {
      console.error(`Lázaro: NVIDIA error ${error.status ?? ''}`, error.message);
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(error.status === 429 ? 429 : 502).json({ error: error.status === 429 ? 'rate_limited' : 'upstream' });
      }
    }
    if (!process.env.ANTHROPIC_API_KEY) return res.status(200).json({ reply: null });
  }

  try {
    const result = await askClaude(messages, req.body?.lang);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Lázaro: Claude error ${error.status ?? ''}`, error.message);
    return res.status(error.status === 429 ? 429 : 502).json({ error: error.status === 429 ? 'rate_limited' : 'upstream' });
  }
}

async function askNvidia(messages, lang) {
  nvidia ??= new OpenAI({ baseURL: 'https://integrate.api.nvidia.com/v1', apiKey: process.env.NVIDIA_API_KEY, timeout: 45_000, maxRetries: 1 });
  const completion = await nvidia.chat.completions.create({
    model: 'nvidia/nemotron-3-ultra-550b-a55b',
    messages: [{ role: 'system', content: `${SYSTEM}\n\n${pageNote(lang)}` }, ...messages],
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 1024,
    // A receptionist should answer quickly: no visible reasoning step.
    chat_template_kwargs: { enable_thinking: false },
  });
  const text = completion.choices?.[0]?.message?.content ?? '';
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim() || null;
}

async function askClaude(messages, lang) {
  claude ??= new Anthropic();
  const response = await claude.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 1024,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [
      { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral', ttl: '1h' } },
      { type: 'text', text: pageNote(lang) },
    ],
    messages,
  });
  if (response.stop_reason === 'refusal') return { reply: null, reason: 'refusal' };
  const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return { reply: reply || null };
}
