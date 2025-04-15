import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CommandePage = () => {
  const { marque, index, produitnom } = useParams();
  console.log('Paramètres extraits :', { marque, index, produitnom });
  
  const [keyData, setKeyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchKey() {
      if (!marque || !index) {
        setError(new Error("Les paramètres 'marque' ou 'index' sont manquants."));
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `https://cl-back.onrender.com/produit/cles/brand/${encodeURIComponent(marque)}/index/${index}`
        );
        setKeyData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération par marque et index:', err);
        try {
          const fallbackResponse = await axios.get(
            'https://cl-back.onrender.com/produit/cles/closest',
            { params: { nom: produitnom } }  // Assurez-vous que produitnom est défini
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
  }, [marque, index, produitnom]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;
  if (!keyData) return <div>Aucune clé trouvée.</div>;

  return (
    <div>
      <h1>Commande Page</h1>
      <h2>Détails de la clé :</h2>
      <p><strong>Nom :</strong> {keyData.nom}</p>
      <p><strong>Marque :</strong> {keyData.marque}</p>
      <p><strong>Prix :</strong> {keyData.prix}</p>
    </div>
  );
};

export default CommandePage;
