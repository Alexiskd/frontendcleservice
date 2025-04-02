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

const ProductPage = () => {
  const location = useLocation();
  let { brandName, productName } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');

  if (!productName && location.pathname === '/cle-izis-cassee.php') {
    productName = "Clé-Izis-Cavers-Reparation-de-clé";
  }
  if (!brandName && location.pathname === '/cle-izis-cassee.php') {
    brandName = "cle-izis-cavers";
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
        if (!response.ok) throw new Error('Produit introuvable.');
        const data = await response.json();
        if (!data) throw new Error('Réponse vide du serveur.');
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [decodedProductName]);

  const handleCloseImageModal = () => setOpenImageModal(false);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return <Alert severity="error">Produit non trouvé.</Alert>;

  return (
    <>
      <Helmet>
        <title>{product.nom} | Clé Service</title>
      </Helmet>

      <Container sx={{ mt: 2, mb: 4 }}>
        <StyledCard>
          <CardContent>
            <Typography variant="h4">{product.nom}</Typography>

            <Divider sx={{ my: 2 }} />

            <List>
              {product.cleAvecCartePropriete !== null && (
                <ListItem>
                  <ListItemIcon><VpnKeyIcon /></ListItemIcon>
                  <ListItemText primary={`Carte: ${product.cleAvecCartePropriete ? 'Oui' : 'Non'}`} />
                </ListItem>
              )}
              {product.referenceEbauche && (
                <ListItem>
                  <ListItemIcon><LabelIcon /></ListItemIcon>
                  <ListItemText primary={`Référence: ${product.referenceEbauche}`} />
                </ListItem>
              )}
              {product.typeReproduction && (
                <ListItem>
                  <ListItemIcon><FileCopyIcon /></ListItemIcon>
                  <ListItemText primary={`Reproduction: ${product.typeReproduction}`} />
                </ListItem>
              )}
              {product.descriptionNumero && (
                <ListItem>
                  <ListItemIcon><FormatListNumberedIcon /></ListItemIcon>
                  <ListItemText primary={`Numéro: ${product.descriptionNumero}`} />
                </ListItem>
              )}
            </List>
          </CardContent>
        </StyledCard>

        {error && <Snackbar open={!!error}><Alert severity="error">{error}</Alert></Snackbar>}
      </Container>

      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="lg">
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={modalImage} alt={product.nom} style={{ width: '100%', maxWidth: '800px', height: 'auto' }} />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductPage;
