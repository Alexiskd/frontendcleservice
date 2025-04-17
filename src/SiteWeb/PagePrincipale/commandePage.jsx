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
  DialogTitle,
  DialogContent,
  DialogActions,
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

// Normalisation pour comparer les chaînes
const normalizeString = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[^\p{ASCII}]/gu, '');

// Décodage safe des images
const decodeImage = (img) =>
  img
    ? img.startsWith('data:')
      ? img
      : `data:image/jpeg;base64,${img}`
    : '';

// Popup CGV
const ConditionsGeneralesVentePopup = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Conditions Générales de Vente - Cleservice.com</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 2 }}>
        {/* ... contenu CGV ... */}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Fermer</Button>
    </DialogActions>
  </Dialog>
);

const CommandePage = () => {
  useEffect(() => window.scrollTo(0, 0), []);

  const { brand: brandName, reference: articleType, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // État popup CGV
  const [openCGV, setOpenCGV] = useState(false);
  const handleOpenCGV = () => setOpenCGV(true);
  const handleCloseCGV = () => setOpenCGV(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        if (!decodedArticleName.trim()) throw new Error("Nom d’article vide.");
        const bestUrl = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let res = await fetch(bestUrl);
        if (res.status === 404) {
          const fallbackUrl = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          res = await fetch(fallbackUrl);
          if (!res.ok) throw new Error(`Erreur closest-match : ${await res.text()}`);
        } else if (!res.ok) {
          throw new Error(`Erreur best-by-name : ${await res.text()}`);
        }
        const prod = await res.json();
        if (prod.marque && normalizeString(prod.marque) !== normalizeString(brandName)) {
          throw new Error('Marque non correspondante.');
        }
        setArticle(prod);
      } catch (e) {
        setErrorArticle(e.message);
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchProduct();
  }, [brandName, decodedArticleName]);

  if (loadingArticle) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (errorArticle || !article) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" color="error" gutterBottom>
          {errorArticle || 'Produit non disponible'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Retour à l’accueil
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          Commander {article.nom}
        </Typography>
        {/* Formulaire de commande ici */}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="outlined" onClick={handleOpenCGV}>
            Conditions Générales de Vente
          </Button>
        </Box>
      </Container>

      <ConditionsGeneralesVentePopup open={openCGV} onClose={handleCloseCGV} />
    </Box>
  );
};

export default CommandePage;
