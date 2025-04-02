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
  DialogContent,
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LabelIcon from '@mui/icons-material/Label';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const theme = createTheme({
  typography: {
    fontFamily: '"Playfair Display", serif',
  },
});

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

const ProductPage = ({ product }) => {
  const location = useLocation();
  const { brandName = '', productName = '' } = useParams();
  const navigate = useNavigate();
  const [openImageModal, setOpenImageModal] = useState(false);

  const mainPrice = Number(product?.prix) || Number(product?.prixSansCartePropriete) || null;

  const handleOrderNow = useCallback((mode) => {
    if (product) {
      const formattedBrand = brandName.toLowerCase().replace(/\s+/g, '-');
      const formattedProductName = product.nom.trim().replace(/\s+/g, '-');
      navigate(
        `/commander/${formattedBrand}/cle/${product.referenceEbauche}/${encodeURIComponent(
          formattedProductName
        )}?mode=${mode}`
      );
    }
  }, [navigate, product, brandName]);

  const handleViewProduct = useCallback(() => {
    if (product) {
      const formattedProductName = product.nom.trim().replace(/\s+/g, '-');
      navigate(`/produit/${brandName}/${encodeURIComponent(formattedProductName)}`);
    }
  }, [navigate, product, brandName]);

  const handleOpenImageModal = useCallback(() => {
    if (product?.imageUrl) {
      setOpenImageModal(true);
    }
  }, [product]);

  const handleCloseImageModal = useCallback(() => {
    setOpenImageModal(false);
  }, []);

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Produit non trouvé.
        </Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <Container sx={{ mt: 4 }}>
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
                <Typography
                  variant="h4"
                  sx={{
                    color: '#1B5E20',
                    mb: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={handleViewProduct}
                >
                  {product.nom}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ color: '#155724', mb: 1, textAlign: 'center' }}
                >
                  {product.marque}
                </Typography>

                {mainPrice && (
                  <Typography
                    variant="h5"
                    sx={{ color: '#1B5E20', fontWeight: 600, mb: 2, textAlign: 'center' }}
                  >
                    {mainPrice} €
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
      </Container>

      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="lg">
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={product.imageUrl}
              alt={product.nom}
              style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default ProductPage;
