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
        <Typography variant="h6" gutterBottom>Article 1 : Objet</Typography>
        <Typography variant="body2" paragraph>
          Les présentes Conditions Générales de Vente (CGV) régissent la vente de clés, cartes de propriété et autres services proposés sur le site Cleservice.com.
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

  // États pour les informations utilisateur
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

  // États pour les informations sur la clé
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

  // États pour la livraison
  const [deliveryType, setDeliveryType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('magasin');

  // États pour le snackbar de notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);

  // États pour la popup CGV et l'acceptation des conditions
  const [openCGV, setOpenCGV] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Quantité de copies souhaitée
  const [quantity, setQuantity] = useState(1);

  // Modal d'image
  const [openImageModal, setOpenImageModal] = useState(false);
  const handleOpenImageModal = () => setOpenImageModal(true);
  const handleCloseImageModal = () => setOpenImageModal(false);

  // Calcul des prix
  const articlePrice = article
    ? (isCleAPasse && article.prixCleAPasse
         ? parseFloat(article.prixCleAPasse)
         : mode === 'postal'
         ? parseFloat(article.prixSansCartePropriete)
         : parseFloat(article.prix))
    : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;

  // Mapping et calcul du frais de dossier
  const dossierFees = {
    anker: 80,
    bricard: 60,
    fichet: 205,
    heracles: 60,
    laperche: 60,
    medeco: 60,
    picard: 80,
    vachette: 96,
  };
  const normalizedMarque = article ? normalizeString(article.marque) : "";
  const dossierFee = lostCartePropriete ? (daisseurFees[normalizedMarque] || 0) : 0;

  const totalPrice = safeArticlePrice + shippingFee + dossierFee;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name in userInfo) {
      setUserInfo((prev) => ({ ...prev, [name]: value }));
    } else if (name in keyInfo) {
      setKeyInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (event) => {
    const { name, files } = event.target;
    if (files && files[0]) {
      setKeyInfo((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleIdCardUpload = async (event) => {
    const { name, files } = event.target;
    if (files && files[0]) {
      if (name === 'domicileJustificatif') {
        const formData = new FormData();
        formData.append('pdf', files[0]);
        try {
          const response = await fetch('https://cl-back.onrender.com/upload/pdf', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok)
            throw new Error("Erreur lors de l'upload du justificatif.");
          const data = await response.json();
          setIdCardInfo((prev) => ({ ...prev, domicileJustificatif: data.filePath }));
        } catch (err) {
          setSnackbarMessage("Erreur lors de l'upload du justificatif.");
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } else {
        setIdCardInfo((prev) => ({ ...prev, [name]: files[0] }));
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
      const commandeFormData = new FormData();
      commandeFormData.append('nom', userInfo.nom);
      commandeFormData.append('email', userInfo.email);
      commandeFormData.append('phone', userInfo.phone);
      commandeFormData.append('address', userInfo.address);
      commandeFormData.append('postalCode', userInfo.postalCode);
      commandeFormData.append('ville', userInfo.ville);
      commandeFormData.append('additionalInfo', userInfo.additionalInfo);
      commandeFormData.append('prix', totalPrice.toFixed(2));
      commandeFormData.append('articleName', article?.nom || '');
      commandeFormData.append('quantity', quantity);
      if (mode === 'numero') {
        if (article?.besoinNumeroCle) {
          commandeFormData.append('keyNumber', article?.nom || '');
        }
        if (article?.besoinNumeroCarte) {
          if (!lostCartePropriete) {
            commandeFormData.append('propertyCardNumber', keyInfo.propertyCardNumber);
          } else {
            commandeFormData.append('idCardFront', idCardInfo.idCardFront);
            commandeFormData.append('idCardBack', idCardInfo.idCardBack);
            commandeFormData.append('domicileJustificatifPath', idCardInfo.domicileJustificatif);
            commandeFormData.append('attestationPropriete', attestationPropriete.toString());
          }
        }
      }
      commandeFormData.append('deliveryType', deliveryType);
      commandeFormData.append('shippingMethod', shippingMethod);
      commandeFormData.append('isCleAPasse', isCleAPasse.toString());
      if (article?.besoinPhoto) {
        commandeFormData.append('frontPhoto', keyInfo.frontPhoto);
        commandeFormData.append('backPhoto', keyInfo.backPhoto);
      }

      const commandeResponse = await fetch('https://cl-back.onrender.com/commande/create', {
        method: 'POST',
        body: commandeFormData,
      });
      if (!commandeResponse.ok) {
        const errorText = await commandeResponse.text();
        throw new Error(`Erreur lors de la création de la commande : ${errorText}`);
      }
      const commandeResult = await commandeResponse.json();
      const { numeroCommande } = commandeResult;

      const paymentPayload = {
        amount: totalPrice * 100,
        currency: 'eur',
        description: article
          ? `Veuillez procéder au paiement pour ${userInfo.nom}`
          : 'Veuillez procéder au paiement',
        success_url: `https://www.cleservice.com/commande-success?numeroCommande=${numeroCommande}`,
        cancel_url: `https://www.cleservice.com/commande-cancel?numeroCommande=${numeroCommande}`,
      };

      const paymentResponse = await fetch('https://cl-back.onrender.com/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      });
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Erreur lors de la création de la page de paiement : ${errorText}`);
      }
      const paymentResult = await paymentResponse.json();
      window.location.href = paymentResult.paymentUrl;
    } catch (error) {
      setSnackbarMessage(`Erreur : ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOrdering(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
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
        <Button variant="contained" onClick={() => navigate('/')}>
          Retour à l’accueil
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Section Formulaire */}
          <Grid item xs={12}>
            <SectionPaper>
              <Typography variant="h5" gutterBottom>Informations de Commande</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.2rem', mb: 1 }}>
                  Processus de Commande
                </Typography>
                {mode === 'postal' ? (
                  <Typography variant="body1" sx={{ color: '#000' }}>
                    Vous avez choisi le mode de commande <strong>"atelier"</strong>. Après paiement, vous recevrez un email avec l'adresse d'envoi de votre clé en recommandé. Une fois la clé reçue, notre atelier procédera à la reproduction et vous renverra la clé avec sa copie.
                  </Typography>
                ) : (
                  <Typography variant="body1" sx={{ color: '#000' }}>
                    Vous avez choisi le mode de commande <strong>"numero"</strong>. Dans ce mode, il n'est pas nécessaire d'envoyer votre clé préalablement. La commande sera directement traitée par le fabricant grâce au numéro.
                  </Typography>
                )}
              </Box>
              {/* ... (le reste du formulaire et récapitulatif identique) */}
            </SectionPaper>
          </Grid>
        </Grid>
      </Container>
      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;

/*
Conditions Générales de Vente

Objet
Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Maison Bouvet S.A.S. (ci-après "le Vendeur") et tout client souhaitant effectuer un achat sur le site cleservice.com (ci-après "l'Acheteur").

Produits
Les produits proposés à la vente sont présentés avec la plus grande exactitude possible. En cas d'erreur ou d'omission, le Vendeur se réserve le droit de corriger les informations sans que cela n'engage sa responsabilité.

Prix
Les prix indiqués sur le site sont exprimés en euros, toutes taxes comprises (TTC) et peuvent être modifiés à tout moment. Le prix applicable à l'achat est celui en vigueur au moment de la validation de la commande.

Commande
Toute commande passée sur le site implique l'acceptation sans réserve des présentes CGV. L'Acheteur déclare avoir pris connaissance de ces conditions avant de valider sa commande.

Paiement
Le paiement s'effectue en ligne par carte bancaire ou via d'autres moyens de paiement proposés sur le site. Le Vendeur garantit la sécurité des transactions.

Livraison
Les produits sont livrés à l'adresse indiquée par l'Acheteur lors de la commande. Les délais de livraison, précisés sur le site, peuvent varier en fonction de la destination. Tout retard ne pourra être imputé au Vendeur.

Droit de Rétractation
Conformément à la législation en vigueur, l'Acheteur dispose d'un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation, sans avoir à justifier de motifs. Les frais de retour sont à la charge de l'Acheteur, sauf indication contraire.

Garantie
Les produits vendus bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés, conformément aux dispositions légales en vigueur.

Responsabilité
Le Vendeur ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation des produits. La responsabilité du Vendeur est limitée au montant de la commande.

Droit Applicable et Juridiction
Les présentes CGV sont régies par le droit français. En cas de litige, seuls les tribunaux de Paris seront compétents, sauf disposition légale contraire.

Modification des CGV
Le Vendeur se réserve le droit de modifier les présentes Conditions Générales de Vente à tout moment. Les modifications seront publiées sur le site et s'appliqueront à toutes les commandes passées après leur mise en ligne.

© 2025 cleservice.com - Tous droits réservés.
*/
