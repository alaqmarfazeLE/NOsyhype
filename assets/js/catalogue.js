// Nosy-Hype — réglages de la boutique + catalogue (script classique, expose window.NosyHype).
// Ajoutez, retirez ou modifiez des lignes librement : le site se met à jour tout seul.
(function () {

// ─── Réglages de la boutique ──────────────────────────────────────────────
// Numéros au format local (« 038 05 827 19 ») ou international (« +261 38 05 827 19 »).
const SHOP = {
  whatsapp: '038 05 827 19',   // reçoit toutes les demandes de prix et commandes
  mvola: '038 05 827 19',      // reçoit l’acompte de 50 %
  email: 'alaqmarfazele579@gmail.com',
};

// Affichage.
const SITE = {
  catalogueView: 'Défilement', // vue du catalogue à l’ouverture : 'Défilement' ou 'Grille'
  scrollSpeed: 36,             // vitesse de défilement des rangées du catalogue (px/s, 0 = immobile)
  ringCount: 10,               // nombre de flacons dans l’anneau de l’accueil (6 à 12)
  ringSpeed: 9,                // vitesse de rotation de l’anneau (°/s, 0 = immobile)
};

// Flacons de l’anneau de l’accueil, dans l’ordre : photos détourées (fond transparent)
// dans assets/img/bottles/{id}.webp. Pour en ajouter un, déposez son image détourée puis ajoutez son id.
const RING = [31861, 55805, 81642, 39681, 18471, 210, 16657, 25324, 52802, 33519, 45651, 704];
const BOTTLE = (id) => `assets/img/bottles/${id}.webp`;

// ─── Catalogue ────────────────────────────────────────────────────────────
// id = numéro de la photo du flacon (base Fragrantica) · g : 'H' homme, 'F' femme, 'M' mixte.
// Pour utiliser votre propre photo, remplacez le numéro par son chemin : 'assets/img/perfumes/mon-parfum.jpg'.
const IMG = (id) => (typeof id === 'string' ? id : `https://fimgs.net/mdimg/perfume-thumbs/375x500.${id}.jpg`);
const GENRE = { H: 'Homme', F: 'Femme', M: 'Mixte' };
const SHORT = { 'Yves Saint Laurent': 'YSL', 'Jean Paul Gaultier': 'Gaultier', 'Giorgio Armani': 'Armani', 'Maison Francis Kurkdjian': 'MFK' };

const P = (brand, name, id, g, conc = '', notes = '', tag = '') => ({ brand, name, id, g, conc, notes, tag });
const VA = 'Valentino', YSL = 'Yves Saint Laurent', GA = 'Giorgio Armani', JPG = 'Jean Paul Gaultier',
  RB = 'Rabanne', CH = 'Carolina Herrera', PR = 'Prada', VR = 'Viktor&Rolf', DI = 'Dior', CN = 'Chanel',
  VE = 'Versace', LA = 'Lattafa', PDM = 'Parfums de Marly', MU = 'Mugler', LC = 'Lancôme', HB = 'Hugo Boss', TF = 'Tom Ford';

const PERFUMES = [
  P(JPG, 'Le Male Elixir', 81642, 'H', 'Parfum', 'Lavande · Miel · Tabac', 'Best-seller'),
  P(VA, 'Born in Roma Uomo Intense', 78740, 'H', 'EDP', 'Vanille · Lavande · Vétiver', 'Best-seller'),
  P(YSL, 'Libre Intense', 62318, 'F', 'EDP', 'Lavande · Fleur d’oranger · Vanille', 'Best-seller'),
  P(LA, 'Khamrah', 75805, 'M', 'EDP', 'Cannelle · Dattes · Praliné', 'Best-seller'),
  P(YSL, 'La Nuit de l’Homme', 5521, 'H', 'EDT', 'Cardamome · Lavande · Cèdre'),
  P(GA, 'Stronger With You Intensely', 52802, 'H', 'EDP', 'Caramel · Cannelle · Vanille'),
  P(YSL, 'Black Opium', 25324, 'F', 'EDP', 'Café · Fleurs blanches · Vanille'),
  P(VA, 'Born in Roma Donna', 55805, 'F', 'EDP', 'Cassis · Jasmin · Vanille'),
  P(YSL, 'MYSLF', 84094, 'H', 'EDP', 'Bergamote · Fleur d’oranger · Bois ambré'),
  P(DI, 'Sauvage', 31861, 'H', 'EDT', 'Bergamote · Poivre · Ambroxan'),
  P(VR, 'Spicebomb Extreme', 30499, 'H', 'EDP', 'Tabac · Cannelle · Vanille'),
  P(MU, 'Angel', 704, 'F', 'EDP', 'Praliné · Patchouli · Vanille'),
  P(RB, 'Invictus', 18471, 'H', 'EDT', 'Pamplemousse · Notes marines · Laurier'),
  P(DI, 'J’adore', 210, 'F', 'EDP', 'Ylang-ylang · Rose · Jasmin'),
  P(CH, 'Bad Boy', 55449, 'H', 'EDT', 'Poivre blanc · Sauge · Cacao'),
  P(GA, 'Armani Code', 412, 'H', 'EDT', 'Badiane · Fleur d’olivier · Fève tonka'),
  P(CN, 'Coco Mademoiselle', 611, 'F', 'EDP', 'Orange · Rose · Patchouli'),
  P(JPG, 'Scandal', 45651, 'F', 'EDP', 'Orange sanguine · Miel · Patchouli'),
  P(LC, 'La Nuit Trésor', 29157, 'F', 'EDP', 'Rose noire · Praliné · Vanille'),
  P('Cacharel', 'Yes I Am Gold', 122134, 'F'),
  P(VA, 'Vendetta Uomo', 137496, 'H', '', '', 'Nouveau'),
  P(VA, 'Vendetta Donna', 137495, 'F', '', '', 'Nouveau'),
  P(RB, 'Phantom', 68226, 'H', 'EDT', 'Lavande · Citron · Vanille'),
  P(GA, 'Acqua di Giò', 410, 'H', 'EDT', 'Notes marines · Bergamote · Jasmin'),
  P(PR, 'Paradoxe', 75668, 'F', 'EDP', 'Néroli · Ambre · Vanille'),
  P(PDM, 'Layton', 39314, 'H', 'EDP', 'Pomme · Lavande · Vanille'),
  P(VE, 'Eros', 16657, 'H', 'EDT', 'Menthe · Pomme verte · Vanille'),
  P(HB, 'Boss Bottled', 383, 'H', 'EDT', 'Pomme · Cannelle · Santal'),
  P(PR, 'Luna Rossa Carbon', 43402, 'H', 'EDT', 'Bergamote · Lavande · Ambroxan'),
  P(CH, 'Good Girl', 39681, 'F', 'EDP', 'Tubéreuse · Cacao · Fève tonka'),
  P(CN, 'Bleu de Chanel', 25967, 'H', 'EDP', 'Pamplemousse · Encens · Santal'),

  P(VA, 'Born in Roma Uomo', 55963, 'H', 'EDT', 'Sel · Sauge · Vétiver'),
  P(VA, 'Born in Roma Donna Intense', 78739, 'F', 'EDP', 'Vanille · Jasmin'),
  P(VA, 'Born in Roma Coral Fantasy Uomo', 71761, 'H'),
  P(VA, 'Born in Roma Coral Fantasy Donna', 71760, 'F'),
  P(VA, 'Born in Roma Yellow Dream Uomo', 64614, 'H'),
  P(VA, 'Born in Roma Yellow Dream Donna', 64615, 'F'),
  P(VA, 'Born in Roma Green Stravaganza Uomo', 88989, 'H'),
  P(VA, 'Born in Roma Green Stravaganza Donna', 88988, 'F'),
  P(VA, 'Born in Roma The Gold Uomo', 95705, 'H'),
  P(VA, 'Born in Roma The Gold Donna', 95704, 'F'),
  P(VA, 'Born in Roma Extradose Uomo', 101383, 'H', '', '', 'Nouveau'),
  P(VA, 'Born in Roma Extradose Donna', 101384, 'F', '', '', 'Nouveau'),
  P(VA, 'Born in Roma Ivory Uomo', 113443, 'H'),
  P(VA, 'Born in Roma Ivory Donna', 113442, 'F'),
  P(VA, 'Born in Roma Purple Melancholia Uomo', 120986, 'H'),
  P(VA, 'Born in Roma Purple Melancholia Donna', 120985, 'F'),
  P(VA, 'Valentino Uomo', 19558, 'H', 'EDT', 'Bergamote · Gianduja · Cuir'),
  P(VA, 'Valentino Uomo Intense', 38254, 'H', 'EDP', 'Iris · Fève tonka · Vanille'),
  P(VA, 'Valentino Donna', 31411, 'F', 'EDP', 'Iris · Rose · Cuir'),
  P(VA, 'Voce Viva', 62754, 'F', 'EDP', 'Fleur d’oranger · Gardénia · Vanille'),
  P(VA, 'Voce Viva Intensa', 68560, 'F'),
  P(VA, 'Born in Roma Donna Pink PP', 84444, 'F'),
  P(VA, 'Born in Roma Uomo Rockstud Noir', 84445, 'H'),

  P(YSL, 'MYSLF Le Parfum', 94983, 'H', 'Parfum'),
  P(YSL, 'Libre', 56077, 'F', 'EDP', 'Lavande · Fleur d’oranger · Vanille'),
  P(YSL, 'Libre Le Parfum', 75676, 'F', 'Parfum', 'Safran · Miel · Lavande'),
  P(YSL, 'Libre Flowers & Flames', 95623, 'F'),
  P(YSL, 'Black Opium Le Parfum', 78427, 'F', 'Parfum'),
  P(YSL, 'Black Opium Over Red', 88707, 'F', 'EDP'),
  P(YSL, 'Libre L’Absolu Platine', 83296, 'F', 'Parfum'),
  P(YSL, 'Y Eau de Parfum Intense', 79243, 'H', 'EDP'),
  P(YSL, 'Y', 50757, 'H', 'EDP', 'Pomme · Sauge · Bois ambré'),
  P(YSL, 'Y Le Parfum', 64718, 'H', 'Parfum'),
  P(YSL, 'Mon Paris', 38914, 'F', 'EDP', 'Fraise · Pivoine · Patchouli'),
  P(YSL, 'L’Homme', 734, 'H', 'EDT', 'Gingembre · Bergamote · Cèdre'),

  P(GA, 'Stronger With You', 45258, 'H', 'EDT', 'Marron · Sauge · Vanille'),
  P(GA, 'Stronger With You Absolutely', 64501, 'H', 'Parfum', 'Rhum · Vanille · Patchouli'),
  P(GA, 'Stronger With You Only', 71505, 'H', 'EDT', 'Pamplemousse · Lavande · Marron'),
  P(GA, 'Stronger With You Tobacco', 90333, 'H', 'EDP', 'Tabac · Poivre · Vanille'),
  P(GA, 'Stronger With You Parfum', 100895, 'H', 'Parfum', 'Cuir · Lavande · Vanille'),
  P(GA, 'Stronger With You Powerfully', 123070, 'H', '', 'Cerise · Lavande · Marron', 'Nouveau'),
  P(GA, 'Acqua di Giò Profondo', 59532, 'H', 'EDP', 'Notes marines · Romarin · Minéral'),
  P(GA, 'Acqua di Giò Profumo', 29727, 'H', 'EDP', 'Encens · Notes marines · Patchouli'),
  P(GA, 'Acqua di Giò Parfum', 81508, 'H', 'Parfum', 'Notes marines · Sauge sclarée · Encens'),
  P(GA, 'Armani Code Eau de Parfum', 65581, 'H', 'EDP'),
  P(GA, 'Ocean di Gioia', 59809, 'F', 'EDP', 'Poire · Jasmin d’eau · Musc'),
  P(GA, 'My Way', 62036, 'F', 'EDP', 'Fleur d’oranger · Tubéreuse · Vanille'),
  P(GA, 'Sì', 18453, 'F', 'EDP', 'Cassis · Rose · Vanille'),
  P(GA, 'Sì Passione', 48002, 'F', 'EDP', 'Poire · Rose · Vanille'),

  P(JPG, 'Le Male', 430, 'H', 'EDT', 'Lavande · Menthe · Vanille'),
  P(JPG, 'Le Male Le Parfum', 61856, 'H', 'EDP', 'Cardamome · Iris · Vanille'),
  P(JPG, 'Ultra Male', 30947, 'H', 'EDT', 'Poire · Lavande · Vanille noire'),
  P(JPG, 'Le Beau', 55785, 'H', 'EDT', 'Bergamote · Noix de coco · Fève tonka'),
  P(JPG, 'Le Beau Le Parfum', 72158, 'H', 'EDP', 'Ananas · Iris · Fève tonka'),
  P(JPG, 'Le Beau Paradise Garden', 88836, 'H', 'EDP', 'Notes vertes · Noix de coco · Figue'),
  P(JPG, 'Le Beau Narcisse', 122215, 'H', '', '', 'Nouveau'),
  P(JPG, 'La Belle', 55786, 'F', 'EDP', 'Poire · Vanille · Vétiver'),
  P(JPG, 'Scandal By Night', 50715, 'F', 'EDP', 'Miel · Cerise · Tubéreuse'),

  P(RB, 'Invictus Victory Absolu', 103462, 'H', '', 'Poivre noir · Ambre · Encens', 'Nouveau'),
  P(RB, 'Invictus Parfum', 90433, 'H', 'Parfum'),
  P(RB, 'Invictus Platinum', 72557, 'H', 'EDP'),
  P(RB, 'Invictus Aqua', 106576, 'H'),
  P(RB, 'Phantom Parfum', 81927, 'H', 'Parfum'),
  P(RB, 'Phantom in Red', 120953, 'H', '', 'Lavande · Prune · Daim', 'Nouveau'),
  P(RB, '1 Million', 3747, 'H', 'EDT', 'Mandarine sanguine · Cannelle · Cuir'),
  P(RB, '1 Million Lucky', 48903, 'H', 'EDT', 'Noisette · Prune · Miel'),
  P(RB, 'Olympéa', 31666, 'F', 'EDP', 'Jasmin d’eau · Vanille salée · Santal'),
  P(RB, 'Olympéa Elixir', 128162, 'F'),
  P(RB, 'Million Gold For Her', 95640, 'F'),

  P(CH, 'Bad Boy Le Parfum', 65718, 'H', 'Parfum'),
  P(CH, 'Bad Boy Extreme', 78562, 'H', 'EDP', 'Cacao · Prune · Gingembre'),
  P(CH, 'Bad Boy Cobalt Elixir', 89374, 'H', 'EDP'),
  P(CH, 'Bad Boy Cobalt Électrique', 71888, 'H', 'Parfum'),
  P(CH, 'Bad Boy Elixir', 101597, 'H', '', 'Cuir · Oud · Encens', 'Nouveau'),

  P(PR, 'Paradoxe Intense', 83988, 'F', 'EDP'),
  P(PR, 'Luna Rossa Carbon', 127045, 'H', 'EDP', 'Lavande · Réglisse · Cyprès', 'Nouveau'),
  P(PR, 'Luna Rossa', 15754, 'H', 'EDT', 'Lavande · Orange amère · Menthe'),
  P(PR, 'L’Homme', 39029, 'H', 'EDT', 'Néroli · Iris · Ambre'),
  P(PR, 'L’Homme Intense', 45396, 'H', 'EDP'),
  P(PR, 'L’Homme L’Eau', 46400, 'H', 'EDT'),

  P(VR, 'Spicebomb', 13857, 'H', 'EDT', 'Piment · Cannelle · Tabac'),
  P(VR, 'Spicebomb Night Vision', 53344, 'H', 'EDT'),
  P(VR, 'Flowerbomb', 1460, 'F', 'EDP', 'Thé · Jasmin · Patchouli'),

  P(DI, 'Sauvage Elixir', 68415, 'H', 'Parfum', 'Cannelle · Lavande · Réglisse'),
  P(DI, 'Dior Homme Intense', 13016, 'H', 'EDP', 'Iris · Ambrette · Poire'),
  P(DI, 'Hypnotic Poison', 219, 'F', 'EDT', 'Amande · Jasmin · Vanille'),

  P(CN, 'Chance Eau Tendre', 52359, 'F', 'EDP', 'Coing · Jasmin · Musc'),

  P(VE, 'Eros Flame', 52180, 'H', 'EDP', 'Mandarine · Poivre noir · Vanille'),
  P(VE, 'Dylan Blue', 40031, 'H', 'EDT', 'Bergamote · Feuille de violette · Encens'),
  P(VE, 'Crystal Noir', 631, 'F', 'EDT', 'Gardénia · Noix de coco · Ambre'),
  P(VE, 'Bright Crystal', 632, 'F', 'EDT', 'Grenade · Pivoine · Musc'),

  P(LA, 'Bade’e Al Oud – Oud for Glory', 64948, 'M', 'EDP', 'Safran · Oud · Patchouli'),
  P(LA, 'Opulent Oud', 66012, 'M', 'EDP'),
  P(LA, 'Eclaire', 93628, 'F', 'EDP', 'Caramel · Lait · Miel'),
  P(LA, 'Yara', 76880, 'F', 'EDP', 'Orchidée · Héliotrope · Vanille'),

  P(PDM, 'Althaïr', 84109, 'H', 'EDP', 'Cardamome · Vanille bourbon · Praliné'),
  P(PDM, 'Delina', 43871, 'F', 'EDP', 'Rose · Litchi · Rhubarbe'),
  P(PDM, 'Delina Exclusif', 50370, 'F', 'Parfum', 'Litchi · Rose · Encens'),

  P(MU, 'Alien', 707, 'F', 'EDP', 'Jasmin · Bois cachemire · Ambre'),
  P(MU, 'Alien Goddess', 68354, 'F', 'EDP', 'Bergamote · Jasmin · Vanille'),

  P(LC, 'La Vie est Belle', 14982, 'F', 'EDP', 'Iris · Praliné · Vanille'),
  P(LC, 'La Nuit Trésor Intense', 71512, 'F', 'EDP', 'Rose · Cerise · Amande'),
  P(LC, 'La Nuit Trésor Caresse', 40086, 'F', 'EDP'),

  P(HB, 'Boss Bottled Elixir', 84074, 'H', 'Parfum', 'Encens · Vétiver · Patchouli'),

  P(TF, 'Lost Cherry', 51411, 'M', 'EDP', 'Cerise · Amande · Fève tonka'),
  P(TF, 'Tobacco Vanille', 1825, 'M', 'EDP', 'Tabac · Vanille · Fève tonka'),
  P(TF, 'Ombré Leather', 50239, 'M', 'EDP', 'Cuir · Cardamome · Jasmin'),
  P(TF, 'Black Orchid', 1018, 'F', 'EDP', 'Truffe · Orchidée noire · Patchouli'),
  P('Creed', 'Aventus', 9828, 'H', 'EDP', 'Ananas · Bouleau · Musc'),
  P('Maison Francis Kurkdjian', 'Baccarat Rouge 540', 33519, 'M', 'EDP', 'Safran · Jasmin · Ambre gris'),
  P('Azzaro', 'The Most Wanted', 66826, 'H', '', 'Cardamome · Caramel · Bois ambré'),
  P('Burberry', 'Goddess', 83483, 'F', 'EDP', 'Lavande · Vanille · Gingembre'),
  P('Givenchy', 'L’Interdit', 51488, 'F', 'EDP', 'Fleur d’oranger · Tubéreuse · Vétiver'),
  P('Kayali', 'Vanilla 28', 52616, 'F', 'EDP', 'Vanille · Ambre · Fève tonka'),
  P('Kilian', 'Angels’ Share', 62615, 'M', 'EDP', 'Cognac · Cannelle · Fève tonka'),
  P('Hermès', 'Terre d’Hermès', 17, 'H', 'EDT', 'Orange · Poivre · Vétiver'),
  P('Montblanc', 'Explorer', 52002, 'H', 'EDP', 'Bergamote · Vétiver · Ambroxan'),
  P('Dolce&Gabbana', 'Light Blue', 485, 'F', 'EDT', 'Citron · Pomme · Cèdre'),
  P('Armaf', 'Club de Nuit Intense Man', 34696, 'H', 'EDT', 'Ananas · Bouleau · Musc'),
  P('Narciso Rodriguez', 'For Her', 209, 'F', 'EDT', 'Fleur d’oranger · Osmanthus · Musc'),
];

// Avis d’EXEMPLE : remplacez-les par de vrais avis de vos clients (avec leur accord),
// puis supprimez « exemple: true » : l’étiquette « Exemple » disparaît du site.
// Les trois premiers avis s’affichent ; p = nom du parfum tel qu’il est écrit dans le catalogue.
const REVIEWS = [
  { name: 'Mialy R.', p: 'Libre Intense', stars: 5, exemple: true, text: 'J’hésitais entre Libre et Libre Intense. On m’a bien conseillée, sans me presser. J’ai pris l’Intense et on me complimente tous les jours.' },
  { name: 'Sarah M.', p: 'Born in Roma Donna', stars: 5, exemple: true, text: 'Commande ultra simple : j’ai cliqué sur le parfum, WhatsApp s’est ouvert avec le nom déjà écrit. Réglé en trois messages.' },
  { name: 'Kevin A.', p: 'Le Male Elixir', stars: 5, exemple: true, text: 'Message envoyé le soir, réponse dans la foulée. Le Male Elixir tient toute la journée, deux pulvérisations suffisent.' },
  { name: 'Tiana', p: 'Khamrah', stars: 5, exemple: true, text: 'Je voulais tester Lattafa. Khamrah, c’est une tuerie : cannelle, dattes, ça sent l’hiver.' },
  { name: 'Hery T.', p: 'Stronger With You Intensely', stars: 4, exemple: true, text: 'Offert à mon frère pour son anniversaire, il ne le quitte plus. Réponse un peu lente un dimanche, sinon parfait.' },
  { name: 'Inès B.', p: 'Black Opium', stars: 5, exemple: true, text: 'Mon parfum depuis des années. Enfin une boutique où je peux demander le prix sans prise de tête.' },
];

const askText = (p) => `Bonjour Nosy-Hype ! Je voudrais connaître le prix de : ${p.brand} – ${p.name}${p.conc ? ` (${p.conc})` : ''}. Merci !`;

// Accepte « 038 05 827 19 » ou « +261 38 05 827 19 ».
function waLink(num, text) {
  let n = String(num || SHOP.whatsapp).replace(/\D/g, '');
  if (n.length === 10 && n[0] === '0') n = `261${n.slice(1)}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) { /* repli ci-dessous */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function brandIndex(list, min = 2) {
  const n = {};
  list.forEach((p) => { n[p.brand] = (n[p.brand] || 0) + 1; });
  const main = Object.keys(n).filter((b) => n[b] >= min).sort((a, b) => n[b] - n[a] || a.localeCompare(b));
  const others = Object.keys(n).filter((b) => n[b] < min).reduce((s, b) => s + n[b], 0);
  return { main: main.map((b) => ({ name: b, label: SHORT[b] || b, count: n[b] })), others, isOther: (b) => n[b] < min };
}

function filterPerfumes(list, { q = '', brand = 'Toutes', g = 'Tous' } = {}, min = 2) {
  const { isOther } = brandIndex(list, min);
  const terms = norm(q).split(/\s+/).filter(Boolean);
  return list.filter((p) => {
    if (brand === 'Autres' ? !isOther(p.brand) : brand !== 'Toutes' && p.brand !== brand) return false;
    if (g !== 'Tous' && !(p.g === g || (g !== 'M' && p.g === 'M'))) return false;
    if (!terms.length) return true;
    const hay = norm(`${p.brand} ${SHORT[p.brand] || ''} ${p.name} ${p.notes}`);
    return terms.every((t) => hay.includes(t));
  });
}

  window.NosyHype = { SITE, IMG, BOTTLE, RING, GENRE, SHOP, SHORT, PERFUMES, REVIEWS, askText, waLink, copyText, slug, brandIndex, filterPerfumes };
})();
