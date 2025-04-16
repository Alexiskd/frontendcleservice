import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogContent,
  Card,
  CardMedia,
  Grid,
  Divider,
  Checkbox,
} from '@mui/material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ConditionsGeneralesVentePopup from './ConditionsGeneralesVentePopup';

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary,
}));

const CommandePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extraction des paramètres URL
  // Par exemple, la route pourrait être définie comme "/commande/:brandName/:articleType/:articleName"
  const { brandName, articleType, articleName } = useParams();
  // On remplace les tirets par des espaces pour reconstituer le nom
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';

  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // Récupération du produit depuis le backend
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Vérifier que le nom de l'article est présent
        if (!decodedArticleName) {
          throw new Error("Paramètre 'articleName' absent.");
        }
        setLoadingArticle(true);
        setErrorArticle(null);

        // Construction de l'URL pour une recherche exacte
        let endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpoint);
        if (!response.ok) {
          console.warn("Produit introuvable avec /by-name. Essai via /cles/best-by-name.");
          // Utilisation de l'endpoint pour la meilleure correspondance si la recherche exacte échoue
          endpoint = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
          response = await fetch(endpoint);
        }
        if (!response.ok) {
          throw new Error("Produit introuvable.");
        }
        const data = await response.json();
        // Vérification optionnelle : s'assurer que la marque correspond
        if (data && data.manufacturer && data.manufacturer.toLowerCase() !== brandName.toLowerCase()) {
          throw new Error("La marque de l'article ne correspond pas.");
        }
        setArticle(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du produit:", err);
        setErrorArticle(err.message || "Erreur inconnue");
      } finally {
        setLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [brandName, decodedArticleName]);

  const productDetails = article;
  // Calcul du prix en fonction du mode (exemple simplifié)
  const articlePrice = productDetails
    ? mode === 'postal'
      ? parseFloat(productDetails.prixSansCartePropriete)
      : parseFloat(productDetails.prix)
    : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = mode === 'expedition' ? 8 : 0;
  const totalPrice = safeArticlePrice + shippingFee;

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
        <Typography variant="h6" color="error">{errorArticle}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <SectionPaper>
              <Typography variant="h5" gutterBottom>Informations de Commande</Typography>
              <Divider sx={{ mb: 3 }} />
              {productDetails ? (
                <Box>
                  <Typography variant="h6">{productDetails.nom}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Marque : {productDetails.marque}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Prix : {productDetails.prix} €</Typography>
                  {productDetails.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <CardMedia
                        component="img"
                        image={productDetails.imageUrl}
                        alt={productDetails.nom}
                        sx={{ width: 200, height: 200, objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body1">Aucun produit trouvé.</Typography>
              )}
            </SectionPaper>
          </Grid>
          {/* Vous pouvez ajouter ici d'autres sections du formulaire */}
        </Grid>
      </Container>
    </Box>
  );
};

export default CommandePage;


