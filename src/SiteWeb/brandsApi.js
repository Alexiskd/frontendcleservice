// src/api/brandsApi.js

let preloadedBrands = null;
let preloadedBrandsPromise = null;

/**
 * Charge les données des marques.
 */
export async function preloadBrandsData() {
  // Si les marques ont déjà été chargées, on les retourne immédiatement.
  if (preloadedBrands) {
    return preloadedBrands;
  }
  // Si aucun appel n'a encore été lancé, on lance l'appel.
  if (!preloadedBrandsPromise) {
    preloadedBrandsPromise = (async () => {
      const res = await fetch('https://cl-back.onrender.com/brands');
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des marques');
      }
      const data = await res.json();
      preloadedBrands = data;
      return data;
    })().catch((error) => {
      // En cas d'erreur, réinitialiser la promesse pour permettre de retenter l'appel
      preloadedBrandsPromise = null;
      throw error;
    });
  }
  return preloadedBrandsPromise;
}

let preloadedKeys = {};
let preloadedKeysPromises = {};

/**
 * Charge les clés pour une marque donnée.
 *
 * @param {string} brand - Le nom de la marque
 */
export async function preloadKeysData(brand) {
  // Si pour cette marque les clés sont déjà chargées, retourne-les
  if (preloadedKeys[brand]) {
    return preloadedKeys[brand];
  }
  // Lance l'appel si aucune promesse n'existe pour cette marque.
  if (!preloadedKeysPromises[brand]) {
    preloadedKeysPromises[brand] = (async () => {
      const res = await fetch(
        `https://cl-back.onrender.com/produit/cles?marque=${encodeURIComponent(brand)}`
      );
      if (!res.ok) {
        throw new Error(`Erreur lors de la récupération des clés pour ${brand}`);
      }
      const data = await res.json();
      preloadedKeys[brand] = data;
      return data;
    })().catch((error) => {
      preloadedKeysPromises[brand] = null;
      throw error;
    });
  }
  return preloadedKeysPromises[brand];
}
