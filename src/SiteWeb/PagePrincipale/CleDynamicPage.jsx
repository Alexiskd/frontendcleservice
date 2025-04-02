import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const CleDynamicPage = () => {
  const { productName } = useParams();
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const decodedProductName = decodeURIComponent(productName);
      try {
        const response = await fetch(
          `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedProductName)}`
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const data = await response.json();
        setProductData(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      }
    };

    fetchData();
  }, [productName]);

  if (error) {
    return <div className="error">Erreur : {error}</div>;
  }

  if (!productData) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="product-details">
      <h1>{productData.nom}</h1>
      <img src={productData.image} alt={productData.nom} />
      <p>{productData.description}</p>
      <p>Prix : {productData.prix} €</p>
    </div>
  );
};

export default CleDynamicPage;
