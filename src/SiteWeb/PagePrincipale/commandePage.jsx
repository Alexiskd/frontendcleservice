import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // Récupération des paramètres dynamiques de l'URL
  // La route est définie comme : /commande/:brand/cle/:reference/:name
  const { brand, reference, name } = useParams();
  const [produit, setProduit] = useState(null);
  const [error, setError] = useState(null);

  // Vérifie si l'URL d'image est correctement formée
  const isValidImageUrl = (url) => {
    return typeof url === 'string' &&
           url.trim() !== '' &&
           (url.startsWith('data:image/') || url.startsWith('http'));
  };

  useEffect(() => {
    // On vérifie que le paramètre "name" (nom du produit) est présent
    if (!name || name.trim() === '') {
      setError("Le nom du produit n'est pas fourni.");
      return;
    }
    
    // Construction de l'URL de l'API en utilisant le paramètre "name"
    // L'endpoint "/produit/cles/by-name" attend un paramètre "nom"
    const apiUrl = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(name)}`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des informations de la clé.");
        }
        return res.json();
      })
      .then((data) => {
        setProduit(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [name]);

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!produit) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Détails de la clé</h1>
      <ul>
        <li><strong>Nom :</strong> {produit.nom}</li>
        <li><strong>Marque :</strong> {brand}</li>
        <li><strong>Référence :</strong> {reference}</li>
        <li><strong>Prix :</strong> {produit.prix} €</li>
        <li>
          <strong>Prix sans carte de propriété :</strong> {produit.prixSansCartePropriete} €
        </li>
        <li>
          <strong>Type de reproduction :</strong> {produit.typeReproduction}
        </li>
        <li>
          <strong>Description :</strong> {produit.descriptionProduit}
        </li>
        {isValidImageUrl(produit.imageUrl) ? (
          <li>
            <strong>Image :</strong>
            <br />
            <img src={produit.imageUrl} alt={produit.nom} style={{ maxWidth: '300px' }} />
          </li>
        ) : (
          <li>Aucune image disponible</li>
        )}
      </ul>
    </div>
  );
};

export default CommandePage;

