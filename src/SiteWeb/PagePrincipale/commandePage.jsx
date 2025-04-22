import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket"; // Ajustez le chemin si nécessaire
import { getCommandeData } from "../../api/commandeApi"; // Vérifiez également ce chemin
import { getBrands } from "../../api/brandsApi"; // Assurez-vous que ce fichier existe

const CommandePage = () => {
  const [commandes, setCommandes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les données des commandes
    const fetchCommandes = async () => {
      try {
        const data = await getCommandeData();
        setCommandes(data);
      } catch (err) {
        setError("Erreur lors de la récupération des commandes.");
      } finally {
        setIsLoading(false);
      }
    };

    // Récupérer les données des marques
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        setBrands(data);
      } catch (err) {
        setError("Erreur lors de la récupération des marques.");
      }
    };

    fetchCommandes();
    fetchBrands();

    // Écoute des événements en temps réel avec Socket.io
    socket.on("updateCommandes", (newCommande) => {
      setCommandes((prevCommandes) => [...prevCommandes, newCommande]);
    });

    return () => {
      socket.off("updateCommandes");
    };
  }, []);

  const handleViewDetails = (commandeId) => {
    navigate(`/commande/${commandeId}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Liste des Commandes
      </Typography>
      {commandes.length === 0 ? (
        <Typography variant="h6">Aucune commande trouvée.</Typography>
      ) : (
        <Grid container spacing={2}>
          {commandes.map((commande) => (
            <Grid item xs={12} sm={6} md={4} key={commande.id}>
              <Box border={1} padding={2} borderRadius={2} boxShadow={2}>
                <Typography variant="h6">{commande.nom}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {commande.details}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleViewDetails(commande.id)}
                >
                  Voir Détails
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Marques disponibles
        </Typography>
        <Grid container spacing={2}>
          {brands.map((brand) => (
            <Grid item xs={12} sm={6} md={4} key={brand.id}>
              <Box border={1} padding={2} borderRadius={2} boxShadow={2}>
                <Typography variant="h6">{brand.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {brand.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default CommandePage;
