import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
  Grid,
  Dialog,
  DialogContent
} from '@mui/material';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { preloadKeysData } from '../brandsApi';

// Hook de debounce pour la saisie utilisateur
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Normalisation d'une chaîne
function normalizeString(str) {
  return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Formatage pour l'affichage : première lettre en majuscule
function formatBrandName(name) {
  if (!name) return "";
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const CleDynamicPage = () => {
  const { brandFull } = useParams();
  const navigate = useNavigate();

  // Redirection si le paramètre correspond exactement à "Clé Izis Cavers Reparation de clé"
  if (brandFull && normalizeString(brandFull) === normalizeString("Clé Izis Cavers Reparation de clé")) {
    return <Navigate to="/cle-izis-cassee.php" replace />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [brandLogo, setBrandLogo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [scale, setScale] = useState(1);

  // Si le paramètre ressemble à un slug produit (commence par un chiffre suivi d'un tiret)
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) {
      const parts = brandFull.split("-");
      if (parts.length >= 3) {
        const brand = parts[0];
        const productName = parts.slice(2).join("-");
        console.log("Navigation produit (slug):", brand, productName);
        navigate(`/produit/${brand}/${encodeURIComponent(productName)}`);
      } else {
        navigate(`/produit/${encodeURIComponent(brandFull)}`);
      }
    }
  }, [brandFull, navigate]);

  // Extraction du nom de la marque en retirant le suffixe si présent
  const suffix = '_1_reproduction_cle.html';
  const actualBrandName = brandFull && brandFull.endsWith(suffix)
    ? brandFull.slice(0, -suffix.length)
    : brandFull;

  // Pour l'affichage, on souhaite la forme "Abus", et pour l'API on utilise "ABUS"
  const adjustedBrandNameDisplay = actualBrandName ? formatBrandName(actualBrandName) : "";
  const adjustedBrandNameAPI = actualBrandName ? actualBrandName.toUpperCase() : "";
  console.log("Marque (affichage) :", adjustedBrandNameDisplay);
  console.log("Marque (API) :", adjustedBrandNameAPI);

  // Balises SEO
  const pageTitle = `${adjustedBrandNameDisplay} – Clés et reproductions de qualité`;
  const pageDescription = `Découvrez les clés et reproductions authentiques de ${adjustedBrandNameDisplay}. Commandez directement chez le fabricant ou dans nos ateliers pour bénéficier d'un produit de qualité et d'un service personnalisé.`;

  // Fonction pour obtenir l'URL d'une image
  const getImageSrc = useCallback((imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') return '';
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (!imageUrl.startsWith('http')) return `https://cl-back.onrender.com/${imageUrl}`;
    return imageUrl;
  }, []);

  // Données structurées Schema.org
  const jsonLdData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${adjustedBrandNameDisplay} – Catalogue de clés`,
    "description": `Catalogue des clés et reproductions pour ${adjustedBrandNameDisplay}. Commandez en ligne la reproduction de votre clé.`,
    "itemListElement": keys.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.nom,
        "description": item.descriptionNumero || "Clé de reproduction",
        "image": getImageSrc(item.imageUrl),
        "brand": {
          "@type": "Brand",
          "name": item.marque
        },
        "offers": {
          "@type": "Offer",
          "price": item.prix,
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": window.location.href
        }
      }
    }))
  }), [adjustedBrandNameDisplay, keys, getImageSrc]);

  // Chargement du logo pour la marque
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) return;
    if (!actualBrandName) return;
    fetch(`https://cl-back.onrender.com/brands/logo/${encodeURIComponent(actualBrandName)}`)
      .then((res) => {
        if (res.ok) return res.blob();
        throw new Error(`Logo non trouvé pour ${actualBrandName}`);
      })
      .then((blob) => {
        const logoUrl = URL.createObjectURL(blob);
        setBrandLogo(logoUrl);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du logo:", error);
        setBrandLogo(null);
      });
  }, [actualBrandName, brandFull]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Récupération des clés depuis le backend en utilisant le nom en MAJUSCULES pour l'API
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) {
      setLoading(false);
      return;
    }
    if (!adjustedBrandNameAPI) {
      setError("La marque n'a pas été fournie.");
      setLoading(false);
      return;
    }
    setLoading(true);
    preloadKeysData(adjustedBrandNameAPI)
      .then((data) => {
        console.log("Clés chargées :", data);
        setKeys(data);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des clés:", err);
        setError(err.message);
        setSnackbarMessage(`Erreur: ${err.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      })
      .finally(() => setLoading(false));
  }, [adjustedBrandNameAPI, brandFull]);

  // Préchargement des images
  useEffect(() => {
    keys.forEach((item) => {
      const img = new Image();
      img.src = getImageSrc(item.imageUrl);
    });
  }, [keys, getImageSrc]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Filtrage des clés par terme de recherche (sans inverser l'ordre)
  const filteredKeys = useMemo(() => {
    if (!debouncedSearchTerm) return keys;
    return keys.filter((item) =>
      item.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [keys, debouncedSearchTerm]);

  // Conserver l'ordre du backend
  const sortedKeys = useMemo(() => {
    return [...filteredKeys];
  }, [filteredKeys]);

  const handleOrderNow = useCallback((item, mode) => {
    try {
      const reference = item.referenceEbauche || item.reference || item.id;
      if (!reference) {
        throw new Error("Référence introuvable pour cet article");
      }
      const formattedBrand = brandFull.toLowerCase().replace(/\s+/g, '-');
      const formattedName = item.nom.trim().replace(/\s+/g, '-');
      const url = `/commander/${formattedBrand}/cle/${reference}/${encodeURIComponent(formattedName)}?mode=${mode}`;
      console.log("Navigation vers", url);
      navigate(url);
    } catch (error) {
      console.error("Erreur lors de la navigation vers la commande:", error);
      setSnackbarMessage(`Erreur lors de la commande: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [brandFull, navigate]);

  const handleViewProduct = useCallback((item) => {
    if (item.nom.trim().toLowerCase() === normalizeString("Clé Izis Cavers Reparation de clé")) {
      navigate("/cle-izis-cassee.php");
    } else {
      const formattedName = item.nom.trim().replace(/\s+/g, '-');
      const formattedBrand = item.marque.trim().replace(/\s+/g, '-');
      navigate(`/produit/${formattedBrand}/${encodeURIComponent(formattedName)}`);
    }
  }, [navigate]);

  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }, []);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    setScale((prevScale) => {
      let newScale = prevScale + (event.deltaY < 0 ? 0.1 : -0.1);
      return Math.max(0.5, Math.min(newScale, 3));
    });
  }, []);

  const styles = useMemo(() => ({
    page: {
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      paddingBottom: '24px'
    },
    searchContainer: {
      marginTop: { xs: '20px', sm: '40px' }
    },
    gridContainer: {
      padding: '16px 0'
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px',
      width: '100%',
      flex: 1
    },
    cardMedia: {
      height: 180,
      objectFit: 'contain',
      backgroundColor: '#fff',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px'
    },
    cardContent: {
      flexGrow: 1,
      padding: { xs: '8px', sm: '16px' },
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'left'
    },
    productName: {
      fontSize: '1.2rem',
      fontWeight: 700,
      marginBottom: 0,
      color: '#333',
      cursor: 'pointer'
    },
    brandName: {
      fontSize: '0.9rem',
      color: '#777',
      marginBottom: '8px'
    },
    pricesContainer: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px'
    },
    priceBadge: {
      backgroundColor: '#e8f5e9',
      padding: '6px 12px',
      borderRadius: '8px',
      textAlign: 'center',
      color: '#1B5E20'
    },
    buttonSecondary: {
      borderRadius: '50px',
      padding: '8px 16px',
      fontFamily: 'Montserrat, sans-serif',
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.75rem',
      boxShadow: 'none',
      marginTop: '8px'
    },
    buttonContainer: {
      padding: { xs: '8px', sm: '16px' },
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      mt: 'auto'
    },
    brandLogoContainer: {
      position: 'absolute',
      top: 8,
      left: 8,
      width: 32,
      height: 32,
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      zIndex: 2
    }
  }), []);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${adjustedBrandName}, clés, reproduction, commande, qualité, produit authentique`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://votre-site.com" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLdData)}
        </script>
      </Helmet>
      <Box sx={styles.page}>
        <Container sx={styles.searchContainer}>
          <TextField
            label="Tapez le numéro de votre clé"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Container>
        <Container maxWidth="xl">
          {loading ? (
            <Typography align="center" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Chargement...
            </Typography>
          ) : error ? (
            <Typography align="center" color="error" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {error}
            </Typography>
          ) : sortedKeys.length > 0 ? (
            <Grid container spacing={2} alignItems="stretch" justifyContent="center" sx={styles.gridContainer}>
              {sortedKeys.map((item, index) => (
                <Grid key={item.id || index} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                  <Card sx={styles.card}>
                    <Box onClick={() => handleViewProduct(item)} sx={{ cursor: 'pointer', position: 'relative' }}>
                      {brandLogo && (
                        <Box sx={styles.brandLogoContainer}>
                          <img
                            src={brandLogo}
                            alt={item.marque}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => console.error(`Erreur de chargement du logo pour ${item.marque}:`, e)}
                          />
                        </Box>
                      )}
                      {/* Utilisation conditionnelle du Skeleton */}
                      {loading ? (
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: 180,
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        />
                      ) : (
                        <CardMedia
                          component="img"
                          image={getImageSrc(item.imageUrl)}
                          alt={item.nom}
                          sx={styles.cardMedia}
                          onError={(e) => console.error("Erreur lors du chargement de l'image du produit:", e)}
                        />
                      )}
                    </Box>
                    <CardContent sx={styles.cardContent}>
                      <Typography sx={styles.productName} onClick={() => handleViewProduct(item)}>
                        {item.nom}
                      </Typography>
                      <Typography sx={styles.brandName}>{item.marque}</Typography>
                      <Box sx={styles.pricesContainer}>
                        {Number(item.prix) > 0 && (
                          <Box sx={styles.priceBadge}>
                            <Typography variant="caption">Copie fabricant</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {item.prix} €
                            </Typography>
                          </Box>
                        )}
                        {Number(item.prixSansCartePropriete) > 0 && (
                          <Box sx={styles.priceBadge}>
                            <Typography variant="caption">Copie atelier</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {item.prixSansCartePropriete} €
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                    <Box sx={styles.buttonContainer}>
                      {Number(item.prix) > 0 && (
                        <Button
                          variant="outlined"
                          onClick={() => handleOrderNow(item, 'numero')}
                          startIcon={<ConfirmationNumberIcon />}
                          sx={{
                            ...styles.buttonSecondary,
                            borderColor: '#1B5E20',
                            color: '#1B5E20',
                            '&:hover': {
                              backgroundColor: '#1B5E20',
                              color: '#fff'
                            }
                          }}
                        >
                          Commander par numéro
                        </Button>
                      )}
                      {Number(item.prixSansCartePropriete) > 0 && (
                        <Button
                          variant="outlined"
                          onClick={() => handleOrderNow(item, 'postal')}
                          startIcon={<LocalShippingIcon />}
                          sx={{
                            ...styles.buttonSecondary,
                            borderColor: '#1B5E20',
                            color: '#1B5E20',
                            '&:hover': {
                              backgroundColor: '#1B5E20',
                              color: '#fff'
                            }
                          }}
                        >
                          Commander en atelier
                        </Button>
                      )}
                      <Button variant="text" onClick={() => handleViewProduct(item)} sx={{ mt: 1, textTransform: 'none' }}>
                        Voir le produit
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography align="center" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Aucune clé trouvée.
            </Typography>
          )}
        </Container>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: 'Montserrat, sans-serif' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg">
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} onWheel={handleWheel}>
              <img
                src={modalImageSrc}
                alt="Agrandissement de la clé"
                style={{
                  transform: `scale(${scale})`,
                  transition: 'transform 0.2s',
                  width: '100%',
                  height: 'auto'
                }}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </HelmetProvider>
  );
};

export default CleDynamicPage;

