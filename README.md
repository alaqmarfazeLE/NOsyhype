# NOSY HYPE — *The art of fragrance.*

Site vitrine et catalogue de parfums de luxe pour **NOSY HYPE** : commande sur WhatsApp,
demandes privées, acompte de 50 % par MVOLA.

Site statique (HTML / CSS / JavaScript), sans dépendance ni étape de compilation : il suffit
d'ouvrir `index.html` ou de l'héberger tel quel (GitHub Pages, Netlify, Vercel, un hébergeur classique…).

## Modifier le site

Tout se règle dans **deux fichiers** :

| Fichier | Contenu |
| --- | --- |
| `assets/js/config.js` | Numéro WhatsApp, e-mail, numéro MVOLA, pourcentage d'acompte, devise |
| `assets/js/products.js` | Le catalogue : nom, prix, catégorie, description, notes, photo, disponibilité |

### Coordonnées (`config.js`)

- `whatsappNumber` : numéro au format international, chiffres uniquement (ex. `261380582719`).
  **À vérifier** : le site utilise par défaut le numéro MVOLA (038 05 827 19) comme numéro WhatsApp.
- `whatsappDisplay` : le même numéro tel qu'il s'affiche.
- `email`, `mvolaNumber`, `depositPercent` (50), `currency` (Ar).

### Parfums (`products.js`)

Les 9 parfums fournis sont des **exemples fictifs** (noms, prix et visuels de démonstration).
Remplacez-les par votre stock réel :

```js
{
  "name": "Nom du parfum",
  "price": "185 000 Ar",
  "category": "Femme",          // crée automatiquement le filtre
  "description": "Une à trois phrases.",
  "notes": ["Note 1", "Note 2", "Note 3"],
  "image": "assets/img/perfumes/ma-photo.webp",
  "available": true             // false = « Sur demande »
}
```

- Le **premier parfum** de la liste est mis en avant dans l'accueil (« Signature »).
- Le prix sert au calcul automatique de l'acompte (50 %).
- Photos : format portrait **4:5** conseillé (ex. 1200 × 1500 px), en `.webp` ou `.jpg`.

### Visuels

Les images de `assets/img/` sont des rendus 3D de démonstration (flacons fictifs).
Pour les remplacer, gardez les mêmes noms de fichiers ou modifiez les chemins :

- `hero-wide.webp` (2400 × 1350) et `hero-tall.webp` (1080 × 1920, mobile) : image d'accueil
- `prive.webp` (1200 × 1500) : section « Demande privée »
- `atelier.webp` (1400 × 1000) : section « À propos »
- `og-image.jpg` (1200 × 630) : aperçu lors du partage du lien. Une fois le site en ligne,
  remplacez `assets/img/og-image.jpg` dans `index.html` par l'adresse complète
  (ex. `https://votre-domaine.com/assets/img/og-image.jpg`).

## Paiement

Le site **n'encaisse aucun paiement**. Il explique la marche à suivre :

1. Le client choisit un parfum (ou demande un parfum précis) et écrit sur WhatsApp.
2. NOSY HYPE confirme la disponibilité et le montant total.
3. Le client paie **50 % d'acompte par MVOLA au 038 05 827 19**.
4. Le client envoie la **preuve de paiement sur WhatsApp** ; la commande est confirmée après vérification.
5. Le solde (50 %) est réglé à la remise du parfum.

## Fonctionnalités

- Écran de chargement avec révélation du logo doré, puis entrée animée de l'accueil
- Navigation fixe avec indicateur de section active, menu mobile plein écran animé
- Catalogue filtrable ; chaque fiche parfum s'ouvre avec une transition « cinéma » (image qui s'agrandit, fond flouté)
- Navigation entre parfums dans la fiche (flèches, clavier ← →, glisser sur mobile), lien partageable `?parfum=nom-du-parfum`
- « Ma sélection » : plusieurs parfums envoyés en un seul message WhatsApp, avec total et acompte calculés
- Calculateur d'acompte, bouton « Copier le numéro MVOLA », formulaire de contact qui prépare le message WhatsApp
- Animations au défilement (apparition, parallaxe, zoom), reflets dorés, halo du curseur (ordinateur)
- Accessible : navigation clavier, focus visible, respect du réglage « réduire les animations »
- Polices hébergées localement (Cormorant Garamond, Manrope — licence SIL OFL, voir `assets/fonts/`)
