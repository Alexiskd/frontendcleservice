// KeySearchAll.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

/**
 * normalizeText:
 * - Convertit le texte en minuscules.
 * - Supprime les accents.
 * - Retire les espaces et tout caractère non alphanumérique.
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques (accents)
    .replace(/[^a-z0-9]/g, '');       // Supprime les caractères non alphanumériques
};

const KeySearch = () => {
  // États du composant
  const [searchTerm, setSearchTerm] = useState('');
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Récupération des clés depuis le back-end
  useEffect(() => {
    const fetchAllKeys = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('https://cl-back.onrender.com/produit/cles/all?limit=1000&skip=0', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la récupération des clés.');
        }
        const data = await response.json();
        setKeys(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllKeys();
  }, []);

  // Mise à jour de la chaîne de recherche
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Filtrage des clés (minimum 3 caractères)
  const filteredKeys = useMemo(() => {
    if (searchTerm.length < 3) return [];
    const normalizedSearch = normalizeText(searchTerm);
    return keys.filter((item) => normalizeText(item.nom).includes(normalizedSearch));
  }, [keys, searchTerm]);

  // Gestion de la fermeture de la Snackbar
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }, []);

  // Ouvre ou ferme la popup
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSearchTerm('');
  };

  // Styles mis à jour pour un design moderne et épuré
  const styles = {
    page: { 
      backgroundColor: '#f5f5f5', 
      padding: '16px', 
      textAlign: 'center',
      maxWidth: '800px', 
      margin: '20px auto',
      borderRadius: '12px',
    },
    bigButton: { 
      fontSize: '1.5rem', 
      padding: '16px 32px',
      backgroundColor: '#2E7D32',
      borderRadius: '12px',
      textTransform: 'none',
      boxShadow: 'none',
      '&:hover': { 
        backgroundColor: '#276324',
        boxShadow: 'none'
      }
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)' 
      },
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    cardMedia: {
      height: 180,
      width: '100%',
      objectFit: 'contain', // Permet d'afficher l'image en entier sans la couper
      padding: '16px',      // Espace autour de l'image
      backgroundColor: '#fff'
    },
    cardContent: {
      flexGrow: 1,
      padding: '16px',
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center',
    },
    productName: {
      fontSize: '1.1rem',
      fontWeight: 600,
      marginBottom: '8px',
      color: '#333',
    },
    dialogContent: {
      padding: '24px'
    },
    textField: {
      marginBottom: '24px'
    }
  };

  return (
    <Box sx={styles.page}>
      {/* Bouton d'ouverture de la popup */}
      <Button
        variant="contained"
        size="large"
        onClick={handleOpenDialog}
        sx={styles.bigButton}
      >
        Rechercher votre Clé
      </Button>

      {/* Popup (Dialog) de recherche */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
          Recherche votre Clé
        </DialogTitle>
        <DialogContent dividers sx={styles.dialogContent}>
          <TextField
            label="Tapez la réference marqué sur votre clé (min. 3 caractères)"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            sx={styles.textField}
          />

          {loading ? (
            <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Chargement...
            </Typography>
          ) : error ? (
            <Typography color="error" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {error}
            </Typography>
          ) : searchTerm.length < 3 ? (
            <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Veuillez taper au moins 3 caractères pour lancer la recherche.
            </Typography>
          ) : filteredKeys.length > 0 ? (
            <Grid container spacing={3}>
              {filteredKeys.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={styles.card}>
                    <CardMedia
                      component="img"
                      image={
                        item.imageUrl
                          ? item.imageUrl.startsWith('http')
                            ? item.imageUrl
                            : `https://cl-back.onrender.com/${item.imageUrl}`
                          : ''
                      }
                      alt={item.nom}
                      sx={styles.cardMedia}
                      loading="lazy"
                    />
                    <CardContent sx={styles.cardContent}>
                      <Typography sx={styles.productName}>{item.nom}</Typography>
                      <Typography variant="body2">Marque : {item.marque}</Typography>
                      <Typography variant="body2">Prix : {item.prix} €</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Aucun résultat trouvé.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ color: '#2E7D32', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%', fontFamily: 'Montserrat, sans-serif' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KeySearch;
