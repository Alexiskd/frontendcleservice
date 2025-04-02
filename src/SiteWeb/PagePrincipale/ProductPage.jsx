import { Helmet } from 'react-helmet';
import { Typography, createTheme, ThemeProvider, Container, Button, Card } from '@mui/material';
import { styled } from '@mui/material/styles';

// Définition du thème avec la police Serif élégante
const theme = createTheme({
  typography: {
    fontFamily: '\"Playfair Display\", serif',
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  color: '#fff',
  backgroundColor: '#1B5E20',
  '&:hover': { backgroundColor: '#134817' },
}));

const ProductPage = ({ product }) => {
  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <link
          href=\"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap\"
          rel=\"stylesheet\"
        />
      </Helmet>
      <Container sx={{ mt: 4 }}>
        <StyledCard>
          <Typography
            variant=\"h4\"
            sx={{
              color: '#1B5E20',
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
            }}
          >
            {product.nom}
          </Typography>
          <Typography
            variant=\"h5\"
            sx={{
              color: '#155724',
              fontWeight: 500,
              mb: 2,
              textAlign: 'center',
            }}
          >
            {product.marque}
          </Typography>

          <Typography
            variant=\"body1\"
            sx={{
              color: '#333',
              mb: 2,
              lineHeight: 1.8,
              textAlign: 'center',
            }}
          >
            {product.descriptionProduit || 'Description détaillée du produit ici...'}
          </Typography>

          <Typography
            variant=\"h5\"
            sx={{
              color: '#1B5E20',
              fontWeight: 600,
              mb: 2,
              textAlign: 'center',
            }}
          >
            {product.prix} €
          </Typography>

          <StyledButton>
            Commander maintenant
          </StyledButton>
        </StyledCard>
      </Container>
    </ThemeProvider>
  );
};

export default ProductPage;
