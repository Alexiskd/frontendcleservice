import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { preloadKeysData, findProductInKeys } from "@/lib/keys";
import { Product } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProductDisplay from "@/components/ProductDisplay";
import ErrorMessage from "@/components/ui/ErrorMessage";

const normalizeString = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const ProductPage: React.FC = () => {
  const { productName = "", brandName = "" } = useParams<{ productName: string; brandName: string }>();
  const decodedProductName = decodeURIComponent(productName);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Étape 1 : Essayer de trouver localement via preload
        const keys = await preloadKeysData(brandName);
        let foundProduct = findProductInKeys(keys, decodedProductName);

        // Étape 2 : Si pas trouvé localement, appeler les endpoints
        if (!foundProduct) {
          const endpointBest = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedProductName)}`;
          let response = await fetch(endpointBest);

          if (response.status === 404) {
            console.warn("best-by-name retourne 404, tentative via closest-match.");
            const fallbackUrl = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedProductName)}`;
            response = await fetch(fallbackUrl);
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API : ${errorText}`);
          }

          foundProduct = await response.json();
        }

        setProduct(foundProduct);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [decodedProductName, brandName]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Produit introuvable." />;

  return <ProductDisplay product={product} />;
};

export default ProductPage;
