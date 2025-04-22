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

// Initialisation de la connexion au socket
const socket = io(import.meta.env.VITE_SERVER_URL);

function CommandePage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les commandes depuis le serveur
  const fetchCommandes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/commandes/payees`
      );
      setCommandes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes :", error);
      setLoading(false);
    }
  };

  // Effet de bord pour récupérer les commandes et mettre à jour en temps réel via socket
  useEffect(() => {
    fetchCommandes();

    // Écoute des événements de mise à jour de commande
    socket.on("commandeUpdated", () => {
      fetchCommandes();
    });

    return () => {
      // Nettoyage du socket lors du démontage du composant
      socket.off("commandeUpdated");
    };
  }, []);

  // Fonction pour générer la facture en PDF
  const generatePDF = (commande) => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = "/logo.png"; // Le fichier logo.png doit être dans le dossier public

    // Une fois que l'image est chargée, on ajoute le logo et les informations
    logoImg.onload = () => {
      doc.addImage(logoImg, "PNG", 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.text("Facture", 105, 20, null, null, "center");

      doc.setFontSize(12);
      doc.text(`Date : ${new Date().toLocaleDateString()}`, 150, 10);
      doc.text(`Numéro de commande : ${commande._id}`, 14, 50);

      // Préparer les produits pour le tableau
      const body = commande.produits.map((produit) => [
        produit.nom,
        produit.prix.toFixed(2) + " €",
      ]);

      // Ajouter le tableau des produits à la facture
      doc.autoTable({
        startY: 60,
        head: [["Produit", "Prix"]],
        body: body,
      });

      doc.text(
        `Total : ${commande.total.toFixed(2)} €`,
        14,
        doc.lastAutoTable.finalY + 10
      );

      // Sauvegarder la facture en PDF
      doc.save(`facture-${commande._id}.pdf`);
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
                    Commande #{commande._id.slice(-6)}
                  </Typography>
                  <Typography variant="body2">
                    Total : {commande.total.toFixed(2)} €
                  </Typography>
                  <Typography variant="body2">
                    Produits :
                    <ul>
                      {commande.produits.map((produit, idx) => (
                        <li key={idx}>{produit.nom}</li>
                      ))}
                    </ul>
                  </Typography>
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
