import React from 'react';
import { Helmet } from 'react-helmet';
import { styled } from '@mui/material/styles';
import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

const CustomButton = styled('button')(({ theme }) => ({
  backgroundColor: '#2E7D32',
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
  '&:hover': {
    backgroundColor: '#1B5E20',
    boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)'
  },
  '&:active': { transform: 'translateY(0)' },
}));

const GradientText = styled('span')({ color: '#fff' });

const MyCustomButton = React.forwardRef(function MyCustomButton(props, ref) {
  const { children, ...other } = props;
  return (
    <CustomButton ref={ref} {...other}>
      <GradientText>{children}</GradientText>
    </CustomButton>
  );
});

const Login = () => (
  <ErrorBoundary>
    <Box component="main" sx={{ backgroundColor: '#F9F9F9', minHeight: '70vh', fontFamily: '"Roboto", sans-serif' }}>

      <section>
        <Container maxWidth="lg" sx={{ py: 2, mx: 'auto', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <MyCustomButton as={Link} to="/trouvez.php">Commander un double de clé</MyCustomButton>
            <MyCustomButton as={Link} to="/contact.php">Demande de devis</MyCustomButton>
          </Box>
        </Container>
      </section>

      <section>
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: '#F1F8E9',
            borderRadius: '8px',
            mb: { xs: 4, md: 6 },
            mx: 'auto'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: '700', color: '#212121', textAlign: 'center', mb: 4 }}>
            Pour gagner du temps, notre boutique est à votre disposition<br />
            pour toute reproduction de clé au 20 rue de levviss.<br />
            Du lundi au samedi, de 8h30 à 12h30<br />
            et de 14h à 18h.
          </Typography>
          <Box sx={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDl71ub7b41CY0j1_SvNjj53kSIQAyGgLs&q=20+rue+de+levviss,+Paris,+75017&zoom=18"
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

    </Box>
  </ErrorBoundary>
);

export default Login;

