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

// Fonction de normalisation pour comparer les chaînes
const normalizeString = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[^\p{ASCII}]/gu, "");

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
  // Défilement vers le haut lors du chargement de la page
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

  // État pour le popup CGV
  const [openCGV, setOpenCGV] = useState(false);

  // Gestion ouverture/fermeture CGV
  const handleOpenCGV = () => setOpenCGV(true);
  const handleCloseCGV = () => setOpenCGV(false);

  // Récupération du produit via best-by-name avec fallback sur closest-match
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        if (!decodedArticleName.trim()) {
          throw new Error("Le nom de l'article est vide après décodage.");
        }
        const endpointBest = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpointBest);
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

  // ... (le reste des états et fonctions de gestion de formulaire et commande)

  // Affichage pendant le chargement ou en cas d'erreur
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
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      {/* JSX pour le formulaire et le récapitulatif de commande */}

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="outlined" onClick={handleOpenCGV}>
          Conditions Générales de Vente
        </Button>
      </Box>

      <ConditionsGeneralesVentePopup open={openCGV} onClose={handleCloseCGV} />
    </Box>
  );
};

export default CommandePage;

