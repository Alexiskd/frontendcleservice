// src/Login.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Container,
  Grid,
  IconButton,
  Drawer,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import KeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerifiedIcon from '@mui/icons-material/Verified';
import FactoryIcon from '@mui/icons-material/Factory';
import Slider from './PagePrincipale/Slider';
import ErrorBoundary from './ErrorBoundary.jsx';

// Variables de couleurs et typographie
const primaryColor = '#2E7D32';
const primaryDark = '#1B5E20';
const lightBackground = '#F1F8E9';
const textPrimary = '#212121';
const textSecondary = '#424242';

// Tableau des items de navigation
const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Qui sommes-nous ?', to: '/qui.php' },
  { label: 'Catalogue', to: '/trouvez.php' },
  { label: 'Coffre Fort', to: '/catalogue-cles-coffre.php' },
  { label: 'Badges', to: '/badges.php' },
  { label: 'Contact', to: '/contact.php' },
];

// Style commun pour les cartes
const cardStyle = {
  backgroundColor: '#FFFFFF',
  padding: { xs: 2, sm: 4 },
  borderRadius: '4px',
  boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0px 6px 16px rgba(0,0,0,0.15)'
  }
};

// Bouton personnalisé avec adaptation aux écrans mobiles
const CustomButton = styled('button')(({ theme }) => ({
  backgroundColor: primaryColor,
  border: 'none',
  padding: '12px 24px',
  borderRadius: '4px',
  cursor: 'pointer',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  fontWeight: 600,
  textTransform: 'none',
  outline: 'none',
  fontFamily: '"Roboto", sans-serif',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: '10px 20px',
    fontSize: '0.9rem'
  },
  '&:hover': {
    backgroundColor: primaryDark,
    boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
}));

const GradientText = styled('span')({
  color: '#fff',
});

// Composant bouton personnalisable (utilisable avec le prop "as")
const MyCustomButton = React.forwardRef(function MyCustomButton(props, ref) {
  const { children, ...other } = props;
  return (
    <CustomButton ref={ref} {...other}>
      <GradientText>{children}</GradientText>
    </CustomButton>
  );
});

const Login = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ErrorBoundary>
      <Helmet>
        <title>CléService - Double de clé en ligne, Facile et Rapide</title>
        <meta
          name="description"
          content="Doublez vos clés en quelques clics avec CléService. Commandez votre copie de clé en ligne, livrée à domicile. Boutique à Paris 75017, forte de plus de 50 ans d'expérience."
        />
        <link rel="canonical" href="https://www.cleservice.com/" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="CléService - Double de clé en ligne, Facile et Rapide" />
        <meta property="og:description" content="Doublez vos clés en quelques clics avec CléService. Commandez votre copie de clé en ligne, livrée à domicile." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.cleservice.com/" />
        <meta property="og:image" content="https://www.cleservice.com/logo.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CléService - Double de clé en ligne, Facile et Rapide" />
        <meta name="twitter:description" content="Doublez vos clés en quelques clics avec CléService. Commandez votre copie de clé en ligne, livrée à domicile." />
        <meta name="twitter:image" content="https://www.cleservice.com/logo.png" />

        {/* Données structurées (JSON-LD) */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "CléService",
            "image": "https://www.cleservice.com/logo.png",
            "telephone": "01 42 67 48 61",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "20 rue de Levis",
              "addressLocality": "Paris",
              "postalCode": "75017",
              "addressCountry": "FR"
            },
            "url": "https://www.cleservice.com/",
            "priceRange": "$$"
          }
          `}
        </script>

        {/* Préconnexion aux ressources critiques */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Helmet>

      {/* Fallback pour les utilisateurs sans JavaScript */}
      <noscript>
        <div style={{ padding: '1rem', textAlign: 'center', background: '#f8d7da', color: '#721c24' }}>
          Cette application fonctionne mieux avec JavaScript activé.
        </div>
      </noscript>

      {/* Menu mobile pour téléphone - style bento moderne */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(90deg, #e0e0e0, #ffffff)',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            width: 280,
          },
        }}
      >
        <Box
          sx={{
            width: 280,
            p: 3,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={() => setMobileMenuOpen(false)}
        >
          {navItems.map((item, index) => (
            <Button
              key={index}
              component={Link}
              to={item.to}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: primaryColor,
                color: '#fff', // Texte en blanc uniquement dans le menu mobile
                borderRadius: 2,
                padding: 1.5,
                transition: 'background-color 0.3s, transform 0.3s',
                '&:hover': {
                  backgroundColor: primaryDark,
                  transform: 'scale(1.05)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          backgroundColor: '#F9F9F9',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"Roboto", sans-serif'
        }}
      >
        {/* Animation pour le numéro de téléphone */}
        <style>
          {`
            @keyframes laser {
              0% { left: -100%; }
              50% { left: 100%; }
              100% { left: 100%; }
            }
          `}
        </style>

        {/* HEADER - Bandeaux et Hero Section */}
        <header>
          <Box
            component="section"
            sx={{
              position: 'relative',
              backgroundColor: '#F9F9F9',
              color: textPrimary,
              py: { xs: 2, md: 4 },
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <Container
              maxWidth="lg"
              sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, md: 10 }, textAlign: 'center' }}
            >
              <Typography
                component="h1"
                variant="h3"
                gutterBottom
                sx={{ fontWeight: '700', mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}
              >
                Un double de clé, une copie ? Facile et rapide !
              </Typography>
              <Typography
                component="h2"
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: '700',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1.25rem', md: '1.75rem' }
                }}
              >
                Appelez le&nbsp;
                <Box
                  component="a"
                  href="tel:0142674861"
                  sx={{
                    color: 'red',
                    position: 'relative',
                    display: 'inline-block',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent)',
                      animation: 'laser 2s linear infinite',
                      borderRadius: '2px'
                    }
                  }}
                >
                  01 42 67 48 61
                </Box>
              </Typography>
              <Typography component="p" variant="h6" sx={{ mb: 0, fontWeight: '300' }}>
                {/* Sous-titre ou texte additionnel */}
              </Typography>
            </Container>

            {/* Icône du menu mobile (visible uniquement sur mobile) */}
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: { xs: 'block', md: 'none' }
              }}
            >
              <MenuIcon sx={{ fontSize: 28, color: primaryColor }} />
            </IconButton>
          </Box>
        </header>

        {/* SECTION - Boutons d'action et recherche */}
        <section>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 2, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <MyCustomButton as={Link} to="/trouvez.php">
                Commander un double de clé
              </MyCustomButton>
              <MyCustomButton as={Link} to="/contact.php">
                Demande de devis
              </MyCustomButton>
            </Box>
          </Container>
        </section>

        {/* SECTION - Localisation */}
        <section>
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 4, md: 6 },
              backgroundColor: lightBackground,
              borderRadius: '8px',
              mb: { xs: 4, md: 6 },
              mx: 'auto'
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              sx={{
                fontWeight: '700',
                color: textPrimary,
                textAlign: 'center',
                mb: 4,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Pour gagner du temps, notre boutique est à votre disposition<br />
              pour toute reproduction de clé au 20 rue de Levis.<br />
              Du lundi au samedi, de 8h30 à 12h30<br />
              et de 14h à 18h.
            </Typography>
            <Box sx={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyA7lo5IVVfLt8l5g5SiYbObTFVyEklhv5M&q=20+rue+de+Levis,+Paris,+France&zoom=18"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Localisation Boutique"
              ></iframe>
            </Box>
          </Container>
        </section>

        {/* SECTION - Nos Services En Ligne */}
        <section>
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 4, md: 6 },
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              mb: { xs: 4, md: 6 },
              mx: 'auto'
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              sx={{
                fontWeight: '700',
                mb: 6,
                textAlign: 'center',
                color: textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Nos Services En Ligne
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={cardStyle}>
                  <KeyIcon sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor }} role="img" aria-label="Livraison de clé" />
                  <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textPrimary }}>
                    Faites-vous livrer votre clé
                  </Typography>
                  <Typography component="p" sx={{ mt: 1, color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    Grâce au numéro de votre clé, nous pouvons en réaliser une copie et vous l'envoyer directement.
                    Livraison d'un double de clé conforme à l'original.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={cardStyle}>
                  <FactoryIcon sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor }} role="img" aria-label="Clé au numéro" />
                  <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textPrimary }}>
                    Clé au numéro
                  </Typography>
                  <Typography component="p" sx={{ mt: 1, color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    Nous reproduisons vos clés à partir de leur numéro unique. Pour les cas spécifiques, nous collaborons avec le fabricant afin d'assurer une reproduction fidèle.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={cardStyle}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <KeyIcon sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor, mx: 0.5 }} role="img" aria-label="Copie de clé" />
                    <KeyIcon sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor, mx: 0.5 }} role="img" aria-label="Copie de clé" />
                    <KeyIcon sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor, mx: 0.5 }} role="img" aria-label="Copie de clé" />
                  </Box>
                  <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textPrimary }}>
                    Demande de devis
                  </Typography>
                  <Typography component="p" sx={{ mt: 1, color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    Pour plus de 10 clés à reproduire, un devis personnalisé est nécessaire.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </section>

        {/* SECTION - Pourquoi Nous Choisir */}
        <section>
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 4, md: 6 },
              backgroundColor: lightBackground,
              borderRadius: '4px',
              mb: { xs: 4, md: 6 },
              mx: 'auto'
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              sx={{
                fontWeight: '700',
                mb: 4,
                textAlign: 'center',
                color: textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Pourquoi Choisir CleService.com ?
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={cardStyle}>
                  <BuildIcon sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor }} role="img" aria-label="Expertise reconnue" />
                  <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textPrimary }}>
                    Expertise reconnue
                  </Typography>
                  <Typography component="p" sx={{ mt: 1, color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    Forts de plus de 50 ans d'expérience, nous sommes spécialisés dans la reproduction de clés en ligne.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={cardStyle}>
                  <AccessTimeIcon sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor }} role="img" aria-label="Service rapide et sécurisé" />
                  <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textPrimary }}>
                    Service rapide et sécurisé
                  </Typography>
                  <Typography component="p" sx={{ mt: 1, color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    Commandez en ligne et recevez vos clés directement chez vous en toute sécurité.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </section>

        {/* SECTION - Nos Fournisseurs */}
        <section>
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 4, md: 6 },
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              mb: { xs: 4, md: 6 },
              mx: 'auto'
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              sx={{
                fontWeight: '700',
                mb: 3,
                textAlign: 'center',
                color: textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Nos Fournisseurs
            </Typography>
            <Typography
              component="p"
              variant="h6"
              sx={{
                textAlign: 'center',
                color: textSecondary,
                mb: 4,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Nous collaborons avec des marques de renom pour garantir la qualité de nos produits.
            </Typography>
            <Slider />
          </Container>
        </section>

        {/* SECTION - Processus de Commande */}
        <section>
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 4, md: 6 },
              backgroundColor: lightBackground,
              borderRadius: '4px',
              mb: { xs: 4, md: 6 },
              mx: 'auto'
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              sx={{
                fontWeight: '700',
                mb: 4,
                textAlign: 'center',
                color: textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Processus de Commande Simplifié
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {[
                { step: '1. Sélectionnez votre clé' },
                { step: '2. Tapez votre numéro de clé' },
                { step: '3. Payez en ligne' },
                { step: '4. Livraison à domicile' }
              ].map((item, index) => (
                <Grid
                  key={index}
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <IconButton
                    sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, color: primaryColor }}
                    aria-label={`Étape ${index + 1}`}
                  >
                    <ArrowDownwardIcon sx={{ transform: 'rotate(-90deg)' }} />
                  </IconButton>
                  <Typography
                    component="p"
                    variant="h6"
                    sx={{ mt: 2, fontWeight: '500', color: textSecondary, textAlign: 'center', fontSize: { xs: '0.9rem', md: '1rem' } }}
                  >
                    {item.step}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </section>

        {/* SECTION - Engagement Qualité & Sécurité */}
        <section>
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 4, md: 6 },
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              mb: { xs: 4, md: 6 },
              mx: 'auto'
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              sx={{
                fontWeight: '700',
                mb: 6,
                textAlign: 'center',
                color: textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Engagement envers la qualité et la sécurité
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconButton sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, color: primaryColor }} aria-label="Certifications et garanties">
                  <VerifiedIcon />
                </IconButton>
                <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textSecondary }}>
                  Certifications et garanties
                </Typography>
                <Typography component="p" sx={{ textAlign: 'center', color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                  Nous garantissons des reproductions de clés conformes aux normes de sécurité en vigueur.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconButton sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, color: primaryColor }} aria-label="Sécurité des transactions">
                  <LockIcon />
                </IconButton>
                <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textSecondary }}>
                  Sécurité des transactions
                </Typography>
                <Typography component="p" sx={{ textAlign: 'center', color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                  Vos données personnelles et paiements sont protégés par des technologies de cryptage avancées.
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </section>
      </Box>
    </ErrorBoundary>
  );
};

export default Login;

