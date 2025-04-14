import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const CommandePage = () => {
  // Extraction des paramètres de l’URL
  const { brand, reference, name } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const mode = queryParams.get('mode');

  // Nettoyage du paramètre "brand" (suppression de l'extension ".html")
  const cleanedBrand = brand ? brand.replace(/\.html$/, '') : brand;

  // URL de base du back-end
  const API_BASE = 'https://cl-back.onrender.com';

  // États pour le produit, le chargement et les erreurs
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let url = '';

        // Si le mode est "numero" et que reference est fournie et différente de "null",
        // on tente l'endpoint par index
        if (mode === 'numero' && reference && reference !== 'null') {
          url = `${API_BASE}/produit/cles/brand/${encodeURIComponent(cleanedBrand)}/index/${encodeURIComponent(reference)}`;
        } else {
          // Sinon, on utilise directement l'endpoint 'closest'
          url = `${API_BASE}/produit/cles/closest?nom=${encodeURIComponent(name)}`;
        }

        console.log('Appel vers URL:', url);
        let response = await fetch(url);

        // Si la réponse est 404 lors de l'appel par index, on effectue le fallback vers "closest"
        if (!response.ok && response.status === 404 && mode === 'numero' && reference && reference !== 'null') {
          const fallbackUrl = `${API_BASE}/produit/cles/closest?nom=${encodeURIComponent(name)}`;
          console.warn('Fallback vers URL:', fallbackUrl);
          response = await fetch(fallbackUrl);
        }

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

  const handleValidate = () => {
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
        </div>
      ) : (!loading && !error && <p>Aucun produit trouvé pour "{name}".</p>)}

      <button onClick={handleValidate}>Valider</button>
    </div>
  );
};

export default CommandePage;
