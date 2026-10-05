/* Univers olfactifs (flacons 3D de l'accueil) et gammes.
   Les parfums eux-mêmes sont dans js/parfums.js.
   Familles : une couleur chacune (lueurs, liquide des flacons 3D) ; « img » = photo affichée si la 3D est indisponible.
   Gammes : cartes de la rubrique « Nos gammes ». Photos : dossier assets/parfums/ (flacons détourés). */
window.CATALOGUE = (function () {
  var P = 'assets/parfums/';
  return {
    familles: [
      { key: 'Frais', n: '01', pluriel: 'frais', color: '#21D1CA', img: P + 'eros-hd.webp' },
      { key: 'Floral', n: '02', pluriel: 'floraux', color: '#F77CB0', img: P + 'valentino-hd.webp' },
      { key: 'Oriental', n: '03', pluriel: 'orientaux', color: '#F5AE4B', img: P + 'layton-hd.webp' },
      { key: 'Boisé', n: '04', pluriel: 'boisés', color: '#67D283', img: P + 'paradigme-hd.webp' },
      { key: 'Gourmand', n: '05', pluriel: 'gourmands', color: '#F77C56', img: P + 'blackopium-hd.webp' }
    ],
    gammes: [
      { key: 'Essentiels', tag: 'Petits prix', color: '#21D1CA', img: P + 'blackopium-hd.webp', label: 'Black Opium' },
      { key: 'Signature', tag: 'Best-sellers', color: '#F77CB0', img: P + 'valuomo-hd.webp', label: 'Valentino' },
      { key: 'Prestige', tag: 'Haut de gamme', color: '#F5AE4B', img: P + 'layton-hd.webp', label: 'Parfums de Marly' }
    ]
  };
})();
