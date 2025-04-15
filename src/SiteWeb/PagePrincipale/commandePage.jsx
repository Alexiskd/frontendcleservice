// Modification du chemin d'import (ajustez avec l'extension si nécessaire)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { preloadKeysData } from '../../api/brandsApi.js'; // Chemin corrigé

const CommandePage = () => {
  const { brand } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const keysData = await preloadKeysData(brand);
        if (keysData && keysData.length > 0) {
          setProduct(keysData[0]);
        } else {
          setError("Aucun produit trouvé pour cette marque.");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    if (brand) {
      fetchProduct();
    }
  }, [brand]);

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!product) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Commande pour {brand}</h1>
      <div>
        <p>Produit : {product.name ? product.name : JSON.stringify(product)}</p>
      </div>
    </div>
  );
};

export default CommandePage;
