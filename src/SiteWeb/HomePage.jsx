import React from 'react';
import { Helmet } from 'react-helmet';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Container,
  Grid,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerifiedIcon from '@mui/icons-material/Verified';
import FactoryIcon from '@mui/icons-material/Factory';
import Slider from './PagePrincipale/Slider';
import ErrorBoundary from './ErrorBoundary';

const primaryColor = '#2E7D32';
const primaryDark = '#1B5E20';
const lightBackground = '#F1F8E9';
const textPrimary = '#212121';
const textSecondary = '#424242';

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

// Reusable ServiceCard component
const ServiceCard = ({ IconComponent, title, description }) => (
  <Box sx={cardStyle}>
    <IconComponent sx={{ fontSize: { xs: 40, md: 50 }, color: primaryColor }} />
    <Typography component="h3" variant="h6" sx={{ mt: 2, fontWeight: '600', color: textPrimary }}>
      {title}
    </Typography>
    <Typography component="p" sx={{ mt: 1, color: textSecondary, fontSize: { xs: '0.9rem', md: '1rem' } }}>
      {description}
    </Typography>
  </Box>
);

// Reusable OrderStep component
const OrderStep = ({ step }) => (
  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <IconButton sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, color: primaryColor }} aria-label={`Étape`}>
      <ArrowDownwardIcon sx={{ transform: 'rotate(-90deg)' }} />
    </IconButton>
    <Typography component="p" variant="h6" sx={{ mt: 2, fontWeight: '500', color: textSecondary, textAlign: 'center', fontSize: { xs: '0.9rem', md: '1rem' } }}>
      {step}
    </Typography>
  </Grid>
);

const Login = () => {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>CléService - Double de clé en ligne, Facile et Rapide</title>
        <meta name="description" content="Doublez vos clés en quelques clics avec CléService. Commandez votre copie de clé en ligne, livrée à domicile." />
        <link rel="canonical" href="https://www.cleservice.com/" />
      </Helmet>

      <noscript>
        <div style={{ padding: '1rem', textAlign: 'center', background: '#f8d7da', color: '#721c24' }}>
          Cette application fonctionne mieux avec JavaScript activé.
        </div>
      </noscript>

      <Box component="main" sx={{ backgroundColor: '#F9F9F9', minHeight: '70vh', display: 'flex', flexDirection: 'column', fontFamily: '"Roboto", sans-serif' }}>
        <header>
          <Box sx={{ height: { xs: '56px', md: '0px' }, backgroundColor: "#01591f" }} />
          <Box sx={{ height: { xs: '100px', md: '120px' }, backgroundColor: "#01591f" }} />
          <Box component="section" sx={{ position: 'relative', backgroundColor: '#F9F9F9', color: textPrimary, py: { xs: 2, md: 4 }, borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}>
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
              <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: '700', mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                Un double de clé, une copie ? Facile et rapide !
              </Typography>
              <Typography component="h2" variant="h4" gutterBottom sx={{ fontWeight: '700', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
                Appelez le&nbsp;
                <Box component="a" href="tel:0142674861" sx={{ color: 'red', position: 'relative', display: 'inline-block', overflow: 'hidden', textDecoration: 'none' }}>
                  01 42 67 48 61
                </Box>
              </Typography>
            </Container>
          </Box>
        </header>

        <section>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 2, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <MyCustomButton as={Link} to="/trouvez.php">Commander un double de clé</MyCustomButton>
              <MyCustomButton as={Link} to="/contact.php">Demande de devis</MyCustomButton>
            </Box>
          </Container>
        </section>

        {/* Services Section */}
        <section>
          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, backgroundColor: lightBackground, borderRadius: '8px', mb: { xs: 4, md: 6 }, mx: 'auto' }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: '700', color: textPrimary, textAlign: 'center', mb: 4, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Nos Services En Ligne
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <ServiceCard IconComponent={KeyIcon} title="Faites-vous livrer votre clé" description="Grâce au numéro de votre clé, nous pouvons en réaliser une copie et vous l'envoyer directement." />
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <ServiceCard IconComponent={FactoryIcon} title="Clé au numéro" description="Nous reproduisons vos clés à partir de leur numéro unique." />
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <ServiceCard IconComponent={KeyIcon} title="Demande de devis" description="Pour plus de 10 clés à reproduire, un devis personnalisé est nécessaire." />
              </Grid>
            </Grid>
          </Container>
        </section>

        {/* Order Process Section */}
        <section>
          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, backgroundColor: lightBackground, borderRadius: '4px', mb: { xs: 4, md: 6 }, mx: 'auto' }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: '700', mb: 4, textAlign: 'center', color: textPrimary, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Processus de Commande Simplifié
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {[
                { step: '1. Sélectionnez votre clé' },
                { step: '2. Tapez votre numéro de clé' },
                { step: '3. Payez en ligne' },
                { step: '4. Livraison à domicile' }
              ].map((item, index) => (
                <OrderStep key={index} step={item.step} />
              ))}
            </Grid>
          </Container>
        </section>
      </Box>
    </ErrorBoundary>
  );
};

export default Login;

