import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [brands, setBrands] = useState(null);
  const [keysCache, setKeysCache] = useState({}); // Clés préchargées indexées par le nom de la marque
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction de chargement des marques
  const fetchBrands = useCallback(async () => {
    const response = await fetch('https://cl-back.onrender.com/brands/logos');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors du chargement des marques');
    }
    const data = await response.json();
    return data;
  }, []);

  // Fonction de chargement des clés pour une marque donnée
  const fetchKeysForBrand = useCallback(async (brandName) => {
    if (!brandName) {
      console.error("Erreur dans fetchKeysForBrand : brandName est undefined");
      return [];
    }
    const formattedBrand = brandName.toUpperCase().replace(/\s+/g, '-');
    const response = await fetch(
      `https://cl-back.onrender.com/produit/cles?marque=${encodeURIComponent(formattedBrand)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Erreur lors du chargement des clés pour la marque ${formattedBrand}`
      );
    }
    const data = await response.json();
    const decodedData = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          nom: decodeURIComponent(item.nom),
          type_article: 'cle'
        }))
      : [];
    return decodedData;
  }, []);

  // Au montage, charger les marques puis précharger toutes les clés associées
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const brandsData = await fetchBrands();
        setBrands(brandsData);

        if (brandsData && brandsData.length > 0) {
          // Vérifier que chaque marque possède bien une propriété 'name'
          brandsData.forEach((brand) => {
            if (!brand.name) {
              console.warn("Marque sans propriété 'name' :", brand);
            }
          });

          const keysArray = await Promise.all(
            brandsData.map((brand) =>
              fetchKeysForBrand(brand.name).catch((err) => {
                console.error(`Erreur pour ${brand.name || 'Marque inconnue'} :`, err);
                return []; // En cas d'erreur, retourner un tableau vide
              })
            )
          );
          const newKeysCache = {};
          brandsData.forEach((brand, index) => {
            newKeysCache[brand.name] = keysArray[index];
          });
          setKeysCache(newKeysCache);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [fetchBrands, fetchKeysForBrand]);

  // Fonction pour récupérer les clés d'une marque depuis le cache, ou les charger si nécessaire
  const getKeysForBrand = useCallback(
    async (brandName) => {
      if (!brandName) {
        console.error("Erreur dans getKeysForBrand : brandName est undefined");
        return [];
      }
      if (keysCache[brandName]) {
        return keysCache[brandName];
      }
      try {
        const keysData = await fetchKeysForBrand(brandName);
        setKeysCache((prev) => ({ ...prev, [brandName]: keysData }));
        return keysData;
      } catch (err) {
        throw err;
      }
    },
    [fetchKeysForBrand, keysCache]
  );

  return (
    <DataContext.Provider value={{ brands, keysCache, loading, error, getKeysForBrand }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
export default DataContext;
