# Nosy_Hype — *Le luxe à prix doux.*

Site vitrine et boutique de la parfumerie **Nosy_Hype** : parfums homme, femme et mixte de toutes gammes,
prix et disponibilité sur WhatsApp, acompte de 50 % via MVola, livraison partout à Madagascar.

Thème « Noir holographique » (repris du site nosyhype-parfums.netlify.app) : noir profond, or champagne,
et, sur l'accueil, l'anneau de vrais flacons qui tourne. La boutique garde notre catalogue de 151 parfums.

Site statique (HTML / CSS / JavaScript), sans étape de compilation.

## Mise en ligne (Netlify)

Netlify publie la racine du dépôt (`netlify.toml`). Les en-têtes de sécurité et de cache sont dans `_headers`,
la page d'erreur dans `404.html`.

## Modifier le site

| Fichier | Contenu |
| --- | --- |
| `js/config.js` | Nom de la boutique, numéro WhatsApp, numéro MVola, e-mail, Instagram, villes du bandeau « Livraison » |
| `js/parfums.js` | Le catalogue de la boutique (151 parfums, 30 maisons), les flacons qui tournent sur l'accueil (`RING`) et les réglages d'affichage |
| `js/univers.js` | Les 3 gammes de la rubrique « Nos gammes » |
| `index.html` | Tous les textes ; le numéro y apparaît aussi en clair (à changer en même temps que `js/config.js`) |

### Parfums (`js/parfums.js`)

Une ligne par parfum :

```js
P(DI, 'Sauvage', 31861, 'H', 'EDT', 'Bergamote · Poivre · Ambroxan', 'Best-seller'),
//  maison, nom, photo, genre ('H', 'F', 'M' = mixte), concentration, notes, étiquette (facultatif)
```

- **Les prix ne sont pas affichés** : chaque bouton « Demander le prix » ouvre WhatsApp avec le nom du parfum déjà écrit.
- Les filtres par maison se créent tout seuls (une maison avec un seul parfum va dans « Autres maisons »).
- **Photo** : le numéro est celui de la photo du flacon sur Fragrantica (`fimgs.net`). Pour utiliser votre propre photo
  (fond blanc, format portrait), déposez-la dans `assets/parfums/` et remplacez le numéro par son chemin.
  Si une photo ne se charge pas, le monogramme de la maison s'affiche à la place.
- `SITE.catalogueView` : vue à l'ouverture (`'Défilement'` ou `'Grille'`) ; `SITE.scrollSpeed` : vitesse des rangées.

### Flacons de l'accueil (`RING` dans `js/parfums.js`)

L'anneau montre les 10 premiers flacons de la liste `RING` (réglable avec `SITE.ringCount`, de 6 à 12), dans l'ordre.
Chaque flacon utilise une photo **détourée** (fond transparent) : `assets/parfums/flacons/{numéro}.webp`.
Pour en ajouter un, déposez son image détourée puis ajoutez son numéro à `RING`.

### Avis clients

Les trois avis de `index.html` sont des **exemples** (étiquette « Exemple » visible). Remplacez-les par de vrais
avis de vos clients, avec leur accord, puis retirez les étiquettes.

## Paiement

Le site **n'encaisse aucun paiement** : le client demande le prix sur WhatsApp, verse 50 % d'acompte par MVola,
et règle le solde à la livraison.

## Structure

```
index.html, 404.html, favicon.svg, partage.jpg (image de partage)
css/styles.css     thème « Noir holographique »
css/icons.css      icônes (Lucide, WhatsApp)
css/boutique.css   la boutique
js/config.js       coordonnées de la boutique
js/univers.js      gammes
js/parfums.js      catalogue
js/app.js          en-tête, gammes, bandeaux, copie MVola
js/anneau.js       accueil : l'anneau de flacons qui tourne
js/boutique.js     boutique : recherche, filtres, défilement, grille
js/carte.js        carte de Madagascar
assets/fonts/      Noto Serif Display, Sora, DM Mono (licence SIL OFL)
assets/parfums/    flacons détourés des gammes ; flacons/ : ceux de l'anneau de l'accueil
```

## Crédits

- Icônes [Lucide](https://lucide.dev) (ISC) et WhatsApp (Simple Icons, CC0)
- Photos des flacons de la boutique : Fragrantica (`fimgs.net`) — à remplacer par vos photos ou les visuels officiels des marques
- Contour de Madagascar : [Natural Earth](https://www.naturalearthdata.com) (domaine public)
