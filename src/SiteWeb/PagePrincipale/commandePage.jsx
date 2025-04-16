import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  const { brand: brandName, name: articleName } = useParams();

  // Vérification de la présence des paramètres requis
  if (!brandName || !articleName) {
    return <div>Erreur : Paramètre "brand" ou "articleName" manquant dans l'URL.</div>;
  }

  const decodedArticleName = articleName.replace(/-/g, ' ');

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestKey = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!decodedArticleName.trim()) {
          throw new Error("Le nom de l'article est vide après décodage.");
        }

        // Utilisation de la méthode best by name qui correspond à l'endpoint "closest-match"
        const endpoint = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur lors du chargement de la clé (best by name) : ${errorText}`);
        }

        const data = await response.json();

        // Vérification optionnelle de la correspondance de la marque
        if (data && data.marque && data.marque.toLowerCase() !== brandName.toLowerCase()) {
          throw new Error("La marque de l'article ne correspond pas.");
        }
        setArticle(data);
      } catch (err) {
        console.error("Erreur lors de la récupération de la clé :", err);
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchBestKey();
  }, [brandName, decodedArticleName]);

  return (
    <div>
      {loading ? (
        <div>Chargement de la clé...</div>
      ) : error ? (
        <div>Erreur : {error}</div>
      ) : article ? (
        <div>
          <h1>{article.nom}</h1>
          <p>Marque : {article.marque}</p>
          <p>Prix : {article.prix} €</p>
        </div>
      ) : (
        <div>Produit non trouvé.</div>
      )}
    </div>
  );
};

export default CommandePage;
