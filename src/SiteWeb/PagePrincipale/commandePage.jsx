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
  DialogContent,
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
  // Défilement vers le haut à l'ouverture de la page
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

        // Appel sur l'endpoint best-by-name
        const endpointBest = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpointBest);

        // Si best-by-name renvoie un 404, alors fallback sur closest-match
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

  // Calcul des prix et des frais de livraison
  const articlePrice = article
    ? isCleAPasse && article.prixCleAPasse
      ? parseFloat(article.prixCleAPasse)
      : mode === 'postal'
      ? parseFloat(article.prixSansCartePropriete)
      : parseFloat(article.prix)
    : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const totalPrice = safeArticlePrice + shippingFee;

  // Gestion des changements d'input
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name in userInfo) {
      setUserInfo((prev) => ({ ...prev, [name]: value }));
    } else if (name in keyInfo) {
      setKeyInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Gestion de l'upload des photos de la clé
  const handlePhotoUpload = (event) => {
    const { name, files } = event.target;
    if (files && files[0]) {
      setKeyInfo((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // Gestion de l'upload des documents d'identité
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

  // Gestion de la commande
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
      // Informations client
      commandeFormData.append('nom', userInfo.nom);
      commandeFormData.append('email', userInfo.email);
      commandeFormData.append('phone', userInfo.phone);
      commandeFormData.append('address', userInfo.address);
      commandeFormData.append('postalCode', userInfo.postalCode);
      commandeFormData.append('ville', userInfo.ville);
      commandeFormData.append('additionalInfo', userInfo.additionalInfo);
      // Détail de la commande
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

      // Création de la page de paiement
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
              {mode === 'numero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Informations sur la Clé</Typography>
                  {article?.estCleAPasse && (
                    <FormControlLabel
                      control={<ModernCheckbox checked={isCleAPasse} onChange={(e) => setIsCleAPasse(e.target.checked)} />}
                      label="Clé à passe ? (Ouvre plusieurs serrures)"
                      sx={{ mb: 2 }}
                    />
                  )}
                  {article?.besoinNumeroCle && (
                    <>
                      <TextField
                        disabled
                        placeholder="Le nom du produit sera utilisé comme numéro de clé"
                        variant="outlined"
                        name="keyNumber"
                        value={article?.nom || ''}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      {article.numeroCleDescription && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {article.numeroCleDescription}
                        </Typography>
                      )}
                    </>
                  )}
                  {article?.besoinNumeroCarte && (
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={<Checkbox checked={lostCartePropriete} onChange={(e) => setLostCartePropriete(e.target.checked)} />}
                        label="J'ai perdu ma carte de propriété"
                        sx={{ mr: 2 }}
                      />
                      {!lostCartePropriete ? (
                        <>
                          <TextField
                            placeholder="* Numéro inscrit sur la carte de propriété"
                            variant="outlined"
                            name="propertyCardNumber"
                            value={keyInfo.propertyCardNumber}
                            onChange={handleInputChange}
                            required
                            fullWidth
                          />
                          {article.numeroCarteDescription && (
                            <Typography variant="body2" color="text.secondary">
                              {article.numeroCarteDescription}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            Fournissez les documents obligatoires ci-dessous.
                          </Typography>
                          <AlignedFileUpload
                            label="Photo recto de la pièce d'identité * :"
                            name="idCardFront"
                            accept="image/*"
                            onChange={handleIdCardUpload}
                            icon={PhotoCamera}
                            file={idCardInfo.idCardFront}
                          />
                          <AlignedFileUpload
                            label="Photo verso de la pièce d'identité * :"
                            name="idCardBack"
                            accept="image/*"
                            onChange={handleIdCardUpload}
                            icon={PhotoCamera}
                            file={idCardInfo.idCardBack}
                          />
                          <AlignedFileUpload
                            label="Justificatif de domicile (PDF) * :"
                            name="domicileJustificatif"
                            accept="application/pdf"
                            onChange={handleIdCardUpload}
                            icon={CloudUpload}
                            file={idCardInfo.domicileJustificatif}
                          />
                          <FormControlLabel
                            control={<Checkbox checked={attestationPropriete} onChange={(e) => setAttestationPropriete(e.target.checked)} />}
                            label="J'atteste être le propriétaire"
                            sx={{ mt: 1 }}
                          />
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              {article?.besoinPhoto && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Téléchargement des Photos de la Clé</Typography>
                  <AlignedFileUpload
                    label="Photo clé (recto) * :"
                    name="frontPhoto"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    icon={PhotoCamera}
                    file={keyInfo.frontPhoto}
                  />
                  <AlignedFileUpload
                    label="Photo clé (verso) * :"
                    name="backPhoto"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    icon={PhotoCamera}
                    file={keyInfo.backPhoto}
                  />
                </Box>
              )}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Quantité de copies souhaitée</Typography>
                <TextField
                  type="number"
                  label="Nombre de clés"
                  variant="outlined"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  fullWidth
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Informations Client</Typography>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup row name="clientType" value={userInfo.clientType} onChange={handleInputChange}>
                    <FormControlLabel value="particulier" control={<Radio sx={{ color: '#1B5E20' }} />} label="Particulier" />
                    <FormControlLabel value="entreprise" control={<Radio sx={{ color: '#1B5E20' }} />} label="Entreprise" />
                  </RadioGroup>
                </FormControl>
                <TextField
                  placeholder="* Nom et prénom"
                  variant="outlined"
                  fullWidth
                  name="nom"
                  value={userInfo.nom}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#1B5E20' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="* Adresse email"
                  variant="outlined"
                  fullWidth
                  name="email"
                  type="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#1B5E20' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="* Téléphone"
                  variant="outlined"
                  fullWidth
                  name="phone"
                  type="tel"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#1B5E20' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="* Adresse de livraison"
                  variant="outlined"
                  fullWidth
                  name="address"
                  value={userInfo.address}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home sx={{ color: '#1B5E20' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="* Code postal"
                  variant="outlined"
                  fullWidth
                  name="postalCode"
                  value={userInfo.postalCode}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity sx={{ color: '#1B5E20' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="* Ville"
                  variant="outlined"
                  fullWidth
                  name="ville"
                  value={userInfo.ville}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity sx={{ color: '#1B5E20' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="Infos complémentaires de livraison"
                  variant="outlined"
                  fullWidth
                  name="additionalInfo"
                  value={userInfo.additionalInfo}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Info sx={{ color: '#1B5E20' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>
              {mode === 'postal' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Type d'expédition</Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Après paiement, vous recevrez l'adresse d'envoi de votre clé. Nous vous conseillons d'envoyer la clé en recommandé pour plus de sécurité.
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      displayEmpty
                      inputProps={{ 'aria-label': "Type d'expédition" }}
                      required
                    >
                      <MenuItem value="" disabled>
                        Sélectionnez un type d'expédition
                      </MenuItem>
                      <MenuItem value="lettre">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CloudUpload sx={{ mr: 1, color: '#1B5E20' }} />
                          Lettre
                        </Box>
                      </MenuItem>
                      <MenuItem value="recommande">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CloudUpload sx={{ mr: 1, color: '#1B5E20' }} />
                          Recommandé
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Mode de Récupération</Typography>
                <FormControl component="fieldset">
                  <RadioGroup row name="shippingMethod" value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                    <FormControlLabel value="magasin" control={<Radio sx={{ color: '#1B5E20' }} />} label="En magasin" />
                    <FormControlLabel value="expedition" control={<Radio sx={{ color: '#1B5E20' }} />} label="Expédition (8€)" />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Box>
                <FormControlLabel
                  control={<ModernCheckbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
                  label={
                    <>
                      J'accepte les{' '}
                      <Button
                        variant="text"
                        color="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenCGV(true);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Conditions Générales de Vente
                      </Button>
                    </>
                  }
                />
              </Box>
            </SectionPaper>
          </Grid>
          {/* Section Récapitulatif */}
          <Grid item xs={12}>
            <SummaryCard>
              <Typography variant="h6" sx={{ mb: 2 }}>Récapitulatif</Typography>
              {article ? (
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
              ) : (
                <Typography variant="body2" color="error">
                  Produit non disponible
                </Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">
                  {shippingMethod === 'expedition' ? "Frais d'expédition" : "Récupération en magasin"}
                </Typography>
                <Typography variant="body2">{shippingMethod === 'expedition' ? "8 €" : "0 €"}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {totalPrice.toFixed(2)} €
                </Typography>
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
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>
      {/* Modal d'affichage de l'image agrandie */}
      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={article?.imageUrl} alt={article?.nom} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </DialogContent>
      </Dialog>
      {/* Snackbar pour les notifications */}
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
      {/* Popup des Conditions Générales de Vente */}
      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;
