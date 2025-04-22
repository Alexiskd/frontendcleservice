import React, { useEffect, useState } from "react";
import { Box, Container, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import { socket } from "../socket";  // Assurez-vous que le chemin est correct
import CommandeItem from "../components/CommandeItem";  // Votre composant pour afficher chaque commande
import { fetchCommandes } from "../api/commandesApi";  // Supposons que vous avez une fonction d'API pour récupérer les commandes

const CommandePage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les commandes au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchCommandes();
        setCommandes(result);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gérer la réception d'événements via socket.io
  useEffect(() => {
    // Lorsqu'un événement 'commande-updated' est émis par le serveur
    socket.on("commande-updated", (updatedCommande) => {
      setCommandes((prevCommandes) =>
        prevCommandes.map((commande) =>
          commande.id === updatedCommande.id ? updatedCommande : commande
        )
      );
    });

    // Nettoyer l'événement au démontage du composant
    return () => {
      socket.off("commande-updated");
    };
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center">
        Gestion des Commandes
      </Typography>
      <Grid container spacing={3}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <CircularProgress />
          </Box>
        ) : (
          commandes.map((commande) => (
            <Grid item xs={12} sm={6} md={4} key={commande.id}>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <CommandeItem commande={commande} />
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default CommandePage;

