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

const socket = io(import.meta.env.VITE_SERVER_URL);

function CommandePage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCommandes();

    socket.on("commandeUpdated", () => {
      fetchCommandes();
    });

    return () => {
      socket.off("commandeUpdated");
    };
  }, []);

  const generatePDF = (commande) => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = "/logo.png"; // chemin vers le fichier dans /public

    logoImg.onload = () => {
      doc.addImage(logoImg, "PNG", 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.text("Facture", 105, 20, null, null, "center");

      doc.setFontSize(12);
      doc.text(`Date : ${new Date().toLocaleDateString()}`, 150, 10);
      doc.text(`Numéro de commande : ${commande._id}`, 14, 50);

      const body = commande.produits.map((produit) => [
        produit.nom,
        produit.prix.toFixed(2) + " €",
      ]);

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


