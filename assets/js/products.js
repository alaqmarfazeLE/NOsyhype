/* =========================================================
   NOSY HYPE — CATALOGUE DES PARFUMS
   ---------------------------------------------------------
   Pour chaque parfum :
   - brand       : la marque (ex. "Dior")
   - name        : le nom du parfum
   - category    : "Femme", "Homme" ou "Unisexe" (crée les filtres)
   - description : 1 phrase
   - notes       : notes olfactives principales
   - image       : chemin de la VRAIE photo du parfum, ex.
                   "assets/img/perfumes/dior-sauvage.jpg"
                   (laisser "" tant que la photo n'est pas ajoutée :
                   une carte élégante s'affiche à la place)
                   Format conseillé : portrait 4:5, fond sombre.
   - available   : true  = disponible à la commande
                   false = affiché « Sur demande »
   - vedette     : true  = apparaît dans le showroom 3D (optionnel)

   Les prix ne sont pas affichés : ils sont communiqués sur WhatsApp.

   Ajouter un parfum : copiez un bloc { … }, collez-le, modifiez-le.
   Supprimer un parfum : effacez son bloc { … } (et la virgule).
   ========================================================= */
window.NOSY_PRODUCTS = [
  { "brand": "Dior", "name": "Sauvage Eau de Toilette", "category": "Homme", "description": "Frais et épicé : une bergamote vive sur un fond boisé ambré très reconnaissable.", "notes": ["Bergamote", "Poivre", "Ambroxan"], "image": "", "available": true, "vedette": true },
  { "brand": "Chanel", "name": "Bleu de Chanel Eau de Parfum", "category": "Homme", "description": "Boisé aromatique frais, des agrumes jusqu'à un fond d'encens et de santal.", "notes": ["Pamplemousse", "Encens", "Santal"], "image": "", "available": true, "vedette": true },
  { "brand": "Maison Francis Kurkdjian", "name": "Baccarat Rouge 540", "category": "Unisexe", "description": "Ambré floral aérien, entre safran, jasmin et bois ambrés.", "notes": ["Safran", "Jasmin", "Bois ambré"], "image": "", "available": true, "vedette": true },
  { "brand": "Yves Saint Laurent", "name": "Libre Eau de Parfum", "category": "Femme", "description": "Floral ambré : la lavande rencontre la fleur d'oranger et la vanille.", "notes": ["Lavande", "Fleur d'oranger", "Vanille"], "image": "", "available": true, "vedette": true },
  { "brand": "Lancôme", "name": "La Vie est Belle", "category": "Femme", "description": "Gourmand floral autour de l'iris, du praliné et de la vanille.", "notes": ["Iris", "Praliné", "Vanille"], "image": "", "available": true, "vedette": true },
  { "brand": "Creed", "name": "Aventus", "category": "Homme", "description": "Fruité boisé et fumé, à l'ananas et au bouleau.", "notes": ["Ananas", "Bouleau", "Musc"], "image": "", "available": true, "vedette": true },
  { "brand": "Carolina Herrera", "name": "Good Girl", "category": "Femme", "description": "Floral gourmand, entre tubéreuse, fève tonka et cacao.", "notes": ["Tubéreuse", "Fève tonka", "Cacao"], "image": "", "available": true, "vedette": true },
  { "brand": "Rabanne", "name": "1 Million", "category": "Homme", "description": "Épicé cuiré, chaud et affirmé.", "notes": ["Mandarine sanguine", "Cannelle", "Cuir"], "image": "", "available": true, "vedette": true },
  { "brand": "Lattafa", "name": "Khamrah", "category": "Unisexe", "description": "Ambré épicé et gourmand, aux dattes et au praliné.", "notes": ["Cannelle", "Dattes", "Praliné"], "image": "", "available": true, "vedette": true },
  { "brand": "Dior", "name": "J'adore Eau de Parfum", "category": "Femme", "description": "Grand bouquet floral, lumineux et féminin.", "notes": ["Ylang-ylang", "Rose de Damas", "Jasmin"], "image": "", "available": true, "vedette": true },
  { "brand": "Yves Saint Laurent", "name": "Black Opium", "category": "Femme", "description": "Gourmand intense au café et à la vanille.", "notes": ["Café", "Vanille", "Fleurs blanches"], "image": "", "available": true, "vedette": true },
  { "brand": "Tom Ford", "name": "Tobacco Vanille", "category": "Unisexe", "description": "Ambré épicé, entre feuille de tabac et vanille.", "notes": ["Tabac", "Vanille", "Fève tonka"], "image": "", "available": true, "vedette": true },

  { "brand": "Dior", "name": "Sauvage Elixir", "category": "Homme", "description": "Version dense et épicée : lavande, épices chaudes et réglisse.", "notes": ["Cannelle", "Lavande", "Réglisse"], "image": "", "available": true },
  { "brand": "Dior", "name": "Dior Homme Intense", "category": "Homme", "description": "Iris poudré et élégant, réchauffé de notes boisées.", "notes": ["Iris", "Lavande", "Ambrette"], "image": "", "available": true },
  { "brand": "Dior", "name": "Fahrenheit", "category": "Homme", "description": "Classique boisé et cuiré, aux accents de violette.", "notes": ["Feuille de violette", "Cuir", "Muscade"], "image": "", "available": true },
  { "brand": "Dior", "name": "Miss Dior Blooming Bouquet", "category": "Femme", "description": "Floral frais et tendre, autour de la pivoine et de la rose.", "notes": ["Pivoine", "Rose", "Musc blanc"], "image": "", "available": true },
  { "brand": "Dior", "name": "Hypnotic Poison", "category": "Femme", "description": "Ambré vanillé à l'amande, gourmand et envoûtant.", "notes": ["Amande", "Vanille", "Jasmin sambac"], "image": "", "available": true },

  { "brand": "Chanel", "name": "Allure Homme Sport", "category": "Homme", "description": "Frais et sportif, porté par l'orange et une base douce de fève tonka.", "notes": ["Orange", "Notes marines", "Fève tonka"], "image": "", "available": true },
  { "brand": "Chanel", "name": "N°5 Eau de Parfum", "category": "Femme", "description": "Le floral aldéhydé par excellence, poudré et intemporel.", "notes": ["Aldéhydes", "Rose", "Jasmin"], "image": "", "available": true },
  { "brand": "Chanel", "name": "Coco Mademoiselle Eau de Parfum", "category": "Femme", "description": "Chypre floral frais, entre agrumes, rose et patchouli.", "notes": ["Orange", "Rose", "Patchouli"], "image": "", "available": true },
  { "brand": "Chanel", "name": "Chance Eau Tendre", "category": "Femme", "description": "Floral fruité délicat et léger.", "notes": ["Coing", "Jasmin", "Musc blanc"], "image": "", "available": true },

  { "brand": "Yves Saint Laurent", "name": "Y Eau de Parfum", "category": "Homme", "description": "Boisé aromatique frais, avec une pomme croquante et un fond ambré.", "notes": ["Pomme", "Sauge", "Fève tonka"], "image": "", "available": true },
  { "brand": "Yves Saint Laurent", "name": "La Nuit de l'Homme", "category": "Homme", "description": "Épicé et sensuel, autour de la cardamome.", "notes": ["Cardamome", "Lavande", "Cèdre"], "image": "", "available": true },
  { "brand": "Yves Saint Laurent", "name": "Mon Paris", "category": "Femme", "description": "Fruité chypré, entre fruits rouges et patchouli.", "notes": ["Fraise", "Datura", "Patchouli"], "image": "", "available": true },

  { "brand": "Giorgio Armani", "name": "Acqua di Giò", "category": "Homme", "description": "Aquatique et lumineux, un classique de la fraîcheur.", "notes": ["Notes marines", "Bergamote", "Jasmin"], "image": "", "available": true },
  { "brand": "Giorgio Armani", "name": "Acqua di Giò Profondo", "category": "Homme", "description": "Aquatique aromatique, plus profond et minéral.", "notes": ["Notes marines", "Mandarine verte", "Romarin"], "image": "", "available": true },
  { "brand": "Giorgio Armani", "name": "Stronger With You Intensely", "category": "Homme", "description": "Ambré épicé et gourmand, très chaleureux.", "notes": ["Caramel", "Cannelle", "Vanille"], "image": "", "available": true },
  { "brand": "Giorgio Armani", "name": "Sì Eau de Parfum", "category": "Femme", "description": "Chypre fruité au cassis, élégant et doux.", "notes": ["Cassis", "Rose", "Vanille"], "image": "", "available": true },
  { "brand": "Giorgio Armani", "name": "My Way", "category": "Femme", "description": "Floral solaire autour de la tubéreuse et de la fleur d'oranger.", "notes": ["Fleur d'oranger", "Tubéreuse", "Vanille"], "image": "", "available": true },

  { "brand": "Rabanne", "name": "Invictus", "category": "Homme", "description": "Frais boisé et marin, énergique.", "notes": ["Pamplemousse", "Notes marines", "Bois de gaïac"], "image": "", "available": true },
  { "brand": "Rabanne", "name": "Phantom", "category": "Homme", "description": "Aromatique frais à la lavande, avec un fond vanillé.", "notes": ["Citron", "Lavande", "Vanille"], "image": "", "available": true },
  { "brand": "Rabanne", "name": "Lady Million", "category": "Femme", "description": "Floral fruité et miellé, éclatant.", "notes": ["Framboise", "Fleur d'oranger", "Miel"], "image": "", "available": true },
  { "brand": "Rabanne", "name": "Olympéa", "category": "Femme", "description": "Ambré floral à la vanille salée.", "notes": ["Mandarine verte", "Jasmin d'eau", "Vanille salée"], "image": "", "available": true },

  { "brand": "Versace", "name": "Eros", "category": "Homme", "description": "Frais et vanillé, entre menthe, pomme verte et fève tonka.", "notes": ["Menthe", "Pomme verte", "Fève tonka"], "image": "", "available": true },
  { "brand": "Versace", "name": "Dylan Blue", "category": "Homme", "description": "Aromatique frais et boisé, aux accents minéraux.", "notes": ["Bergamote", "Feuille de figuier", "Encens"], "image": "", "available": true },
  { "brand": "Versace", "name": "Bright Crystal", "category": "Femme", "description": "Floral fruité frais et lumineux.", "notes": ["Yuzu", "Pivoine", "Musc"], "image": "", "available": true },

  { "brand": "Lancôme", "name": "Idôle", "category": "Femme", "description": "Floral chypré moderne et lumineux.", "notes": ["Rose", "Jasmin", "Musc blanc"], "image": "", "available": true },
  { "brand": "Lancôme", "name": "Trésor", "category": "Femme", "description": "Floral fruité poudré, un classique.", "notes": ["Pêche", "Rose", "Vanille"], "image": "", "available": true },

  { "brand": "Guerlain", "name": "Shalimar Eau de Parfum", "category": "Femme", "description": "Oriental vanillé légendaire.", "notes": ["Bergamote", "Iris", "Vanille"], "image": "", "available": true },
  { "brand": "Guerlain", "name": "Mon Guerlain", "category": "Femme", "description": "Ambré à la lavande et à la vanille, doux et sensuel.", "notes": ["Lavande", "Vanille", "Jasmin sambac"], "image": "", "available": true },
  { "brand": "Guerlain", "name": "L'Homme Idéal Eau de Parfum", "category": "Homme", "description": "Ambré boisé à l'amande et au cuir.", "notes": ["Amande", "Cuir", "Fève tonka"], "image": "", "available": true },

  { "brand": "Hermès", "name": "Terre d'Hermès", "category": "Homme", "description": "Boisé minéral, entre agrumes et vétiver.", "notes": ["Orange", "Pierre à fusil", "Vétiver"], "image": "", "available": true },
  { "brand": "Hermès", "name": "Twilly d'Hermès", "category": "Femme", "description": "Floral épicé, pétillant et espiègle.", "notes": ["Gingembre", "Tubéreuse", "Santal"], "image": "", "available": true },

  { "brand": "Jean Paul Gaultier", "name": "Le Male", "category": "Homme", "description": "Aromatique vanillé iconique, frais et doux.", "notes": ["Lavande", "Menthe", "Vanille"], "image": "", "available": true },
  { "brand": "Jean Paul Gaultier", "name": "Le Male Elixir", "category": "Homme", "description": "Version ambrée et miellée, intense.", "notes": ["Lavande", "Miel", "Fève tonka"], "image": "", "available": true },
  { "brand": "Jean Paul Gaultier", "name": "Le Beau", "category": "Homme", "description": "Boisé frais à la noix de coco.", "notes": ["Bergamote", "Noix de coco", "Fève tonka"], "image": "", "available": true },
  { "brand": "Jean Paul Gaultier", "name": "Scandal", "category": "Femme", "description": "Chypre miellé, gourmand et audacieux.", "notes": ["Miel", "Gardénia", "Patchouli"], "image": "", "available": true },
  { "brand": "Jean Paul Gaultier", "name": "La Belle", "category": "Femme", "description": "Gourmand fruité à la poire et à la vanille.", "notes": ["Poire", "Vanille", "Fève tonka"], "image": "", "available": true },

  { "brand": "Givenchy", "name": "L'Interdit Eau de Parfum", "category": "Femme", "description": "Floral blanc sur un fond sombre et boisé.", "notes": ["Fleur d'oranger", "Tubéreuse", "Patchouli"], "image": "", "available": true },
  { "brand": "Givenchy", "name": "Gentleman Eau de Parfum", "category": "Homme", "description": "Iris et lavande sur un fond vanillé.", "notes": ["Iris", "Lavande", "Vanille"], "image": "", "available": true },

  { "brand": "Prada", "name": "Luna Rossa Carbon", "category": "Homme", "description": "Aromatique frais aux reflets métalliques.", "notes": ["Bergamote", "Lavande", "Ambroxan"], "image": "", "available": true },
  { "brand": "Prada", "name": "L'Homme", "category": "Homme", "description": "Iris propre et élégant.", "notes": ["Iris", "Néroli", "Ambre"], "image": "", "available": true },
  { "brand": "Prada", "name": "Paradoxe", "category": "Femme", "description": "Floral ambré moderne.", "notes": ["Néroli", "Ambre", "Musc blanc"], "image": "", "available": true },

  { "brand": "Carolina Herrera", "name": "Bad Boy", "category": "Homme", "description": "Boisé épicé, entre poivre, sauge et fève tonka.", "notes": ["Poivre", "Sauge", "Fève tonka"], "image": "", "available": true },
  { "brand": "Carolina Herrera", "name": "212 VIP Black", "category": "Homme", "description": "Aromatique sombre, absinthe et vanille noire.", "notes": ["Absinthe", "Lavande", "Vanille noire"], "image": "", "available": true },

  { "brand": "Valentino", "name": "Donna Born in Roma", "category": "Femme", "description": "Floral boisé vanillé.", "notes": ["Jasmin", "Vanille bourbon", "Bois de cachemire"], "image": "", "available": true },
  { "brand": "Valentino", "name": "Uomo Born in Roma", "category": "Homme", "description": "Boisé aromatique frais et minéral.", "notes": ["Sel minéral", "Sauge", "Vétiver"], "image": "", "available": true },

  { "brand": "Gucci", "name": "Bloom", "category": "Femme", "description": "Bouquet de fleurs blanches.", "notes": ["Tubéreuse", "Jasmin", "Liane de Rangoon"], "image": "", "available": true },
  { "brand": "Gucci", "name": "Flora Gorgeous Gardenia", "category": "Femme", "description": "Floral fruité et gourmand.", "notes": ["Poire", "Gardénia", "Sucre brun"], "image": "", "available": true },

  { "brand": "Burberry", "name": "Her", "category": "Femme", "description": "Fruité gourmand aux fruits rouges.", "notes": ["Fraise", "Framboise", "Musc"], "image": "", "available": true },
  { "brand": "Burberry", "name": "Hero", "category": "Homme", "description": "Boisé frais autour du cèdre.", "notes": ["Bergamote", "Genévrier", "Cèdre"], "image": "", "available": true },

  { "brand": "Viktor&Rolf", "name": "Flowerbomb", "category": "Femme", "description": "Floral gourmand et généreux.", "notes": ["Jasmin", "Rose", "Patchouli"], "image": "", "available": true },
  { "brand": "Viktor&Rolf", "name": "Spicebomb Extreme", "category": "Homme", "description": "Épicé ambré, intense et chaleureux.", "notes": ["Tabac", "Cannelle", "Vanille"], "image": "", "available": true },

  { "brand": "Mugler", "name": "Alien", "category": "Femme", "description": "Floral boisé ambré, solaire et mystérieux.", "notes": ["Jasmin sambac", "Bois de cachemire", "Ambre blanc"], "image": "", "available": true },
  { "brand": "Mugler", "name": "Angel", "category": "Femme", "description": "Le gourmand originel, praliné et patchouli.", "notes": ["Praliné", "Patchouli", "Vanille"], "image": "", "available": true },

  { "brand": "Tom Ford", "name": "Black Orchid", "category": "Femme", "description": "Floral sombre et opulent.", "notes": ["Truffe noire", "Orchidée noire", "Patchouli"], "image": "", "available": true },
  { "brand": "Tom Ford", "name": "Oud Wood", "category": "Unisexe", "description": "Boisé oud doux et raffiné.", "notes": ["Oud", "Bois de rose", "Cardamome"], "image": "", "available": true },
  { "brand": "Tom Ford", "name": "Lost Cherry", "category": "Unisexe", "description": "Gourmand fruité à la cerise noire.", "notes": ["Cerise noire", "Amande amère", "Fève tonka"], "image": "", "available": true },

  { "brand": "Maison Francis Kurkdjian", "name": "Grand Soir", "category": "Unisexe", "description": "Ambré chaud et lumineux.", "notes": ["Ambre", "Benjoin", "Vanille"], "image": "", "available": true },
  { "brand": "Parfums de Marly", "name": "Layton", "category": "Homme", "description": "Ambré floral à la pomme et à la vanille.", "notes": ["Pomme", "Lavande", "Vanille"], "image": "", "available": true },
  { "brand": "Parfums de Marly", "name": "Delina", "category": "Femme", "description": "Floral fruité autour d'une rose turque.", "notes": ["Litchi", "Rhubarbe", "Rose"], "image": "", "available": true },
  { "brand": "Initio", "name": "Oud for Greatness", "category": "Unisexe", "description": "Oud épicé et puissant.", "notes": ["Oud", "Safran", "Lavande"], "image": "", "available": true },
  { "brand": "Kilian", "name": "Angels' Share", "category": "Unisexe", "description": "Ambré gourmand au cognac.", "notes": ["Cognac", "Cannelle", "Fève tonka"], "image": "", "available": true },
  { "brand": "Byredo", "name": "Gypsy Water", "category": "Unisexe", "description": "Boisé aromatique doux.", "notes": ["Bergamote", "Pin", "Vanille"], "image": "", "available": true },
  { "brand": "Le Labo", "name": "Santal 33", "category": "Unisexe", "description": "Boisé cuiré, devenu culte.", "notes": ["Santal", "Cardamome", "Cuir"], "image": "", "available": true },
  { "brand": "Jo Malone London", "name": "Wood Sage & Sea Salt", "category": "Unisexe", "description": "Boisé aromatique et minéral.", "notes": ["Sauge", "Sel marin", "Ambrette"], "image": "", "available": true },
  { "brand": "Maison Margiela", "name": "Replica By the Fireplace", "category": "Unisexe", "description": "Boisé fumé et chaleureux.", "notes": ["Marron grillé", "Clou de girofle", "Vanille"], "image": "", "available": true },
  { "brand": "Xerjoff", "name": "Erba Pura", "category": "Unisexe", "description": "Fruité ambré lumineux, avec une vanille de Madagascar.", "notes": ["Agrumes de Sicile", "Fruits", "Vanille de Madagascar"], "image": "", "available": true },
  { "brand": "Kayali", "name": "Vanilla 28", "category": "Femme", "description": "Gourmand vanillé.", "notes": ["Vanille", "Sucre brun", "Fève tonka"], "image": "", "available": true },
  { "brand": "Montale", "name": "Intense Café", "category": "Unisexe", "description": "Ambré floral au café.", "notes": ["Café", "Rose", "Vanille"], "image": "", "available": true },
  { "brand": "Mancera", "name": "Cedrat Boise", "category": "Unisexe", "description": "Boisé fruité et frais.", "notes": ["Cédrat", "Cassis", "Cuir"], "image": "", "available": true },
  { "brand": "Nishane", "name": "Hacivat", "category": "Unisexe", "description": "Chypre fruité frais.", "notes": ["Ananas", "Pamplemousse", "Mousse de chêne"], "image": "", "available": true },

  { "brand": "Lattafa", "name": "Asad", "category": "Homme", "description": "Ambré épicé intense.", "notes": ["Poivre noir", "Tabac", "Vanille"], "image": "", "available": true },
  { "brand": "Lattafa", "name": "Yara", "category": "Femme", "description": "Gourmand fruité et doux.", "notes": ["Orchidée", "Fruits tropicaux", "Vanille"], "image": "", "available": true },
  { "brand": "Armaf", "name": "Club de Nuit Intense Man", "category": "Homme", "description": "Fruité boisé et fumé.", "notes": ["Citron", "Ananas", "Bouleau"], "image": "", "available": true },
  { "brand": "Afnan", "name": "9pm", "category": "Homme", "description": "Ambré aromatique et gourmand.", "notes": ["Pomme", "Lavande", "Vanille"], "image": "", "available": true },
  { "brand": "Rasasi", "name": "Hawas for Him", "category": "Homme", "description": "Aquatique fruité.", "notes": ["Pomme", "Notes marines", "Ambre gris"], "image": "", "available": true },

  { "brand": "Hugo Boss", "name": "Boss Bottled", "category": "Homme", "description": "Boisé épicé classique.", "notes": ["Pomme", "Cannelle", "Santal"], "image": "", "available": true },
  { "brand": "Davidoff", "name": "Cool Water", "category": "Homme", "description": "Aquatique aromatique classique.", "notes": ["Menthe", "Lavande", "Notes marines"], "image": "", "available": true },
  { "brand": "Azzaro", "name": "The Most Wanted Eau de Parfum Intense", "category": "Homme", "description": "Ambré épicé et gourmand.", "notes": ["Cardamome", "Caramel", "Bois ambré"], "image": "", "available": true },
  { "brand": "Montblanc", "name": "Explorer", "category": "Homme", "description": "Boisé aromatique.", "notes": ["Bergamote", "Vétiver", "Patchouli"], "image": "", "available": true },
  { "brand": "Issey Miyake", "name": "L'Eau d'Issey pour Homme", "category": "Homme", "description": "Boisé aquatique frais.", "notes": ["Yuzu", "Muscade", "Bois"], "image": "", "available": true },

  { "brand": "Dolce&Gabbana", "name": "Light Blue", "category": "Femme", "description": "Floral fruité frais et méditerranéen.", "notes": ["Citron de Sicile", "Pomme", "Cèdre"], "image": "", "available": true },
  { "brand": "Narciso Rodriguez", "name": "For Her Eau de Toilette", "category": "Femme", "description": "Musqué floral, doux et sensuel.", "notes": ["Musc", "Fleur d'oranger", "Osmanthus"], "image": "", "available": true },
  { "brand": "Kenzo", "name": "Flower by Kenzo", "category": "Femme", "description": "Floral poudré.", "notes": ["Violette", "Rose", "Vanille"], "image": "", "available": true },
  { "brand": "Chloé", "name": "Chloé Eau de Parfum", "category": "Femme", "description": "Floral rosé et frais.", "notes": ["Pivoine", "Rose", "Litchi"], "image": "", "available": true },
  { "brand": "Marc Jacobs", "name": "Daisy", "category": "Femme", "description": "Floral fruité frais.", "notes": ["Fraise", "Violette", "Jasmin"], "image": "", "available": true },
  { "brand": "Ariana Grande", "name": "Cloud", "category": "Femme", "description": "Gourmand aérien.", "notes": ["Lavande", "Praliné", "Musc"], "image": "", "available": true },
  { "brand": "Calvin Klein", "name": "CK One", "category": "Unisexe", "description": "Frais hespéridé, à partager.", "notes": ["Bergamote", "Thé vert", "Musc"], "image": "", "available": true }
];
