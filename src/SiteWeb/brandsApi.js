import React, { useState, useEffect } from 'react';

// Fonctions de préchargement telles que fournies
let preloadedBrands = null;
let preloadedBrandsPromise = null;
export function preloadBrandsData() {
  if (!preloadedBrandsPromise) {
    preloadedBrandsPromise = fetch('https://cl-back.onrender.com/brands')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des marques');
        }
        return res.json();
      })
      .then((data) => {
        preloadedBrands = data;
        return data;
      });
  }
  return preloadedBrandsPromise;
}

let preloadedKeys = {};
let preloadedKeysPromises = {};
export function preloadKeysData(brand) {
  if (!preloadedKeysPromises[brand]) {
    preloadedKeysPromises[brand] = fetch(
      `https://cl-back.onrender.com/produit/cles?marque=${encodeURIComponent(brand)}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur lors de la récupération des clés pour ${brand}`);
        }
        return res.json();
      })
      .then((data) => {
        preloadedKeys[brand] = data;
        return data;
      });
  }
  return preloadedKeysPromises[brand];
}

// Composant React pour afficher les produits d'une marque préchargée
function ProductList() {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // Précharge les marques dès le montage
  useEffect(() => {
    preloadBrandsData()
      .then((data) => {
        setBrands(data);
        if (data.length > 0) {
          // Sélectionne par défaut la première marque
          setSelectedBrand(data[0].nom);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  // À chaque fois que la marque sélectionnée change, précharge ses produits
  useEffect(() => {
    if (selectedBrand) {
      preloadKeysData(selectedBrand)
        .then((data) => setProducts(data))
        .catch((err) => {
          console.error(err);
          setError(err.message);
        });
    }
  }, [selectedBrand]);

  if (error) {
    return <div className="error">Erreur : {error}</div>;
  }

  return (
    <div>
      <h1>Produits de la marque : {selectedBrand}</h1>
      <div>
        <label htmlFor="brandSelect">Choisir une marque&nbsp;:</label>
        <select
          id="brandSelect"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          {brands.map((brand, idx) => (
            <option key={idx} value={brand.nom}>
              {brand.nom}
            </option>
          ))}
        </select>
      </div>
      <div>
        {products.length > 0 ? (
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <strong>{product.nom}</strong> - {product.prix} €
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun produit trouvé pour cette marque.</p>
        )}
      </div>
    </div>
  );
}

export default ProductList;
