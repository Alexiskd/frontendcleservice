import React, { useState, useEffect, useCallback } from 'react';
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
  Select,
  MenuItem,
  IconButton,
  Card,
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
  VpnKey,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ConditionsGeneralesVentePopup from './ConditionsGeneralesVentePopup';
// ← chemin corrigé : PagePrincipale → api
import { preloadKeysData } from '../../../api/brandsApi';

const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ mb: 2 }}>
    <Button variant="outlined" component="label" startIcon={<IconComponent />}>
      {label}
      <input type="file" hidden name={name} accept={accept} onChange={onChange} />
    </Button>
    {file && <Typography variant="body2" sx={{ mt: 1 }}>{file.name || file}</Typography>}
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
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

const CommandePage = () => {
  // Scroll to top
  useEffect(() => window.scrollTo(0, 0), []);

  const { brandName, articleType, articleName } = useParams();
  const decodedArticleName = articleName?.replace(/-/g, ' ') || '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);
  const [preloadedKey, setPreloadedKey] = useState(null);

  const [openImageModal, setOpenImageModal] = useState(false);
  const handleOpenImageModal = () => setOpenImageModal(true);
  const handleCloseImageModal = () => setOpenImageModal(false);

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
  const [keyInfo, setKeyInfo] = useState({
    keyNumber: '',
    propertyCardNumber: '',
    frontPhoto: null,
    backPhoto: null,
  });
  const [isCleAPasse, setIsCleAPasse] = useState(false);
  const [lostCartePropriete, setLostCartePropriete] = useState(false);
  const [idCardInfo, setIdCardInfo] = useState({
    idCardFront: null,
    idCardBack: null,
    domicileJustificatif: '',
  });
  const [attestationPropriete, setAttestationPropriete] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('magasin');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);
  const [openCGV, setOpenCGV] = useState(false);

  // Load article
  const loadArticle = useCallback(async () => {
    setLoadingArticle(true);
    setErrorArticle(null);
    try {
      // URL entourée de `` pour être valide
      const endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(
        decodedArticleName
      )}`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Article non trouvé.');
        throw new Error("Erreur lors du chargement de l'article.");
      }
      const text = await res.text();
      if (!text) throw new Error('Réponse vide du serveur.');
      const data = JSON.parse(text);
      if (
        data.manufacturer &&
        data.manufacturer.toLowerCase() !== brandName.toLowerCase()
      ) {
        throw new Error("La marque ne correspond pas.");
      }
      setArticle(data);
    } catch (e) {
      setErrorArticle(e.message);
    } finally {
      setLoadingArticle(false);
    }
  }, [brandName, decodedArticleName]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  // Preload keys
  useEffect(() => {
    if (brandName && article) {
      preloadKeysData(brandName)
        .then((keys) => {
          const found = keys.find(
            (k) =>
              k.nom.trim().toLowerCase() === article.nom.trim().toLowerCase()
          );
          if (found) setPreloadedKey(found);
        })
        .catch(console.error);
    }
  }, [brandName, article]);

  const productDetails = preloadedKey || article;
  const basePrice = productDetails
    ? isCleAPasse && productDetails.prixCleAPasse
      ? parseFloat(productDetails.prixCleAPasse)
      : mode === 'postal'
      ? parseFloat(productDetails.prixSansCartePropriete)
      : parseFloat(productDetails.prix)
    : 0;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const totalPrice = (isNaN(basePrice) ? 0 : basePrice) + shippingFee;

  const validateForm = () => {
    // ... validation logic ...
    return true;
  };

  const handleOrder = async () => {
    if (!termsAccepted) {
      setSnackbarMessage('Veuillez accepter les CGV.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!validateForm()) {
      setSnackbarMessage('Champs obligatoires manquants.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setOrdering(true);
    try {
      const fd = new FormData();
      // append fields...
      const cmdRes = await fetch(
        'https://cl-back.onrender.com/commande/create',
        { method: 'POST', body: fd }
      );
      if (!cmdRes.ok) {
        const errText = await cmdRes.text();
        throw new Error(`Création commande : ${errText}`);
      }
      const { numeroCommande } = await cmdRes.json();
      const payload = {
        amount: Math.round(totalPrice * 100),
        currency: 'eur',
        description: `Paiement ${userInfo.nom}`,
        success_url: `https://www.cleservice.com/commande-success?numeroCommande=${numeroCommande}`,
        cancel_url: `https://www.cleservice.com/commande-cancel?numeroCommande=${numeroCommande}`,
      };
      const payRes = await fetch(
        'https://cl-back.onrender.com/stripe/create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!payRes.ok) {
        const errText = await payRes.text();
        throw new Error(`Paiement : ${errText}`);
      }
      const { paymentUrl } = await payRes.json();
      window.location.href = paymentUrl;
    } catch (e) {
      setSnackbarMessage(e.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOrdering(false);
    }
  };

  if (loadingArticle) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorArticle) {
    return (
      <Box sx={{ minHeight: '100vh', p: 4, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 48 }} />
        <Typography variant="h6" color="error">{errorArticle}</Typography>
        <Button onClick={loadArticle}>Réessayer</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* ... le reste du formulaire et résumé ... */}
      </Container>

      {/* Modals & Snackbar */}
      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={productDetails?.imageUrl} alt={productDetails?.nom} style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>

      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;
