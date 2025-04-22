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
  VpnKey,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ConditionsGeneralesVentePopup from './ConditionsGeneralesVentePopup';
import { preloadKeysData } from '../../api/brandsApi';

const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ mb: 2 }}>
    <Button variant="outlined" component="label" startIcon={<IconComponent />}>
      {label}
      <input
        type="file"
        hidden
        name={name}
        accept={accept}
        onChange={onChange}
      />
    </Button>
    {file && (
      <Typography variant="body2" sx={{ mt: 1 }}>
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
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Params & navigation
  const { brandName, articleType, articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  // États principaux
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);
  const [preloadedKey, setPreloadedKey] = useState(null);

  // Modals & UI
  const [openImageModal, setOpenImageModal] = useState(false);
  const handleOpenImageModal = () => setOpenImageModal(true);
  const handleCloseImageModal = () => setOpenImageModal(false);

  // Formulaire
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

  // Notifications / loading commande
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);
  const [openCGV, setOpenCGV] = useState(false);

  // Chargement de l'article depuis l'API
  const loadArticle = useCallback(async () => {
    try {
      setLoadingArticle(true);
      setErrorArticle(null);
      const endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(
        decodedArticleName
      )}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Article non trouvé.');
        throw new Error("Erreur lors du chargement de l'article.");
      }
      const text = await response.text();
      if (!text) throw new Error('Réponse vide du serveur.');
      const data = JSON.parse(text);
      if (
        data.manufacturer &&
        data.manufacturer.toLowerCase() !== brandName.toLowerCase()
      ) {
        throw new Error("La marque de l'article ne correspond pas.");
      }
      setArticle(data);
    } catch (err) {
      setErrorArticle(err.message);
    } finally {
      setLoadingArticle(false);
    }
  }, [brandName, decodedArticleName]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  // Préchargement des clés de la marque
  useEffect(() => {
    if (brandName && article) {
      preloadKeysData(brandName)
        .then((keys) => {
          const found = keys.find(
            (key) =>
              key.nom.trim().toLowerCase() === article.nom.trim().toLowerCase()
          );
          if (found) setPreloadedKey(found);
        })
        .catch(console.error);
    }
  }, [brandName, article]);

  // Sélection des détails à afficher
  const productDetails = preloadedKey || article;

  // Calculs des prix
  const basePrice = productDetails
    ? isCleAPasse && productDetails.prixCleAPasse
      ? parseFloat(productDetails.prixCleAPasse)
      : mode === 'postal'
      ? parseFloat(productDetails.prixSansCartePropriete)
      : parseFloat(productDetails.prix)
    : 0;
  const safeArticlePrice = isNaN(basePrice) ? 0 : basePrice;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const totalPrice = safeArticlePrice + shippingFee;

  // Validation du formulaire
  const validateForm = () => {
    if (
      !userInfo.nom.trim() ||
      !userInfo.email.trim() ||
      !userInfo.phone.trim() ||
      !userInfo.address.trim() ||
      !userInfo.postalCode.trim() ||
      !userInfo.ville.trim() ||
      (productDetails?.besoinPhoto &&
        (!keyInfo.frontPhoto || !keyInfo.backPhoto)) ||
      !shippingMethod ||
      (mode === 'postal' && !deliveryType)
    ) {
      return false;
    }
    if (mode === 'numero') {
      if (
        productDetails?.besoinNumeroCarte &&
        !lostCartePropriete &&
        !keyInfo.propertyCardNumber.trim()
      )
        return false;
      if (lostCartePropriete) {
        if (
          !idCardInfo.idCardFront ||
          !idCardInfo.idCardBack ||
          !idCardInfo.domicileJustificatif ||
          !attestationPropriete
        )
          return false;
      }
    }
    return true;
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in userInfo) setUserInfo((p) => ({ ...p, [name]: value }));
    else if (name in keyInfo) setKeyInfo((p) => ({ ...p, [name]: value }));
  };
  const handlePhotoUpload = (e) => {
    const { name, files } = e.target;
    if (files?.[0]) setKeyInfo((p) => ({ ...p, [name]: files[0] }));
  };
  const handleIdCardUpload = async (e) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      if (name === 'domicileJustificatif') {
        const fd = new FormData();
        fd.append('pdf', files[0]);
        try {
          const res = await fetch('https://cl-back.onrender.com/upload/pdf', {
            method: 'POST',
            body: fd,
          });
          if (!res.ok) throw new Error("Erreur lors de l'upload du justificatif.");
          const data = await res.json();
          setIdCardInfo((p) => ({ ...p, domicileJustificatif: data.filePath }));
        } catch {
          setSnackbarMessage("Erreur lors de l'upload du justificatif.");
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } else {
        setIdCardInfo((p) => ({ ...p, [name]: files[0] }));
      }
    }
  };

  // Passage de commande + redirection Stripe
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
      // ... append champs ...
      const cmdRes = await fetch('https://cl-back.onrender.com/commande/create', {
        method: 'POST',
        body: fd,
      });
      if (!cmdRes.ok) {
        const errText = await cmdRes.text();
        throw new Error(`Erreur création commande : ${errText}`);
      }
      const { numeroCommande } = await cmdRes.json();
      const payload = {
        amount: totalPrice * 100,
        currency: 'eur',
        description: `Paiement pour ${userInfo.nom}`,
        success_url: `https://www.cleservice.com/commande-success?numeroCommande=${numeroCommande}`,
        cancel_url: `https://www.cleservice.com/commande-cancel?numeroCommande=${numeroCommande}`,
      };
      const payRes = await fetch('https://cl-back.onrender.com/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!payRes.ok) {
        const errText = await payRes.text();
        throw new Error(`Erreur paiement : ${errText}`);
      }
      const { paymentUrl } = await payRes.json();
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

  // Gestion des états vides / chargement
  if (errorArticle === 'Réponse vide du serveur.') {
    return (
      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2 }}>
        <ErrorIcon color="error" sx={{ fontSize: 40 }} />
        <Typography variant="h6" color="error">
          Réponse vide du serveur.
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Aucune donnée n'a été renvoyée. Vérifiez la connexion ou réessayez.
        </Typography>
        <Button variant="contained" onClick={loadArticle}>
          Réessayer
        </Button>
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

  // Affichage du formulaire et récapitulatif
  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* ...tout le JSX du formulaire et du récapitulatif... */}
      </Container>

      {/* Modal image */}
      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img
            src={productDetails?.imageUrl}
            alt={productDetails?.nom}
            style={{ width: '100%', display: 'block' }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          iconMapping={{
            success: <CheckCircle fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
          }}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;

