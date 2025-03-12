import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

const StatistiquesCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupération des commandes payées
  useEffect(() => {
    const fetchCommandes = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://cl-back.onrender.com/commande/paid', {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération (status ${response.status})`);
        }
        const json = await response.json();
        setCommandes(Array.isArray(json.data) ? json.data : []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des commandes :', err);
        setError('Erreur lors du chargement des commandes.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, []);

  // Calcul des statistiques
  const count = commandes.length;
  const totalTTC = commandes.reduce(
    (acc, commande) => acc + parseFloat(commande.prix || 0),
    0
  );
  const tauxTVA = 0.20;
  const totalHT = totalTTC / (1 + tauxTVA);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        fontFamily: '"Poppins", sans-serif',
        backgroundColor: 'rgba(240, 255, 245, 0.5)',
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: '#388e3c', fontWeight: 600 }}
      >
        Statistiques des Commandes
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="success" />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          {/* Boîte pour le nombre de commandes */}
          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                  Nombre de commandes
                </Typography>
                <Typography variant="h4" sx={{ color: '#388e3c', fontWeight: 600 }}>
                  {count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Boîte pour le total TTC */}
          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                  Total TTC
                </Typography>
                <Typography variant="h4" sx={{ color: '#388e3c', fontWeight: 600 }}>
                  {totalTTC.toFixed(2)} €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Boîte pour le total HT */}
          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                  Total HT
                </Typography>
                <Typography variant="h4" sx={{ color: '#388e3c', fontWeight: 600 }}>
                  {totalHT.toFixed(2)} €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default StatistiquesCommandes;
