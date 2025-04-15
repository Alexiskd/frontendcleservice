import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const CommandePage = () => {
  // Extraction des paramètres depuis l'URL
  const { brand, reference, name: rawName } = useParams();
  // Nettoyage de la marque pour enlever le suffixe (_1_reproduction_cle.html) et ne garder que la première partie
  const cleanedBrand = brand ? brand.split('_')[0] : '';
  
  // Nettoyage du paramètre "name"
  const name = rawName ? rawName.trim() : '';

  // Extraction du paramètre "mode" depuis la query string (ex: ?mode=numero)
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [produit, setProduit] = useState(null);
  const [error, setError] = useState(null);

  // Fonction pour valider une Data URI correspondant à un format d'image autorisé (png, jpeg/jpg ou gif)
  const isValidDataUri = (url) => {
    const regex = /^data:image\/(png|jpe?g|gif);base64,/;
    return regex.test(url);
  };

  // Vérifie que l'URL d'image n'est pas vide et qu'elle commence par "http" ou correspond à une Data URI valide
  const isValidImageUrl = (url) => {
    return (
      typeof url === 'string' &&
      url.trim() !== '' &&
      (url.startsWith('http') || isValidDataUri(url))
    );
  };

  useEffect(() => {
    console.log('Paramètres reçus :', { brand, cleanedBrand, reference, name, mode });
    // Vérifier que tous les paramètres requis sont présents
    if (!cleanedBrand || !reference || !name) {
      setError("Les paramètres requis ne sont pas fournis.");
      return;
    }

    // Construction de l'URL de l'API en utilisant cleanedBrand
    const apiUrl = `https://cl-back.onrender.com/produit/cles/by-brand-ref?brand=${encodeURIComponent(cleanedBrand)}&reference=${encodeURIComponent(reference)}&name=${encodeURIComponent(name)}&mode=${encodeURIComponent(mode || '')}`;
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
  }, [brand, cleanedBrand, reference, name, mode]);

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

