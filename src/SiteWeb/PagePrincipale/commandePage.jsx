import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Grid, Typography, Box } from '@mui/material';

const CommandePage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get('https://cl-back.onrender.com/produit/cles?marque=FONTAINE');
        if (Array.isArray(response.data)) {
          setCommandes(response.data);
        } else {
          setError('Les données retournées ne sont pas un tableau.');
        }
      } catch (err) {
        console.error('Erreur lors du fetch:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {commandes.length > 0 ? (
        commandes.map((commande, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box border={1} borderRadius={2} padding={2}>
              <Typography variant="h6">Commande {commande.id}</Typography>
              <Typography variant="body1">Marque: {commande.marque}</Typography>
              <Typography variant="body2">Description: {commande.description}</Typography>
            </Box>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Typography variant="h6">Aucune commande trouvée.</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default CommandePage;
