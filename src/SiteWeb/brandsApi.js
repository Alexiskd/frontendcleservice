// src/api/brandsApi.js

let preloadedBrands = null;
let preloadedBrandsPromise = null;

/**
 * Charge les données des marques.
 */
export async function preloadBrandsData() {
  if (preloadedBrands) {
    return preloadedBrands;
  }
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
 */
export async function preloadKeysData(brand) {
  if (preloadedKeys[brand]) {
    return preloadedKeys[brand];
  }
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
