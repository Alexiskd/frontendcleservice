import React, { useState, useEffect } from 'react';

function BrandsApi() {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://cl-back.onrender.com/brands')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des marques');
        }
        return res.json();
      })
      .then((data) => {
        setBrands(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return <div className="error">Erreur : {error}</div>;
  }

  if (brands.length === 0) {
    return <div>Aucune marque disponible.</div>;
  }

  return (
    <div>
      <h1>Liste des Marques</h1>
      <ul>
        {brands.map((brand) => (
          <li key={brand.id}>{brand.nom}</li>
        ))}
      </ul>
    </div>
  );
}

export default BrandsApi;
