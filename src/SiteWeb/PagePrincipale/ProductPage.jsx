import React, { useState, useEffect, useCallback } from 'react'; 
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { brandName, productName } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!productName) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
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
          `/commander/${formattedBrand}/cle/${product.referenceEbauche}/${encodeURIComponent(formattedProductName)}?mode=${mode}`
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
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Produit non trouvé.
        </Typography>
      </Container>
    );
  }

  // Détection si c'est une clé de coffre‑fort
  const isCoffreFort =
    product &&
    (product.nom.toUpperCase().includes("COFFRE FORT") ||
      (product.marque && product.marque.toUpperCase().includes("COFFRE FORT")));

  // Détermination du prix principal (sauf clé de passe)
  const mainPrice = Number(product.prix) > 0
    ? product.prix
    : Number(product.prixSansCartePropriete) > 0
    ? product.prixSansCartePropriete
    : null;

  // Texte de procédé en fonction du type de reproduction
  const processText =
    Number(product.prix) > 0
      ? "Reproduction par numéro et/ou carte de propriété chez le fabricant. Vous n'avez pas besoin d'envoyer la clé en amont."
      : Number(product.prixSansCartePropriete) > 0
      ? "Reproduction dans notre atelier : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie (clé à passe ou clé normale)."
      : "";

  return (
    <>
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
                  onClick={handleViewProduct}
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
                {/* Nom du produit et prix principal */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="h3"
                    sx={{ color: '#1B5E20', fontWeight: 'bold', mb: 1, cursor: 'pointer' }}
                    onClick={handleViewProduct}
                  >
                    {product.nom}
                  </Typography>
                  {mainPrice && (
                    <Typography variant="h3" sx={{ color: '#1B5E20', fontWeight: 'bold' }}>
                      {mainPrice} €
                    </Typography>
                  )}
                </Box>
                {isCoffreFort && (
                  <Typography variant="subtitle1" sx={{ color: '#D32F2F', fontWeight: 'bold', mb: 1 }}>
                    Clé Coffre Fort
                  </Typography>
                )}
                {product.marque && (
                  <Typography variant="h4" sx={{ color: '#1B5E20', fontWeight: 'medium', mb: 2 }}>
                    {product.marque}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                {/* Section Processus de fabrication */}
                <InfoBox>
                  <Typography variant="h6" sx={{ color: '#1B5E20', fontWeight: 'bold', mb: 2 }}>
                    processus de fabrication
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Les clients peuvent directement venir en boutique au 20 rue de Lévis pour faire une reproduction de leur clé, c'est plus simple et plus rapide.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {processText}
                      </Typography>
                    </Grid>
                  </Grid>
                </InfoBox>
                {/* Tableau pour clé de passe */}
                {Number(product.prixCleAPasse) > 0 && (
                  <InfoBox>
                    <Typography variant="h6" sx={{ color: '#1B5E20', fontWeight: 'bold', mb: 2 }}>
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
                        Reproduction par numéro clé de passe : votre clé est un passe, qui ouvre plusieurs serrures. Vous n'avez pas besoin d'envoyer leur clé en amont.
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
                        <ListItemText primary={`Carte de propriété : ${product.cleAvecCartePropriete ? 'Oui' : 'Non'}`} />
                      </ListItem>
                    )}
                    {product.referenceEbauche && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <LabelIcon color="action" />
                        </ListItemIcon>
                        <ListItemText primary={`Référence ébauche : ${product.referenceEbauche}`} />
                      </ListItem>
                    )}
                    {product.typeReproduction && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <FileCopyIcon color="action" />
                        </ListItemIcon>
                        <ListItemText primary={`Mode de reproduction : ${product.typeReproduction}`} />
                      </ListItem>
                    )}
                    {product.descriptionNumero && product.descriptionNumero.trim() !== '' && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <FormatListNumberedIcon color="action" />
                        </ListItemIcon>
                        <ListItemText primary={`Détails du numéro : ${product.descriptionNumero}`} />
                      </ListItem>
                    )}
                    {product.descriptionProduit && product.descriptionProduit.trim() !== '' && (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <DescriptionIcon color="action" />
                        </ListItemIcon>
                        <ListItemText primary={`Description du produit : ${product.descriptionProduit}`} />
                      </ListItem>
                    )}
                  </List>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoBox>
                      <Typography variant="h6" sx={{ color: '#1B5E20', fontWeight: 'bold', mb: 1 }}>
                        Délai de livraison
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1B5E20' }}>
                        {getDeliveryDelay(product.typeReproduction)}
                      </Typography>
                    </InfoBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBox>
                      <Typography variant="h6" sx={{ color: '#1B5E20', fontWeight: 'bold', mb: 1 }}>
                        Moyens de paiement
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1B5E20' }}>
                        Paiement par carte uniquement (Mastercard, Visa, American Express).
                      </Typography>
                    </InfoBox>
                  </Grid>
                </Grid>
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
    </>
  );
};

export default ProductPage;
