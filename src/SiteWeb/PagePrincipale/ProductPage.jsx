import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import ZoomableImage from "@components/ZoomableImage";
import preloadData from "@utils/preloadData";

const ProductPage = () => {
  const { productName } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // État pour gérer l'erreur

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const cachedData = preloadData.get(`product-${productName}`);
        if (cachedData) {
          setProduct(cachedData);
          setLoading(false);
          return;
        }

        const res = await axios.get(`/produit/cles/best-by-name/${productName}`);
        setProduct(res.data);
        preloadData.set(`product-${productName}`, res.data);
      } catch (err) {
        try {
          const res = await axios.get(`/produit/cles/closest-match/${productName}`);
          setProduct(res.data);
          preloadData.set(`product-${productName}`, res.data);
        } catch (err2) {
          setError("Produit non trouvé."); // Enregistrer l'erreur
          console.error("Produit non trouvé.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productName]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="50vh">
        <Typography variant="h6" align="center" mt={2}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} mt={2}>
          Réessayer
        </Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Typography variant="h6" align="center" mt={4}>
        Produit introuvable.
      </Typography>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        {product.nom}
      </Typography>
      {/* Vérification si l'image existe avant de l'afficher */}
      <ZoomableImage src={product.image || "/default-image.jpg"} alt={product.nom} />
      <Typography variant="body1" mt={2}>
        {product.description}
      </Typography>
    </Box>
  );
};

export default ProductPage;

