import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Container, TextField, Button, CircularProgress,
  Snackbar, Alert, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Grid, Card, CardMedia, IconButton,
  InputAdornment, RadioGroup, FormControlLabel, Radio,
  FormControl, Select, MenuItem, Checkbox
} from '@mui/material';
import {
  PhotoCamera, CloudUpload, Person, Email, Phone, Home,
  LocationCity, Info, CheckCircle, Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Fonction de normalisation pour comparer les chaînes
const normalizeString = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

// Composant de téléchargement de fichier aligné
const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
    <Typography variant="body2" sx={{ minWidth: '150px' }}>{label}</Typography>
    <IconButton
      color="primary"
      aria-label={label}
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

// Checkbox avec style moderne
const ModernCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.grey[500],
  '&.Mui-checked': { color: theme.palette.primary.main },
}));

// Paper stylisé pour les sections
const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

// Card de résumé stylisée
const SummaryCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary,
}));

// Popup des Conditions Générales de Vente
const ConditionsGeneralesVentePopup = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Conditions Générales de Vente - Cleservice.com</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 2 }}>
        {/* CGV Articles 1 à 11 */}
        {/* ... */}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">Fermer</Button>
    </DialogActions>
  </Dialog>
);

const CommandePage = () => {
  // Scroll to top on load
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // URL params & navigation
  const { brand: brandName, reference: articleType, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // "postal" or "numero"
  const navigate = useNavigate();

  // Product state
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        if (!decodedArticleName.trim()) throw new Error("Nom d'article vide après décodage.");
        const bestUrl = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let res = await fetch(bestUrl);
        if (res.status === 404) {
          const fallback = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          res = await fetch(fallback);
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Erreur chargement produit : ${txt}`);
        }
        const prod = await res.json();
        if (prod.marque && normalizeString(prod.marque) !== normalizeString(brandName)) {
          throw new Error("La marque de l'article ne correspond pas.");
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

  // User & key info states
  const [userInfo, setUserInfo] = useState({
    clientType: 'particulier',
    nom: '', email: '', phone: '',
    address: '', postalCode: '', ville: '', additionalInfo: ''
  });
  const [keyInfo, setKeyInfo] = useState({
    keyNumber: '', propertyCardNumber: '', frontPhoto: null, backPhoto: null
  });
  const [isCleAPasse, setIsCleAPasse] = useState(false);
  const [lostCartePropriete, setLostCartePropriete] = useState(false);
  const [idCardInfo, setIdCardInfo] = useState({
    idCardFront: null, idCardBack: null, domicileJustificatif: ''
  });
  const [attestationPropriete, setAttestationPropriete] = useState(false);

  // Shipping & CGV states
  const [deliveryType, setDeliveryType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('magasin');
  const [quantity, setQuantity] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openCGV, setOpenCGV] = useState(false);

  // Ordering & notifications
  const [ordering, setOrdering] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Image modal
  const [openImageModal, setOpenImageModal] = useState(false);

  // Handlers for inputs & uploads
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
      const form = new FormData();
      form.append('pdf', files[0]);
      try {
        const res = await fetch('https://cl-back.onrender.com/upload/pdf', { method: 'POST', body: form });
        if (!res.ok) throw new Error("Upload justificatif a échoué.");
        const data = await res.json();
        setIdCardInfo(prev => ({ ...prev, domicileJustificatif: data.filePath }));
      } catch {
        setSnackbarMessage("Erreur upload justificatif.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      setIdCardInfo(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Price calculations
  const articlePrice = article
    ? (isCleAPasse && article.prixCleAPasse
        ? parseFloat(article.prixCleAPasse)
        : mode === 'postal'
          ? parseFloat(article.prixSansCartePropriete)
          : parseFloat(article.prix))
    : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const dossierFees = {
    anker: 80, bricard: 60, fichet: 205, heracles: 60,
    laperche: 60, medeco: 60, picard: 80, vachette: 96
  };
  const normalizedMarque = article ? normalizeString(article.marque) : "";
  const dossierFee = lostCartePropriete ? (dossierFees[normalizedMarque] || 0) : 0;
  const totalPrice = safeArticlePrice * quantity + shippingFee + dossierFee;

  // Order handler
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
      fd.append('nom', userInfo.nom);
      fd.append('email', userInfo.email);
      fd.append('phone', userInfo.phone);
      fd.append('address', userInfo.address);
      fd.append('postalCode', userInfo.postalCode);
      fd.append('ville', userInfo.ville);
      fd.append('additionalInfo', userInfo.additionalInfo);
      fd.append('prix', totalPrice.toFixed(2));
      fd.append('articleName', article?.nom || '');
      fd.append('quantity', String(quantity));
      if (mode === 'numero') {
        if (article?.besoinNumeroCle) fd.append('keyNumber', keyInfo.keyNumber);
        if (article?.besoinNumeroCarte) {
          if (!lostCartePropriete) {
            fd.append('propertyCardNumber', keyInfo.propertyCardNumber);
          } else {
            fd.append('idCardFront', idCardInfo.idCardFront);
            fd.append('idCardBack', idCardInfo.idCardBack);
            fd.append('domicileJustificatifPath', idCardInfo.domicileJustificatif);
            fd.append('attestationPropriete', attestationPropriete.toString());
          }
        }
      }
      fd.append('deliveryType', deliveryType);
      fd.append('shippingMethod', shippingMethod);
      fd.append('isCleAPasse', isCleAPasse.toString());
      if (article?.besoinPhoto) {
        fd.append('frontPhoto', keyInfo.frontPhoto);
        fd.append('backPhoto', keyInfo.backPhoto);
      }

      const res = await fetch('https://cl-back.onrender.com/commande/create', {
        method: 'POST', body: fd
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      const { numeroCommande } = await res.json();
      // redirect to payment as before...
    } catch (err) {
      setSnackbarMessage(`Erreur : ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOrdering(false);
    }
  };

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
        <Button variant="contained" onClick={() => navigate('/')}>Retour à l’accueil</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* --- Formulaire (inchangé) --- */}
          <Grid item xs={12}>
            <SectionPaper>
              {/* ... votre formulaire complet ... */}
            </SectionPaper>
          </Grid>

          {/* --- Récapitulatif complet --- */}
          <Grid item xs={12}>
            <SummaryCard>
              <Typography variant="h6" sx={{ mb: 2 }}>Récapitulatif de votre commande</Typography>

              {/* Produit commandé */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {article.imageUrl && (
                  <CardMedia
                    component="img"
                    image={article.imageUrl}
                    alt={article.nom}
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                  />
                )}
                <Box>
                  <Typography variant="subtitle1">{article.nom}</Typography>
                  <Typography variant="body2">Prix unitaire : {safeArticlePrice.toFixed(2)} €</Typography>
                  <Typography variant="body2">Quantité : {quantity}</Typography>
                </Box>
              </Box>

              <Divider />

              {/* Prix et frais */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">Sous‑total produits</Typography>
                <Typography variant="body2">{(safeArticlePrice * quantity).toFixed(2)} €</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">Frais d'expédition ({deliveryType || '—'})</Typography>
                <Typography variant="body2">{shippingFee.toFixed(2)} €</Typography>
              </Box>
              {dossierFee > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                  <Typography variant="body2">Frais de dossier</Typography>
                  <Typography variant="body2">{dossierFee.toFixed(2)} €</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total à payer</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{totalPrice.toFixed(2)} €</Typography>
              </Box>

              {/* Client Info */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Informations client</Typography>
                <Typography variant="body2">Type : {userInfo.clientType}</Typography>
                <Typography variant="body2">Nom : {userInfo.nom}</Typography>
                <Typography variant="body2">Email : {userInfo.email}</Typography>
                <Typography variant="body2">Téléphone : {userInfo.phone}</Typography>
                <Typography variant="body2">Adresse : {userInfo.address}, {userInfo.postalCode} {userInfo.ville}</Typography>
                {userInfo.additionalInfo && (
                  <Typography variant="body2">Infos complémentaires : {userInfo.additionalInfo}</Typography>
                )}
              </Box>

              {/* Fichiers uploadés */}
              {(keyInfo.frontPhoto || keyInfo.backPhoto || idCardInfo.idCardFront || idCardInfo.idCardBack || idCardInfo.domicileJustificatif) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Fichiers fournis</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {keyInfo.frontPhoto && (
                      <CardMedia
                        component="img"
                        src={URL.createObjectURL(keyInfo.frontPhoto)}
                        alt="Photo clé recto"
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    {keyInfo.backPhoto && (
                      <CardMedia
                        component="img"
                        src={URL.createObjectURL(keyInfo.backPhoto)}
                        alt="Photo clé verso"
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    {idCardInfo.idCardFront && (
                      <CardMedia
                        component="img"
                        src={URL.createObjectURL(idCardInfo.idCardFront)}
                        alt="ID Front"
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    {idCardInfo.idCardBack && (
                      <CardMedia
                        component="img"
                        src={URL.createObjectURL(idCardInfo.idCardBack)}
                        alt="ID Back"
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    {idCardInfo.domicileJustificatif && (
                      <Typography variant="body2">
                        Justificatif : {idCardInfo.domicileJustificatif.split('/').pop()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleOrder}
                disabled={ordering}
                sx={{
                  mt: 2,
                  backgroundImage: 'linear-gradient(145deg, #1B5E20, black)',
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  border: '1px solid #1B5E20',
                  '&:hover': { backgroundImage: 'linear-gradient(145deg, black, #1B5E20)' },
                }}
              >
                {ordering ? <CircularProgress size={24} color="inherit" /> : 'Commander'}
              </Button>
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={article.imageUrl} alt={article.nom} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(e, reason) => reason !== 'clickaway' && setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          iconMapping={{
            success: <CheckCircle fontSize="inherit" sx={{ color: '#1B5E20' }} />,
            error: <ErrorIcon fontSize="inherit" sx={{ color: '#1B5E20' }} />,
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


