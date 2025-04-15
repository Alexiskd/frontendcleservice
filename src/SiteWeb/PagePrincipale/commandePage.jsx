import React, { useState, useEffect } from 'react';  
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

// Composant utilitaire pour l'upload de fichiers
const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
    <Typography variant="body2" sx={{ minWidth: '150px' }}>
      {label}
    </Typography>
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

const ModernCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.grey[500],
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
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

// -----------------------------
// Composant Principal : CommandePage
// -----------------------------
const CommandePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { brandName, articleType, articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

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

  // Pour le mode "numero", le champ keyNumber sera directement rempli avec le nom du produit.
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);

  const [openCGV, setOpenCGV] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [quantity, setQuantity] = useState(1);

  // Récupération directe de la clé via son nom (endpoint getKeyByName)
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        const endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Article non trouvé.');
          throw new Error("Erreur lors du chargement de l'article.");
        }
        const responseText = await response.text();
        if (!responseText) throw new Error('Réponse vide du serveur.');
        const data = JSON.parse(responseText);
        // Optionnel : vérification de la marque si nécessaire
        if (data && data.manufacturer && data.manufacturer.toLowerCase() !== brandName.toLowerCase()) {
          throw new Error("La marque de l'article ne correspond pas.");
        }
        setArticle(data);
      } catch (err) {
        setErrorArticle(err.message);
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchArticle();
  }, [brandName, decodedArticleName]);

  // Ici, on utilise directement l'objet récupéré
  const productDetails = article;

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
    ) {
      return false;
    }
    if (mode === 'numero') {
      if (productDetails?.besoinNumeroCarte && !lostCartePropriete && !keyInfo.propertyCardNumber.trim()) return false;
      if (lostCartePropriete) {
        if (
          !idCardInfo.idCardFront ||
          !idCardInfo.idCardBack ||
          !idCardInfo.domicileJustificatif ||
          !attestationPropriete
        ) {
          return false;
        }
      }
    }
    return true;
  };

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
          if (!response.ok) throw new Error("Erreur lors de l'upload du justificatif.");
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
    if (!validateForm()) {
      setSnackbarMessage('Veuillez remplir tous les champs obligatoires.');
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
      // Enregistrement du nom du produit commandé
      commandeFormData.append('articleName', productDetails?.nom || '');
      commandeFormData.append('quantity', quantity);

      if (mode === 'numero') {
        if (productDetails?.besoinNumeroCle) {
          commandeFormData.append('keyNumber', productDetails?.nom || '');
        }
        if (productDetails?.besoinNumeroCarte) {
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
      if (productDetails?.besoinPhoto) {
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
        description: productDetails
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
      <Box
        sx={{
          backgroundColor: '#fff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorArticle) {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="error">
          {errorArticle}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <SectionPaper>
              <Typography variant="h5" gutterBottom>
                Informations de Commande
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3, p: 2, backgroundColor: '#e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.2rem', mb: 1 }}>
                  Processus de Commande
                </Typography>
                {mode === 'postal' ? (
                  <Typography variant="body1" sx={{ color: '#000' }}>
                    Vous avez choisi le mode de commande <strong>"atelier"</strong> via notre atelier. Après paiement,
                    vous recevrez un email contenant l'adresse d'envoi de votre clé en recommandé. Une fois la clé reçue,
                    notre atelier procédera à la reproduction et vous renverra la clé avec sa copie (clé à passe ou clé
                    classique).
                  </Typography>
                ) : (
                  <Typography variant="body1" sx={{ color: '#000' }}>
                    Vous avez choisi le mode de commande <strong>"numero"</strong>. Dans ce mode, il n'est pas nécessaire
                    d'envoyer votre clé préalablement. La commande sera directement traitée par le fabricant grâce au
                    numéro.
                  </Typography>
                )}
              </Box>

              {mode === 'numero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Informations sur la clé
                  </Typography>
                  {productDetails?.estCleAPasse && (
                    <FormControlLabel
                      control={
                        <ModernCheckbox
                          checked={isCleAPasse}
                          onChange={(e) => setIsCleAPasse(e.target.checked)}
                        />
                      }
                      label="Clé à passe ? (Ouvre plusieurs serrures)"
                      sx={{ mb: 2 }}
                    />
                  )}

                  {productDetails?.besoinNumeroCle && (
                    <>
                      <TextField
                        disabled
                        placeholder="Le nom du produit sera utilisé comme numéro de clé"
                        variant="outlined"
                        name="keyNumber"
                        value={productDetails?.nom || ''}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      {productDetails?.numeroCleDescription && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {productDetails.numeroCleDescription}
                        </Typography>
                      )}
                    </>
                  )}

                  {productDetails?.besoinNumeroCarte && (
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={lostCartePropriete}
                            onChange={(e) => setLostCartePropriete(e.target.checked)}
                          />
                        }
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
                          {productDetails?.numeroCarteDescription && (
                            <Typography variant="body2" color="text.secondary">
                              {productDetails.numeroCarteDescription}
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
                            control={
                              <Checkbox
                                checked={attestationPropriete}
                                onChange={(e) => setAttestationPropriete(e.target.checked)}
                              />
                            }
                            label="J'atteste être le propriétaire"
                            sx={{ mt: 1 }}
                          />
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {productDetails?.besoinPhoto && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Téléchargement des Photos de la Clé
                  </Typography>
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
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Quantité de copies souhaitée
                </Typography>
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
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Informations Client
                </Typography>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup row name="clientType" value={userInfo.clientType} onChange={handleInputChange}>
                    <FormControlLabel
                      value="particulier"
                      control={<Radio sx={{ color: '#1B5E20' }} />}
                      label="Particulier"
                    />
                    <FormControlLabel
                      value="entreprise"
                      control={<Radio sx={{ color: '#1B5E20' }} />}
                      label="Entreprise"
                    />
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
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Type d'expédition
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Une fois le paiement effectué, vous recevrez un email contenant l'adresse d'envoi de votre clé.
                    Pour une sécurité maximale, nous vous conseillons de l'envoyer en recommandé.
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
                          Lettre (envoyée par vos propres moyens)
                        </Box>
                      </MenuItem>
                      <MenuItem value="recommande">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CloudUpload sx={{ mr: 1, color: '#1B5E20' }} />
                          Recommandé (envoyé par vos propres moyens)
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Mode de Récupération
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup row name="shippingMethod" value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                    <FormControlLabel value="magasin" control={<Radio sx={{ color: '#1B5E20' }} />} label="En magasin" />
                    <FormControlLabel
                      value="expedition"
                      control={<Radio sx={{ color: '#1B5E20' }} />}
                      label="Expédition (Collisimo Suivi 8€)"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <ModernCheckbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                  }
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

          <Grid item xs={12}>
            <SummaryCard>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Récapitulatif
              </Typography>
              {productDetails && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {productDetails.imageUrl && (
                    <Box onClick={handleOpenImageModal} sx={{ cursor: 'pointer', mr: 2 }}>
                      <CardMedia
                        component="img"
                        image={productDetails.imageUrl}
                        alt={productDetails.nom}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle1">{productDetails.nom}</Typography>
                    {productDetails.manufacturer && (
                      <Typography variant="body2">Marque : {productDetails.manufacturer}</Typography>
                    )}
                    {productDetails.descriptionProduit && (
                      <Typography variant="body2" color="text.secondary">
                        {productDetails.descriptionProduit}
                      </Typography>
                    )}
                    <Typography variant="body2">Prix : {safeArticlePrice.toFixed(2)} €</Typography>
                  </Box>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">
                  {shippingMethod === 'expedition'
                    ? "Frais d'expédition"
                    : "Récupération en magasin"}
                </Typography>
                <Typography variant="body2">{`${shippingMethod === 'expedition' ? 8 : 0} €`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Total
                </Typography>
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
                  '&:hover': {
                    backgroundImage: 'linear-gradient(145deg, black, #1B5E20)',
                  },
                }}
              >
                {ordering ? <CircularProgress size={24} color="inherit" /> : 'Commander'}
              </Button>
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={productDetails?.imageUrl} alt={productDetails?.nom} style={{ width: '100%', height: 'auto', display: 'block' }} />
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


