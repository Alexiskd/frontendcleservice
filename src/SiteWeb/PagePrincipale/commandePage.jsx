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

const CommandePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extraction des paramètres depuis l'URL
  const { brandName, productName } = useParams();
  const decodedProductName = productName ? productName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // ex: 'postal' ou 'numero'
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

  // Pour le mode "numero", le champ keyNumber recevra automatiquement le nom du produit commandé
  const [keyInfo, setKeyInfo] = useState({
    keyNumber: '', // À remplir automatiquement avec article.nom
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

  // Récupération du produit selon brandName et decodedProductName
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        const endpoint = `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedProductName)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Article non trouvé.');
          throw new Error("Erreur lors du chargement de l'article.");
        }
        const responseText = await response.text();
        if (!responseText) throw new Error('Réponse vide du serveur.');
        const data = JSON.parse(responseText);

        // Vérification de la cohérence de la marque
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
  }, [brandName, decodedProductName]);

  // Calcul du prix en fonction du mode et des options choisies
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

  // Reste de la logique du composant (gestion des formulaires, envoi, affichage, etc.)
  // ... (par exemple, validateForm, handleInputChange, handleOrder, etc.)

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
                    Vous avez choisi le mode <strong>"atelier"</strong> via notre atelier. Après paiement, vous recevrez un email avec l'adresse d'envoi de votre clé en recommandé. Une fois la clé reçue, notre atelier procédera à la reproduction.
                  </Typography>
                ) : (
                  <Typography variant="body1" sx={{ color: '#000' }}>
                    Vous avez choisi le mode <strong>"numero"</strong>. Dans ce mode, il n'est pas nécessaire d'envoyer votre clé. La commande sera directement traitée par le fabricant grâce au numéro.
                  </Typography>
                )}
              </Box>

              {mode === 'numero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Informations sur la clé
                  </Typography>
                  {article?.estCleAPasse && (
                    <FormControlLabel
                      control={
                        <ModernCheckbox checked={isCleAPasse} onChange={(e) => setIsCleAPasse(e.target.checked)} />
                      }
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
                            onChange={() => {}}
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
                            onChange={() => {}}
                            icon={PhotoCamera}
                            file={idCardInfo.idCardFront}
                          />
                          <AlignedFileUpload
                            label="Photo verso de la pièce d'identité * :"
                            name="idCardBack"
                            accept="image/*"
                            onChange={() => {}}
                            icon={PhotoCamera}
                            file={idCardInfo.idCardBack}
                          />
                          <AlignedFileUpload
                            label="Justificatif de domicile (PDF) * :"
                            name="domicileJustificatif"
                            accept="application/pdf"
                            onChange={() => {}}
                            icon={CloudUpload}
                            file={idCardInfo.domicileJustificatif}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox checked={attestationPropriete} onChange={(e) => setAttestationPropriete(e.target.checked)} />
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

              {article?.besoinPhoto && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Téléchargement des Photos de la Clé
                  </Typography>
                  <AlignedFileUpload
                    label="Photo clé (recto) * :"
                    name="frontPhoto"
                    accept="image/*"
                    onChange={() => {}}
                    icon={PhotoCamera}
                    file={keyInfo.frontPhoto}
                  />
                  <AlignedFileUpload
                    label="Photo clé (verso) * :"
                    name="backPhoto"
                    accept="image/*"
                    onChange={() => {}}
                    icon={PhotoCamera}
                    file={keyInfo.backPhoto}
                  />
                </Box>
              )}

              {/* ... Autres sections du formulaire ... */}

              {mode === 'postal' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Type d'expédition
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Une fois le paiement effectué, vous recevrez un email contenant l'adresse d'envoi de votre clé.
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

          <Grid item xs={12}>
            <SummaryCard>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Récapitulatif
              </Typography>
              {article && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {article.imageUrl && (
                    <Box onClick={handleOpenImageModal} sx={{ cursor: 'pointer', mr: 2 }}>
                      <CardMedia
                        component="img"
                        image={article.imageUrl}
                        alt={article.nom}
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
                    <Typography variant="subtitle1">{article.nom}</Typography>
                    {article.manufacturer && (
                      <Typography variant="body2">Marque : {article.manufacturer}</Typography>
                    )}
                    <Typography variant="body2">Prix : {safeArticlePrice.toFixed(2)} €</Typography>
                  </Box>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">
                  {shippingMethod === 'expedition' ? "Frais d'expédition" : "Récupération en magasin"}
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
                onClick={() => {}}
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

      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={article?.imageUrl} alt={article?.nom} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
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
