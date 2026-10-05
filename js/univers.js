/* Gammes : cartes de la rubrique « Nos gammes ». Photos : dossier assets/parfums/ (flacons détourés).
   Les parfums sont dans js/parfums.js (catalogue de la boutique et flacons de l'accueil). */
window.CATALOGUE = (function () {
  var P = 'assets/parfums/';
  return {
    gammes: [
      { key: 'Essentiels', tag: 'Petits prix', color: '#21D1CA', img: P + 'blackopium-hd.webp', label: 'Black Opium' },
      { key: 'Signature', tag: 'Best-sellers', color: '#F77CB0', img: P + 'valuomo-hd.webp', label: 'Valentino' },
      { key: 'Prestige', tag: 'Haut de gamme', color: '#F5AE4B', img: P + 'layton-hd.webp', label: 'Parfums de Marly' }
    ]
  };
})();
