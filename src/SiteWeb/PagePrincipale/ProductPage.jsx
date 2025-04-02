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
  Dialog,
  DialogContent
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
  const [openImageModal, setOpenImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');

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
          https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(decodedProductName)}
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

  const handleOrderNow = useCallback((mode) => {
    if (product) {
      const formattedBrand = brandName.toLowerCase().replace(/\s+/g, '-');
      const formattedProductName = product.nom.trim().replace(/\s+/g, '-');
      navigate(
        /commander/${formattedBrand}/cle/${product.referenceEbauche}/${encodeURIComponent(
          formattedProductName
        )}?mode=${mode}
      );
    }
  }, [navigate, product, brandName]);

  const handleViewProduct = useCallback(() => {
    if (product) {
      const formattedProductName = product.nom.trim().replace(/\s+/g, '-');
      navigate(/produit/${brandName}/${encodeURIComponent(formattedProductName)});
    }
  }, [navigate, product, brandName]);

  const handleOpenImageModal = useCallback(() => {
    if (product && product.imageUrl) {
      setModalImage(product.imageUrl);
      setOpenImageModal(true);
    }
  }, [product]);

  const handleCloseImageModal = useCallback(() => {
    setOpenImageModal(false);
  }, []);

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

  const isCoffreFort =
    product &&
    (product.nom.toUpperCase().includes("COFFRE FORT") ||
      (product.marque && product.marque.toUpperCase().includes("COFFRE FORT")));

  const mainPrice =
    Number(product.prix) > 0
      ? product.prix
      : Number(product.prixSansCartePropriete) > 0
      ? product.prixSansCartePropriete
      : null;

  const processText =
    Number(product.prix) > 0
      ? "Reproduction par numéro et/ou carte de propriété chez le fabricant. Vous n'avez pas besoin d'envoyer la clé en amont."
      : Number(product.prixSansCartePropriete) > 0
      ? "Reproduction dans notre atelier : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie (clé à passe ou clé normale)."
      : "";

  const cleAPasseText =
    Number(product.prixCleAPasse) > 0 && product.typeReproduction && product.typeReproduction.toLowerCase().includes('atelier')
      ? "Reproduction dans notre atelier pour clé de passe : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie."
      : "Reproduction par numéro clé de passe : votre clé est un passe, qui ouvre plusieurs serrures. Vous n'avez pas besoin d'envoyer leur clé en amont.";

  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <StyledCard>
        <Grid container spacing={2}>
          {product.imageUrl && (
            <Grid item xs={12} md={4}>
              <Box
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, cursor: 'pointer' }}
                onClick={handleOpenImageModal}
              >
                <CardMedia
                  component="img"
                  image={product.imageUrl}
                  alt={product.nom}
                  sx={{ width: '80%', maxWidth: 150, objectFit: 'contain', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' } }}
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={12} md={8}>
            <CardContent>
              <Typography
                variant="h4"
                sx={{ fontFamily: 'Playfair Display, serif', color: '#1B5E20', mb: 1, cursor: 'pointer' }}
                onClick={handleViewProduct}
              >
                {product.nom}
              </Typography>
              {/* Other content remains unchanged */}
            </CardContent>
          </Grid>
        </Grid>
      </StyledCard>
    </Container>
  );
};

export default ProductPage;
