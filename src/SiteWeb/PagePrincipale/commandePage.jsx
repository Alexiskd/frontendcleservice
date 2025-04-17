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

// Utility pour normaliser les chaînes
const normalizeString = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

// Composants auxiliaires
const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
    <Typography variant="body2" sx={{ minWidth: 150 }}>{label}</Typography>
    <IconButton component="label" sx={{
      backgroundColor: 'background.paper',
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': { backgroundColor: 'action.hover' },
    }}>
      <input type="file" name={name} accept={accept} hidden onChange={onChange} />
      <IconComponent sx={{ color: '#1B5E20' }} />
    </IconButton>
    {file && <Typography variant="caption" color="success.main">{typeof file === 'string' ? file : file.name}</Typography>}
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
}));

const ConditionsGeneralesVentePopup = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Conditions Générales de Vente</DialogTitle>
    <DialogContent dividers>
      <Typography paragraph>
        Les présentes Conditions Générales de Vente régissent la vente de clés, cartes de propriété et services associés.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Fermer</Button>
    </DialogActions>
  </Dialog>
);

const CommandePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { brand: brandName, name: articleName } = useParams();
  const decodedArticleName = articleName?.replace(/-/g, ' ') || '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  // États produit
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // Fonction corrigée : backticks autour du data URI
  const decodeImage = (img) =>
    img
      ? img.startsWith('data:')
        ? img
        : `data:image/jpeg;base64,${img}`
      : '';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        if (!decodedArticleName.trim()) throw new Error("Nom vide.");
        const bestUrl = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let res = await fetch(bestUrl);
        if (res.status === 404) {
          const fallback = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          res = await fetch(fallback);
          if (!res.ok) throw new Error(`fallback échoué : ${await res.text()}`);
        } else if (!res.ok) {
          throw new Error(`best-by-name échoué : ${await res.text()}`);
        }
        const prod = await res.json();
        if (prod.marque && normalizeString(prod.marque) !== normalizeString(brandName)) {
          throw new Error("Marque non correspondante.");
        }
        setArticle(prod);
      } catch (err) {
        console.error(err);
        setErrorArticle(err.message);
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchProduct();
  }, [brandName, decodedArticleName]);

  // États formulaire
  const [userInfo, setUserInfo] = useState({
    clientType: 'particulier',
    nom: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    ville: '',
    additionalInfo: '',
  });
  const [keyInfo, setKeyInfo] = useState({ propertyCardNumber: '', frontPhoto: null, backPhoto: null });
  const [isCleAPasse, setIsCleAPasse] = useState(false);
  const [lostCartePropriete, setLostCartePropriete] = useState(false);
  const [idCardInfo, setIdCardInfo] = useState({ idCardFront: null, idCardBack: null, domicileJustificatif: '' });
  const [attestationPropriete, setAttestationPropriete] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('magasin');
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);
  const [openCGV, setOpenCGV] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in userInfo) setUserInfo(prev => ({ ...prev, [name]: value }));
    else if (name in keyInfo) setKeyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const { name, files } = e.target;
    if (files[0]) setKeyInfo(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleIdCardUpload = async (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      if (name === 'domicileJustificatif') {
        const fd = new FormData();
        fd.append('pdf', files[0]);
        try {
          const r = await fetch('https://cl-back.onrender.com/upload/pdf', { method: 'POST', body: fd });
          if (!r.ok) throw new Error("Upload PDF échoué.");
          const d = await r.json();
          setIdCardInfo(prev => ({ ...prev, domicileJustificatif: d.filePath }));
        } catch (err) {
          setSnackbarMessage(err.message);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } else {
        setIdCardInfo(prev => ({ ...prev, [name]: files[0] }));
      }
    }
  };

  const safeArticlePrice = article
    ? isCleAPasse && article.prixCleAPasse
      ? parseFloat(article.prixCleAPasse)
      : mode === 'postal'
        ? parseFloat(article.prixSansCartePropriete)
        : parseFloat(article.prix)
    : 0;
  const totalPrice = safeArticlePrice + (shippingMethod === 'expedition' ? 8 : 0);

  const handleOrder = async () => {
    if (!termsAccepted) {
      setSnackbarMessage('Veuillez accepter les CGV.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setOrdering(true);
    try {
      const fd = new FormData();
      Object.entries(userInfo).forEach(([k, v]) => fd.append(k, v));
      fd.append('prix', totalPrice.toFixed(2));
      fd.append('articleName', article.nom);
      fd.append('quantity', quantity.toString());
      if (mode === 'numero' && article.besoinNumeroCle) fd.append('keyNumber', article.nom);
      if (mode === 'numero' && article.besoinNumeroCarte) {
        if (!lostCartePropriete) fd.append('propertyCardNumber', keyInfo.propertyCardNumber);
        else {
          fd.append('idCardFront', idCardInfo.idCardFront);
          fd.append('idCardBack', idCardInfo.idCardBack);
          fd.append('domicileJustificatifPath', idCardInfo.domicileJustificatif);
          fd.append('attestationPropriete', attestationPropriete.toString());
        }
      }
      fd.append('deliveryType', deliveryType);
      fd.append('shippingMethod', shippingMethod);
      fd.append('isCleAPasse', isCleAPasse.toString());
      if (article.besoinPhoto) {
        fd.append('frontPhoto', keyInfo.frontPhoto);
        fd.append('backPhoto', keyInfo.backPhoto);
      }

      const res = await fetch('https://cl-back.onrender.com/commande/create', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const { numeroCommande } = await res.json();

      const pay = await fetch('https://cl-back.onrender.com/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice * 100,
          currency: 'eur',
          description: `Paiement pour ${userInfo.nom}`,
          success_url: `https://cleservice.com/commande-success?numeroCommande=${numeroCommande}`,
          cancel_url: `https://cleservice.com/commande-cancel?numeroCommande=${numeroCommande}`,
        }),
      });
      if (!pay.ok) throw new Error(await pay.text());
      const { paymentUrl } = await pay.json();
      window.location.href = paymentUrl;
    } catch (err) {
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOrdering(false);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (loadingArticle) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorArticle || !article) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{errorArticle || "Produit non disponible"}</Typography>
        <Button onClick={() => navigate('/')}>Retour</Button>
      </Container>
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
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6">
                  {mode === 'postal'
                    ? 'Atelier — envoyez votre clé après paiement.'
                    : 'Numéro — pas besoin d’envoyer la clé.'}
                </Typography>
              </Box>
              {/* ... votre formulaire ici ... */}
            </SectionPaper>
          </Grid>

          <Grid item xs={12}>
            <SummaryCard>
              <Typography variant="h6" sx={{ mb: 2 }}>Récapitulatif</Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                {article.imageBase64 && (
                  <CardMedia
                    component="img"
                    image={decodeImage(article.imageBase64)}
                    alt={article.nom}
                    sx={{ width: 80, height: 80, borderRadius: 1, mr: 2 }}
                  />
                )}
                <Box>
                  <Typography>{article.nom}</Typography>
                  <Typography variant="body2">Marque : {article.marque}</Typography>
                  <Typography variant="body2">Prix : {safeArticlePrice.toFixed(2)} €</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Livraison</Typography>
                <Typography>{shippingMethod === 'expedition' ? '8 €' : '0 €'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography fontWeight="bold">Total</Typography>
                <Typography fontWeight="bold">{totalPrice.toFixed(2)} €</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleOrder}
                disabled={ordering}
                sx={{ mt: 2 }}
              >
                {ordering ? <CircularProgress size={24} /> : 'Commander'}
              </Button>
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={decodeImage(article.imageBase64)} alt={article.nom} style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar} iconMapping={{
          success: <CheckCircle />,
          error: <ErrorIcon />,
        }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;
