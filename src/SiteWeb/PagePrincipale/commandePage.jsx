import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // Récupère le paramètre "nom" depuis l'URL (exemple de route : /commande/:nom)
  const { nom } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const isValidImageUrl = (url) => {
    return typeof url === 'string' &&
           url.trim() !== '' &&
           (url.startsWith('data:image/') || url.startsWith('http'));
  };

  useEffect(() => {
    if (!nom) {
      setError("Le nom du produit n'est pas fourni.");
      return;
    }

    fetch(`https://cl-back.onrender.com/produit/cles/closest?nom=${encodeURIComponent(nom)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des informations du produit");
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [nom]);

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!product) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Détails du produit</h1>
      <ul>
        <li><strong>Nom :</strong> {product.nom}</li>
        <li><strong>Marque :</strong> {product.marque}</li>
        <li><strong>Prix :</strong> {product.prix} €</li>
        <li>
          <strong>Prix sans carte de propriété :</strong> {product.prixSansCartePropriete} €
        </li>
        <li>
          <strong>Type de reproduction :</strong> {product.typeReproduction}
        </li>
        <li>
          <strong>Description :</strong> {product.descriptionProduit}
        </li>
        {isValidImageUrl(product.imageUrl) ? (
          <li>
            <strong>Image :</strong>
            <br />
            <img src={product.imageUrl} alt={product.nom} style={{ maxWidth: '300px' }} />
          </li>
        ) : (
          <li>Aucune image disponible</li>
        )}
      </ul>
    </div>
  );
};

export default CommandePage;
