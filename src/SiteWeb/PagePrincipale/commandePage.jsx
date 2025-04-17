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

// Fonction de normalisation pour comparer les chaînes
const normalizeString = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

// Composant de téléchargement de fichier aligné
const AlignedFileUpload = ({ label, name, accept, onChange, icon: IconComponent, file }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
    <Typography variant="body2" sx={{ minWidth: '150px' }}>{label}</Typography>
    <IconButton
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
    {file && <Typography variant="caption" color="success.main">{typeof file === 'string' ? file : file.name}</Typography>}
  </Box>
);

// Checkbox moderne
const ModernCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.grey[500],
  '&.Mui-checked': { color: theme.palette.primary.main },
}));

// Section paper stylisé
const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

// Card récapitulatif stylisée
const SummaryCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary,
}));

// Popup CGV
const ConditionsGeneralesVentePopup = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Conditions Générales de Vente - Cleservice.com</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 2 }}>
        <Typography variant="h6" gutterBottom>Article 1 : Objet</Typography>
        <Typography variant="body2" paragraph>
          Les présentes Conditions Générales de Vente (CGV) régissent la vente de clés, cartes de propriété et autres services proposés sur Cleservice.com.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Fermer</Button>
    </DialogActions>
  </Dialog>
);

const CommandePage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { brand: brandName, reference: articleType, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'postal' or 'numero'
  const navigate = useNavigate();

  // États pour le produit
  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  // Correction de decodeImage : backticks autour du template literal
  const decodeImage = (img) =>
    img
      ? img.startsWith('data:')
        ? img
        : `data:image/jpeg;base64,${img}`
      : '';

  // Fetch product via best-by-name, fallback to closest-match
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
          console.warn("best-by-name retourne 404, fallback vers closest-match");
          const endpointFallback = `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`;
          response = await fetch(endpointFallback);
          if (!response.ok) {
            throw new Error(`Erreur via closest-match : ${await response.text()}`);
          }
        } else if (!response.ok) {
          throw new Error(`Erreur via best-by-name : ${await response.text()}`);
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

  // États pour le formulaire utilisateur
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

  // États pour la clé
  const [keyInfo, setKeyInfo] = useState({
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

  // Livraison
  const [deliveryType, setDeliveryType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('magasin');

  // Notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ordering, setOrdering] = useState(false);

  // CGV
  const [openCGV, setOpenCGV] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Quantité
  const [quantity, setQuantity] = useState(1);

  // Modal image
  const [openImageModal, setOpenImageModal] = useState(false);
  const handleOpenImageModal = () => setOpenImageModal(true);
  const handleCloseImageModal = () => setOpenImageModal(false);

  // Calculs de prix
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

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (userInfo.hasOwnProperty(name)) {
      setUserInfo((prev) => ({ ...prev, [name]: value }));
    } else if (keyInfo.hasOwnProperty(name)) {
      setKeyInfo((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handlePhotoUpload = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setKeyInfo((prev) => ({ ...prev, [name]: files[0] }));
    }
  };
  const handleIdCardUpload = async (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      if (name === 'domicileJustificatif') {
        const formData = new FormData();
        formData.append('pdf', files[0]);
        try {
          const res = await fetch('https://cl-back.onrender.com/upload/pdf', { method: 'POST', body: formData });
          if (!res.ok) throw new Error("Upload justificatif échoué.");
          const data = await res.json();
          setIdCardInfo((prev) => ({ ...prev, domicileJustificatif: data.filePath }));
        } catch (err) {
          setSnackbarMessage(err.message);
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
      setSnackbarMessage('Veuillez accepter les CGV.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setOrdering(true);
    try {
      const formData = new FormData();
      // Client info
      Object.entries(userInfo).forEach(([k,v]) => formData.append(k, v));
      formData.append('prix', totalPrice.toFixed(2));
      formData.append('articleName', article.nom);
      formData.append('quantity', quantity.toString());
      if (mode === 'numero' && article.besoinNumeroCle) {
        formData.append('keyNumber', article.nom);
      }
      if (mode === 'numero' && article.besoinNumeroCarte) {
        if (!lostCartePropriete) {
          formData.append('propertyCardNumber', keyInfo.propertyCardNumber);
        } else {
          formData.append('idCardFront', idCardInfo.idCardFront);
          formData.append('idCardBack', idCardInfo.idCardBack);
          formData.append('domicileJustificatifPath', idCardInfo.domicileJustificatif);
          formData.append('attestationPropriete', attestationPropriete.toString());
        }
      }
      formData.append('deliveryType', deliveryType);
      formData.append('shippingMethod', shippingMethod);
      formData.append('isCleAPasse', isCleAPasse.toString());
      if (article.besoinPhoto) {
        formData.append('frontPhoto', keyInfo.frontPhoto);
        formData.append('backPhoto', keyInfo.backPhoto);
      }

      const res = await fetch('https://cl-back.onrender.com/commande/create', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const { numeroCommande } = await res.json();

      // Paiement stripe
      const paymentRes = await fetch('https://cl-back.onrender.com/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice * 100,
          currency: 'eur',
          description: `Paiement pour ${userInfo.nom}`,
          success_url: `https://www.cleservice.com/commande-success?numeroCommande=${numeroCommande}`,
          cancel_url: `https://www.cleservice.com/commande-cancel?numeroCommande=${numeroCommande}`,
        }),
      });
      if (!paymentRes.ok) throw new Error(await paymentRes.text());
      const { paymentUrl } = await paymentRes.json();
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
    <Box sx={{ py: 4, backgroundColor: '#f7f7f7' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Section Formulaire */}
          <Grid item xs={12}>
            <SectionPaper>
              <Typography variant="h5" gutterBottom>Informations de Commande</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Processus de Commande
                </Typography>
                {mode === 'postal' ? (
                  <Typography variant="body1">
                    Vous avez choisi le mode <strong>atelier</strong>. Après paiement, suivez les instructions d’envoi.
                  </Typography>
                ) : (
                  <Typography variant="body1">
                    Vous avez choisi le mode <strong>numéro</strong>. Pas besoin d’envoyer la clé.
                  </Typography>
                )}
              </Box>

              {mode === 'numero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Informations sur la Clé</Typography>
                  {article.estCleAPasse && (
                    <FormControlLabel
                      control={<ModernCheckbox checked={isCleAPasse} onChange={(e) => setIsCleAPasse(e.target.checked)} />}
                      label="Clé à passe"
                    />
                  )}
                  {article.besoinNumeroCle && (
                    <>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {article.nom}
                      </Typography>
                      {article.descriptionNumero && (
                        <Typography variant="body2" color="text.secondary">
                          {article.descriptionNumero}
                        </Typography>
                      )}
                    </>
                  )}
                  {article.besoinNumeroCarte && (
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={<Checkbox checked={lostCartePropriete} onChange={(e) => setLostCartePropriete(e.target.checked)} />}
                        label="J'ai perdu ma carte"
                      />
                      {!lostCartePropriete ? (
                        <TextField
                          placeholder="Numéro sur carte"
                          variant="outlined"
                          name="propertyCardNumber"
                          value={keyInfo.propertyCardNumber}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      ) : (
                        <>
                          <Typography color="error" sx={{ mb: 1 }}>
                            Fournissez justificatifs :
                          </Typography>
                          <AlignedFileUpload
                            label="Recto ID :"
                            name="idCardFront"
                            accept="image/*"
                            onChange={handleIdCardUpload}
                            icon={PhotoCamera}
                            file={idCardInfo.idCardFront}
                          />
                          <AlignedFileUpload
                            label="Verso ID :"
                            name="idCardBack"
                            accept="image/*"
                            onChange={handleIdCardUpload}
                            icon={PhotoCamera}
                            file={idCardInfo.idCardBack}
                          />
                          <AlignedFileUpload
                            label="Justif. domicile :"
                            name="domicileJustificatif"
                            accept="application/pdf"
                            onChange={handleIdCardUpload}
                            icon={CloudUpload}
                            file={idCardInfo.domicileJustificatif}
                          />
                          <FormControlLabel
                            control={<Checkbox checked={attestationPropriete} onChange={(e) => setAttestationPropriete(e.target.checked)} />}
                            label="J'atteste être propriétaire"
                          />
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {article.besoinPhoto && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Photos de la Clé</Typography>
                  <AlignedFileUpload
                    label="Recto clé :"
                    name="frontPhoto"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    icon={PhotoCamera}
                    file={keyInfo.frontPhoto}
                  />
                  <AlignedFileUpload
                    label="Verso clé :"
                    name="backPhoto"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    icon={PhotoCamera}
                    file={keyInfo.backPhoto}
                  />
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Quantité</Typography>
                <TextField
                  type="number"
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
                    <FormControlLabel value="particulier" control={<Radio />} label="Particulier" />
                    <FormControlLabel value="entreprise" control={<Radio />} label="Entreprise" />
                  </RadioGroup>
                </FormControl>
                <TextField
                  placeholder="Nom & prénom"
                  name="nom"
                  value={userInfo.nom}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="Email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="Téléphone"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="Adresse"
                  name="address"
                  value={userInfo.address}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="Code postal"
                  name="postalCode"
                  value={userInfo.postalCode}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  placeholder="Ville"
                  name="ville"
                  value={userInfo.ville}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}  
                />
                <TextField
                  placeholder="Infos complémentaires"
                  name="additionalInfo"
                  value={userInfo.additionalInfo}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Info />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>

              {mode === 'postal' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Type d'expédition</Typography>
                  <Select
                    fullWidth
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Choisissez un type</MenuItem>
                    <MenuItem value="lettre">Lettre</MenuItem>
                    <MenuItem value="recommande">Recommandé</MenuItem>
                  </Select>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Mode de récupération</Typography>
                <FormControl component="fieldset">
                  <RadioGroup row name="shippingMethod" value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                    <FormControlLabel value="magasin" control={<Radio />} label="En magasin" />
                    <FormControlLabel value="expedition" control={<Radio />} label="Expédition (8€)" />
                  </RadioGroup>
                </FormControl>
              </Box>

              <FormControlLabel
                control={<ModernCheckbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
                label={<>J'accepte les <Button onClick={() => setOpenCGV(true)}>CGV</Button></>}
              />
            </SectionPaper>
          </Grid>

          {/* Récapitulatif */}
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
                sx={{ mt: 2 }}
                onClick={handleOrder}
                disabled={ordering}
              >
                {ordering ? <CircularProgress size={24} color="inherit" /> : 'Commander'}
              </Button>
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>

      {/* Modal agrandi */}
      <Dialog open={openImageModal} onClose={handleCloseImageModal} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={decodeImage(article.imageBase64)} alt={article.nom} style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} iconMapping={{
          success: <CheckCircle />,
          error: <ErrorIcon />,
        }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* CGV Popup */}
      <ConditionsGeneralesVentePopup open={openCGV} onClose={() => setOpenCGV(false)} />
    </Box>
  );
};

export default CommandePage;
