import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { preloadKeysData } from '../api/brandsApi'; // ajustez le chemin selon votre organisation

const CommandePage = () => {
  // On suppose que l’URL comporte un paramètre "brand" (ex: /commande/:brand)
  const { brand } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // On lance le chargement des clés pour la marque spécifiée
    const fetchProduct = async () => {
      try {
        const keysData = await preloadKeysData(brand);
        if (keysData && keysData.length > 0) {
          // On affiche ici le premier produit/key retourné
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
        {/* Si le produit possède une propriété "name", on l'affiche, sinon on affiche l'objet complet */}
        <p>Produit : {product.name ? product.name : JSON.stringify(product)}</p>
      </div>
    </div>
  );
};

export default CommandePage;
