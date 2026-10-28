// English copy. Spanish lives in index.html as the default and is captured at runtime.
export const en = {
  'nav.lineages': 'Bloodlines',
  'nav.philosophy': 'Philosophy',
  'nav.estate': 'The Estate',
  'nav.center': 'Equestrian Center',
  'nav.visit': 'Book a visit',

  'hero.eyebrow': 'Santa Cruz de la Sierra · Bolivia · Since 1993',
  'hero.pre': 'Haras',
  'hero.sub': 'Arabian and Pura Raza Española horses.<br />Raised with patience, selected with rigor.',
  'hero.scroll': 'Scroll',

  'manifesto.eyebrow': 'Why we exist',
  'manifesto.text': 'Some horses you look at. Others you remember. Since 1993 we have bred the second kind: purebred Arabians and Pura Raza Española, born in eastern Bolivia and shaped with the patience of those who think in generations, not seasons.',

  'origin.eyebrow': 'Chapter I — The origin',
  'origin.title': 'It began with a conviction: to breed horses worthy of a legacy.',
  'origin.p1': 'In 1993, Haras La Alhambra was born as a private breeding program for purebred Arabian and Andalusian horses. We were never after volume. We were after bloodline, character and beauty, in that order and without compromise.',
  'origin.p2': 'Three decades later, the same standard guides every pairing, every foaling and every morning in the fields. Over the years we opened the estate to share it, and so our Equestrian Center was born.',

  'lin.eyebrow': 'Chapter II — Bloodlines',
  'lin.title': 'Three bloodlines.<br /><em>One standard.</em>',
  'lin.intro': 'Every line we breed carries centuries of history. Our work is to honor it, and to carry it one step further.',
  'lin.hint': 'Scroll to explore →',
  'lin.arab.name': 'Purebred Arabian',
  'lin.arab.tag': 'An ancient fire.',
  'lin.arab.body': 'The chiseled head, the lifted tail, the eye that understands everything. We work with Egyptian, Polish, Spanish and American lines, crossed with judgment to preserve what matters: beauty, endurance and an intelligence you can see in the gaze.',
  'lin.arab.l1': 'Egyptian', 'lin.arab.l2': 'Polish', 'lin.arab.l3': 'Spanish', 'lin.arab.l4': 'American',
  'lin.pre.name': 'Pura Raza Española',
  'lin.pre.tag': 'Nobility in motion.',
  'lin.pre.body': 'The horse of kings and of haute école. An arched neck, a long mane, a trot that seems suspended in the air. We breed P.R.E. for temperament: brave in the arena, calm in the hand.',
  'lin.pre.l1': 'Classical dressage', 'lin.pre.l2': 'Haute école', 'lin.pre.l3': 'Temperament',
  'lin.ha.name': 'Hispano-Arabian',
  'lin.ha.tag': 'The best of two worlds.',
  'lin.ha.body': 'The blood of the desert and of Andalusia, united in a sport horse. Agility, stamina and a natural talent for dressage and competition.',
  'lin.ha.l1': 'Sport', 'lin.ha.l2': 'Dressage', 'lin.ha.l3': 'Versatility',

  'marquee': 'Bloodline <i>✦</i> Temperament <i>✦</i> Nobility <i>✦</i> Patience <i>✦</i> ',

  'phil.eyebrow': 'Chapter III — Philosophy',
  'phil.quote': '“Function is never inherited by chance. It is selected, cared for from the very first day, and shaped with method.”',
  'phil.p1.t': 'Selection',
  'phil.p1.b': 'Every pairing is a decision measured in years. We choose sires and dams for conformation, movement and character, never for fashion.',
  'phil.p2.t': 'Handling',
  'phil.p2.b': 'Our foals know the human hand from the day they are born. Trust comes first; everything else follows.',
  'phil.p3.t': 'Training',
  'phil.p3.b': 'Systematic, progressive work with no shortcuts. That is how you shape a horse that responds, and enjoys doing it.',

  'estate.eyebrow': 'Chapter IV — The Estate',
  'estate.title': 'A place designed<br /><em>for the horse.</em>',
  'estate.body': 'At kilometer 5 on the road to Porongo, among the trees and the golden light of the east, every corner of the estate exists for one reason: so the horse lives well, grows strong and works happily.',
  'estate.s1': 'tree-lined grazing fields',
  'estate.s2': 'paddocks',
  'estate.s3': 'stables',
  'estate.s4': 'indoor arena',
  'estate.s5': 'on-site veterinary facilities',

  'slow.eyebrow': 'A day at La Alhambra',
  'slow.c1': 'Dawn reaches the fields first.',
  'slow.c2': 'In the arena, every step is worked. None is forced.',
  'slow.c3': 'As evening falls, they are free again.',

  'cela.eyebrow': 'Chapter V — C.E.L.A.',
  'cela.title': 'La Alhambra<br /><em>Equestrian Center.</em>',
  'cela.body': 'We opened our gates so more people can live what we live every morning. Instruction, training and care held to the same standard we use to raise our own horses.',
  'cela.s1.t': 'Riding school', 'cela.s1.d': 'For every age. From the first walk to the first show.',
  'cela.s2.t': 'Private instruction', 'cela.s2.d': 'A plan built around the rider, the horse and the goal.',
  'cela.s3.t': 'Horse training', 'cela.s3.d': 'Progressive, methodical schooling, with respect as the starting point.',
  'cela.s4.t': 'Full boarding', 'cela.s4.d': 'Stabling, feeding, daily care and veterinary attention. Your horse, at home.',
  'cela.s5.t': 'Indoor and grass arenas', 'cela.s5.d': 'Train under cover through the rainy season, or outdoors on grass.',
  'cela.s6.t': 'Paddocks and fields', 'cela.s6.d': 'Turnout every day. A horse that moves is a horse that thinks better.',

  'visit.eyebrow': 'Chapter VI — Visit us',
  'visit.title': 'Come and<br /><em>meet them.</em>',
  'visit.body': 'Visits are by appointment. Write to us and we will open the gate: to meet our horses, begin your lessons or find a new home for your own.',
  'visit.cta1': 'Message us on Instagram',
  'visit.cta2': 'Get directions',

  'footer.tag': 'Breeders of Arabian and Pura Raza Española horses since 1993.',
};

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

export function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang]').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.lang === lang);
  });
  if (lang !== 'en') return;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = en[el.dataset.i18n];
    if (value) el.innerHTML = value;
  });
}
