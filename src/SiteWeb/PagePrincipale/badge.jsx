import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import badgeImage from './badge.jpg';
import PhoneNumber from './PhoneNumber';

const Badgeuu = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  // Redirection vers la page de commande pour le Badge Vigik
  const handleOrderNow = () => {
    navigate(
      `/commander/Vigik/cle/BadgeVigik/${encodeURIComponent('Badge Vigik')}?mode=postal`
    );
  };

  // Redirection vers la page produit (mise à jour effectuée)
  const handleViewProduct = () => {
    navigate(`/produit/Vigik/${encodeURIComponent('Badge Vigik')}`);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Styles
  const styles = {
    header: {
      backgroundColor: '#01591f',
      height: { xs: '100px', md: '120px' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    page: {
      backgroundColor: '#F5F5F5',
      minHeight: '100vh',
      paddingBottom: '24px',
    },
    explanationContainer: {
      p: { xs: 2, sm: 3 },
      backgroundColor: '#fff',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    explanationTitle: {
      mb: 2,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
      fontSize: { xs: '1.5rem', sm: '2rem' },
    },
    explanationText: {
      mb: 1,
      fontFamily: 'Roboto, sans-serif',
      fontSize: '1rem',
    },
    card: {
      borderRadius: 3,
      boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
    },
    cardMedia: {
      height: 220,
      objectFit: 'cover',
    },
    cardContent: {
      p: 3,
      textAlign: 'center',
      fontFamily: 'Montserrat, sans-serif',
    },
    productName: {
      fontSize: '1.5rem',
      fontWeight: 700,
      mb: 1,
      color: '#333',
    },
    priceBadge: {
      display: 'inline-block',
      padding: '8px 16px',
      borderRadius: '20px',
      backgroundColor: '#f0f0f0',
      color: '#555',
      fontSize: '1rem',
      mb: 2,
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      mt: 2,
    },
    buttonPrimary: {
      borderRadius: '50px',
      px: 4,
      py: 1.5,
      backgroundColor: '#1B5E20',
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#155724',
      },
    },
    buttonSecondary: {
      borderRadius: '50px',
      px: 4,
      py: 1.5,
      color: '#1B5E20',
      borderColor: '#1B5E20',
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#1B5E20',
        color: '#fff',
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Commande Badge Vigik - Reproduction de Badge Sécurisé à 30€ | NomDuSite</title>
        <meta
          name="description"
          content="Commandez votre Badge Vigik, indispensable pour accéder à vos espaces sécurisés. Reproduction de badge de qualité à 30€ l'unité, avec livraison rapide par voie postale."
        />
      </Helmet>
      <Box sx={styles.page}>
        {/* Bandeau supérieur */}
        
        {/* Conteneur regroupant les deux sections côte à côte */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: 'stretch',
            }}
          >
            {/* Section d'explication */}
            <Box sx={{ flex: 1 }}>
              <Box sx={styles.explanationContainer}>
                <Typography component="h1" sx={styles.explanationTitle}>
                  Comment commander votre Badge Vigik ?
                </Typography>
                <Typography sx={styles.explanationText}>
                  Le Badge Vigik est indispensable pour accéder à vos espaces sécurisés.
                </Typography>
                <Typography sx={styles.explanationText}>
                  Cliquez sur "Commander" pour passer votre commande dès maintenant.
                </Typography>
              </Box>
            </Box>

            {/* Section produit */}
            <Box sx={{ flex: 1 }}>
              <Card sx={styles.card}>
                <CardMedia
                  component="img"
                  image={badgeImage}
                  alt="Badge Vigik - Reproduction de badge pour accès sécurisé"
                  sx={styles.cardMedia}
                />
                <CardContent sx={styles.cardContent}>
                  <Typography sx={styles.productName}>Badge Vigik</Typography>
                  <Box sx={styles.priceBadge}>
                    Prix : <strong>30€</strong> unitaire
                  </Box>
                  <Box sx={styles.buttonContainer}>
                    <Button variant="contained" sx={styles.buttonPrimary} onClick={handleOrderNow}>
                      Commander
                    </Button>
                    <Button variant="outlined" sx={styles.buttonSecondary} onClick={handleViewProduct}>
                      Voir le produit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>

        {/* Snackbar de notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Badgeuu;
