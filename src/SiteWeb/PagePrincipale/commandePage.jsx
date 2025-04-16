import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  const { brand: brandName, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);

        let endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpoint);

        if (!response.ok) {
          const errorText = await response.text();
          if (errorText.includes("Produit introuvable")) {
            endpoint = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
            response = await fetch(endpoint);
          } else {
            throw new Error("Erreur lors du chargement de l'article.");
          }
        }

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de l'article.");
        }

        const data = await response.json();

        if (data && data.marque && data.marque.toLowerCase() !== brandName.toLowerCase()) {
          throw new Error("La marque de l'article ne correspond pas.");
        }

        setArticle(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du produit:", err);
        setErrorArticle(err.message || "Erreur inconnue");
      } finally {
        setLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [brandName, decodedArticleName]);

  if (loadingArticle) return <div>Chargement...</div>;
  if (errorArticle) return <div>Erreur : {errorArticle}</div>;

  return (
    <div>
      <h1>{article.nom}</h1>
      <p>Marque : {article.marque}</p>
      <p>Prix : {article.prix} €</p>
    </div>
  );
};

export default CommandePage;
