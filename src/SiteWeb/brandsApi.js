// Préchargement des marques
let preloadedBrands = null;
let preloadedBrandsPromise = null;

export function preloadBrandsData() {
  if (!preloadedBrandsPromise) {
    preloadedBrandsPromise = fetch('https://cl-back.onrender.com/brands')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des marques');
        }
        return res.json();
      })
      .then((data) => {
        preloadedBrands = data;
        return data;
      });
  }
  return preloadedBrandsPromise;
}

// Préchargement des clés pour une marque donnée
let preloadedKeys = {};
let preloadedKeysPromises = {};

export function preloadKeysData(brand) {
  if (!preloadedKeysPromises[brand]) {
    preloadedKeysPromises[brand] = fetch(
      `https://cl-back.onrender.com/produit/cles?marque=${encodeURIComponent(brand)}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur lors de la récupération des clés pour ${brand}`);
        }
        return res.json();
      })
      .then((data) => {
        preloadedKeys[brand] = data;
        return data;
      });
  }
  return preloadedKeysPromises[brand];
}
