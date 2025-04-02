import React, { useState, useEffect, useCallback } from 'react'; 
import { Helmet } from 'react-helmet';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LabelIcon from '@mui/icons-material/Label';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import DescriptionIcon from '@mui/icons-material/Description';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  boxShadow: '0px 4px 20px rgba(27, 94, 32, 0.3)',
  transition: 'transform 0.3s',
  overflow: 'hidden',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1B5E20',
  color: '#fff',
  textTransform: 'none',
  padding: theme.spacing(1.5, 4),
  borderRadius: 4,
  boxShadow: 'none',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#155724',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 4,
  background: 'linear-gradient(45deg, #e8f5e9, #f1f8e9)',
  marginBottom: theme.spacing(2),
}));

const PricingGrid = styled(Grid)(({ theme }) => ({
  border: '1px solid #1B5E20',
  borderRadius: 4,
  overflow: 'hidden',
}));

const PricingCell = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRight: '1px solid #1B5E20',
  borderBottom: '1px solid #1B5E20',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const PricingCellNoBorder = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: '1px solid #1B5E20',
}));

const getDeliveryDelay = (typeReproduction) => {
  switch (typeReproduction) {
    case 'copie':
      return 'Livraison en 3 jours ouvrés pour cette clé';
    case 'clé à IA':
      return 'Livraison en 5 jours ouvrés pour cette clé';
    case 'clé à numéro':
      return 'Livraison en 1/2 semaine pour cette clé';
    default:
      return 'Délai de livraison à confirmer';
  }
};

const ProductPage = () => {
  const location = useLocation();
  let { brandName, productName } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // États pour le modal d'image agrandie
  const [openImageModal, setOpenImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');

  // Si aucun nom de produit n'est fourni et que le chemin est '/cle-izis-cassee.php', on définit une valeur par défaut
  if (!productName && location.pathname === '/cle-izis-cassee.php') {
    productName = "Clé-Izis-Cavers-Reparation-de-clé";
  }
  // On peut aussi définir une marque par défaut si nécessaire
  if (!brandName && location.pathname === '/cle-izis-cassee.php') {
    brandName = "cle-izis-cavers";
  }

  if (!productName) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" sx={{ fontFamily: 'Bento, sans-serif' }}>
          Nom de produit non spécifié.
        </Typography>
      </Container>
    );
  }

  let cleanedProductName = productName;
  if (cleanedProductName.endsWith('-reproduction-cle.html')) {
    cleanedProductName = cleanedProductName.replace(/-reproduction-cle\.html$/, '');
  }
  const decodedProductName = cleanedProductName.replace(/-/g, ' ');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedProductName)}`
        );
        if (!response.ok) {
          throw new Error('Produit introuvable.');
        }
        const data = await response.json();
        if (!data) {
          throw new Error('Réponse vide du serveur.');
        }
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [decodedProductName]);

  const handleOrderNow = useCallback(
    (mode) => {
      if (product) {
        const formattedBrand = brandName.toLowerCase().replace(/\s+/g, '-');
        const formattedProductName = product.nom.trim().replace(/\s+/g, '-');
        navigate(
          `/commander/${formattedBrand}/cle/${product.referenceEbauche}/${encodeURIComponent(
            formattedProductName
          )}?mode=${mode}`
        );
      }
    },
    [navigate, product, brandName]
  );

  const handleViewProduct = useCallback(() => {
    if (product) {
      const formattedProductName = product.nom.trim().replace(/\s+/g, '-');
      navigate(`/produit/${brandName}/${encodeURIComponent(formattedProductName)}`);
    }
  }, [navigate, product, brandName]);

  // Ouvre le modal d'image agrandie
  const handleOpenImageModal = useCallback(() => {
    if (product && product.imageUrl) {
      setModalImage(product.imageUrl);
      setOpenImageModal(true);
    }
  }, [product]);

  // Ferme le modal
  const handleCloseImageModal = useCallback(() => {
    setOpenImageModal(false);
  }, []);

  // Fonction pour ouvrir la source de la page dans un nouvel onglet
  const handleOpenSourcePage = () => {
    window.open('https://www.votresite.com/cle-izis-cassee.php', '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" sx={{ fontFamily: 'Bento, sans-serif' }}>
          {error}
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" sx={{ fontFamily: 'Bento, sans-serif' }}>
          Produit non trouvé.
        </Typography>
      </Container>
    );
  }

  // Vérification si c'est une clé de coffre‑fort
  const isCoffreFort =
    product &&
    (product.nom.toUpperCase().includes("COFFRE FORT") ||
      (product.marque && product.marque.toUpperCase().includes("COFFRE FORT")));

  // Détermination du prix principal (sauf clé de passe)
  const mainPrice =
    Number(product.prix) > 0
      ? product.prix
      : Number(product.prixSansCartePropriete) > 0
      ? product.prixSansCartePropriete
      : null;

  // Texte de procédé pour la section principale
  const processText =
    Number(product.prix) > 0
      ? "Reproduction par numéro et/ou carte de propriété chez le fabricant. Vous n'avez pas besoin d'envoyer la clé en amont."
      : Number(product.prixSansCartePropriete) > 0
      ? "Reproduction dans notre atelier : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie (clé à passe ou clé normale)."
      : "";

  // Texte de la cellule droite du tableau clé de passe
  const cleAPasseText =
    Number(product.prixCleAPasse) > 0 && product.typeReproduction && product.typeReproduction.toLowerCase().includes('atelier')
      ? "Reproduction dans notre atelier pour clé de passe : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie."
      : "Reproduction par numéro clé de passe : votre clé est un passe, qui ouvre plusieurs serrures. Vous n'avez pas besoin d'envoyer leur clé en amont.";

  return (
    <>
      <Helmet>
        <title>Clé Izis Cavers Reparation de clé – Votre solution en ligne</title>
        <meta name="description" content="Découvrez la clé Izis Cavers Reparation de clé, réalisée avec soin par nos experts." />
        <link rel="canonical" href="https://www.votresite.com/cle-izis-cassee.php" />
      </Helmet>
      <Container sx={{ mt: 2, mb: 4 }}>
        <StyledCard>
          <Grid container spacing={2}>
            {product.imageUrl && (
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    p: 2,
                    cursor: 'pointer',
                  }}
                  onClick={handleOpenImageModal}
                >
                  <CardMedia
                    component="img"
                    image={product.imageUrl}
                    alt={product.nom}
                    sx={{
                      width: '80%',
                      maxWidth: 150,
                      objectFit: 'contain',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  />
                </Box>
              </Grid>
            )}
            <Grid item xs={12} md={8}>
              <CardContent>
                {/* Nom du produit */}
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Bento, sans-serif',
                    color: '#1B5E20',
                    mb: 1,
                    cursor: 'pointer',
                  }}
                  onClick={handleViewProduct}
                >
                  {product.nom}
                </Typography>
                {/* Marque et prix */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ flexWrap: 'nowrap', mb: 2 }}
                >
                  {product.marque && (
                    <Typography variant="h5" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20' }}>
                      {product.marque}
                    </Typography>
                  )}
                  {mainPrice && (
                    <Typography
                      variant="h5"
                      sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20', whiteSpace: 'nowrap' }}
                    >
                      {mainPrice} €
                    </Typography>
                  )}
                </Box>
                {isCoffreFort && (
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Bento, sans-serif', color: '#D32F2F', mb: 1 }}>
                    Clé Coffre Fort
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                {/* Processus de fabrication */}
                <InfoBox>
                  <Typography variant="h6" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20', mb: 2 }}>
                    Processus de fabrication
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Bento, sans-serif' }}>
                    {processText}
                  </Typography>
                </InfoBox>
                {/* Autre moyen de reproduction */}
                <InfoBox>
                  <Typography variant="h6" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20', mb: 2 }}>
                    Autre moyen de reproduction
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Bento, sans-serif' }}>
                    Notre boutique, située au 20 rue de Lévis 75017 Paris, vous accueille pour la reproduction de votre clé. C'est simple et rapide. N'hésitez pas à venir nous voir !
                  </Typography>
                </InfoBox>
                {/* Tableau pour clé de passe */}
                {Number(product.prixCleAPasse) > 0 && (
                  <InfoBox>
                    <Typography variant="h6" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20', mb: 2 }}>
                      Clé de passe
                    </Typography>
                    <PricingGrid container>
                      <PricingCell item xs={12} sm={4}>
                        Copie fabricant d'une clé de passe (clé qui ouvre plusieurs serrures)
                      </PricingCell>
                      <PricingCell item xs={12} sm={4}>
                        {product.prixCleAPasse} €
                      </PricingCell>
                      <PricingCellNoBorder item xs={12} sm={4}>
                        {cleAPasseText}
                      </PricingCellNoBorder>
                    </PricingGrid>
                  </InfoBox>
                )}
                <Box sx={{ mb: 2 }}>
                  <List>
                    {product.cleAvecCartePropriete !== null && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <VpnKeyIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Carte de propriété : ${product.cleAvecCartePropriete ? 'Oui' : 'Non'}`}
                          primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }}
                        />
                      </ListItem>
                    )}
                    {product.referenceEbauche && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <LabelIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Référence ébauche : ${product.referenceEbauche}`}
                          primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }}
                        />
                      </ListItem>
                    )}
                    {product.typeReproduction && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <FileCopyIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Mode de reproduction : ${product.typeReproduction}`}
                          primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }}
                        />
                      </ListItem>
                    )}
                    {product.descriptionNumero && product.descriptionNumero.trim() !== '' && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <FormatListNumberedIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Détails du numéro : ${product.descriptionNumero}`}
                          primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }}
                        />
                      </ListItem>
                    )}
                    {/* La section de description du produit a été supprimée */}
                  </List>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoBox>
                      <Typography variant="h6" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20', mb: 1 }}>
                        Délai de livraison
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20' }}>
                        {getDeliveryDelay(product.typeReproduction)}
                      </Typography>
                    </InfoBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBox>
                      <Typography variant="h6" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20', mb: 1 }}>
                        Moyens de paiement
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Bento, sans-serif', color: '#1B5E20' }}>
                        Paiement par carte uniquement (Mastercard, Visa, American Express).
                      </Typography>
                    </InfoBox>
                  </Grid>
                </Grid>
                {/* Bloc de commande */}
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Number(product.prix) > 0 && (
                    <StyledButton onClick={() => handleOrderNow('numero')} startIcon={<ConfirmationNumberIcon />}>
                      Commander par numéro chez le fabricant
                    </StyledButton>
                  )}
                  {Number(product.prixSansCartePropriete) > 0 && (
                    <StyledButton onClick={() => handleOrderNow('postal')} startIcon={<LocalShippingIcon />}>
                      Commander, la reproduction sera effectuée dans notre atelier.
                    </StyledButton>
                  )}
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </StyledCard>
        {error && (
          <Snackbar open={!!error} autoHideDuration={6000}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}
      </Container>
      {/* Dialog affichant l'image agrandie */}
      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="lg">
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={modalImage}
              alt={product.nom}
              style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductPage;
