// src/AppAdmin/commande.jsx

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

// Styled Paper pour sections (si besoin)
const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

// Popup des Conditions Générales de Vente
const ConditionsGeneralesVentePopup = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Conditions Générales de Vente - Cleservice.com</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 2 }}>
        <Typography variant="h6" gutterBottom>
          Article 1 : Objet
        </Typography>
        <Typography variant="body2" paragraph>
          Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Maison Bouvet S.A.S. (ci-après "le Vendeur") et tout client souhaitant effectuer un achat sur le site cleservice.com (ci-après "l'Acheteur").
        </Typography>
        <Typography variant="body2" paragraph>
          Les produits proposés à la vente sont présentés avec la plus grande exactitude possible. En cas d'erreur ou d'omission, le Vendeur se réserve le droit de corriger les informations sans que cela n'engage sa responsabilité.
        </Typography>
        <Typography variant="body2" paragraph>
          Les prix indiqués sur le site sont exprimés en euros, toutes taxes comprises (TTC) et peuvent être modifiés à tout moment. Le prix applicable à l'achat est celui en vigueur au moment de la validation de la commande.
        </Typography>
        <Typography variant="body2" paragraph>
          Toute commande passée sur le site implique l'acceptation sans réserve des présentes CGV.
        </Typography>
        <Typography variant="body2" paragraph>
          Conformément à la législation en vigueur, l'Acheteur dispose d'un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation.
        </Typography>
        <Typography variant="body2" paragraph>
          Les produits vendus bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.
        </Typography>
        <Typography variant="body2" paragraph>
          Le Vendeur ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation des produits.
        </Typography>
        <Typography variant="body2" paragraph>
          Les présentes CGV sont régies par le droit français. En cas de litige, seuls les tribunaux de Paris seront compétents.
        </Typography>
        <Typography variant="body2" align="center" paragraph>
          © 2025 cleservice.com - Tous droits réservés.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Fermer
      </Button>
    </DialogActions>
  </Dialog>
);

const CommandePage = () => {
  // Scroll vers le haut au chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Récupération des paramètres d'URL
  const { brand: brandName, reference: articleType, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // "postal" ou "numero"
  const navigate = useNavigate();

  // États pour le produit
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // États pour le formulaire de commande (exemples)
  // const [quantite, setQuantite] = useState(1);
  // const [nomClient, setNomClient] = useState('');
  // etc.

  // État pour l'ouverture de la popup CGV
  const [openCGV, setOpenCGV] = useState(false);
  const handleOpenCGV = () => setOpenCGV(true);
  const handleCloseCGV = () => setOpenCGV(false);

  // Récupération du produit via best-by-name avec fallback
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        if (!decodedArticleName.trim()) {
          throw new Error("Nom d’article vide.");
        }
        const bestUrl = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let res = await fetch(bestUrl);
        if (res.status === 404) {
          const fallbackUrl = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          res = await fetch(fallbackUrl);
          if (!res.ok) {
            throw new Error(`Erreur closest-match : ${await res.text()}`);
          }
        } else if (!res.ok) {
          throw new Error(`Erreur best-by-name : ${await res.text()}`);
        }

        const prod = await res.json();
        if (
          prod.marque &&
          normalizeString(prod.marque) !== normalizeString(brandName)
        ) {
          throw new Error("Marque non correspondante.");
        }
        setArticle(prod);
      } catch (err) {
        console.error("Erreur récupération produit :", err);
        setErrorArticle(err.message);
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchProduct();
  }, [brandName, decodedArticleName]);

  // Affichage pendant le chargement ou en cas d'erreur
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

  // Ici : calcul du prix, gestion du formulaire, envoi de la commande, etc.

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          Commander {article.nom}
        </Typography>

        {/* Vos champs de formulaire ici */}

        {/* Bouton pour ouvrir les CGV */}
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
