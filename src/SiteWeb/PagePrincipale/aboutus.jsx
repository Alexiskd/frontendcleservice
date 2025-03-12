import React from 'react';
import { Helmet } from 'react-helmet';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Container,
  Grid,
  IconButton,
  Avatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import { CheckCircleOutline } from '@mui/icons-material';

// Import des images d'avatars
import benjamin from './benjamin.jpg';
import alexis from './alexis.png';

// Variables de couleurs et typographie
const primaryColor = '#2E7D32';
const primaryDark = '#1B5E20';
const lightBackground = '#F1F8E9';
const textPrimary = '#212121';
const textSecondary = '#424242';

// Style commun pour les cartes (effet hover inclus)
const cardStyle = {
  backgroundColor: '#FFFFFF',
  p: { xs: 2, sm: 4 },
  borderRadius: '8px',
  boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0px 6px 16px rgba(0,0,0,0.15)',
  },
};

// Bouton personnalisé avec texte en blanc et adaptation sur mobile
const CustomButton = styled('button')(({ theme }) => ({
  backgroundColor: primaryColor,
  color: '#fff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
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
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

// Composant bouton personnalisable (utilisable avec le prop "as")
const MyCustomButton = React.forwardRef(function MyCustomButton(props, ref) {
  const { children, ...other } = props;
  return (
    <CustomButton ref={ref} {...other}>
      {children}
    </CustomButton>
  );
});

const AboutUs = () => {
  return (
    <>
      <Helmet>
        {/* Title et meta description */}
        <title>Qui sommes-nous ? | CLE SERVICE - Reproduction de clés depuis 50 ans</title>
        <meta
          name="description"
          content="CLE SERVICE, entreprise familiale issue de La Maison BOUVET, combine tradition et innovation pour offrir un service rapide et sécurisé de reproduction de clés en ligne. Découvrez notre histoire, notre mission et notre équipe."
        />
        {/* Données structurées JSON-LD */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CLE SERVICE",
            "url": "https://www.cléservice.com",
            "logo": "https://www.cléservice.com/logo.png",
            "description": "CLE SERVICE, entreprise familiale issue de La Maison BOUVET, offre un service rapide et sécurisé de reproduction de clés depuis plus de 50 ans.",
            "founder": [
              {
                "@type": "Person",
                "name": "Benjamin Bouvet"
              },
              {
                "@type": "Person",
                "name": "Alexis Bouvet"
              }
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer support",
              "url": "https://www.cléservice.com/contact.php"
            }
          }
          `}
        </script>
      </Helmet>

      <Box
        sx={{
          backgroundColor: '#F9F9F9',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"Roboto", sans-serif',
        }}
      >
        {/* Bandeau en haut de la Hero Section */}
        <Box
          sx={{
            height: { xs: '100px', md: '120px' },
            backgroundColor: "#01591f",
          }}
        />

        {/* SECTION HERO */}
        <Box
          sx={{
            backgroundColor: '#F9F9F9',
            color: textPrimary,
            py: { xs: 4, md: 6 },
            textAlign: 'center',
            px: { xs: 2, md: 4 },
          }}
        >
          <Container>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: { xs: 2, md: 3 },
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              Qui sommes-nous ?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 300,
                mb: { xs: 3, md: 4 },
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.5,
              }}
            >
              CLE SERVICE est une entreprise familiale issue de La Maison BOUVET, forte de plus de 50 ans d'expertise dans la reproduction de clés. Nous combinons tradition et innovation pour offrir un service rapide, sécurisé et convivial, afin de vous permettre de refaire vos clés en toute simplicité.
            </Typography>
          </Container>
        </Box>

        {/* SECTION NOTRE HISTOIRE */}
        <Container
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: lightBackground,
            borderRadius: '16px',
            mb: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, md: 3 },
              textAlign: 'center',
              color: textPrimary,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Notre Histoire
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: textSecondary,
              textAlign: 'center',
              mb: { xs: 3, md: 4 },
              lineHeight: 1.8,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            Depuis sa création, CLE SERVICE s’est imposé comme une référence dans la reproduction de clés.
            Grâce à une expertise cumulée sur plus de 50 ans, nous avons su allier tradition et innovation pour offrir un service fiable et sécurisé.
            Notre objectif est de simplifier la vie de nos clients en leur proposant des solutions en ligne rapides, sans compromis sur la qualité.
          </Typography>
        </Container>

        {/* SECTION NOTRE MISSION & VISION */}
        <Container
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            mb: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, md: 3 },
              textAlign: 'center',
              color: textPrimary,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Notre Mission & Vision
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: textPrimary,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                Notre Mission
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: textSecondary,
                  lineHeight: 1.8,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                }}
              >
                Chez CLE SERVICE, notre mission est de rendre la reproduction de clés accessible à tous, en offrant une plateforme en ligne intuitive et sécurisée.
                Nous nous engageons à fournir un service rapide, fiable et personnalisé, en tirant parti des dernières technologies pour garantir la sécurité et la qualité de chaque commande.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: textPrimary,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                Notre Vision
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: textSecondary,
                  lineHeight: 1.8,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                }}
              >
                Nous aspirons à offrir le service le plus optimal possible pour nos utilisateurs, afin qu'ils puissent refaire leurs clés en toute simplicité. Nous sommes une famille, et nous croyons en un accompagnement chaleureux et personnalisé.
              </Typography>
            </Grid>
          </Grid>
        </Container>

        {/* SECTION NOS AVANTAGES */}
        <Container
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            mb: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, md: 4 },
              textAlign: 'center',
              color: textPrimary,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Nos Avantages
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={cardStyle}>
                <IconButton sx={{ color: primaryColor, fontSize: { xs: 40, md: 50 } }}>
                  <CheckCircleOutline fontSize="inherit" />
                </IconButton>
                <Typography
                  variant="h3"
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                    textAlign: 'center',
                    color: textPrimary,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                  }}
                >
                  Commande en ligne
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    color: textSecondary,
                    textAlign: 'center',
                    fontSize: { xs: '0.8rem', md: '1rem' },
                  }}
                >
                  Une interface intuitive pour commander votre clé en quelques clics, sans déplacement.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={cardStyle}>
                <IconButton sx={{ color: primaryColor, fontSize: { xs: 40, md: 50 } }}>
                  <CheckCircleOutline fontSize="inherit" />
                </IconButton>
                <Typography
                  variant="h3"
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                    textAlign: 'center',
                    color: textPrimary,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                  }}
                >
                  Livraison rapide
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    color: textSecondary,
                    textAlign: 'center',
                    fontSize: { xs: '0.8rem', md: '1rem' },
                  }}
                >
                  Recevez vos reproductions directement à domicile, dans des délais optimisés.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={cardStyle}>
                <IconButton sx={{ color: primaryColor, fontSize: { xs: 40, md: 50 } }}>
                  <CheckCircleOutline fontSize="inherit" />
                </IconButton>
                <Typography
                  variant="h3"
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                    textAlign: 'center',
                    color: textPrimary,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                  }}
                >
                  Qualité et Précision
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    color: textSecondary,
                    textAlign: 'center',
                    fontSize: { xs: '0.8rem', md: '1rem' },
                  }}
                >
                  Chaque clé est reproduite avec minutie pour garantir une parfaite correspondance avec l’original.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* SECTION NOS CLIENTS */}
        <Container
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            mb: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, md: 3 },
              textAlign: 'center',
              color: textPrimary,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Nos Clients nous font confiance
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: textSecondary,
              textAlign: 'center',
              mb: { xs: 3, md: 4 },
              lineHeight: 1.8,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            Ambassade de Colombie, Ambassade de Russie, Salon de l’Automobile, Restaurant François Clerc, Burberrys, Givenchy, Monceau Fleurs, MACIF, Monoprix, Yves Rocher, Crédit Maritime, Ligue Nationale de Football, et bien d’autres institutions prestigieuses.
          </Typography>
        </Container>

        {/* SECTION NOTRE ÉQUIPE */}
        <Container
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: lightBackground,
            borderRadius: '16px',
            mb: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, md: 3 },
              textAlign: 'center',
              color: textPrimary,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Notre Équipe
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Avatar 
                alt="Benjamin Bouvet - Gérant de CLE SERVICE"
                
                sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, mx: 'auto', mb: 2 }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: textPrimary,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Benjamin Bouvet
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, fontSize: { xs: '0.8rem', md: '1rem' } }}>
                Gérant
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Avatar 
                alt="Alexis Bouvet - Développeur chez CLE SERVICE"
                
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  mx: 'auto',
                  mb: 2,
                  transform: 'scale(1.1)',
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: textPrimary,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Alexis Bouvet
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, fontSize: { xs: '0.8rem', md: '1rem' } }}>
                Développeur
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Avatar 
                alt="SAM YOS - WebMaster de CLE SERVICE"
                sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, mx: 'auto', mb: 2 }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: textPrimary,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                SAM YOS
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, fontSize: { xs: '0.8rem', md: '1rem' } }}>
                WebMaster
              </Typography>
            </Grid>
          </Grid>
        </Container>

        {/* SECTION APPEL À L'ACTION */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: { xs: 4, md: 6 } }}>
          <MyCustomButton as={Link} to="/contact.php">
            Nous Contacter
          </MyCustomButton>
        </Box>
      </Box>
    </>
  );
};

export default AboutUs;
