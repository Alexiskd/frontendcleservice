import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  Grid,
  Divider,
  IconButton,
  InputAdornment
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
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.divider
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary
}));

// Composante principale
const CommandePage = () => {
  // Pour cet exemple, nous nous concentrons sur l'affichage du produit
  const { name: encodedArticleName, brand: brandName } = useParams();
  const decodedArticleName = encodedArticleName ? encodedArticleName.replace(/-/g, ' ') : '';
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        // Recherche exacte par nom (endpoint "by-name")
        let endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpoint);
        if (!response.ok) {
          // S'il n'y a pas de correspondance exacte, utiliser le fallback "best-by-name"
          endpoint = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
          response = await fetch(endpoint);
        }
        if (!response.ok) {
          throw new Error("Produit introuvable.");
        }
        const data = await response.json();
        // Vous pouvez vérifier ici si la marque correspond, par exemple
        if (data && data.marque && data.marque.toLowerCase() !== brandName.toLowerCase()) {
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

  if (loadingArticle) {
    return (
      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorArticle) {
    return (
      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <Typography variant="h5" gutterBottom>
                Détails du Produit
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {article ? (
                <Box>
                  <Typography variant="h6">{article.nom}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Marque : {article.marque}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Prix : {article.prix} €</Typography>
                  {article.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <CardMedia
                        component="img"
                        image={article.imageUrl}
                        alt={article.nom}
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
        </Grid>
      </Container>
    </Box>
  );
};

export default CommandePage;
