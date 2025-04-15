import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // Extraction du paramètre "nom" depuis l'URL (ex: /commande/:nom)
  const { nom } = useParams();
  const [produit, setProduit] = useState(null);
  const [error, setError] = useState(null);

  // Vérifie si une URL de type Data URI correspond à une image valide
  const isValidDataUri = (url) => {
    // On autorise ici png, jpeg, jpg ou gif
    const regex = /^data:image\/(png|jpe?g|gif);base64,/;
    return regex.test(url);
  };

  // Vérifie que l'URL de l'image est correctement formée : soit une URL HTTP(S), soit un Data URI valide
  const isValidImageUrl = (url) => {
    return (
      typeof url === 'string' &&
      url.trim() !== '' &&
      (url.startsWith('http') || isValidDataUri(url))
    );
  };

  useEffect(() => {
    // Vérification de la présence du paramètre "nom"
    if (!nom || nom.trim() === '') {
      setError("Le nom du produit n'est pas fourni.");
      return;
    }

    // Construction de l'URL de l'API avec le paramètre "nom" encodé
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

