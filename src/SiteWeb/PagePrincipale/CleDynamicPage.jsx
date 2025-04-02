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

// Normalisation d'une chaîne (pour comparaison)
function normalizeString(str) {
  return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const CleDynamicPage = () => {
  const { brandFull } = useParams();
  const navigate = useNavigate();

  // Redirection spéciale pour une clé spécifique
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
  // Etats pour la modal d'image agrandie
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [scale, setScale] = useState(1);

  // Si le paramètre ressemble à un slug produit, redirige vers la page produit
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

  const suffix = '_1_reproduction_cle.html';
  const actualBrandName = brandFull && brandFull.endsWith(suffix)
    ? brandFull.slice(0, -suffix.length)
    : brandFull;
  const adjustedBrandName = actualBrandName ? actualBrandName.toUpperCase() : "";

  const pageTitle = `${adjustedBrandName} – Clés et reproductions de qualité`;
  const pageDescription = `Découvrez les clés et reproductions authentiques de ${adjustedBrandName}. Commandez directement chez le fabricant ou dans nos ateliers pour bénéficier d'un produit de qualité et d'un service personnalisé.`;

  // Fonction pour obtenir une URL d'image complète
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
        "brand": { "@type": "Brand", "name": item.marque },
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

  // Chargement du logo de la marque
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) return;
    if (!actualBrandName) return;
    fetch(`https://cl-back.onrender.com/brands/logo/${encodeURIComponent(actualBrandName)}`)
      .then((res) => {
        if (res.ok) return res.blob();
        throw new Error(`Logo non trouvé pour ${actualBrandName}`);
      })
      .then((blob) => setBrandLogo(URL.createObjectURL(blob)))
      .catch((error) => {
        console.error("Erreur logo:", error);
        setBrandLogo(null);
      });
  }, [actualBrandName, brandFull]);

  useEffect(() => window.scrollTo(0, 0), []);

  // Chargement des clés via preloadKeysData
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
    preloadKeysData(adjustedBrandName)
      .then(setKeys)
      .catch((err) => {
        setError(err.message);
        setSnackbarMessage(`Erreur: ${err.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      })
      .finally(() => setLoading(false));
  }, [adjustedBrandName, brandFull]);

  // Préchargement des images
  useEffect(() => {
    keys.forEach((item) => {
      const img = new Image();
      img.src = getImageSrc(item.imageUrl);
    });
  }, [keys, getImageSrc]);

  const handleSearchChange = useCallback((event) => setSearchTerm(event.target.value), []);

  const filteredKeys = useMemo(() => (
    keys.filter((item) => item.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase())).reverse()
  ), [keys, debouncedSearchTerm]);

  const sortedKeys = useMemo(() => [...filteredKeys].sort((a, b) => {
    const aIsManufacturer = Number(a.prix) > 0;
    const bIsManufacturer = Number(b.prix) > 0;
    return aIsManufacturer === bIsManufacturer ? 0 : aIsManufacturer ? 1 : -1;
  }), [filteredKeys]);

  // Fonction pour la commande
  const handleOrderNow = useCallback((item, mode) => {
    try {
      const reference = item.referenceEbauche || item.reference || item.id;
      if (!reference) throw new Error("Référence introuvable pour cet article");
      const formattedBrand = brandFull.toLowerCase().replace(/\s+/g, '-');
      const formattedName = item.nom.trim().replace(/\s+/g, '-');
      const url = `/commander/${formattedBrand}/cle/${reference}/${encodeURIComponent(formattedName)}?mode=${mode}`;
      navigate(url);
    } catch (error) {
      setSnackbarMessage(`Erreur: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [brandFull, navigate]);

  // Redirection vers la page produit
  const handleViewProduct = useCallback((item) => {
    if (normalizeString(item.nom) === normalizeString("Clé Izis Cavers Reparation de clé")) {
      navigate("/cle-izis-cassee.php");
    } else {
      const formattedName = item.nom.trim().replace(/\s+/g, '-');
      const formattedBrand = item.marque.trim().replace(/\s+/g, '-');
      navigate(`/produit/${formattedBrand}/${encodeURIComponent(formattedName)}`);
    }
  }, [navigate]);

  const handleCloseSnackbar = useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale((s) => Math.max(0.5, Math.min(s + (e.deltaY < 0 ? 0.1 : -0.1), 3)));
  }, []);

  // Ouvre le modal d'image agrandie
  const handleOpenImageModal = useCallback((item) => {
    if (item.imageUrl) {
      setModalImageSrc(getImageSrc(item.imageUrl));
      setModalOpen(true);
    }
  }, [getImageSrc]);

  // Ferme le modal
  const handleCloseImageModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '24px' }}>
        <Container sx={{ marginTop: { xs: '20px', sm: '40px' } }}>
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
            <Grid container spacing={2} alignItems="stretch" justifyContent="center" sx={{ padding: '16px 0' }}>
              {sortedKeys.map((item, index) => {
                const numeroPrice = Number(item.prix);
                const postalPrice = Number(item.prixSansCartePropriete);
                return (
                  <Grid key={item.id || index} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                    <Card sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px', width: '100%', flex: 1 }}>
                      <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                        {brandLogo && (
                          <Box sx={{ position: 'absolute', top: 8, left: 8, width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 2 }}>
                            <img
                              src={brandLogo}
                              alt={item.marque}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => console.error(`Erreur logo ${item.marque}:`, e)}
                            />
                          </Box>
                        )}
                        <CardMedia
                          component="img"
                          image={getImageSrc(item.imageUrl)}
                          alt={item.nom}
                          sx={{ height: 180, objectFit: 'contain', backgroundColor: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' } }}
                          onClick={() => handleOpenImageModal(item)}
                          onError={(e) => console.error("Erreur chargement image:", e)}
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
                      <CardContent sx={{ flexGrow: 1, padding: { xs: '8px', sm: '16px' }, fontFamily: 'Montserrat, sans-serif', textAlign: 'left' }}>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 0, color: '#333', cursor: 'pointer' }}
                          onClick={() => handleViewProduct(item)}>
                          {item.nom}
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#777', marginBottom: '8px' }}>{item.marque}</Typography>
                        <Box sx={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          {numeroPrice > 0 && (
                            <Box sx={{ backgroundColor: '#e8f5e9', padding: '6px 12px', borderRadius: '8px', textAlign: 'center', color: '#1B5E20' }}>
                              <Typography variant="caption">Copie chez le fabricant</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.prix} €</Typography>
                            </Box>
                          )}
                          {postalPrice > 0 && (
                            <Box sx={{ backgroundColor: '#e8f5e9', padding: '6px 12px', borderRadius: '8px', textAlign: 'center', color: '#1B5E20' }}>
                              <Typography variant="caption">Copie dans nos ateliers</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.prixSansCartePropriete} €</Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                      <Box sx={{ padding: { xs: '8px', sm: '16px' }, display: 'flex', flexDirection: 'column', gap: '8px', mt: 'auto' }}>
                        {numeroPrice > 0 && (
                          <Button
                            variant="outlined"
                            onClick={() => handleOrderNow(item, 'numero')}
                            startIcon={<ConfirmationNumberIcon />}
                            sx={{
                              borderRadius: '50px',
                              padding: '8px 16px',
                              fontFamily: 'Montserrat, sans-serif',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              boxShadow: 'none',
                              borderColor: '#1B5E20',
                              color: '#1B5E20',
                              '&:hover': { backgroundColor: '#1B5E20', color: '#fff' },
                            }}
                          >
                            Commander par numéro (chez le fabricant)
                          </Button>
                        )}
                        {postalPrice > 0 && (
                          <Button
                            variant="outlined"
                            onClick={() => handleOrderNow(item, 'postal')}
                            startIcon={<LocalShippingIcon />}
                            sx={{
                              borderRadius: '50px',
                              padding: '8px 16px',
                              fontFamily: 'Montserrat, sans-serif',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              boxShadow: 'none',
                              borderColor: '#1B5E20',
                              color: '#1B5E20',
                              '&:hover': { backgroundColor: '#1B5E20', color: '#fff' },
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
      </Box>
      {/* Modal pour l'image agrandie */}
      <Dialog open={modalOpen} onClose={handleCloseImageModal} maxWidth="lg">
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} onWheel={handleWheel}>
            <img src={modalImageSrc} alt="Image agrandie" style={{ width: '100%', maxWidth: '800px', height: 'auto', transform: `scale(${scale})`, transition: 'transform 0.2s' }} />
          </Box>
        </DialogContent>
      </Dialog>
    </HelmetProvider>
  );
};

export default CleDynamicPage;
