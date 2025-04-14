import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const CommandePage = () => {
  // Extraction des paramètres de l'URL
  const { brand, reference, name } = useParams();
  // Extraction du mode depuis les query params (ex. ?mode=numero)
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const mode = queryParams.get('mode');

  // États pour la gestion du produit, du chargement et des erreurs
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupération des données produit dès le chargement du composant ou lors d'un changement de paramètres
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let url = '';
        // Si le mode est "numero", on utilise l'endpoint par index de marque
        if (mode === 'numero') {
          url = `https://cl-back.onrender.com/produit/cles/brand/${encodeURIComponent(brand)}/index/${encodeURIComponent(reference)}`;
        } else {
          // Sinon, on utilise l'endpoint de recherche par nom
          url = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(name)}`;
        }
  
        const response = await fetch(url);
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
  }, [brand, reference, name, mode]);

  // Fonction appelée lors du clic sur le bouton "Valider"
  const handleValidate = () => {
    // Ici, vous pouvez ajouter votre logique de validation ou création de commande
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
          {/* Vous pouvez ajouter d'autres champs du produit ici */}
        </div>
      ) : (
        !loading && !error && <p>Aucun produit trouvé pour "{name}".</p>
      )}

      <button onClick={handleValidate}>Valider</button>
    </div>
  );
};

export default CommandePage;
