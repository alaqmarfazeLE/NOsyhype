# NOSY HYPE — *The art of fragrance.*

Site vitrine et catalogue de parfums pour **NOSY HYPE** : commande sur WhatsApp,
demandes privées, acompte de 50 % par MVOLA, livraison partout à Madagascar.

Site statique (HTML / CSS / JavaScript), sans étape de compilation : il suffit
d'ouvrir `index.html` ou de l'héberger tel quel (GitHub Pages, Netlify, Vercel, un hébergeur classique…).

## Modifier le site

Tout se règle dans **trois fichiers** :

| Fichier | Contenu |
| --- | --- |
| `assets/js/config.js` | WhatsApp, Instagram, e-mail, numéro MVOLA, pourcentage d'acompte |
| `assets/js/products.js` | Le catalogue : marque, nom, catégorie, description, notes, photo, disponibilité |
| `assets/js/reviews.js` | Les avis clients |

### Coordonnées (`config.js`)

- `whatsappNumber` : numéro au format international, chiffres uniquement (ex. `261380582719`).
  **À vérifier** : le site utilise par défaut le numéro MVOLA (038 05 827 19) comme numéro WhatsApp.
- `instagramUrl`, `instagramHandle` : `https://www.instagram.com/nosy_hype/`, `@nosy_hype`.
- `email`, `mvolaNumber`, `depositPercent` (50), `currency` (Ar).

### Parfums (`products.js`)

Le catalogue contient 99 parfums connus. **Les prix ne sont pas affichés** : ils sont
communiqués sur WhatsApp.

```js
{
  "brand": "Dior",
  "name": "Sauvage Eau de Toilette",
  "category": "Homme",            // crée automatiquement le filtre
  "description": "Une phrase.",
  "notes": ["Bergamote", "Poivre", "Ambroxan"],
  "image": "",                    // chemin de la vraie photo, ex. "assets/img/perfumes/dior-sauvage-eau-de-toilette.jpg"
  "available": true,              // false = « Sur demande »
  "vedette": true                 // facultatif : apparaît dans le showroom 3D
}
```

- **Photos** : tant que `image` est vide, une carte « Photo à venir » s'affiche.
  La liste des noms de fichiers conseillés pour chaque parfum est dans
  `assets/img/perfumes/LISEZMOI.md`. Utilisez vos propres photos ou les visuels officiels
  de la marque ou du fournisseur.
- Le showroom 3D montre les parfums marqués `"vedette": true` (12 conseillés).

### Avis clients (`reviews.js`)

Les 6 avis fournis sont des **exemples** (étiquette « Exemple » visible sur le site).
Remplacez-les par de vrais avis de vos clients, avec leur accord, puis supprimez la ligne
`"exemple": true`.

## Paiement

Le site **n'encaisse aucun paiement**. Il explique la marche à suivre :

1. Le client choisit un parfum (ou demande un parfum précis) et écrit sur WhatsApp.
2. NOSY HYPE confirme la disponibilité, le prix et les frais de livraison.
3. Le client paie **50 % d'acompte par MVOLA au 038 05 827 19**.
4. Le client envoie la **preuve de paiement sur WhatsApp** ; la commande est confirmée après vérification.
5. Le solde (50 %) est réglé à la remise du parfum.

## Fonctionnalités

- Écran de chargement avec révélation du logo doré
- Accueil avec un **flacon NOSY HYPE en 3D temps réel** (three.js) qui tourne, à faire pivoter
  au doigt ou à la souris ; la qualité s'adapte automatiquement aux téléphones moins puissants
- **Showroom 3D** : un carrousel circulaire des parfums en vedette, à faire tourner
- Catalogue avec recherche (nom, marque ou note), filtres Femme / Homme / Unisexe et « Voir plus »
- Fiche parfum avec ouverture animée, carte flottante en 3D, navigation entre parfums
  (flèches, clavier ← →, glisser sur mobile) et lien partageable `?parfum=nom-du-parfum`
- « Ma sélection » : plusieurs parfums envoyés en un seul message WhatsApp
- **Livraison partout à Madagascar** avec une carte de l'île (données Natural Earth)
- Avis clients, liens Instagram, calculateur d'acompte, copie du numéro MVOLA,
  formulaire de contact qui prépare le message WhatsApp
- Accessible : navigation clavier, focus visible, respect du réglage « réduire les animations »

## Crédits

- [three.js](https://threejs.org) (licence MIT, `assets/vendor/`)
- Polices Cormorant Garamond, Manrope et IBM Plex Mono (licence SIL OFL, `assets/fonts/`)
- Contour de Madagascar : [Natural Earth](https://www.naturalearthdata.com) (domaine public)
