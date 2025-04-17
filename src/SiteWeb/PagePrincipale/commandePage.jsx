// src/SiteWeb/PagePrincipale/commandePage.jsx
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
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ConditionsGeneralesVentePopup from './ConditionsGeneralesVentePopup';
// Import corrigé vers brandsApi placé dans src/SiteWeb/
import { preloadKeysData } from '../brandsApi';

const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
    <Typography variant="body2" sx={{ minWidth: '150px' }}>{label}</Typography>
    <IconButton
      color="primary"
      component="label"
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
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

const levenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
};

const CommandePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { brand, reference, articleName } = useParams();
  const decodedProductName = articleName
    ? decodeURIComponent(articleName).replace(/-/g, ' ')
    : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);
  const [preloadedKey, setPreloadedKey] = useState(null);
  const [deliveryType, setDeliveryType] = useState('');

  const [userInfo, setUserInfo] = useState({
    clientType: 'particulier', nom: '', email: '', phone: '', address: '',
    postalCode: '', ville: '', additionalInfo: '',
  });
  const [keyInfo, setKeyInfo] = useState({
    keyNumber: '', propertyCardNumber: '', frontPhoto: null, backPhoto: null,
  });
  const [isCleAPasse, setIsCleAPasse] = useState(false);
  const [lostCartePropriete, setLostCartePropriete] = useState(false);
  const [idCardInfo, setIdCardInfo] = useState({
    idCardFront: null, idCardBack: null, domicileJustificatif: '',
  });
  const [attestationPropriete, setAttestationPropriete] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('magasin');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);
  const [openCGV, setOpenCGV] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openImageModal, setOpenImageModal] = useState(false);
  const handleOpenImageModal = () => setOpenImageModal(true);
  const handleCloseImageModal = () => setOpenImageModal(false);

  const loadArticle = useCallback(async () => {
    try {
      setLoadingArticle(true);
      setErrorArticle(null);
      const res = await fetch(
        `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedProductName)}`
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error('Article non trouvé.');
        throw new Error("Erreur lors du chargement de l'article.");
      }
      const text = await res.text();
      if (!text) throw new Error('Réponse vide du serveur.');
      const data = JSON.parse(text);
      if (data.marque.toLowerCase() !== brand.toLowerCase()) {
        throw new Error("La marque de l'article ne correspond pas.");
      }
      setArticle(data);
    } catch (err) {
      setErrorArticle(err.message);
    } finally {
      setLoadingArticle(false);
    }
  }, [brand, decodedProductName]);

  useEffect(() => { loadArticle(); }, [loadArticle]);

  useEffect(() => {
    if (brand && article) {
      preloadKeysData(brand)
        .then(keys => {
          let best = null, bestDist = Infinity;
          const tgt = article.nom.toLowerCase();
          keys.forEach(k => {
            const d = levenshteinDistance(k.nom.toLowerCase(), tgt);
            if (d < bestDist) { bestDist = d; best = k; }
          });
          if (best) setPreloadedKey(best);
        })
        .catch(console.error);
    }
  }, [brand, article]);

  const productDetails = preloadedKey || article;
  const articlePrice = productDetails
    ? isCleAPasse && productDetails.prixCleAPasse
      ? parseFloat(productDetails.prixCleAPasse)
      : mode === 'postal'
      ? parseFloat(productDetails.prixSansCartePropriete)
      : parseFloat(productDetails.prix)
    : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const totalPrice = safeArticlePrice + shippingFee;

  const validateForm = () => {
    if (
      !userInfo.nom.trim() ||
      !userInfo.email.trim() ||
      !userInfo.phone.trim() ||
      !userInfo.address.trim() ||
      !userInfo.postalCode.trim() ||
      !userInfo.ville.trim() ||
      (productDetails?.besoinPhoto && (!keyInfo.frontPhoto || !keyInfo.backPhoto)) ||
      !shippingMethod ||
      (mode === 'postal' && !deliveryType)
    ) return false;
    if (mode === 'numero') {
      if (productDetails?.besoinNumeroCarte && !lostCartePropriete && !keyInfo.propertyCardNumber.trim())
        return false;
      if (lostCartePropriete) {
        if (
          !idCardInfo.idCardFront ||
          !idCardInfo.idCardBack ||
          !idCardInfo.domicileJustificatif ||
          !attestationPropriete
        ) return false;
      }
    }
    return true;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name in userInfo) setUserInfo(prev => ({ ...prev, [name]: value }));
    else if (name in keyInfo) setKeyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = e => {
    const { name, files } = e.target;
    if (files?.[0]) setKeyInfo(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleIdCardUpload = async e => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    if (name === 'domicileJustificatif') {
      const formData = new FormData();
      formData.append('pdf', files[0]);
      try {
        const r = await fetch('https://cl-back.onrender.com/upload/pdf', {
          method: 'POST',
          body: formData,
        });
        if (!r.ok) throw new Error("Erreur lors de l'upload du justificatif.");
        const d = await r.json();
        setIdCardInfo(prev => ({ ...prev, domicileJustificatif: d.filePath }));
      } catch {
        setSnackbarMessage("Erreur lors de l'upload du justificatif.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      setIdCardInfo(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleOrder = async () => {
    if (!termsAccepted) {
      setSnackbarMessage('Veuillez accepter les CGV.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!validateForm()) {
      setSnackbarMessage('Veuillez remplir tous les champs obligatoires.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setOrdering(true);
    try {
      const fd = new FormData();
      fd.append('nom', userInfo.nom);
      fd.append('email', userInfo.email);
      fd.append('phone', userInfo.phone);
      fd.append('address', userInfo.address);
      fd.append('postalCode', userInfo.postalCode);
      fd.append('ville', userInfo.ville);
      fd.append('additionalInfo', userInfo.additionalInfo);
      fd.append('prix', totalPrice.toFixed(2));
      fd.append('articleName', productDetails?.nom || '');
      fd.append('quantity', quantity);
      if (mode === 'numero') {
        if (productDetails?.besoinNumeroCle) fd.append('keyNumber', productDetails.nom);
        if (productDetails?.besoinNumeroCarte) {
          if (!lostCartePropriete) fd.append('propertyCardNumber', keyInfo.propertyCardNumber);
          else {
            fd.append('idCardFront', idCardInfo.idCardFront);
            fd.append('idCardBack', idCardInfo.idCardBack);
            fd.append('domicileJustificatifPath', idCardInfo.domicileJustificatif);
            fd.append('attestationPropriete', attestationPropriete);
          }
        }
      }
      fd.append('deliveryType', deliveryType);
      fd.append('shippingMethod', shippingMethod);
      fd.append('isCleAPasse', isCleAPasse);
      if (productDetails?.besoinPhoto) {
        fd.append('frontPhoto', keyInfo.frontPhoto);
        fd.append('backPhoto', keyInfo.backPhoto);
      }

      const r1 = await fetch('https://cl-back.onrender.com/commande/create', { method: 'POST', body: fd });
      if (!r1.ok) throw new Error(await r1.text());
      const { numeroCommande } = await r1.json();

      const payment = {
        amount: totalPrice * 100,
        currency: 'eur',
        description: `Paiement ${userInfo.nom}`,
        success_url: `https://www.cleservice.com/commande-success?numeroCommande=${numeroCommande}`,
        cancel_url: `https://www.cleservice.com/commande-cancel?numeroCommande=${numeroCommande}`,
      };
      const r2 = await fetch('https://cl-back.onrender.com/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      if (!r2.ok) throw new Error(await r2.text());
      const { paymentUrl } = await r2.json();
      window.location.href = paymentUrl;
    } catch (err) {
      setSnackbarMessage(`Erreur : ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOrdering(false);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (errorArticle === 'Réponse vide du serveur.' || errorArticle === 'Article non trouvé.') {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 2,
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 40 }} />
        <Typography variant="h6" color="error">{errorArticle}</Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Aucune donnée n'a été renvoyée. Vérifiez la connexion ou réessayez.
        </Typography>
        <Button variant="contained" onClick={loadArticle}>Réessayer</Button>
      </Box>
    );
  }

  if (loadingArticle) {
    return (
      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Formulaire de commande */}
          <Grid item xs={12}>
            <SectionPaper>
              {/* … le reste du JSX inchangé … */}
            </SectionPaper>
          </Grid>

          {/* Récapitulatif */}
          <Grid item xs={12}>
            <SummaryCard>
              {/* … le reste du JSX inchangé … */}
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>
      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={productDetails?.imageUrl} alt={productDetails?.nom} style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} iconMapping={{ success: <CheckCircle />, error: <ErrorIcon /> }} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;

