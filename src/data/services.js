// Services and reference rates in Bolivianos (Bs). Edit prices here: the Services page
// and Lázaro's knowledge both read from this file.
// `price: null` means "a cotizar" (quoted per request).

export const categories = [
  {
    id: 'educacion',
    es: 'Educación ecuestre',
    en: 'Riding education',
    image: '/media/lib/clases-dressage-grey-outdoor.webp', pos: '82% 55%',
    intro: { es: 'Del primer contacto con el caballo al primer concurso, con el mismo método con el que formamos a nuestros caballos.', en: 'From the first touch to the first competition, with the same method we use to raise our horses.' },
    items: [
      { es: 'Clases · 1 vez por semana', en: 'Lessons · once a week', price: 1900, unit: { es: 'al mes · 4 clases', en: 'per month · 4 lessons' },
        desc: { es: 'Una clase por semana para avanzar a su ritmo.', en: 'One lesson a week to progress at your own pace.' } },
      { es: 'Clases · 2 veces por semana', en: 'Lessons · twice a week', price: 3000, unit: { es: 'al mes · 8 clases', en: 'per month · 8 lessons' },
        desc: { es: 'Dos clases por semana para afianzar lo aprendido de una clase a otra.', en: 'Two lessons a week to build on what you learn from one lesson to the next.' } },
      { es: 'Clases · 3 veces por semana', en: 'Lessons · three times a week', price: 3850, unit: { es: 'al mes · 12 clases', en: 'per month · 12 lessons' },
        desc: { es: 'Tres clases por semana para progresar más rápido o preparar un concurso.', en: 'Three lessons a week to progress faster or prepare for a competition.' } },
    ],
  },
  {
    id: 'caballos',
    es: 'Cuidado y entrenamiento',
    en: 'Care and training',
    image: '/media/lib/g83.webp', pos: '50% 35%',
    intro: { es: 'Su caballo, en casa: box, alimentación, salida diaria y un equipo que lo trabaja con paciencia y método.', en: 'Your horse, at home: stabling, feed, daily turnout and a team that works it with patience and method.' },
    items: [
      { es: 'Pensión completa', en: 'Full boarding', price: 3200, unit: { es: 'al mes', en: 'per month' }, featured: true,
        desc: { es: 'Box, alimentación, cama, salida diaria a paddock y control veterinario.', en: 'Stable, feed, bedding, daily turnout and veterinary checks.' } },
      { es: 'Media pensión', en: 'Part boarding', price: 2300, unit: { es: 'al mes', en: 'per month' },
        desc: { es: 'Box y alimentación. El propietario se encarga del trabajo diario.', en: 'Stable and feed. The owner handles daily work.' } },
      { es: 'Entrenamiento de caballos', en: 'Horse training', price: 4800, unit: { es: 'al mes · pensión incluida', en: 'per month · boarding included' },
        desc: { es: 'Cinco sesiones semanales con nuestro equipo, con informe mensual de progreso.', en: 'Five weekly sessions with our team and a monthly progress report.' } },
      { es: 'Doma de potros', en: 'Young horse starting', price: 12000, unit: { es: 'programa de 90 días', en: '90-day program' },
        desc: { es: 'Iniciación respetuosa y progresiva, desde el trabajo a la cuerda hasta la monta.', en: 'Respectful, progressive starting, from lunging to first rides.' } },
    ],
  },
  {
    id: 'instalaciones',
    es: 'Instalaciones',
    en: 'Facilities',
    image: '/media/lib/g03.webp', pos: '50% 60%',
    intro: { es: 'Picadero cubierto para la temporada de lluvias y pista verde para concursos y clínicas.', en: 'An indoor arena for the rainy season and a grass arena for shows and clinics.' },
    items: [
      { es: 'Alquiler de picadero cubierto', en: 'Indoor arena rental', price: 200, unit: { es: 'por hora', en: 'per hour' },
        desc: { es: 'Para entrenar bajo techo durante la temporada de lluvias.', en: 'Train under cover through the rainy season.' } },
      { es: 'Pista verde para concursos', en: 'Grass arena for shows', price: null, unit: { es: 'a cotizar', en: 'on request' },
        desc: { es: 'Sede para concursos y clínicas, con apoyo logístico del equipo.', en: 'Venue for shows and clinics, with logistic support from our team.' } },
    ],
  },
  {
    id: 'experiencias',
    es: 'Eventos y alquileres',
    en: 'Events and rentals',
    image: '/media/lib/g16.webp', pos: '50% 60%',
    intro: { es: 'Visitas, caballos entre sus invitados, espectáculos de alta escuela y el haras completo para su celebración.', en: 'Visits, horses among your guests, haute école shows and the whole estate for your celebration.' },
    items: [
      { es: 'Visita guiada al haras', en: 'Guided estate visit', price: 100, unit: { es: 'por persona', en: 'per person' },
        desc: { es: 'Recorrido por las caballerizas, los potreros y los picaderos. Con cita previa.', en: 'A walk through the stables, fields and arenas. By appointment.' } },
      { es: 'Paseo de caballos en su evento', en: 'Horses at your event', price: 2500, from: true, unit: { es: 'por evento', en: 'per event' },
        desc: { es: 'Caballos y jinetes que recorren el evento entre los invitados.', en: 'Horses and riders walking among your guests.' } },
      { es: 'Espectáculo ecuestre', en: 'Equestrian show', price: 6000, from: true, unit: { es: 'por función', en: 'per show' },
        desc: { es: 'Doma clásica, cuadrillas y alta escuela bajo los reflectores.', en: 'Classical dressage, quadrilles and haute école in the spotlight.' } },
      { es: 'Galas y cenas privadas', en: 'Galas and private dinners', price: null, unit: { es: 'a cotizar', en: 'on request' },
        desc: { es: 'El haras completo para su celebración: carpas, iluminación y caballos.', en: 'The whole estate for your celebration: canopies, lighting and horses.' } },
    ],
  },
];

export const formatPrice = (item, lang = 'es') => {
  if (item.price == null) return lang === 'en' ? 'On request' : 'A cotizar';
  const n = item.price.toLocaleString(lang === 'en' ? 'en-US' : 'es-BO');
  return `${item.from ? (lang === 'en' ? 'From ' : 'Desde ') : ''}Bs ${n}`;
};
