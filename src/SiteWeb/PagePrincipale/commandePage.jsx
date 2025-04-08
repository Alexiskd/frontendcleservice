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
import { PhotoCamera, CloudUpload, Person, Email, Phone, Home, LocationCity, Info, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ConditionsGeneralesVentePopup from './ConditionsGeneralesVentePopup';

// ... (vos autres composants utilitaires et styles)

const CommandePage = () => {
  // On remonte en haut de la page lors du montage du composant
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extraction des paramètres depuis l'URL en utilisant les noms définis dans la route
  const { brand, reference, name } = useParams();
  const decodedProductName = name ? name.replace(/-/g, ' ') : '';

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // Exemple de récupération de l'article via l'API
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        const endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedProductName)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("L'article n'a pas été trouvé.");
          }
          throw new Error("Une erreur s'est produite lors du chargement de l'article.");
        }
        const responseText = await response.text();
        if (!responseText) {
          throw new Error("Le serveur a renvoyé une réponse vide.");
        }
        const data = JSON.parse(responseText);
        // Vérification que la marque indiquée dans l'URL correspond à celle de l'article récupéré
        if (data && data.manufacturer && data.manufacturer.toLowerCase() !== brand.toLowerCase()) {
          throw new Error("Le produit récupéré ne correspond pas à la marque indiquée dans l'URL.");
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

  // Déclaration d'autres états, logique de formulaire, etc.
  // ...

  // Gestion de l'affichage lors du chargement ou en cas d'erreur
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

  // Exemple de calcul du prix (vous adapterez selon votre logique)
  const articlePrice = article ? parseFloat(article.prix) : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = 0; // à adapter selon votre logique
  const totalPrice = safeArticlePrice + shippingFee;

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* ... votre formulaire de commande et les autres éléments ... */}

          {/* Récapitulatif affiché en bas */}
          <Grid item xs={12}>
            <Paper sx={{ padding: 2, borderRadius: 2, border: '1px solid #ccc' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Récapitulatif
              </Typography>
              {article && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {article.imageUrl && (
                    <Box onClick={() => {}} sx={{ cursor: 'pointer', mr: 2 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">Frais d'expédition</Typography>
                <Typography variant="body2">{shippingFee.toFixed(2)} €</Typography>
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
                // onClick={handleOrder} // Votre logique d'envoi de commande ici
                sx={{
                  mt: 2,
                }}
              >
                Commander
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
