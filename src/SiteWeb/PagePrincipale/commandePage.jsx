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
        {/* Articles 1 à 11 */}
        <Typography variant="h6" gutterBottom>Article 1 : Objet</Typography>
        <Typography variant="body2" paragraph>
          Les présentes Conditions Générales de Vente (CGV) régissent la vente de clés, cartes de propriété et autres services proposés sur le site Cleservice.com.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 2 : Prix</Typography>
        <Typography variant="body2" paragraph>
          Tous les prix affichés sont en euros, toutes taxes comprises (TTC). Cleservice.com se réserve le droit de modifier ses tarifs à tout moment sans préavis.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 3 : Commande</Typography>
        <Typography variant="body2" paragraph>
          La validation de la commande vaut acceptation des présentes CGV. Toute commande effectuée sur le site implique l’adhésion complète aux conditions de vente en vigueur.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 4 : Livraison et Retrait</Typography>
        <Typography variant="body2" paragraph>
          Les produits commandés sont livrés à l’adresse indiquée lors de la commande. Le retrait en magasin reste gratuit, tandis que l’expédition entraîne des frais supplémentaires indiqués lors de la commande.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 5 : Responsabilité et Garanties</Typography>
        <Typography variant="body2" paragraph>
          Cleservice.com ne pourra être tenue responsable des dommages directs ou indirects liés à l’utilisation des produits, sauf en cas de faute grave ou intentionnelle. Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 6 : Propriété Intellectuelle</Typography>
        <Typography variant="body2" paragraph>
          L’ensemble des éléments présents sur le site (textes, images, logos, etc.) est protégé par le droit d’auteur et ne peut être reproduit, distribué ou exploité sans l’autorisation expresse de Cleservice.com.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 7 : Données Personnelles</Typography>
        <Typography variant="body2" paragraph>
          Les informations recueillies lors de la commande sont nécessaires au traitement de celle-ci. Conformément à la loi « Informatique et Libertés », vous disposez d’un droit d’accès, de modification et de suppression de vos données personnelles.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 8 : Loi Applicable et Juridiction</Typography>
        <Typography variant="body2" paragraph>
          Les présentes CGV sont régies par la loi française. En cas de litige, seuls les tribunaux français seront compétents.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 9 : Livraison, Sécurité et Transfert de Risque</Typography>
        <Typography variant="body2" paragraph>
          Les clés, cartes de propriété et autres produits restent la propriété de Cleservice.com jusqu’à confirmation du paiement complet. Le transfert des risques intervient dès la livraison effective aux coordonnées indiquées par le client. Cleservice.com ne pourra être tenue responsable des pertes, détériorations ou vol de produits après expédition, sauf en cas de faute avérée du transporteur.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 10 : Reproduction et Contrefaçon</Typography>
        <Typography variant="body2" paragraph>
          Toute reproduction, duplication, modification ou imitation, totale ou partielle, des clés, cartes de propriété ou autres produits fournis par Cleservice.com est strictement interdite. Toute infraction à cette disposition fera l’objet de poursuites judiciaires. Le client s’engage à ne pas faire de copies ou reproductions non autorisées des produits reçus.
        </Typography>
        <Typography variant="h6" gutterBottom>Article 11 : Envoi et Utilisation des Clés</Typography>
        <Typography variant="body2" paragraph>
          L’envoi des clés ou des cartes de propriété se fait sous la responsabilité du client dès leur remise au transporteur. Le client s’engage à vérifier l’état du colis à la réception et à signaler toute anomalie dans un délai de 48 heures. Toute utilisation frauduleuse ou détournée des produits sera considérée comme une violation grave des présentes CGV et pourra donner lieu à des poursuites civiles et pénales.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">Fermer</Button>
    </DialogActions>
  </Dialog>
);

const CommandePage = () => {
  const { brand: brandName, reference: articleType, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // "postal" ou "numero"
  const navigate = useNavigate();

  // États pour le produit
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // Fetch du produit
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
        }
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur lors du chargement du produit : ${errorText}`);
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

  // États utilisateur, clé, ID, CGV...
  const [userInfo, setUserInfo] = useState({
    clientType: 'particulier', nom: '', email: '', phone: '',
    address: '', postalCode: '', ville: '', additionalInfo: '',
  });
  const [keyInfo, setKeyInfo] = useState({ keyNumber: '', propertyCardNumber: '', frontPhoto: null, backPhoto: null });
  const [isCleAPasse, setIsCleAPasse] = useState(false);
  const [lostCartePropriete, setLostCartePropriete] = useState(false);
  const [idCardInfo, setIdCardInfo] = useState({ idCardFront: null, idCardBack: null, domicileJustificatif: '' });
  const [attestationPropriete, setAttestationPropriete] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('magasin');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openCGV, setOpenCGV] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openImageModal, setOpenImageModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in userInfo) {
      setUserInfo(prev => ({ ...prev, [name]: value }));
    } else if (name in keyInfo) {
      setKeyInfo(prev => ({ ...prev, [name]: value }));
    }
  };
  const handlePhotoUpload = (e) => {
    const { name, files } = e.target;
    if (files?.[0]) setKeyInfo(prev => ({ ...prev, [name]: files[0] }));
  };
  const handleIdCardUpload = async (e) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      if (name === 'domicileJustificatif') {
        const formData = new FormData();
        formData.append('pdf', files[0]);
        try {
          const res = await fetch('https://cl-back.onrender.com/upload/pdf', { method: 'POST', body: formData });
          if (!res.ok) throw new Error("Erreur lors de l'upload du justificatif.");
          const data = await res.json();
          setIdCardInfo(prev => ({ ...prev, domicileJustificatif: data.filePath }));
        } catch {
          setSnackbarMessage("Erreur lors de l'upload du justificatif.");
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } else {
        setIdCardInfo(prev => ({ ...prev, [name]: files[0] }));
      }
    }
  };

  // Calculs prix
  const articlePrice = article
    ? (isCleAPasse && article.prixCleAPasse
         ? parseFloat(article.prixCleAPasse)
         : mode === 'postal'
         ? parseFloat(article.prixSansCartePropriete)
         : parseFloat(article.prix))
    : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const dossierFees = { anker:80, bricard:60, fichet:205, heracles:60, laperche:60, medeco:60, picard:80, vachette:96 };
  const normalizedMarque = article ? normalizeString(article.marque) : "";
  const dossierFee = lostCartePropriete ? (dossierFees[normalizedMarque] || 0) : 0;
  const totalPrice = safeArticlePrice + shippingFee + dossierFee;

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
      fd.append('quantity', quantity.toString());
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

      const resOrder = await fetch('https://cl-back.onrender.com/commande/create', {
        method: 'POST', body: fd
      });
      if (!resOrder.ok) {
        const err = await resOrder.text();
        throw new Error(`Erreur création commande : ${err}`);
      }
      const { numeroCommande } = await resOrder.json();

      const paymentPayload = {
        amount: totalPrice * 100,
        currency: 'eur',
        description: article
          ? `Paiement pour ${userInfo.nom}`
          : 'Paiement',
        success_url: `https://www.cleservice.com/commande-success?numeroCommande=${numeroCommande}`,
        cancel_url: `https://www.cleservice.com/commande-cancel?numeroCommande=${numeroCommande}`,
      };
      const resPay = await fetch('https://cl-back.onrender.com/stripe/create', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(paymentPayload)
      });
      if (!resPay.ok) {
        const err = await resPay.text();
        throw new Error(`Erreur paiement : ${err}`);
      }
      const { paymentUrl } = await resPay.json();
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

  const handleOpenImageModal = () => setOpenImageModal(true);
  const handleCloseImageModal = () => setOpenImageModal(false);

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
              {/* ... (tout le formulaire reste identique à la version précédente) ... */}
            </SectionPaper>
          </Grid>

          {/* Section Récapitulatif */}
          <Grid item xs={12}>
            <SummaryCard>
              <Typography variant="h6" sx={{ mb: 2 }}>Récapitulatif</Typography>

              <Box sx={{ display: 'flex', mb: 2 }}>
                {article.imageUrl && (
                  <Box onClick={handleOpenImageModal} sx={{ cursor: 'pointer', mr: 2 }}>
                    <CardMedia
                      component="img"
                      image={article.imageUrl}
                      alt={article.nom}
                      sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                    />
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle1">{article.nom}</Typography>
                  <Typography variant="body2">Marque : {article.marque}</Typography>
                  <Typography variant="body2">Prix : {safeArticlePrice.toFixed(2)} €</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">
                  {shippingMethod === 'expedition' ? "Frais d'expédition" : "Récupération en magasin"}
                </Typography>
                <Typography variant="body2">{shippingMethod === 'expedition' ? "8 €" : "0 €"}</Typography>
              </Box>
              {dossierFee > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                  <Typography variant="body2">Frais de dossier</Typography>
                  <Typography variant="body2">{dossierFee} €</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {totalPrice.toFixed(2)} €
                </Typography>
              </Box>

              {/* Affichage dynamique de toutes les propriétés de `article` */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Détails du produit
                </Typography>
                {Object.entries(article).map(([key, value]) => (
                  <Typography key={key} variant="body2" sx={{ textTransform: 'capitalize' }}>
                    <strong>{key.replace(/([A-Z])/g, ' $1')}</strong>: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                ))}
              </Box>

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

              {lostCartePropriete && dossierFee > 0 && (
                <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  Les frais de dossier de {dossierFee}€ seront appliqués pour couvrir le traitement administratif suite à la perte de votre carte de propriété.
                </Typography>
              )}
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={article.imageUrl} alt={article.nom} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </DialogContent>
      </Dialog>

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

