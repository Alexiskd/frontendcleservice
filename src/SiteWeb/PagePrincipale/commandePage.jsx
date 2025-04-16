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
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);
  const [errorSimilar, setErrorSimilar] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        setLoadingSimilar(true);
        setErrorSimilar(null);

        if (!decodedArticleName.trim()) {
          throw new Error("Le nom de l'article est vide après décodage.");
        }

        // Fonction pour effectuer une requête à l'API
        const fetchProduct = async (endpoint) => {
          const response = await fetch(endpoint);
          return response;
        };

        // Tentative de récupération du produit exact
        let endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetchProduct(endpoint);

        // Si la réponse n'est pas OK, on tente un fallback vers l'endpoint "closest-match"
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 500 || errorText.includes("Produit introuvable")) {
            // On utilise l'endpoint alternatif pour récupérer les produits similaires
            endpoint = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
            response = await fetchProduct(endpoint);
            if (!response.ok) {
              throw new Error("Erreur lors du chargement des produits similaires.");
            }
            const similarData = await response.json();
            setArticle(null);
            setSimilarProducts(similarData);
          } else {
            throw new Error("Erreur lors du chargement de l'article.");
          }
        } else {
          // Si le produit exact est trouvé
          const data = await response.json();
          if (data && data.marque && data.marque.toLowerCase() !== brandName.toLowerCase()) {
            throw new Error("La marque de l'article ne correspond pas.");
          }
          setArticle(data);

          // Récupération des produits similaires
          endpoint = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          const similarResponse = await fetch(endpoint);
          if (similarResponse.ok) {
            const similarData = await similarResponse.json();
            // On peut retirer le produit principal de la liste si besoin (ici on suppose qu'il y a une propriété "id")
            const filteredSimilar =
              data && data.id ? similarData.filter(prod => prod.id !== data.id) : similarData;
            setSimilarProducts(filteredSimilar);
          } else {
            setErrorSimilar("Erreur lors du chargement des produits similaires.");
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        setErrorArticle(err.message || "Erreur inconnue");
      } finally {
        setLoadingArticle(false);
        setLoadingSimilar(false);
      }
    };

    fetchData();
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

      <hr />

      {loadingSimilar ? (
        <div>Chargement des produits similaires...</div>
      ) : errorSimilar ? (
        <div>Erreur : {errorSimilar}</div>
      ) : similarProducts.length > 0 ? (
        <div>
          <h2>Produits similaires :</h2>
          <ul>
            {similarProducts.map(prod => (
              <li key={prod.id}>
                <h3>{prod.nom}</h3>
                <p>Marque : {prod.marque}</p>
                <p>Prix : {prod.prix} €</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>Aucun produit similaire trouvé.</div>
      )}
    </div>
  );
};

export default CommandePage;
