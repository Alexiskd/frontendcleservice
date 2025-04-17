// src/AppAdmin/commande.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  const { brand: brandName, name: articleName } = useParams();
  const decodedArticleName = articleName?.replace(/-/g, ' ') || '';

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Décode une image Base64 ou renvoie directement si déjà Data URI
  const decodeImage = (img) =>
    img
      ? img.startsWith('data:')
        ? img
        : `data:image/jpeg;base64,${img}`
      : '';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!decodedArticleName.trim()) {
          throw new Error("Le nom de l'article est vide après décodage.");
        }

        // Essai sur l'endpoint best-by-name
        const urlBest = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let res = await fetch(urlBest);

        // Si 404 (pas trouvé), bascule sur closest-match
        if (res.status === 404) {
          const urlFallback = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          res = await fetch(urlFallback);
          if (!res.ok) {
            throw new Error(`Fallback closest-match échoué : ${await res.text()}`);
          }
        } else if (!res.ok) {
          throw new Error(`Best-by-name échoué : ${await res.text()}`);
        }

        const data = await res.json();

        // Vérifier la marque
        if (data.marque && data.marque.toLowerCase() !== brandName.toLowerCase()) {
          throw new Error("La marque de l'article ne correspond pas.");
        }

        setArticle(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [brandName, decodedArticleName]);

  if (loading) return <div>Chargement du produit...</div>;
  if (error)   return <div>Erreur : {error}</div>;

  return (
    <div>
      <h1>{article.nom}</h1>
      <p>Marque : {article.marque}</p>
      <p>Prix : {article.prix} €</p>
      {article.imageBase64 && (
        <img
          src={decodeImage(article.imageBase64)}
          alt={article.nom}
          style={{ maxWidth: '200px', marginTop: '1rem' }}
        />
      )}
    </div>
  );
};

export default CommandePage;

