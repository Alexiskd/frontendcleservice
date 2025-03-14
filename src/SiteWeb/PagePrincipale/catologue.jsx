import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  Fab,
  Card,
  CardContent,
  Slide,
  IconButton,
  Skeleton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { preloadBrandsData } from '../brandsApi';


// Hook personnalisé pour précharger une image
function useImagePreloader(src) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);
  return loaded;
}

const BrandCard = React.memo(({ brand }) => {
  // Utiliser brand.nom pour récupérer le nom et préparer le logo
  const logoSrc = brand.logo ? `data:image/*;base64,${brand.logo}` : null;
  const imgLoaded = useImagePreloader(logoSrc);

  // Génération de l'URL de redirection au format demandé :
  // "/<nom-marque-en-minuscule>_1_reproduction_cle.html"
  const brandUrl = `/${(brand.nom || '')
    .toLowerCase()
    .replace(/\s+/g, '-')}_1_reproduction_cle.html`;

  return (
    <Link to={brandUrl} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          p: 1,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <Box
            sx={{
              width: { xs: '2.5rem', sm: '3rem' },
              height: { xs: '2.5rem', sm: '3rem' },
              position: 'relative',
            }}
          >
            {logoSrc ? (
              <>
                {!imgLoaded && (
                  <Skeleton
                    variant="circular"
                    width="100%"
                    height="100%"
                    sx={{ position: 'absolute', top: 0, left: 0 }}
                  />
                )}
                <Box
                  component="img"
                  src={logoSrc}
                  alt={brand.nom}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: imgLoaded ? 'block' : 'none',
                  }}
                />
              </>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: '#666',
                }}
              >
                Pas de logo
              </Box>
            )}
          </Box>
          {/* Affichage du nom de la marque en noir */}
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.9rem', md: '1.3rem' },
              ml: 2,
              color: '#000',
            }}
          >
            {brand.nom}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
});

const Catalogue = () => {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Filtrage des marques en utilisant brand.nom
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) =>
      (brand.nom || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  const toggleInfo = useCallback(() => {
    setShowInfo((prev) => !prev);
  }, []);

  // Chargement des marques via preloadBrandsData
  useEffect(() => {
    let isMounted = true;
    preloadBrandsData()
      .then((data) => {
        if (isMounted) {
          setBrands(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: '#fafafa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Helmet>
        <title>
          Catalogue des Marques de Clés – Reproduction de Clé en Ligne | Maison Bouvet
        </title>
        <meta
          name="description"
          content="Découvrez notre catalogue exclusif regroupant les marques leaders dans le domaine des clés. Commandez votre double de clé en ligne rapidement et en toute sécurité avec Maison Bouvet."
        />
        <meta
          name="keywords"
          content="catalogue, marques, clés, reproduction de clé, double de clé, Maison Bouvet, commande en ligne"
        />
        <link rel="canonical" href="https://cl-back.onrender.com/catalogue" />
      </Helmet>

      

      {/* Section Hero */}
      <Box
        sx={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          py: { xs: 4, md: 8 },
          mb: -4,
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#000' }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: '700', mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Catalogue des Marques
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: '300', fontSize: { xs: '0.9rem', md: '1.2rem' } }}
          >
            Découvrez notre sélection exclusive de clés de qualité et commandez votre double en ligne.
          </Typography>
        </Container>
      </Box>

      {/* Barre de recherche */}
      <Container sx={{ mb: 4 }}>
        <TextField
          label="Rechercher une marque"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ backgroundColor: '#fff', borderRadius: 1 }}
        />
      </Container>

      {/* Affichage des marques */}
      <Container sx={{ flexGrow: 1, mb: 8 }}>
        {error ? (
          <Typography variant="h6" align="center" color="error">
            {error}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredBrands
              .slice()
              .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))
              .map((brand) => (
                <Grid item xs={12} sm={6} md={4} key={brand.id}>
                  <BrandCard brand={brand} />
                </Grid>
              ))}
          </Grid>
        )}
      </Container>

      {/* Bouton d'info flottant */}
      <Fab
        onClick={toggleInfo}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          bgcolor: '#025920',
          color: '#fff',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          '&:hover': { bgcolor: '#013d17' },
        }}
      >
        <InfoIcon />
      </Fab>

      {/* Slide d'information */}
      <Slide direction="left" in={showInfo} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 80, md: 80 },
            right: { xs: 16, md: 24 },
            bgcolor: '#fff',
            borderRadius: 2,
            p: 3,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
            maxWidth: { xs: 280, md: 320 },
            zIndex: 1300,
            border: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton size="small" onClick={toggleInfo}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: '700', mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Informations Utiles
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
            Découvrez une sélection pointue regroupant près de 95% des marques leaders dans le domaine des clés.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
            Vous ne trouvez pas la marque que vous cherchez ? Contactez-nous pour enrichir notre catalogue.
          </Typography>
        </Box>
      </Slide>
    </Box>
  );
};

export default Catalogue;
