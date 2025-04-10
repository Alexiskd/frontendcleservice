// @utils/preloadData.js

/**
 * Précharge les clés (produits) associées à une marque spécifique depuis l'API.
 *
 * @param {string} brandName - Le nom de la marque pour laquelle récupérer les clés.
 * @returns {Promise<Array>} - Une promesse qui se résout avec un tableau de clés ou, en cas d'erreur, un tableau vide.
 */
export const preloadKeysData = async (brandName) => {
  // Vérification que la marque a été spécifiée
  if (!brandName) {
    console.error("Le nom de la marque est requis pour précharger les données.");
    return [];
  }

  // Déclaration d'une URL de base configurable (vous pouvez en faire une constante d'environnement par exemple)
  const baseUrl = 'https://cl-back.onrender.com';
  // Construction de l'endpoint à partir du nom de la marque
  const endpoint = `/produit/cles?marque=${encodeURIComponent(brandName)}`;
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url);
    // Vérification que la réponse du serveur est correcte
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
