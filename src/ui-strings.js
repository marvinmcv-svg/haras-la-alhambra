// Text that lives in JavaScript rather than in the HTML: rate cards, Lázaro's messages, the cursor.
// Spanish and English are written here; Portuguese, Arabic and Chinese come from src/locales/
// (run `npm run translate` after editing).
const IG = 'href="https://www.instagram.com/haraslaalhambra.bo/" target="_blank" rel="noopener"';

export const UI = {
  view: { es: 'Ver', en: 'View' },
  services: { es: 'Servicios', en: 'Services' },
  mostChosen: { es: 'El más elegido', en: 'Most chosen' },
  onRequest: { es: 'A cotizar', en: 'On request' },
  free: { es: 'Sin costo', en: 'Free of charge' },
  tailored: { es: 'Propuesta a medida', en: 'Tailored proposal' },
  from: { es: 'Desde', en: 'From' },
  askAbout: { es: 'Consultar', en: 'Ask about it' },
  language: { es: 'Idioma', en: 'Language' },

  chatError: {
    es: `Ahora mismo no puedo responder. Escríbanos por <a ${IG}>Instagram</a> y el equipo le atenderá.`,
    en: `I can't answer right now. Message us on <a ${IG}>Instagram</a> and the team will help you.`,
  },
  chatRefusal: {
    es: `Eso no lo puedo responder, pero el equipo sí: escríbanos por <a ${IG}>Instagram</a>.`,
    en: `I can't answer that one, but the team can: message us on <a ${IG}>Instagram</a>.`,
  },
  chatTyping: { es: 'Lázaro está escribiendo', en: 'Lázaro is typing' },
  chatSchool: { es: 'Estas son las tarifas de referencia de la escuela:', en: "These are the school's reference rates:" },
  chatSchoolMore: { es: 'Más detalles en <a href="/educacion/">Educación</a>.', en: 'More on the <a href="/educacion/">Education</a> page.' },
  chatHorse: { es: 'Para su caballo ofrecemos:', en: 'For your horse we offer:' },
  chatEvents: {
    es: 'Organizamos galas, cenas bajo carpas y espectáculos ecuestres:',
    en: 'We host galas, dinners under canopies and equestrian shows:',
  },
  chatEventsMore: { es: 'Vea más en <a href="/noches/">Noches</a>.', en: 'See more on <a href="/noches/">Nights</a>.' },
  chatVisit: {
    es: `Estamos en la Carretera a Porongo, Cruce Los Batos (Km 5), Urubó. Las visitas son con cita previa: escríbanos por <a ${IG}>Instagram</a>.`,
    en: `We are on the road to Porongo, Cruce Los Batos (Km 5), Urubó. Visits are by appointment: message us on <a ${IG}>Instagram</a>.`,
  },
  chatRates: {
    es: 'Todas las tarifas están en <a href="/servicios/">Servicios y tarifas</a>. ¿Le interesa algo en particular?',
    en: 'All rates are on <a href="/servicios/">Services &amp; rates</a>. Anything in particular?',
  },
};
