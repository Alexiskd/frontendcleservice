import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
// import ZoomableImage from "@components/ZoomableImage"; // Commenté si ZoomableImage est manquant

const CommandePage = () => {
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommande = async () => {
      setLoading(true);
      setError(null); // Reset error on each fetch attempt
      try {
        const res = await axios.get('https://cl-back.onrender.com/produit/cles/by-name?nom=Iseo%20R14');
        if (res.status === 200) {
          setCommande(res.data);
        } else {
          setError(`Erreur serveur: ${res.statusText}`);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la commande:", err);
        setError("Une erreur est survenue lors du chargement de la commande.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommande();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!commande) {
    return (
      <Typography variant="h6" align="center" mt={4}>
        Aucun produit trouvé.
      </Typography>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        {commande.nom}
      </Typography>
      {/* Affichage d'une image normale si ZoomableImage est manquant */}
      <img src={commande.image} alt={commande.nom} style={{ width: "100%", maxWidth: "500px" }} />
      <Typography variant="body1" mt={2}>
        {commande.description}
      </Typography>
    </Box>
  );
};

export default CommandePage;
