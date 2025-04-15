import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';

const CommandePage = () => {
  // Extraction des paramètres depuis l'URL (ex. : brand, reference, name, mode)
  const { brand, reference, name, mode } = useParams();
  const navigate = useNavigate();

  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    console.log("Recherche du produit avec le nom:", name);

    const fetchProduit = async () => {
      try {
        const response = await fetch(
          `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(name)}`
        );
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération du produit: ${response.status}`);
        }
        const data = await response.json();
        console.log("Produit récupéré:", data);
        setProduit(data);
      } catch (err) {
        console.error(err);
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduit();
  }, [name]);

  const handleCommander = () => {
    // Rediriger vers la page de finalisation de commande en utilisant l'id du produit
    if (produit && produit.id) {
      navigate(`/finaliser-commande/${produit.id}`);
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Commande - {produit ? produit.nom : 'Produit'}</title>
        <meta name="description" content="Page de commande du produit" />
      </Helmet>
      <Container sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : erreur ? (
          <Alert severity="error">{erreur}</Alert>
        ) : !produit ? (
          <Typography>Aucun produit trouvé.</Typography>
        ) : (
          <Box>
            <Typography variant="h4" gutterBottom>
              {produit.nom}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Marque : {produit.marque}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Prix : {produit.prix} €
            </Typography>
            {produit.descriptionProduit && (
              <Typography variant="body2" gutterBottom>
                {produit.descriptionProduit}
              </Typography>
            )}
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleCommander}>
                Procéder à la commande
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </HelmetProvider>
  );
};

export default CommandePage;
