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

// Liste des marques en dur
const hardcodedBrands = [
  { id: 1, manufacturer: 'CLES ASSA' },
  { id: 2, manufacturer: 'CLES BODE' },
  { id: 3, manufacturer: 'CLES CECCHERELLI' },
  { id: 4, manufacturer: 'CLES CIS' },
  { id: 5, manufacturer: 'CLES CONFORTI' },
  { id: 6, manufacturer: 'CLES CORBIN' },
  { id: 7, manufacturer: 'CLES DUTO' },
  { id: 8, manufacturer: 'CLES FASTA' },
  { id: 9, manufacturer: 'CLES FICHET-BAUCHE' },
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
  { id: 22, manufacturer: 'CLES SELLA-VALZ' },
  { id: 23, manufacturer: 'CLES SIBI' },
  { id: 24, manufacturer: 'CLES STIEHM' },
  { id: 25, manufacturer: 'CLES STUV' },
  { id: 26, manufacturer: 'CLES SWEDEN' },
];

// Hook personnalisé pour précharger une image (si nécessaire)
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
  const logoSrc = brand.logo ? `data:image/*;base64,${brand.logo}` : null;
  const imgLoaded = useImagePreloader(logoSrc);

  // Suppression du préfixe "CLES" pour obtenir le nom de la marque
  const nameWithoutPrefix = brand.manufacturer.replace(/^CLES\s*/i, '');
  const isCoffreFort = nameWithoutPrefix.toUpperCase().includes("COFFRE FORT");
  const fullName = nameWithoutPrefix.toLowerCase().replace(/\s+/g, '_');

  // Si c'est une marque coffre‑fort, l'URL comporte le suffixe _1_coffre_fort.html
  const brandUrl = isCoffreFort
    ? `/${fullName}_1_coffre_fort.html`
    : `/${fullName}_1_reproduction_cle.html`;

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
          {logoSrc && (
            <Box
              sx={{
                width: { xs: '2.5rem', sm: '3rem' },
                height: { xs: '2.5rem', sm: '3rem' },
                position: 'relative',
                mr: 2,
              }}
            >
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
                alt={brand.manufacturer}
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
            </Box>
          )}
          <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1.3rem' }, color: '#000' }}>
            {nameWithoutPrefix.toUpperCase()}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
});

const Coffrefort = () => {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Filtrage en fonction du terme de recherche
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) =>
      (brand.manufacturer || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  // Tri différencié :
  // - Marques "coffre fort" triées en A-Z
  // - Marques de reproduction de clé triées en Z-A
  const sortedFilteredBrands = useMemo(() => {
    const safeLockBrands = filteredBrands.filter((brand) => {
      const name = brand.manufacturer.replace(/^CLES\s*/i, '');
      return name.toUpperCase().includes("COFFRE FORT");
    });
    const keyBrands = filteredBrands.filter((brand) => {
      const name = brand.manufacturer.replace(/^CLES\s*/i, '');
      return !name.toUpperCase().includes("COFFRE FORT");
    });

    safeLockBrands.sort((a, b) => {
      const nameA = a.manufacturer.replace(/^CLES\s*/i, '');
      const nameB = b.manufacturer.replace(/^CLES\s*/i, '');
      return nameA.localeCompare(nameB);
    });

    keyBrands.sort((a, b) => {
      const nameA = a.manufacturer.replace(/^CLES\s*/i, '');
      const nameB = b.manufacturer.replace(/^CLES\s*/i, '');
      return nameB.localeCompare(nameA);
    });

    return [...safeLockBrands, ...keyBrands];
  }, [filteredBrands]);

  const toggleInfo = useCallback(() => {
    setShowInfo((prev) => !prev);
  }, []);

  useEffect(() => {
    setBrands(hardcodedBrands);
  }, []);

  const seoTitle = searchTerm
    ? `Résultats pour "${searchTerm}" – Marques de Clés | Maison Bouvet`
    : 'Catalogue des Marques de Clés – Reproduction de Clé en Ligne | Maison Bouvet';

  const seoDescription = searchTerm
    ? `Retrouvez les marques correspondant à "${searchTerm}" dans notre catalogue de clés.`
    : 'Découvrez notre catalogue exclusif regroupant les marques leaders dans le domaine des clés. Commandez votre double de clé en ligne rapidement et en toute sécurité avec Maison Bouvet.';

  const seoKeywords = sortedFilteredBrands.length > 0
    ? sortedFilteredBrands.map(b => b.manufacturer).join(', ')
    : hardcodedBrands.map(b => b.manufacturer).join(', ');

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
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href="https://www.maisonbouvet.com/catalogue" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content="https://www.maisonbouvet.com/catalogue" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

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
          <Typography variant="h4" sx={{ fontWeight: '700', mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Catalogue des Marques
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: '300', fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
            Découvrez notre sélection exclusive de clés de qualité et commandez votre double en ligne.
          </Typography>
        </Container>
      </Box>

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

      <Container sx={{ flexGrow: 1, mb: 8 }}>
        <Grid container spacing={3}>
          {sortedFilteredBrands.map((brand) => (
            <Grid item xs={12} sm={6} md={4} key={brand.id}>
              <BrandCard brand={brand} />
            </Grid>
          ))}
        </Grid>
      </Container>

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
          <Typography variant="h6" sx={{ fontWeight: '700', mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
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

export default Coffrefort;
