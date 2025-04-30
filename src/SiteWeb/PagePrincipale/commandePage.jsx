import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, TextField, Button, Snackbar, Alert,
  RadioGroup, FormControlLabel, Radio, FormControl, Select, MenuItem,
  IconButton, InputAdornment, Card, CardMedia, Grid, Divider, CircularProgress,
  Checkbox, Paper, Dialog, DialogContent
} from '@mui/material';
import {
  PhotoCamera, CloudUpload, Person, Email, Phone, Home,
  LocationCity, Info, CheckCircle, Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ConditionsGeneralesVentePopup from './ConditionsGeneralesVentePopup';

const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
    <Typography variant="body2" sx={{ minWidth: '150px' }}>{label}</Typography>
    <IconButton color="primary" component="label" sx={{ backgroundColor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider', '&:hover': { backgroundColor: 'action.hover' } }}>
      <input type="file" name={name} accept={accept} hidden onChange={onChange} />
      <IconComponent sx={{ color: '#1B5E20' }} />
    </IconButton>
    {file && (
      <Typography variant="caption" color="success.main">
        {typeof file === 'string' ? file : file.name}
      </Typography>
    )}
  </Box>
);

const ModernCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.grey[500],
  '&.Mui-checked': { color: theme.palette.primary.main },
}));

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
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { brandName, articleType, articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!decodedArticleName) throw new Error("Nom d'article manquant dans l'URL.");
        setLoadingArticle(true);
        const endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Article non trouvé.');
          throw new Error("Erreur lors du chargement de l'article.");
        }
        const responseText = await response.text();
        if (!responseText) throw new Error('Réponse vide du serveur.');
        const data = JSON.parse(responseText);
        if (data && data.manufacturer && data.manufacturer.toLowerCase() !== brandName.toLowerCase()) {
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
  }, [brandName, decodedArticleName, articleType]);

  // --- Reste des hooks d'état et logique formulaire identique à ton code d'origine ---
  // Je les ai omis ici pour rester sous la limite de caractères

  return loadingArticle ? (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ) : errorArticle ? (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" color="error">{errorArticle}</Typography>
    </Box>
  ) : (
    <Box>
      {/* Contenu principal de la page */}
      <Container>
        <Typography variant="h4">Commande pour : {article.nom}</Typography>
        {/* …Suite de la structure formulaire et récapitulatif */}
      </Container>
    </Box>
  );
};

export default CommandePage;

