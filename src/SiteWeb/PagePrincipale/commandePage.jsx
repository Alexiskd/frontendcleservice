import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const CommandePage = () => {
  // Extraction des paramètres de l’URL
  let { brand, reference, name } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const mode = queryParams.get('mode');

  // Si le paramètre "brand" contient ".html", on le nettoie
  if (brand && brand.endsWith('.html')) {
    brand = brand.replace('.html', '');
  }

  // Définition de l'URL de base pour le back-end
  const API_BASE = 'https://cl-back.onrender.com';

  // États pour le produit, le chargement et la gestion des erreurs
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupération du produit dès le chargement ou lorsque les paramètres changent
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let url = '';
        if (mode === 'numero') {
          // Utilisation de l'endpoint pour une recherche par index dans la marque
          url = `${API_BASE}/produit/cles/brand/${encodeURIComponent(brand)}/index/${encodeURIComponent(reference)}`;
        } else {
          // Utilisation de l'endpoint pour une recherche par nom
          url = `${API_BASE}/produit/cles/by-name?nom=${encodeURIComponent(name)}`;
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

  // Fonction pour gérer l'action "Valider"
  const handleValidate = () => {
    // Ici, vous pouvez déclencher une logique de commande ou d'autres actions
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
            <strong>Description :</strong>{' '}
            {product.descriptionProduit || 'Aucune description disponible.'}
          </p>
          {/* Vous pouvez afficher d'autres champs du produit ici */}
        </div>
      ) : (!loading && !error && <p>Aucun produit trouvé pour "{name}".</p>)}

      <button onClick={handleValidate}>Valider</button>
    </div>
  );
};

export default CommandePage;
