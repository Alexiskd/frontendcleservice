// CommonComponents.js
import React from 'react';
import { Box, Container, Typography, TextField, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import back from './backp.png';

// Bandeau en haut (similaire à une AppBar)
export const TopBanner = () => (
  <Box
    sx={{
      height: { xs: '100px', md: '120px' },
      backgroundColor: "#01591f",
    }}
  />
);

// Section héros avec image d'arrière-plan et textes centrés
export const HeroSection = ({ title, subtitle }) => (
  <Box
    sx={{
      backgroundImage: `url(${back})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      py: { xs: 8, md: 12 },
      mb: 4,
    }}
  >
    <Container sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff' }}>
      <Typography variant="h3" sx={{ fontWeight: '700', mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="h6" sx={{ fontWeight: '300' }}>
          {subtitle}
        </Typography>
      )}
    </Container>
  </Box>
);

// Barre de recherche
export const SearchBar = ({ searchTerm, onChange, label = "Rechercher une marque", containerProps = {} }) => (
  <Container sx={{ mb: 4, ...containerProps }}>
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      value={searchTerm}
      onChange={onChange}
      sx={{
        backgroundColor: '#fff',
        borderRadius: 1,
      }}
    />
  </Container>
);

// Grille des marques : on passe la liste des marques et le préfixe du lien (pour la route dynamique)
export const BrandGrid = ({ brands, linkPrefix }) => (
  <Container sx={{ flexGrow: 1, mb: 8 }}>
    <Grid container spacing={3}>
      {brands.map((brand, index) => {
        const brandUrl = brand.toLowerCase().replace(/\s+/g, '-');
        return (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Link
                  to={`${linkPrefix}/${brandUrl}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {brand}
                  </Typography>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Container>
);
