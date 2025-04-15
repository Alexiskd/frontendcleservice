import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // Extraction du paramètre "nom" dans l'URL (exemple : /commande/:nom)
  const { nom } = useParams();
  const [produit, setProduit] = useState(null);
  const [error, setError] = useState(null);

  // Fonction pour valider une Data URI correspondant à un format d'image autorisé (png, jpeg/jpg ou gif)
  const isValidDataUri = (url) => {
    const regex = /^data:image\/(png|jpe?g|gif);base64,/;
    return regex.test(url);
  };

  // Vérifie que l'URL d'image n'est pas vide et commence par "http" ou correspond à un Data URI valide
  const isValidImageUrl = (url) => {
    return (
      typeof url === 'string' &&
      url.trim() !== '' &&
      (url.startsWith('http') || isValidDataUri(url))
    );
  };

  useEffect(() => {
    const fetchProduit = async () => {
      console.log('Paramètre "nom" reçu :', nom);
      // Si le paramètre "nom" est manquant ou vide, on affiche une erreur et on arrête l'exécution
      if (!nom || nom.trim() === '') {
        setError("Le nom du produit n'est pas fourni.");
        return;
      }

      // Construction de l'URL de l'API en encodant le paramètre "nom"
      const apiUrl = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(nom)}`;

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des informations de la clé.");
        }
        const data = await res.json();
        setProduit(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProduit();
  }, [nom]);

  // Affichage d'un message d'erreur en cas de problème
  if (error) {
    return <div>Erreur : {error}</div>;
  }

  // Affichage d'un indicateur de chargement tant que les données ne sont pas récupérées
  if (!produit) {
    return <div>Chargement...</div>;
  }

  // Rendu final des informations du produit
  return (
    <div>
      <h1>Détails de la clé</h1>
      <ul>
        <li><strong>Nom :</strong> {produit.nom}</li>
        <li><strong>Marque :</strong> {produit.marque}</li>
        <li><strong>Prix :</strong> {produit.prix} €</li>
        <li>
          <strong>Prix sans carte de propriété :</strong> {produit.prixSansCartePropriete} €
        </li>
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



