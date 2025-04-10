// utils/preloadData.js

/**
 * Précharge les clés (produits) associées à une marque spécifique depuis l'API.
 *
 * @param {string} brandName - Le nom de la marque pour laquelle récupérer les clés.
 * @returns {Promise<Array>} - Une promesse qui se résout avec un tableau de clés ou, en cas d'erreur, un tableau vide.
 */
export const preloadKeysData = async (brandName) => {
  if (!brandName) {
    console.error("Le nom de la marque est requis pour précharger les données.");
    return [];
  }
  
  const baseUrl = 'https://cl-back.onrender.com';
  const endpoint = `/produit/cles?marque=${encodeURIComponent(brandName)}`;
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Erreur: Le serveur a renvoyé le statut ${response.status} pour l'URL : ${url}`);
      throw new Error('Erreur lors du préchargement des clés');
    }
    const keys = await response.json();
    return keys;
  } catch (error) {
    console.error("Erreur dans preloadKeysData:", error);
    return [];
  }
};
