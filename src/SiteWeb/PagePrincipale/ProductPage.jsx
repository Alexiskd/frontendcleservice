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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';


// Composants stylisés
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  boxShadow: '0px 4px 20px rgba(27, 94, 32, 0.3)',
  transition: 'transform 0.3s',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.02)',
  },
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

// Fonction utilitaire pour déterminer le délai de livraison
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

  // Vérifier que productName est défini
  if (!productName) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Nom de produit non spécifié.
        </Typography>
      </Container>
    );
  }

  // Nettoyer le nom du produit s'il contient "-reproduction-cle.html"
  let cleanedProductName = productName;
  if (cleanedProductName.endsWith('-reproduction-cle.html')) {
    cleanedProductName = cleanedProductName.replace(/-reproduction-cle\.html$/, '');
  }
  // Reconstruire le nom en remplaçant les tirets par des espaces
  const decodedProductName = cleanedProductName.replace(/-/g, ' ');

  // Remonter en haut de la page au montage
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Requête vers le back-end pour récupérer la clé par son nom
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

  // Navigation vers la page de commande
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

  // Navigation vers la page produit
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
                <Typography
                  variant="h3"
                  sx={{ color: '#1B5E20', fontWeight: 'bold', mb: 1, cursor: 'pointer' }}
                  onClick={handleViewProduct}
                >
                  {product.nom}
                </Typography>
                {product.marque && (
                  <Typography variant="h4" sx={{ color: '#1B5E20', fontWeight: 'medium', mb: 2 }}>
                    {product.marque}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <InfoBox>
                  <Typography variant="h6" sx={{ color: '#1B5E20', fontWeight: 'bold', mb: 2 }}>
                    Tarifs
                  </Typography>
                  <PricingGrid container>
                    <PricingCell item xs={4} sx={{ fontWeight: 'bold', backgroundColor: '#c8e6c9' }}>
                      Type
                    </PricingCell>
                    <PricingCell item xs={4} sx={{ fontWeight: 'bold', backgroundColor: '#c8e6c9' }}>
                      TTC
                    </PricingCell>
                    <PricingCellNoBorder item xs={4} sx={{ fontWeight: 'bold', backgroundColor: '#c8e6c9' }}>
                      Procédure
                    </PricingCellNoBorder>
                    {Number(product.prix) > 0 && (
                      <>
                        <PricingCell item xs={4}>Copie fabricant</PricingCell>
                        <PricingCell item xs={4}>{product.prix} €</PricingCell>
                        <PricingCellNoBorder item xs={4}>
                          Reproduction par numéro et/ou carte de propriété chez le fabricant. Vous n'avez pas besoin d'envoyer la clé en amont.
                        </PricingCellNoBorder>
                      </>
                    )}
                    {Number(product.prixCleAPasse) > 0 && (
                      <>
                        <PricingCell item xs={4}>
                          Copie fabricant d'une clé de passe (clé qui ouvre plusieurs serrures)
                        </PricingCell>
                        <PricingCell item xs={4}>{product.prixCleAPasse} €</PricingCell>
                        <PricingCellNoBorder item xs={4}>
                          Reproduction par numéro clé de passe : votre clé est un passe, qui ouvre plusieurs serrures. Vous n'avez pas besoin d'envoyer leur clé en amont.
                        </PricingCellNoBorder>
                      </>
                    )}
                    {Number(product.prixSansCartePropriete) > 0 && (
                      <>
                        <PricingCell item xs={4}>Copie dans nos atelier</PricingCell>
                        <PricingCell item xs={4}>{product.prixSansCartePropriete} €</PricingCell>
                        <PricingCellNoBorder item xs={4}>
                          Reproduction dans notre atelier : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie (clé à passe ou clé normale).
                        </PricingCellNoBorder>
                      </>
                    )}
                  </PricingGrid>
                </InfoBox>
                <Box sx={{ mb: 2 }}>
                  {product.cleAvecCartePropriete !== null && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Carte de propriété : {product.cleAvecCartePropriete ? 'Oui' : 'Non'}
                    </Typography>
                  )}
                  {product.referenceEbauche && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Référence ébauche : {product.referenceEbauche}
                    </Typography>
                  )}
                  {product.typeReproduction && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Mode de reproduction : {product.typeReproduction}
                    </Typography>
                  )}
                  {product.descriptionNumero && product.descriptionNumero.trim() !== '' && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Détails du numéro : {product.descriptionNumero}
                    </Typography>
                  )}
                  {product.descriptionProduit && product.descriptionProduit.trim() !== '' && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Description du produit : {product.descriptionProduit}
                    </Typography>
                  )}
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
