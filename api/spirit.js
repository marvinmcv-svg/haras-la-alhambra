// Spirit — the haras' receptionist. A Vercel function that answers the visitor's chat.
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
const SYSTEM = `Eres Spirit, el asistente virtual de Haras La Alhambra, en su sitio web. Tu nombre viene del espíritu del caballo.

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
- Responde en el idioma del visitante (español o inglés). En español, trata al visitante de usted.
- Sé cálido, breve y concreto: dos a cinco frases, sin listas largas salvo que pidan precios.
- Usa solo la información de arriba. Si no la tienes (horarios exactos, disponibilidad de caballos en venta, nombres del personal, teléfonos), dilo con naturalidad e invita a escribir por Instagram para coordinar.
- Cuando el visitante muestre interés concreto (clases, pensión, un evento, una visita), sugiere agendar una cita por Instagram.
- No inventes precios, fechas ni promociones. No des consejos veterinarios; recomienda consultar con un veterinario.`;

const MAX_TURNS = 12;

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
    console.error('Spirit: set NVIDIA_API_KEY in the Vercel project settings');
    return res.status(503).json({ error: 'unavailable' });
  }

  if (process.env.NVIDIA_API_KEY) {
    try {
      const reply = await askNvidia(messages);
      if (reply) return res.status(200).json({ reply });
    } catch (error) {
      console.error(`Spirit: NVIDIA error ${error.status ?? ''}`, error.message);
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(error.status === 429 ? 429 : 502).json({ error: error.status === 429 ? 'rate_limited' : 'upstream' });
      }
    }
    if (!process.env.ANTHROPIC_API_KEY) return res.status(200).json({ reply: null });
  }

  try {
    const result = await askClaude(messages);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Spirit: Claude error ${error.status ?? ''}`, error.message);
    return res.status(error.status === 429 ? 429 : 502).json({ error: error.status === 429 ? 'rate_limited' : 'upstream' });
  }
}

async function askNvidia(messages) {
  nvidia ??= new OpenAI({ baseURL: 'https://integrate.api.nvidia.com/v1', apiKey: process.env.NVIDIA_API_KEY, timeout: 45_000, maxRetries: 1 });
  const completion = await nvidia.chat.completions.create({
    model: 'nvidia/nemotron-3-ultra-550b-a55b',
    messages: [{ role: 'system', content: SYSTEM }, ...messages],
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 1024,
    // A receptionist should answer quickly: no visible reasoning step.
    chat_template_kwargs: { enable_thinking: false },
  });
  const text = completion.choices?.[0]?.message?.content ?? '';
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim() || null;
}

async function askClaude(messages) {
  claude ??= new Anthropic();
  const response = await claude.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 1024,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral', ttl: '1h' } }],
    messages,
  });
  if (response.stop_reason === 'refusal') return { reply: null, reason: 'refusal' };
  const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return { reply: reply || null };
}
