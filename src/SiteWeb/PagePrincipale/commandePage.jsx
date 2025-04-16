import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  const { brand: brandName, name: articleName } = useParams();

  // Vérification de la présence des paramètres requis
  if (!brandName || !articleName) {
    return <div>Erreur : Paramètre "brand" ou "articleName" manquant dans l'URL.</div>;
  }

  // Décodage du nom (remplacement des tirets par des espaces)
  const decodedArticleName = articleName.replace(/-/g, ' ');

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);

        if (!decodedArticleName.trim()) {
          throw new Error("Le nom de l'article est vide après décodage.");
        }

        // Tentative d'appel à l'endpoint best-by-name
        const endpointBestByName = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpointBestByName);

        // En cas d'erreur, on vérifie si c'est un 404 pour effectuer un fallback vers closest-match
        if (!response.ok) {
          if (response.status === 404) {
            console.warn("best-by-name retourne 404, utilisation du fallback closest-match.");
            const endpointClosestMatch = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
            response = await fetch(endpointClosestMatch);
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Erreur lors du chargement des produits via closest-match : ${errorText}`);
            }
          } else {
            const errorText = await response.text();
            throw new Error(`Erreur lors du chargement du produit via best-by-name : ${errorText}`);
          }
        }

        const product = await response.json();

        // Vérification optionnelle : s'assurer que la marque du produit correspond à celle de l'URL
        if (product && product.marque && product.marque.toLowerCase() !== brandName.toLowerCase()) {
          throw new Error("La marque de l'article ne correspond pas.");
        }

        setArticle(product);
      } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        setErrorArticle(err.message || "Erreur inconnue");
      } finally {
        setLoadingArticle(false);
      }
    };

    fetchProduct();
  }, [brandName, decodedArticleName]);

  return (
    <div>
      {loadingArticle ? (
        <div>Chargement du produit...</div>
      ) : errorArticle ? (
        <div>Erreur : {errorArticle}</div>
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

