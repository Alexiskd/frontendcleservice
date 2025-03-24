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
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { preloadKeysData, preloadBrandsData } from '../brandsApi';

// Marques hardcodées : pour ces marques, on effectuera directement une requête API
const hardcodedBrands = [
  { id: 1, manufacturer: 'CLES ASSA' },
  { id: 2, manufacturer: 'CLES BODE' },
  { id: 3, manufacturer: 'CLES CECCHERELLI' },
  { id: 4, manufacturer: 'CLES CIS' },
  { id: 5, manufacturer: 'CLES CONFORTI' },
  { id: 6, manufacturer: 'CLES CORBIN' },
  { id: 7, manufacturer: 'CLES DUTO' },
  { id: 8, manufacturer: 'CLES FASTA' },
  { id: 9, manufacturer: 'CLES FICHET BAUCHE' },
  { id: 10, manufacturer: 'CLES FUMEO-PARMA' },
  { id: 11, manufacturer: 'CLES GLITTENBERG' },
  { id: 12, manufacturer: 'CLES HAGELIN' },
  { id: 13, manufacturer: 'CLES KROMER' },
  { id: 14, manufacturer: 'CLES LIPS-VAGO' },
  { id: 15, manufacturer: 'CLES MAUER' },
  { id: 16, manufacturer: 'CLES MELSMETALL' },
  { id: 17, manufacturer: 'CLES PARMA' },
  { id: 18, manufacturer: 'CLES PARMA-PAS' },
  { id: 19, manufacturer: 'CLES PICARDIE' },
  { id: 20, manufacturer: 'CLES ROSENGREN' },
  { id: 21, manufacturer: 'CLES SECURCASA' },
  { id: 22, manufacturer: 'CLES SELLA & VALZ' },
  { id: 23, manufacturer: 'CLES SIBI' },
  { id: 24, manufacturer: 'CLES STIEHM' },
  { id: 25, manufacturer: 'CLES STUV' },
  { id: 26, manufacturer: 'CLES SWEDEN' },
];

// Tentative de récupérer jQuery depuis la variable globale
let localJQuery;
try {
  localJQuery = window.$;
  if (!localJQuery) {
    throw new Error("jQuery n'est pas chargé globalement.");
  }
} catch (err) {
  console.error("Erreur d'initialisation de jQuery :", err);
  localJQuery = null;
}

// Hook de debounce pour la saisie utilisateur
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const CleDynamicPage = () => {
  const { brandFull } = useParams();
  const navigate = useNavigate();
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

  // Redirection si le paramètre ressemble à un slug produit (commence par un chiffre suivi d'un tiret)
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) {
      const parts = brandFull.split("-");
      if (parts.length >= 3) {
        const brand = parts[0];
        const productName = parts.slice(2).join("-");
        navigate(`/produit/${brand}/${encodeURIComponent(productName)}`);
      } else {
        navigate(`/produit/${encodeURIComponent(brandFull)}`);
      }
      return;
    }
  }, [brandFull, navigate]);

  // Extraction et normalisation du nom de la marque (si ce n'est pas un slug produit)
  const suffix = '_1_reproduction_cle.html';
  const actualBrandName = brandFull.endsWith(suffix)
    ? brandFull.slice(0, -suffix.length)
    : brandFull;
  const adjustedBrandName = actualBrandName.toUpperCase();

  // Définition des balises SEO
  const pageTitle = `${adjustedBrandName} – Clés et reproductions de qualité`;
  const pageDescription = `Découvrez les clés et reproductions authentiques de ${adjustedBrandName}. Commandez directement chez le fabricant ou dans nos ateliers pour bénéficier d'un produit de qualité et d'un service personnalisé.`;

  // Fonction pour obtenir l'URL d'une image
  const getImageSrc = useCallback((imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') return '';
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (!imageUrl.startsWith('http')) return `https://cl-back.onrender.com/${imageUrl}`;
    return imageUrl;
  }, []);

  // Génération des données structurées Schema.org (ItemList)
  const jsonLdData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${adjustedBrandName} – Catalogue de clés`,
    "description": `Catalogue des clés et reproductions pour ${adjustedBrandName}. Commandez en ligne la reproduction de votre clé.`,
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
  }), [adjustedBrandName, keys, getImageSrc]);

  // Récupération du logo pour la marque
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

  // Chargement initial des clés
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) {
      setLoading(false);
      return;
    }
    if (!adjustedBrandName) {
      setError("La marque n'a pas été fournie.");
      setLoading(false);
      return;
    }
    setLoading(true);
    // Vérification si la marque figure dans la liste hardcodée
    const isHardcoded = hardcodedBrands.some(b => b.manufacturer === adjustedBrandName);
    if (isHardcoded) {
      // Pour les marques hardcodées, on effectue directement une requête API
      fetch(`https://cl-back.onrender.com/produit/cles?marque=${encodeURIComponent(adjustedBrandName)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erreur lors de la récupération des clés pour ${adjustedBrandName}`);
          }
          return res.json();
        })
        .then((data) => {
          setKeys(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement des clés:', err);
          setError(err.message);
          setSnackbarMessage(`Erreur: ${err.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    } else {
      // Pour les autres marques, on utilise les clés préchargées avec la meilleure correspondance
      const levenshteinDistance = (a, b) => {
        const m = a.length, n = b.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            );
          }
        }
        return dp[m][n];
      };

      preloadBrandsData()
        .then((brands) => {
          if (!brands || brands.length === 0) {
            throw new Error("Aucune marque préchargée.");
          }
          let bestBrand = brands[0];
          let bestDistance = levenshteinDistance(bestBrand.nom, adjustedBrandName);
          brands.forEach((brand) => {
            const distance = levenshteinDistance(brand.nom, adjustedBrandName);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestBrand = brand;
            }
          });
          return preloadKeysData(bestBrand.nom);
        })
        .then((data) => {
          setKeys(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement des clés:', err);
          setError(err.message);
          setSnackbarMessage(`Erreur: ${err.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [adjustedBrandName, brandFull]);

  // Préchargement des images des clés
  useEffect(() => {
    keys.forEach((item) => {
      const img = new Image();
      img.src = getImageSrc(item.imageUrl);
    });
  }, [keys, getImageSrc]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Tri personnalisé : les clés disposant d'un prix de reproduction en atelier (prixSansCartePropriete > 0)
  // sont affichées en premier, puis les autres, triées par id décroissant.
  const sortedKeys = useMemo(() => {
    const filtered = keys.filter((item) =>
      item.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      const aHasPostal = Number(a.prixSansCartePropriete) > 0;
      const bHasPostal = Number(b.prixSansCartePropriete) > 0;
      if (aHasPostal && !bHasPostal) return -1;
      if (!aHasPostal && bHasPostal) return 1;
      return b.id - a.id;
    });
    return filtered;
  }, [keys, debouncedSearchTerm]);

  // Redirection vers la page de commande
  const handleOrderNow = useCallback((item, mode) => {
    try {
      const formattedName = item.nom.trim().replace(/\s+/g, '-');
      navigate(`/commander/${adjustedBrandName.replace(/\s+/g, '-')}/cle/${item.referenceEbauche}/${encodeURIComponent(formattedName)}?mode=${mode}`);
    } catch (error) {
      console.error('Erreur lors de la navigation vers la commande:', error);
      setSnackbarMessage(`Erreur lors de la commande: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [adjustedBrandName, navigate]);

  // Redirection vers la page produit
  const handleViewProduct = useCallback((item) => {
    const formattedName = item.nom.trim().replace(/\s+/g, '-');
    const formattedBrand = item.marque.trim().replace(/\s+/g, '-');
    navigate(`/produit/${formattedBrand}/${encodeURIComponent(formattedName)}`);
  }, [navigate]);

  // Ouvre le popup d'agrandissement de l'image et réinitialise le zoom
  const openImageModal = useCallback((item) => {
    setModalImageSrc(getImageSrc(item.imageUrl));
    setScale(1);
    setModalOpen(true);
  }, [getImageSrc]);

  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }, []);

  // Gestion du zoom avec la roulette de la souris
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    setScale((prevScale) => {
      let newScale = prevScale + (event.deltaY < 0 ? 0.1 : -0.1);
      newScale = Math.max(0.5, Math.min(newScale, 3));
      return newScale;
    });
  }, []);

  const styles = useMemo(() => ({
    page: {
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      paddingBottom: '24px',
    },
    searchContainer: {
      marginTop: { xs: '20px', sm: '40px' },
      marginBottom: '24px',
    },
    gridContainer: {
      padding: '16px 0',
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
      flex: 1,
    },
    cardMedia: {
      height: 180,
      objectFit: 'contain',
      backgroundColor: '#fff',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
    },
    cardContent: {
      flexGrow: 1,
      padding: { xs: '8px', sm: '16px' },
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'left',
    },
    productName: {
      fontSize: '1.2rem',
      fontWeight: 700,
      marginBottom: 0,
      color: '#333',
      cursor: 'pointer',
    },
    brandName: {
      fontSize: '0.9rem',
      color: '#777',
      marginBottom: '8px',
    },
    pricesContainer: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },
    priceBadge: {
      backgroundColor: '#e8f5e9',
      padding: '6px 12px',
      borderRadius: '8px',
      textAlign: 'center',
      color: '#1B5E20',
    },
    buttonSecondary: {
      borderRadius: '50px',
      padding: '8px 16px',
      fontFamily: 'Montserrat, sans-serif',
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.75rem',
      boxShadow: 'none',
      marginTop: '8px',
    },
    buttonContainer: {
      padding: { xs: '8px', sm: '16px' },
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      mt: 'auto',
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
      zIndex: 2,
    },
  }), []);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`${adjustedBrandName}, clés, reproduction, commande, qualité, produit authentique`}
        />
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
            label="Tapez le nom de votre clé"
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
              {sortedKeys.map((item, index) => {
                const numeroPrice = Number(item.prix);
                const postalPrice = Number(item.prixSansCartePropriete);
                return (
                  <Grid key={item.id || index} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                    <Card sx={styles.card}>
                      <Box onClick={() => openImageModal(item)} sx={{ cursor: 'pointer', position: 'relative' }}>
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
                        <CardMedia
                          component="img"
                          image={getImageSrc(item.imageUrl)}
                          alt={item.nom}
                          sx={styles.cardMedia}
                          onError={(e) => console.error("Erreur lors du chargement de l'image du produit:", e)}
                        />
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
                      </Box>
                      <CardContent sx={styles.cardContent}>
                        <Typography sx={styles.productName} onClick={() => handleViewProduct(item)}>
                          {item.nom}
                        </Typography>
                        <Typography sx={styles.brandName}>{item.marque}</Typography>
                        <Box sx={styles.pricesContainer}>
                          {numeroPrice > 0 && (
                            <Box sx={styles.priceBadge}>
                              <Typography variant="caption">Copie chez le fabricant</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {item.prix} €
                              </Typography>
                            </Box>
                          )}
                          {postalPrice > 0 && (
                            <Box sx={styles.priceBadge}>
                              <Typography variant="caption">Copie dans nos ateliers</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {item.prixSansCartePropriete} €
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                      <Box sx={styles.buttonContainer}>
                        {numeroPrice > 0 && (
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
                                color: '#fff',
                              },
                            }}
                          >
                            Commander par numéro <br />(chez le fabricant)
                          </Button>
                        )}
                        {postalPrice > 0 && (
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
                                color: '#fff',
                              },
                            }}
                          >
                            Commander par envoie/renvoie dans nos ateliers
                          </Button>
                        )}
                        <Button variant="text" onClick={() => handleViewProduct(item)} sx={{ mt: 1, textTransform: 'none' }}>
                          Voir le produit
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
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
            <Box
              onWheel={handleWheel}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                maxHeight: '80vh',
              }}
            >
              <img
                src={modalImageSrc}
                alt="Agrandissement de la clé"
                style={{
                  transform: `scale(${scale})`,
                  transition: 'transform 0.2s',
                  width: '100%',
                  height: 'auto',
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

