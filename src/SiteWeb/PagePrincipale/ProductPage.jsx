import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import ZoomableImage from "@components/ZoomableImage";
import preloadData from "@utils/preloadData";

const ProductPage = () => {
  const { productName } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <ZoomableImage src={product.image} alt={product.nom} />
      <Typography variant="body1" mt={2}>
        {product.description}
      </Typography>
    </Box>
  );
};

export default ProductPage;

