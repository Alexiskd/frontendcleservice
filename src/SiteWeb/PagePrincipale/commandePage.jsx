import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Snackbar,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Card,
  CardMedia,
  Grid,
  Divider,
  CircularProgress,
  Checkbox,
  Paper,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  PhotoCamera,
  CloudUpload,
  Person,
  Email,
  Phone,
  Home,
  LocationCity,
  Info,
  VpnKey,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ConditionsGeneralesVentePopup from './ConditionsGeneralesVentePopup';

// ... (autres composants utilitaires et styles)

const CommandePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Utilisation des bons paramètres de l'URL
  const { brand, reference, name } = useParams();
  const decodedProductName = name ? name.replace(/-/g, ' ') : '';

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // ... (autres états et fonctions)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        const endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedProductName)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Article non trouvé.');
          throw new Error("Erreur lors du chargement de l'article.");
        }
        const responseText = await response.text();
        if (!responseText) throw new Error('Réponse vide du serveur.');
        const data = JSON.parse(responseText);
        // Vérification que la marque correspond à celle du paramètre de l'URL
        if (data && data.manufacturer && data.manufacturer.toLowerCase() !== brand.toLowerCase()) {
          throw new Error("La marque de l'article ne correspond pas.");
        }
        setArticle(data);
      } catch (err) {
        setErrorArticle(err.message);
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchArticle();
  }, [brand, decodedProductName]);

  // Calcul du prix et autres variables (reste inchangé)
  const articlePrice = article
    ? /* ... votre logique pour déterminer le prix ... */
      parseFloat(article.prix) // exemple
    : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = /* ... votre logique pour le frais de port ... */ 0;
  const totalPrice = safeArticlePrice + shippingFee;

  // ... (les autres parties de votre composant : gestion des formulaires, des uploads, de la commande, etc.)

  if (loadingArticle) {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorArticle) {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="error">
          {errorArticle}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* ... Reste du formulaire de commande ... */}

          {/* Récapitulatif affiché en bas */}
          <Grid item xs={12}>
            <Paper sx={{ padding: 2, borderRadius: 2, border: '1px solid #ccc' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Récapitulatif
              </Typography>
              {article && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {article.imageUrl && (
                    <Box onClick={handleOpenImageModal} sx={{ cursor: 'pointer', mr: 2 }}>
                      <CardMedia
                        component="img"
                        image={article.imageUrl}
                        alt={article.nom}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle1">{article.nom}</Typography>
                    {article.manufacturer && (
                      <Typography variant="body2">Marque : {article.manufacturer}</Typography>
                    )}
                    <Typography variant="body2">
                      Prix : {safeArticlePrice.toFixed(2)} €
                    </Typography>
                  </Box>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              {/* Affichage des frais et du total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">
                  {/** Exemple : "Frais d'expédition" ou "Récupération en magasin" */}
                  {/* Votre logique ici */}
                  Frais d'expédition
                </Typography>
                <Typography variant="body2">
                  {shippingFee.toFixed(2)} €
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Total
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {totalPrice.toFixed(2)} €
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleOrder}
                disabled={ordering}
                sx={{
                  mt: 2,
                }}
              >
                {ordering ? <CircularProgress size={24} color="inherit" /> : 'Commander'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Reste du code (modale d'image, Snackbar, popup CGV, etc.) */}
    </Box>
  );
};

export default CommandePage;
