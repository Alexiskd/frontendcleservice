import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
} from "@mui/material";

// Connexion au serveur backend via WebSocket
const socket = io(import.meta.env.VITE_SERVER_URL);

function CommandePage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommandes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/commandes/payees`
      );

      // Protection contre données incorrectes
      const commandesValides = Array.isArray(response.data)
        ? response.data.map((cmd) => ({
            ...cmd,
            produits: Array.isArray(cmd.produits) ? cmd.produits : [],
          }))
        : [];

      setCommandes(commandesValides);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();

    socket.on("commandeUpdated", fetchCommandes);
    return () => socket.off("commandeUpdated");
  }, []);

  const generatePDF = (commande) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/logo.png"; // le logo doit exister dans /public/logo.png

    logo.onload = () => {
      doc.addImage(logo, "PNG", 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.text("Facture", 105, 20, null, null, "center");

      doc.setFontSize(12);
      doc.text(`Date : ${new Date().toLocaleDateString()}`, 150, 10);
      doc.text(`Commande : ${commande._id}`, 14, 50);

      const body = commande.produits.map((produit) => [
        produit.nom || "Produit",
        (produit.prix ?? 0).toFixed(2) + " €",
      ]);

      doc.autoTable({
        startY: 60,
        head: [["Produit", "Prix"]],
        body,
      });

      doc.text(
        `Total : ${(commande.total ?? 0).toFixed(2)} €`,
        14,
        doc.lastAutoTable.finalY + 10
      );

      doc.save(`facture-${commande._id}.pdf`);
    };

    logo.onerror = () => {
      alert("Erreur de chargement du logo.");
    };
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Commandes Payées
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {commandes.map((commande) => (
            <Grid item xs={12} sm={6} md={4} key={commande._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    Commande #{commande._id?.slice(-6)}
                  </Typography>
                  <Typography variant="body2">
                    Total : {(commande.total ?? 0).toFixed(2)} €
                  </Typography>
                  <Typography variant="body2">Produits :</Typography>
                  <ul>
                    {commande.produits.length > 0 ? (
                      commande.produits.map((produit, index) => (
                        <li key={index}>{produit.nom}</li>
                      ))
                    ) : (
                      <li>Aucun produit</li>
                    )}
                  </ul>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => generatePDF(commande)}
                  >
                    Télécharger la facture
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default CommandePage;
