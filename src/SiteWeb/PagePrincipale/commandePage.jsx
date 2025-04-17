// src/AppAdmin/commande.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const CommandePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('https://cl-back.onrender.com/commande/all');
        if (!res.ok) throw new Error('Erreur lors du chargement des commandes');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fonction pour décoder une image Base64 ou renvoyer directement si déjà data URI
  const decodeImage = (img) =>
    img
      ? img.startsWith('data:')
        ? img
        : `data:image/jpeg;base64,${img}`
      : '';

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" icon={<ErrorIcon />}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Réessayer
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord des Commandes
      </Typography>

      {orders.length === 0 ? (
        <Typography>Aucune commande disponible.</Typography>
      ) : (
        orders.map((order) => (
          <Card key={order.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Commande #{order.numeroCommande}</Typography>
              <Typography>Client : {order.nomClient}</Typography>
              <Typography>Statut : {order.statut}</Typography>
              {order.imagePreuve && (
                <CardMedia
                  component="img"
                  src={decodeImage(order.imagePreuve)}
                  alt="Preuve de paiement"
                  sx={{ width: 200, height: 'auto', mt: 2, borderRadius: 1 }}
                />
              )}
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" icon={<ErrorIcon />}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CommandePage;
