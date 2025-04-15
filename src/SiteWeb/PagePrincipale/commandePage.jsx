import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const CommandePage = () => {
  // Extraction des paramètres de l'URL
  const { brand, reference, name } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') || '';

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
    console.log('Paramètres reçus :', { brand, reference, name, mode });
    // Vérification des paramètres obligatoires
    if (!brand || !reference || !name || !name.trim()) {
      setError("Les paramètres de la commande sont incomplets.");
      return;
    }

    // Construction de l'URL de l'API pour récupérer les informations du produit
    const apiUrl = `https://cl-back.onrender.com/produit/cles/by-details?brand=${encodeURIComponent(brand)}&reference=${encodeURIComponent(reference)}&name=${encodeURIComponent(name)}&mode=${encodeURIComponent(mode)}`;
    console.log("URL API construite :", apiUrl);

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des informations de la clé.");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Données récupérées :", data);
        setProduit(data);
      })
      .catch((err) => {
        console.error("Erreur lors du fetch :", err);
        setError(err.message);
      });
  }, [brand, reference, name, mode]);

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
