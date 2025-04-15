import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // Récupération du paramètre "nom" défini dans la route (ex: /commande/:nom)
  const { nom } = useParams();
  const [cle, setCle] = useState(null);
  const [error, setError] = useState(null);

  // Vérification basique de validité d'une URL d'image (data URI ou url http(s))
  const isValidImageUrl = (url) => {
    return typeof url === 'string' && url.trim() !== '' &&
           (url.startsWith('data:image/') || url.startsWith('http'));
  };

  useEffect(() => {
    if (!nom || nom.trim() === '') {
      setError("Le nom du produit n'est pas fourni.");
      return;
    }

    // Utilisation de l'endpoint by-name pour récupérer la clé correspondant exactement au nom
    fetch(`https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(nom)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des informations de la clé.");
        }
        return res.json();
      })
      .then((data) => {
        setCle(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [nom]);

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!cle) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Détails de la clé</h1>
      <ul>
        <li>
          <strong>Nom :</strong> {cle.nom}
        </li>
        <li>
          <strong>Marque :</strong> {cle.marque}
        </li>
        <li>
          <strong>Prix :</strong> {cle.prix} €
        </li>
        <li>
          <strong>Prix sans carte de propriété :</strong> {cle.prixSansCartePropriete} €
        </li>
        <li>
          <strong>Type de reproduction :</strong> {cle.typeReproduction}
        </li>
        <li>
          <strong>Description :</strong> {cle.descriptionProduit}
        </li>
        {isValidImageUrl(cle.imageUrl) ? (
          <li>
            <strong>Image :</strong>
            <br />
            <img src={cle.imageUrl} alt={cle.nom} style={{ maxWidth: '300px' }} />
          </li>
        ) : (
          <li>Aucune image disponible</li>
        )}
      </ul>
    </div>
  );
};

export default CommandePage;
