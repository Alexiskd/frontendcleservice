import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // Extraction du paramètre "nom" dans l'URL (par exemple : /commande/:nom)
  const { nom } = useParams();
  const [produit, setProduit] = useState(null);
  const [error, setError] = useState(null);

  // Vérifie si une Data URI correspond à un format d'image autorisé (png, jpeg/jpg ou gif)
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
    // Affichage dans la console du paramètre reçu (utile pour le débogage)
    console.log('Paramètre "nom" reçu :', nom);

    // Si le paramètre "nom" est manquant ou vide, une erreur est enregistrée et la fonction s'arrête
    if (!nom || nom.trim() === '') {
      setError("Le nom du produit n'est pas fourni.");
      return;
    }

    // Construction de l'URL de l'API pour récupérer les infos du produit, en encodant le paramètre "nom"
    const apiUrl = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(nom)}`;

    // Appel de l'API via fetch
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

  // Si une erreur a été détectée (par exemple, nom vide ou échec de l'appel API), on l'affiche
  if (error) {
    return <div>Erreur : {error}</div>;
  }

  // Tant que le produit n'a pas été récupéré, on affiche un indicateur de chargement
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




