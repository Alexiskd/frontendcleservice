import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommandePage = () => {
  const [keyData, setKeyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paramètres de requête
  const marque = 'abus_1_reproduction_cle'; // valeur attendue dans la base
  const indexParam = 7; // index de la clé recherchée (la 8ème clé, indexée à partir de 0)
  const fallbackNom = 'Clé-Abus-XP-1'; // nom utilisé en fallback

  useEffect(() => {
    async function fetchKey() {
      try {
        // Essai de récupérer la clé via l'endpoint par marque et index
        const response = await axios.get(
          `https://cl-back.onrender.com/produit/cles/brand/${encodeURIComponent(marque)}/index/${indexParam}`
        );
        setKeyData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération par marque et index:', err);
        // En cas d'erreur, passage au fallback via la recherche par similarité de nom
        try {
          const fallbackResponse = await axios.get(
            'https://cl-back.onrender.com/produit/cles/closest',
            { params: { nom: fallbackNom } }
          );
          setKeyData(fallbackResponse.data);
        } catch (fallbackErr) {
          console.error('Fallback vers /cles/closest échoué:', fallbackErr);
          setError(fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchKey();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error.message}</div>;
  }

  if (!keyData) {
    return <div>Aucune clé trouvée.</div>;
  }

  return (
    <div>
      <h1>Commande Page</h1>
      <h2>Détails de la clé :</h2>
      <p><strong>Nom :</strong> {keyData.nom}</p>
      <p><strong>Marque :</strong> {keyData.marque}</p>
      <p><strong>Prix :</strong> {keyData.prix}</p>
      {/* Vous pouvez ajouter ici d'autres informations issues de l'objet keyData */}
    </div>
  );
};

export default CommandePage;
