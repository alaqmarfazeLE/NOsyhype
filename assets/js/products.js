/* =========================================================
   NOSY HYPE — CATALOGUE DES PARFUMS
   ---------------------------------------------------------
   ⚠ Les produits ci-dessous sont des EXEMPLES (noms, prix,
   photos). Remplacez-les par votre vrai stock.

   Pour chaque parfum :
   - name        : nom du parfum
   - price       : prix affiché, ex. "185 000 Ar"
                   (les chiffres servent au calcul de l'acompte)
   - category    : "Femme", "Homme", "Unisexe"… (crée les filtres)
   - description : 1 à 3 phrases
   - notes       : notes olfactives principales
   - image       : chemin de la photo (format portrait 4:5 conseillé,
                   ex. 1200 × 1500 px) dans assets/img/perfumes/
   - available   : true = disponible,
                   false = « Sur demande » (commande via WhatsApp)

   Ajouter un parfum : copiez un bloc { … }, collez-le, modifiez-le.
   Supprimer un parfum : effacez son bloc { … } (et la virgule).
   ========================================================= */
window.NOSY_PRODUCTS = [
  {
    "name": "Nuit d'Ambre",
    "price": "185 000 Ar",
    "category": "Unisexe",
    "description": "Un sillage chaud et enveloppant, comme une nuit d'été au bord de l'océan Indien. L'ambre se fond dans une vanille douce et un santal crémeux.",
    "notes": ["Ambre", "Vanille", "Bois de santal"],
    "image": "assets/img/perfumes/nuit-d-ambre.webp",
    "available": true
  },
  {
    "name": "Oud Impérial",
    "price": "240 000 Ar",
    "category": "Homme",
    "description": "Intense et magnétique. Un oud fumé, rehaussé de safran et adouci d'une touche de cuir, pour une présence qui ne passe pas inaperçue.",
    "notes": ["Oud", "Safran", "Cuir"],
    "image": "assets/img/perfumes/oud-imperial.webp",
    "available": true
  },
  {
    "name": "Rose Noire",
    "price": "195 000 Ar",
    "category": "Femme",
    "description": "Une rose sombre et veloutée, sublimée par le patchouli et une pointe de poivre rose. Élégante, mystérieuse, inoubliable.",
    "notes": ["Rose", "Patchouli", "Poivre rose"],
    "image": "assets/img/perfumes/rose-noire.webp",
    "available": true
  },
  {
    "name": "Ylang de Nosy",
    "price": "170 000 Ar",
    "category": "Femme",
    "description": "Un hommage à l'île aux parfums. L'ylang-ylang solaire s'unit au jasmin et à la fleur de tiaré pour un bouquet lumineux et sensuel.",
    "notes": ["Ylang-ylang", "Jasmin", "Tiaré"],
    "image": "assets/img/perfumes/ylang-de-nosy.webp",
    "available": true
  },
  {
    "name": "Vanille de Sambava",
    "price": "165 000 Ar",
    "category": "Unisexe",
    "description": "Une vanille gourmande et boisée, réchauffée par la fève tonka et un soupçon de rhum ambré. Réconfortante du matin au soir.",
    "notes": ["Vanille", "Fève tonka", "Rhum"],
    "image": "assets/img/perfumes/vanille-de-sambava.webp",
    "available": true
  },
  {
    "name": "Vétiver Lagon",
    "price": "175 000 Ar",
    "category": "Homme",
    "description": "Frais et minéral. Le vétiver rencontre la bergamote et une brise marine, comme une matinée au bord du lagon.",
    "notes": ["Vétiver", "Bergamote", "Notes marines"],
    "image": "assets/img/perfumes/vetiver-lagon.webp",
    "available": true
  },
  {
    "name": "Santal Sacré",
    "price": "210 000 Ar",
    "category": "Unisexe",
    "description": "Un bois crémeux et méditatif. Le santal se mêle à l'encens et au cèdre pour une aura calme et raffinée.",
    "notes": ["Santal", "Encens", "Cèdre"],
    "image": "assets/img/perfumes/santal-sacre.webp",
    "available": true
  },
  {
    "name": "Musc Blanc",
    "price": "150 000 Ar",
    "category": "Femme",
    "description": "La douceur d'une peau propre et soyeuse. Un musc délicat, éclairé de fleur d'oranger et d'une poudre d'iris.",
    "notes": ["Musc blanc", "Fleur d'oranger", "Iris"],
    "image": "assets/img/perfumes/musc-blanc.webp",
    "available": true
  },
  {
    "name": "Cuir Obsidienne",
    "price": "230 000 Ar",
    "category": "Homme",
    "description": "Un cuir noir et fumé, travaillé avec le bouleau et une touche de tabac blond. Disponible sur demande : écrivez-nous sur WhatsApp.",
    "notes": ["Cuir", "Bouleau", "Tabac blond"],
    "image": "assets/img/perfumes/cuir-obsidienne.webp",
    "available": false
  }
];
