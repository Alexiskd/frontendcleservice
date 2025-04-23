import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import jsPDF from 'jspdf';
import ConditionsGeneralesVentePopup from '@components/ConditionsGeneralesVentePopup'; // Assurez-vous que le chemin est correct

const CommandePage = () => {
  const navigate = useNavigate();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showConditions, setShowConditions] = useState(false);

  useEffect(() => {
    const socketInstance = io('https://your-socket-server-url'); // Remplace par ton URL de socket.io
    setSocket(socketInstance);

    socketInstance.on('commandeUpdated', (updatedCommande) => {
      setCommande(updatedCommande);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchCommande = async () => {
      try {
        const response = await fetch('/api/commande'); // Remplace par ton endpoint pour récupérer la commande
        const data = await response.json();
        setCommande(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur de récupération de commande:', error);
        setLoading(false);
      }
    };

    fetchCommande();
  }, []);

  const handleAnnulation = async () => {
    try {
      await fetch('/api/commande/annuler', { method: 'POST' }); // Remplace par l'endpoint pour annuler la commande
      setCommande(null);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text('Facture de commande', 10, 10);
    doc.text(`Commande ID: ${commande.id}`, 10, 20);
    doc.text(`Montant total: ${commande.montantTotal}`, 10, 30);
    // Ajoutez d'autres informations nécessaires
    doc.save(`facture-${commande.id}.pdf`);
  };

  const handleShowConditions = () => {
    setShowConditions(true);
  };

  const handleCloseConditions = () => {
    setShowConditions(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4">Détails de la commande</Typography>
        {commande ? (
          <Box mt={2}>
            <Typography variant="h6">ID de la commande: {commande.id}</Typography>
            <Typography variant="body1">Montant total: {commande.montantTotal}€</Typography>
            <Typography variant="body1">Status: {commande.status}</Typography>
            <Box mt={2}>
              <Button variant="contained" color="primary" onClick={handleGeneratePDF}>
                Télécharger la facture
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleAnnulation} sx={{ ml: 2 }}>
                Annuler la commande
              </Button>
            </Box>
            <Box mt={2}>
              <Button variant="text" onClick={handleShowConditions}>
                Voir les conditions générales de vente
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1">Aucune commande en cours.</Typography>
        )}
      </Box>

      <ConditionsGeneralesVentePopup open={showConditions} onClose={handleCloseConditions} />
    </Container>
  );
};

export default CommandePage;
