import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  Card,
  CardMedia,
  IconButton,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
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
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Fonction de normalisation pour comparer les chaînes
const normalizeString = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

// Les autres composants (AlignedFileUpload, ModernCheckbox, SectionPaper, SummaryCard, ConditionsGeneralesVentePopup)
// sont identiques à votre code original et ne sont pas modifiés ici.

const CommandePage = () => {
  const { brand: brandName, reference: articleType, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'postal' ou 'numero'
  const navigate = useNavigate();

  // États pour le produit
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // Récupération du produit en utilisant best-by-name avec fallback sur closest-match en cas de 404
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        if (!decodedArticleName.trim()) {
          throw new Error("Le nom de l'article est vide après décodage.");
        }

        // Tentative de récupération via best-by-name
        const endpointBest = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpointBest);

        // Si best-by-name renvoie un 404, on utilise l'endpoint closest-match
        if (response.status === 404) {
          console.warn("best-by-name retourne 404, utilisation du fallback closest-match.");
          const endpointFallback = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          response = await fetch(endpointFallback);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur lors du chargement du produit via closest-match : ${errorText}`);
          }
        } else if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur lors du chargement du produit via best-by-name : ${errorText}`);
        }

        const product = await response.json();
        if (product && product.marque && normalizeString(product.marque) !== normalizeString(brandName)) {
          throw new Error("La marque de l'article ne correspond pas.");
        }
        setArticle(product);
      } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        setErrorArticle(err.message || "Erreur inconnue");
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchProduct();
  }, [brandName, decodedArticleName]);

  // Le reste de la composante (états pour le formulaire, gestion des inputs, commande, affichage, etc.)
  // reste inchangé par rapport à votre code complet.

  if (loadingArticle) {
    return (
      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorArticle || !article) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" color="error" gutterBottom>
          {errorArticle || "Produit non disponible"}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Retour à l’accueil
        </Button>
      </Container>
    );
  }

  return (
    // Le rendu complet de votre formulaire et récapitulatif, etc.
    <Box>
      <Typography variant="h1">{article.nom}</Typography>
      <Typography variant="body1">Marque : {article.marque}</Typography>
      <Typography variant="body1">Prix : {article.prix} €</Typography>
      {/* Le reste du contenu de la page */}
    </Box>
  );
};

export default CommandePage;
