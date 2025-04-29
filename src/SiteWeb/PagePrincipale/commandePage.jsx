// src/SiteWeb/PagePrincipale/CommandePage.jsx
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
        {/* Articles 1 à 11 comme défini précédemment */}
        <Typography variant="h6" gutterBottom>Article 1 : Objet</Typography>
        <Typography variant="body2" paragraph>
          Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Maison Bouvet S.A.S. (ci-après "le Vendeur") et tout client souhaitant effectuer un achat sur le site cleservice.com (ci-après "l'Acheteur").
        </Typography>
        {/* ... reste des articles ... */}
        <Typography variant="body2" align="center" paragraph>
          © 2025 cleservice.com - Tous droits réservés.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">Fermer</Button>
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
  const [keyInfo, setKeyInfo] = useState({ keyNumber: '', propertyCardNumber: '', frontPhoto: null, backPhoto: null });
  const [isCleAPasse, setIsCleAPasse] = useState(false);
  const [lostCartePropriete, setLostCartePropriete] = useState(false);
  const [idCardInfo, setIdCardInfo] = useState({ idCardFront: null, idCardBack: null, domicileJustificatif: '' });
  const [attestationPropriete, setAttestationPropriete] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('magasin');
  const [quantity, setQuantity] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openCGV, setOpenCGV] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);

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
          const endpointFallback = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          response = await fetch(endpointFallback);
        }
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur lors du chargement du produit : ${errorText}`);
        }
        const product = await response.json();
        if (product.marque && normalizeString(product.marque) !== normalizeString(brandName)) {
          throw new Error("La marque de l'article ne correspond pas.");
        }
        setArticle(product);
      } catch (err) {
        console.error(err);
        setErrorArticle(err.message || "Erreur inconnue");
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchProduct();
  }, [brandName, decodedArticleName]);

  // Gestion des inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in userInfo) setUserInfo({ ...userInfo, [name]: value });
    else setKeyInfo({ ...keyInfo, [name]: value });
  };
  const handlePhotoUpload = (e) => {
    const { name, files } = e.target;
    if (files[0]) setKeyInfo({ ...keyInfo, [name]: files[0] });
  };
  const handleIdCardUpload = async (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      if (name === 'domicileJustificatif') {
        const formData = new FormData();
        formData.append('pdf', files[0]);
        const res = await fetch('https://cl-back.onrender.com/upload/pdf', { method: 'POST', body: formData });
        const data = await res.json();
        setIdCardInfo({ ...idCardInfo, domicileJustificatif: data.filePath });
      } else {
        setIdCardInfo({ ...idCardInfo, [name]: files[0] });
      }
    }
  };

  const handleOrder = async () => {
    if (!termsAccepted) {
      setSnackbarMessage('Veuillez accepter les Conditions Générales de Vente.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setOrdering(true);
    try {
      const fd = new FormData();
      // append all fields...
      // (identique à votre version)
      const res = await fetch('https://cl-back.onrender.com/commande/create', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const { numeroCommande } = await res.json();
      // redirection Stripe...
    } catch (err) {
      setSnackbarMessage(`Erreur : ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOrdering(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Affichage pendant le chargement / erreur produit
  if (loadingArticle) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }
  if (errorArticle || !article) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" color="error">{errorArticle || "Produit non disponible"}</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Retour à l’accueil</Button>
      </Container>
    );
  }

  // Calcul tarifs
  const articlePrice = /* logique tarifaire */;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const dossierFees = { anker:80, bricard:60, fichet:205, heracles:60, laperche:60, medeco:60, picard:80, vachette:96 };
  const normalizedMarque = normalizeString(article.marque);
  const dossierFee = lostCartePropriete ? (dossierFees[normalizedMarque]||0) : 0;
  const totalPrice = (articlePrice * quantity) + shippingFee + dossierFee;

  return (
    <Box sx={{ backgroundColor:'#f7f7f7', minHeight:'100vh', py:4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Section Formulaire */}
          <Grid item xs={12}>
            <SectionPaper>
              {/* ... tous les champs et boutons de votre formulaire ... */}
            </SectionPaper>
          </Grid>
          {/* Section Récapitulatif */}
          <Grid item xs={12}>
            <SummaryCard>
              {/* ... récapitulatif + bouton Commander ... */}
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} iconMapping={{
          success:<CheckCircle fontSize="inherit" sx={{ color:'#1B5E20' }} />,
          error:<ErrorIcon fontSize="inherit" sx={{ color:'#1B5E20' }} />,
        }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;
