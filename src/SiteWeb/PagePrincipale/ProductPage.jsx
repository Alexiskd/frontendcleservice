import React, { useState, useEffect, useCallback } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
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
  Dialog,
  DialogContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// Import depuis brandsApi.js qui se trouve dans le dossier SiteWeb
import { preloadKeysData } from "../brandsApi.js";

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

// Fonction utilitaire pour déterminer le délai de livraison
const getDeliveryDelay = (typeReproduction) => {
  switch (typeReproduction) {
    case 'copie':
      return 'Livraison en 3 jours ouvrés pour cette clé';
    case 'ia':
      return 'Livraison en 5 jours ouvrés pour cette clé';
    case 'numero':
      return 'Livraison en 1/2 semaine pour cette clé';
    default:
      return 'Délai de livraison à confirmer';
  }
};

// Recherche simple dans la liste des clés préchargées
const findProductInKeys = (keys, productName) => {
  return keys.find((item) =>
    item.nom.trim().toLowerCase() === productName.trim().toLowerCase()
  );
};

const ProductPage = () => {
  const location = useLocation();
  let { brandName, productName } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  // Message d'erreur générique
  const [error, setError] = useState(null);

  // Cas particulier pour "/cle-izis-cassee.php"
  if (!productName && location.pathname === '/cle-izis-cassee.php') {
    productName = "Clé-Izis-Cavers-Reparation-de-clé";
  }
  if (!brandName && location.pathname === '/cle-izis-cassee.php') {
    brandName = "cle-izis-cavers";
  }
  if (!productName) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Nom de produit non spécifié.
        </Typography>
      </Container>
    );
  }

  // Nettoyage du nom du produit : suppression de suffixe éventuel et remplacement des tirets par des espaces
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
        // Préchargement des clés pour la marque donnée via brandsApi.js
        const keys = await preloadKeysData(brandName);
        let foundProduct = findProductInKeys(keys, decodedProductName);

        // Si aucune correspondance n'est trouvée dans le préchargement, fallback sur l'endpoint best-by-name
        if (!foundProduct) {
          const url = `https://cl-back.onrender.com/produit/cles/best-by-name?nom=${encodeURIComponent(decodedProductName)}`;
          const response = await fetch(url);
          if (!response.ok) {
            const serverMessage = await response.text();
            throw new Error(serverMessage || "Erreur lors du chargement de l'article.");
          }
          foundProduct = await response.json();
          if (!foundProduct || !foundProduct.id) {
            throw new Error("Erreur lors du chargement de l'article.");
          }
        }
        setProduct(foundProduct);
      } catch (err) {
        console.error("Erreur lors de la récupération du produit:", err);
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [decodedProductName, brandName]);

  const handleOrderNow = useCallback(
    (mode) => {
      if (product) {
        const formattedBrand = brandName.toLowerCase().replace(/\s+/g, '-');
        const formattedProductName = product.nom.trim().replace(/\s+/g, '-');
        navigate(
          `/commande/${formattedBrand}/cle/${product.referenceEbauche}/${encodeURIComponent(formattedProductName)}?mode=${mode}`
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
      ? "Reproduction dans notre atelier : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie."
      : "";

  const cleAPasseText =
    Number(product.prixCleAPasse) > 0 &&
    product.typeReproduction &&
    product.typeReproduction.toLowerCase().includes('atelier')
      ? "Reproduction dans notre atelier pour clé de passe : vous devez nous envoyer la clé en amont et nous vous la renverrons accompagnée de sa copie."
      : "Reproduction par numéro clé de passe : votre clé est un passe qui ouvre plusieurs serrures. Vous n'avez pas besoin d'envoyer la clé en amont.";

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{product.nom} – Clé Izis Cavers Réparation de clé</title>
          <meta
            name="description"
            content={`Découvrez ${product.nom} de ${brandName}. Réparation et reproduction de clé en ligne.`}
          />
          <link rel="canonical" href={`https://www.votresite.com/cle-izis-cassee.php`} />
        </Helmet>
      </HelmetProvider>
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
                <Typography variant="h4" sx={{ color: '#1B5E20', mb: 1, cursor: 'pointer' }} onClick={handleViewProduct}>
                  {product.nom}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  {product.marque && (
                    <Typography variant="h5" sx={{ color: '#1B5E20' }}>
                      {product.marque}
                    </Typography>
                  )}
                  {mainPrice && (
                    <Typography variant="h5" sx={{ color: '#1B5E20', whiteSpace: 'nowrap' }}>
                      {mainPrice} €
                    </Typography>
                  )}
                </Box>
                {isCoffreFort && (
                  <Typography variant="subtitle1" sx={{ color: '#D32F2F', mb: 1 }}>
                    Clé Coffre Fort
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <InfoBox>
                  <Typography variant="h6" sx={{ color: '#1B5E20', mb: 2 }}>
                    Processus de fabrication
                  </Typography>
                  <Typography variant="subtitle1">{processText}</Typography>
                </InfoBox>
                <InfoBox>
                  <Typography variant="h6" sx={{ color: '#1B5E20', mb: 2 }}>
                    Autre moyen de reproduction
                  </Typography>
                  <Typography variant="subtitle1">
                    Notre boutique, située au 20 rue de Lévis 75017 Paris, vous accueille pour la reproduction de votre clé.
                  </Typography>
                </InfoBox>
                {Number(product.prixCleAPasse) > 0 && (
                  <InfoBox>
                    <Typography variant="h6" sx={{ color: '#1B5E20', mb: 2 }}>
                      Clé de passe
                    </Typography>
                    <Grid container>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1">{cleAPasseText}</Typography>
                      </Grid>
                    </Grid>
                  </InfoBox>
                )}
                <Box display="flex" justifyContent="space-between">
                  <StyledButton onClick={() => handleOrderNow('reproduction')}>
                    Commander maintenant
                  </StyledButton>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </StyledCard>
      </Container>
    </>
  );
};

export default ProductPage;
