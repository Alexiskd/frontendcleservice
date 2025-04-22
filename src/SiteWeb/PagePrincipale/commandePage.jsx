import React, { useEffect, useState } from "react";
import { Box, Button, Typography, CircularProgress, Grid } from "@mui/material";
import { socket } from "../socket"; // Assurez-vous que le chemin vers socket est correct
import { useNavigate } from "react-router-dom";

const CommandePage = () => {
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Écoute des événements via le socket
    socket.on("commandeUpdate", (updatedCommande) => {
      setCommande(updatedCommande);
    });

    // Simuler la récupération de commande depuis un API ou base de données
    const fetchCommande = async () => {
      try {
        const response = await fetch("/api/commande");
        const data = await response.json();
        setCommande(data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors de la récupération de la commande.");
        setLoading(false);
      }
    };

    fetchCommande();

    return () => {
      // Nettoyage du socket lorsque le composant est démonté
      socket.off("commandeUpdate");
    };
  }, []);

  const handleRedirection = () => {
    navigate("/confirmation");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Détails de la commande
      </Typography>

      {commande && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">ID de la commande :</Typography>
            <Typography>{commande.id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Client :</Typography>
            <Typography>{commande.client}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Détails :</Typography>
            <Typography>{commande.details}</Typography>
          </Grid>
        </Grid>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={handleRedirection}
      >
        Confirmer la commande
      </Button>
    </Box>
  );
};

export default CommandePage;
