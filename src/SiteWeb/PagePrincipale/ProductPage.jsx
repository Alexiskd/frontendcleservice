// app/ProductPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { preloadKeysData } from "../lib/api";

interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number;
  marque: string;
  imageUrl: string;
  [key: string]: any;
}

const ProductPage = () => {
  const { productName } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const decodedProductName = decodeURIComponent(productName as string);
  const brandName = decodedProductName.split(" ")[0];

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const keys = await preloadKeysData(brandName);
      let foundProduct = findProductInKeys(keys, decodedProductName);

      if (!foundProduct) {
        const fallbackUrl = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedProductName)}`;
        const response = await fetch(fallbackUrl);

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

  const findProductInKeys = (keys: Product[], name: string): Product | null => {
    const lowerCaseName = name.toLowerCase();
    return (
      keys.find((key) => key.nom.toLowerCase() === lowerCaseName) ||
      keys.find((key) => key.nom.toLowerCase().includes(lowerCaseName)) ||
      null
    );
  };

  useEffect(() => {
    fetchProduct();
  }, [decodedProductName]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;
  if (!product) return <p>Produit introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{product.nom}</h1>
      <img src={product.imageUrl} alt={product.nom} className="w-full max-w-md mb-4 rounded-xl shadow-lg" />
      <p className="text-lg mb-2">Marque : <strong>{product.marque}</strong></p>
      <p className="text-lg mb-2">Prix : <strong>{product.prix.toFixed(2)} €</strong></p>
      <p className="text-base text-gray-700">{product.description}</p>
    </div>
  );
};

export default ProductPage;
