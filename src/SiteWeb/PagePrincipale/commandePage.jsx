import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const CommandePage = () => {
  // Extraction des paramètres de l’URL
  const { brand, reference, name } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const mode = queryParams.get('mode');

  // Nettoyage du paramètre "brand" : suppression de l'extension ".html" s'il est présent.
  const cleanedBrand = brand ? brand.replace(/\.html$/, '') : brand;

  // Définition de l'URL de base pour le back-end
  const API_BASE = 'https://cl-back.onrender.com';

  // États pour gérer le produit, le chargement et les erreurs
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupération du produit dès le chargement ou lorsque les paramètres changent
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let url = '';
        // Si mode "numero" ET que "reference" n'est pas "null", on utilise l'endpoint par index.
        // Sinon, on utilise l'endpoint par nom.
        if (mode === 'numero' && reference !== 'null') {
          url = `${API_BASE}/produit/cles/brand/${encodeURIComponent(cleanedBrand)}/index/${encodeURIComponent(reference)}`;
        } else {
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
  }, [cleanedBrand, reference, name, mode]);

  // Gestion du clic sur le bouton "Valider"
  const handleValidate = () => {
    // Vous pouvez ajouter ici la logique de validation ou de création de commande
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
            <strong>Marque :</strong> {cleanedBrand}
          </p>
          <p>
            <strong>Référence :</strong> {reference}
          </p>
          <p>
            <strong>Description :</strong> {product.descriptionProduit || 'Aucune description disponible.'}
          </p>
          {/* D'autres champs du produit peuvent être affichés ici */}
        </div>
      ) : (!loading && !error && <p>Aucun produit trouvé pour "{name}".</p>)}

      <button onClick={handleValidate}>Valider</button>
    </div>
  );
};

export default CommandePage;
