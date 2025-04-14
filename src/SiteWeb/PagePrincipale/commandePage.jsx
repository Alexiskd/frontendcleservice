import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CommandePage = () => {
  const [keyData, setKeyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paramètres de la requête initiale
  const marque = 'abus_1_reproduction_cle';
  const indexParam = 7;
  // Paramètre de fallback (nom de la clé) si la première requête échoue
  const nomKeyFallback = 'Clé-Abus-XP-1';

  useEffect(() => {
    async function fetchKeyByBrandIndex() {
      try {
        // Essai de récupérer la clé par marque et index
        const response = await axios.get(
          `https://cl-back.onrender.com/produit/cles/brand/${encodeURIComponent(marque)}/index/${indexParam}`
        );
        setKeyData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération par marque et index:', err);
        // Si le endpoint par marque/index ne renvoie rien, on passe au fallback
        try {
          const responseFallback = await axios.get(
            `https://cl-back.onrender.com/produit/cles/closest`,
            { params: { nom: nomKeyFallback } }
          );
          setKeyData(responseFallback.data);
        } catch (fallbackErr) {
          console.error('Fallback vers /cles/closest échoué:', fallbackErr);
          setError(fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchKeyByBrandIndex();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error.message}</div>;
  }

  return (
    <div>
      <h1>Commande Page</h1>
      {keyData ? (
        <div>
          <h2>Détails de la clé :</h2>
          <p><strong>Nom :</strong> {keyData.nom}</p>
          <p><strong>Marque :</strong> {keyData.marque}</p>
          <p><strong>Prix :</strong> {keyData.prix}</p>
          {/* Vous pouvez ajouter ici d'autres informations issues de l'objet keyData */}
        </div>
      ) : (
        <div>Aucune clé trouvée.</div>
      )}
    </div>
  );
};

export default CommandePage;

