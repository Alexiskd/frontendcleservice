import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommandePage = () => {
  // Extraction des paramètres de l'URL
  const { brand, reference, name } = useParams();
  
  // États pour la gestion des données, du chargement et des erreurs
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hook pour récupérer les données du produit dès le chargement du composant
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Appel de l’API back-end pour récupérer le produit par nom
        // Vous pouvez adapter l'URL en fonction de votre configuration (port, chemin, etc.)
        const response = await fetch(`http://localhost:3000/produit/cles/by-name?nom=${encodeURIComponent(name)}`);
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération du produit : ${response.statusText}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [name]);

  // Gestion du clic sur le bouton « Valider »
  const handleValidate = () => {
    // Vous pouvez ici appeler une fonction pour enregistrer la commande
    // Par exemple : appeler un endpoint back-end pour créer la commande
    alert('Produit validé !');
  };

  return (
    <div>
      <h1>Commande Page</h1>
      
      {loading && <p>Chargement du produit…</p>}
      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}

      {!loading && !error && product ? (
        <div>
          <h2>{product.descriptionProduit || name}</h2>
          <p>
            <strong>Marque :</strong> {brand}
          </p>
          <p>
            <strong>Référence :</strong> {reference}
          </p>
          <p>
            <strong>Description :</strong> {product.descriptionProduit || "Aucune description disponible."}
          </p>
          {/* Vous pouvez ajouter d'autres champs disponibles dans l'objet product */}
        </div>
      ) : (
        !loading && !error && <p>Aucun produit trouvé pour le nom "{name}".</p>
      )}

      <button onClick={handleValidate}>Valider</button>
    </div>
  );
};

export default CommandePage;
