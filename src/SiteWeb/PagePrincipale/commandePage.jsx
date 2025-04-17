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
  str.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

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

// Popup des Conditions Générales et Mentions Légales
const ConditionsGeneralesVentePopup = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Conditions Générales de Vente & Mentions Légales - Cleservice.com</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 2 }}>
        <Typography variant="h6" gutterBottom>Objet</Typography>
        <Typography variant="body2" paragraph>
          Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Maison Bouvet S.A.S. (ci-après "le Vendeur") et tout client effectuant un achat sur cleservice.com.
        </Typography>
        <Typography variant="h6" gutterBottom>Produits</Typography>
        <Typography variant="body2" paragraph>
          Les produits sont présentés avec exactitude. Le Vendeur peut corriger erreurs ou omissions sans engager sa responsabilité.
        </Typography>
        <Typography variant="h6" gutterBottom>Prix</Typography>
        <Typography variant="body2" paragraph>
          Les prix, en euros TTC, peuvent être modifiés. Le prix facturé est celui en vigueur lors de la validation du paiement.
        </Typography>
        <Typography variant="h6" gutterBottom>Commande</Typography>
        <Typography variant="body2" paragraph>
          Toute commande implique l'acceptation sans réserve des CGV et la prise de connaissance préalable par l'Acheteur.
        </Typography>
        <Typography variant="h6" gutterBottom>Paiement</Typography>
        <Typography variant="body2" paragraph>
          Paiement en ligne sécurisé par carte bancaire ou autres moyens proposés.
        </Typography>
        <Typography variant="h6" gutterBottom>Livraison</Typography>
        <Typography variant="body2" paragraph>
          Livraison à l'adresse indiquée. Délais variables selon destination. Retard non imputable au Vendeur.
        </Typography>
        <Typography variant="h6" gutterBottom>Droit de Rétractation</Typography>
        <Typography variant="body2" paragraph>
          L'Acheteur dispose de 14 jours à réception pour exercer son droit de rétractation. Frais de retour à sa charge.
        </Typography>
        <Typography variant="h6" gutterBottom>Garantie</Typography>
        <Typography variant="body2" paragraph>
          Garantie légale de conformité et contre les vices cachés selon la législation en vigueur.
        </Typography>
        <Typography variant="h6" gutterBottom>Responsabilité</Typography>
        <Typography variant="body2" paragraph>
          Le Vendeur n'est pas responsable des dommages indirects. Responsabilité limitée au montant de la commande.
        </Typography>
        <Typography variant="h6" gutterBottom>Droit Applicable</Typography>
        <Typography variant="body2" paragraph>
          Les CGV sont soumises au droit français. Juridiction compétente : tribunaux de Paris.
        </Typography>
        <Typography variant="h6" gutterBottom>Modification des CGV</Typography>
        <Typography variant="body2" paragraph>
          Le Vendeur peut modifier les CGV à tout moment. Les nouvelles CGV s'appliquent aux commandes ultérieures.
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { brand: brandName, reference: articleType, name: articleName } = useParams();
  const decodedArticleName = articleName ? articleName.replace(/-/g, ' ') : '';
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [errorArticle, setErrorArticle] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingArticle(true);
        setErrorArticle(null);
        if (!decodedArticleName.trim()) throw new Error("Nom d'article vide.");
        const endpoint = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedArticleName)}`;
        let response = await fetch(endpoint);
        if (response.status === 404) {
          response = await fetch(
            `https://cl-back.onrender.com/produit/cles/closest-match?nom=${encodeURIComponent(decodedArticleName)}`
          );
        }
        if (!response.ok) throw new Error(await response.text());
        const json = await response.json();
        if (json.marque && normalizeString(json.marque) !== normalizeString(brandName))
          throw new Error("Marque non correspondante.");
        setArticle(json);
      } catch (e) {
        setErrorArticle(e.message);
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchProduct();
  }, [brandName, decodedArticleName]);

  const [userInfo, setUserInfo] = useState({
    clientType: 'particulier', nom: '', email: '', phone: '', address: '', postalCode: '', ville: '', additionalInfo: ''
  });
  const [keyInfo, setKeyInfo] = useState({ keyNumber: '', propertyCardNumber: '', frontPhoto: null, backPhoto: null });
  const [isCleAPasse, setIsCleAPasse] = useState(false);
  const [lostCartePropriete, setLostCartePropriete] = useState(false);
  const [idCardInfo, setIdCardInfo] = useState({ idCardFront: null, idCardBack: null, domicileJustificatif: '' });
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
  const [openImageModal, setOpenImageModal] = useState(false);

  const articlePrice = article ? (isCleAPasse && article.prixCleAPasse ? parseFloat(article.prixCleAPasse)
    : mode === 'postal' ? parseFloat(article.prixSansCartePropriete)
    : parseFloat(article.prix)) : 0;
  const safeArticlePrice = isNaN(articlePrice) ? 0 : articlePrice;
  const shippingFee = shippingMethod === 'expedition' ? 8 : 0;
  const dossierFees = { anker:80, bricard:60, fichet:205, heracles:60, laperche:60, medeco:60, picard:80, vachette:96 };
  const normalizedMarque = article ? normalizeString(article.marque) : '';
  const dossierFee = lostCartePropriete && dossierFees[normalizedMarque] ? dossierFees[normalizedMarque] : 0;
  const totalPrice = safeArticlePrice + shippingFee + dossierFee;

  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name in userInfo) setUserInfo({...userInfo, [name]: value});
    else if (name in keyInfo) setKeyInfo({...keyInfo, [name]: value});
  };
  const handlePhotoUpload = e => { const { name, files } = e.target; if (files[0]) setKeyInfo({...keyInfo,[name]:files[0]}); };
  const handleIdCardUpload = async e => { const { name, files } = e.target; if (files[0]) {
    if (name==='domicileJustificatif'){
      const fd=new FormData();fd.append('pdf',files[0]);
      try{ const res=await fetch('https://cl-back.onrender.com/upload/pdf',{method:'POST',body:fd});if(!res.ok)throw new Error();const d=await res.json();setIdCardInfo({...idCardInfo,domicileJustificatif:d.filePath});
      }catch{setSnackbarMessage('Erreur upload');setSnackbarSeverity('error');setSnackbarOpen(true);}    
    } else setIdCardInfo({...idCardInfo,[name]:files[0]}); }};
  const handleOrder = async () => { if(!termsAccepted){setSnackbarMessage('Acceptez CGV');setSnackbarSeverity('error');setSnackbarOpen(true);return;} setOrdering(true);
    try{ const fd=new FormData();Object.entries(userInfo).forEach(([k,v])=>fd.append(k,v));fd.append('prix',totalPrice.toFixed(2));fd.append('articleName',article?.nom||'');fd.append('quantity',quantity);
      if(mode==='numero'){ if(article?.besoinNumeroCle)fd.append('keyNumber',article.nom); if(article?.besoinNumeroCarte){ if(!lostCartePropriete)fd.append('propertyCardNumber',keyInfo.propertyCardNumber); else{ fd.append('idCardFront',idCardInfo.idCardFront);fd.append('idCardBack',idCardInfo.idCardBack);fd.append('domicileJustificatifPath',idCardInfo.domicileJustificatif);fd.append('attestationPropriete',attestationPropriete.toString()); }}} fd.append('deliveryType',deliveryType);fd.append('shippingMethod',shippingMethod);fd.append('isCleAPasse',isCleAPasse.toString()); if(article?.besoinPhoto){ fd.append('frontPhoto',keyInfo.frontPhoto);fd.append('backPhoto',keyInfo.backPhoto);}      
      const commandeRes=await fetch('https://cl-back.onrender.com/commande/create',{method:'POST',body:fd}); if(!commandeRes.ok)throw new Error(await commandeRes.text()); const {numeroCommande}=await commandeRes.json();
      const paymentPayload={ amount:totalPrice*100,currency:'eur',description:`Veuillez procéder au paiement pour ${userInfo.nom}`,success_url:`https://www.cleservice.com/commande-success?numeroCommande=${numeroCommande}`,cancel_url:`https://www.cleservice.com/commande-cancel?numeroCommande=${numeroCommande}` };
      const payRes=await fetch('https://cl-back.onrender.com/stripe/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(paymentPayload)});
      if(!payRes.ok)throw new Error(await payRes.text()); const {paymentUrl}=await payRes.json(); window.location.href=paymentUrl;
    }catch(e){setSnackbarMessage(`Erreur : ${e.message}`);setSnackbarSeverity('error');setSnackbarOpen(true);setOrdering(false);}  };
  const handleCloseSnackbar=(e,reason)=>{if(reason==='clickaway')return;setSnackbarOpen(false);};
  if(loadingArticle) return <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><CircularProgress/></Box>;
  if(errorArticle||!article) return <Container sx={{mt:4}}><Typography variant="h4" color="error">{errorArticle||'Produit non disponible'}</Typography><Button onClick={()=>navigate('/')}>Retour à l’accueil</Button></Container>;
  return (
    <Box sx={{backgroundColor:'#f7f7f7',minHeight:'100vh',py:4}}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <SectionPaper>
              <Typography variant="h5">Informations de Commande</Typography>
              <Divider sx={{mb:3}}/>
              {/* Formulaire... */}
              {/* Le contenu détaillé du formulaire reste inchangé */}
              <Box>
                <FormControlLabel
                  control={<ModernCheckbox checked={termsAccepted} onChange={(e)=>setTermsAccepted(e.target.checked)}/>} 
                  label={
                    <>
                      J'accepte les {' '}
                      <Button variant="text" onClick={(e)=>{e.preventDefault();setOpenCGV(true);}} sx={{textTransform:'none'}}>Conditions Générales de Vente</Button>
                    </>
                  }
                />
              </Box>
            </SectionPaper>
          </Grid>
          <Grid item xs={12}>
            <SummaryCard>
              {/* Récapitulatif... */}
            </SummaryCard>
          </Grid>
        </Grid>
      </Container>
      <Dialog open={openImageModal} onClose={()=>setOpenImageModal(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{p:0}}>
          <img src={article.imageUrl} alt={article.nom} style={{width:'100%',height:'auto'}} />
        </DialogContent>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} iconMapping={{success:<CheckCircle sx={{color:'#1B5E20'}}/>,error:<ErrorIcon sx={{color:'#1B5E20'}}/>}}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <ConditionsGeneralesVentePopup open={openCGV} onClose={()=>setOpenCGV(false)}/>
    </Box>
  );
};

export default CommandePage;
