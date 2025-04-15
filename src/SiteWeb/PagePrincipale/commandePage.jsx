import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // On récupère le paramètre "nom" dans l'URL (ex: /commande/:nom)
  const { nom } = useParams();
  const [produit, setProduit] = useState(null);
  const [error, setError] = useState(null);

  // Fonction de validation de l'URL d'image (vérifie que la chaîne est non vide et commence par data:image/ ou http)
  const isValidImageUrl = (url) => {
    return typeof url === 'string' &&
           url.trim() !== '' &&
           (url.startsWith('data:image/') || url.startsWith('http'));
  };

  useEffect(() => {
    // Si le paramètre "nom" est absent ou vide, on affiche une erreur et on stoppe l'exécution
    if (!nom || nom.trim() === '') {
      setError("Le nom du produit n'est pas fourni.");
      return;
    }

    // Construction de l'URL de l'API avec encodage du paramètre "nom"
    const apiUrl = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(nom)}`;

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
  }, [nom]);

  // Affichage d'un message d'erreur le cas échéant
  if (error) {
    return <div>Erreur : {error}</div>;
  }

  // Affichage d'un indicateur de chargement jusqu'à la réception des données
  if (!produit) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Détails de la clé</h1>
      <ul>
        <li><strong>Nom :</strong> {produit.nom}</li>
        <li><strong>Marque :</strong> {produit.marque}</li>
        <li><strong>Prix :</strong> {produit.prix} €</li>
        <li><strong>Prix sans carte de propriété :</strong> {produit.prixSansCartePropriete} €</li>
        <li><strong>Type de reproduction :</strong> {produit.typeReproduction}</li>
        <li><strong>Description :</strong> {produit.descriptionProduit}</li>
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
