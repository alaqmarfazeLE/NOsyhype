# Nosy-Hype — *Faites tourner les têtes.*

Site vitrine et catalogue de la parfumerie **Nosy-Hype** : les grandes maisons, toutes les gammes,
à prix raisonnables. Demande de prix sur WhatsApp, acompte de 50 % via MVola, livraison partout à Madagascar.

Le site reprend la maquette **« Nosy-Hype Futur »** réalisée dans Claude Design (ciel d'aube, nuit étoilée,
polices Cormorant Garamond et Hanken Grotesk).

Site statique (HTML / CSS / JavaScript), sans étape de compilation : il suffit d'ouvrir `index.html`
ou de l'héberger tel quel (GitHub Pages, Netlify, Vercel, un hébergeur classique…).

## Mise en ligne (Netlify)

Le site se publie avec Netlify relié à ce dépôt GitHub : Netlify remet le site en ligne à chaque
modification de la branche choisie lors de la connexion. Les réglages sont dans `netlify.toml`
(aucune compilation, dossier publié : la racine du dépôt).

## Modifier le site

Tout se règle dans **un seul fichier** : `assets/js/catalogue.js`.

| Bloc | Contenu |
| --- | --- |
| `SHOP` | Numéro WhatsApp, numéro MVola, e-mail (mis à jour partout sur le site) |
| `SITE` | Vue du catalogue à l'ouverture (`'Défilement'` ou `'Grille'`), vitesses, nombre de flacons de l'accueil |
| `RING` | Les flacons qui tournent sur l'accueil, dans l'ordre |
| `PERFUMES` | Le catalogue (151 parfums, 30 maisons) |
| `REVIEWS` | Les avis clients (les 3 premiers s'affichent) |

### Numéros (`SHOP`)

```js
const SHOP = {
  whatsapp: '038 08 827 19',
  mvola: '038 08 827 19',
  email: 'alaqmarfazele579@gmail.com',
};
```

Format local (`038 08 827 19`) ou international (`+261 38 08 827 19`) : les liens `wa.me` sont créés automatiquement.

> **À vérifier** : la maquette Claude Design indique **038 08 827 19** ; l'ancienne version du site
> utilisait **038 05 827 19**. Corrigez `SHOP` si besoin, c'est le seul endroit à changer.

### Parfums (`PERFUMES`)

Une ligne par parfum :

```js
P(DI, 'Sauvage', 31861, 'H', 'EDT', 'Bergamote · Poivre · Ambroxan', 'Best-seller'),
//  maison, nom, photo, genre ('H', 'F', 'M' = mixte), concentration, notes, étiquette (facultatif)
```

- **Les prix ne sont pas affichés** : chaque bouton « Demander le prix » ouvre WhatsApp avec le nom du parfum déjà écrit.
- Les filtres par maison se créent tout seuls (une maison avec un seul parfum va dans « Autres maisons »).
- **Photo** : le numéro est celui de la photo du flacon sur Fragrantica (`fimgs.net`). Pour utiliser votre propre photo
  (fond blanc conseillé, format portrait), déposez-la dans `assets/img/perfumes/` et remplacez le numéro par son chemin :
  `P(DI, 'Sauvage', 'assets/img/perfumes/dior-sauvage.jpg', 'H', …)`.
  Si une photo ne se charge pas, le monogramme de la maison s'affiche à la place.

### Flacons de l'accueil (`RING`)

L'anneau utilise des photos **détourées** (fond transparent) rangées dans `assets/img/bottles/{numéro}.webp`.
16 flacons sont fournis : pour en ajouter un, déposez son image détourée puis ajoutez son numéro à `RING`.

### Avis clients (`REVIEWS`)

Les avis fournis sont des **exemples** : une étiquette « Exemple » s'affiche sur le site.
Remplacez-les par de vrais avis de vos clients (avec leur accord), puis supprimez `exemple: true`.

## Paiement

Le site **n'encaisse aucun paiement**. Il explique la marche à suivre :

1. Le client choisit un parfum (ou demande un parfum précis).
2. « Demander le prix » : WhatsApp s'ouvre avec le nom du parfum.
3. Le client verse **50 % d'acompte via MVola** (bouton « Copier le numéro »).
4. Nosy-Hype livre partout à Madagascar.

## Fonctionnalités

- Accueil : **anneau de vrais flacons qui tourne** (à faire glisser au doigt ou à la souris, flèches, clavier),
  carte du flacon de face avec « Demander le prix »
- Catalogue : recherche (nom, maison ou note), filtres par maison et par genre, deux vues
  (**défilement continu** par maison, ou **grille**), « Afficher plus », demande d'un parfum absent du catalogue
- Livraison : **carte animée de Madagascar** (13 villes), message WhatsApp pré-rempli avec votre ville
- Commander : 4 étapes, numéro MVola à copier
- Avis clients, contact, bouton WhatsApp flottant
- Responsive (téléphone → grand écran), navigation clavier, respect du réglage « réduire les animations »

## Structure

```
index.html
assets/css/styles.css
assets/js/catalogue.js     réglages, parfums, avis
assets/js/madagascar.js    contour de l'île et villes
assets/js/main.js          interactions
assets/img/bottles/        flacons détourés de l'accueil
assets/fonts/              polices (licence SIL OFL)
```

## Crédits

- Photos de fond : [Pexels](https://www.pexels.com) (licence Pexels, chargées depuis `images.pexels.com`)
- Photos des flacons du catalogue : Fragrantica (`fimgs.net`) — à remplacer par vos photos ou les visuels officiels des marques
- Contour de Madagascar : [Natural Earth](https://www.naturalearthdata.com) (domaine public)
- Polices Cormorant Garamond et Hanken Grotesk (licence SIL OFL, `assets/fonts/`)
