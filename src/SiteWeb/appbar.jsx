import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import logo from './icon2.png';
import PhoneNumber from "./PagePrincipale/PhoneNumber";

// Définition des couleurs et du style de texte en dégradé
const primaryColor = '#4E342E';
const gradientText = {
  background: 'linear-gradient(90deg, #15720a, #000)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Qui sommes-nous ?', to: '/qui.php' },
  { label: 'Catalogue', to: '/trouvez.php' },
  { label: 'Coffre Fort', to: '/catalogue-cles-coffre.php' },
  { label: 'Badges', to: '/badges.php' },
  { label: 'Contact', to: '/contact.php' },
];

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (openState) => setDrawerOpen(openState);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(100deg, #f4f4cc, #1B5E20)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          top: 0,
          left: 0,
          right: 0,
          minHeight: { xs: '120px', md: '150px' },
          padding: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 1, md: 4 },
            py: { xs: 1, md: 2 },
          }}
        >
          {/* Bandeau supérieur : Logo, titre et numéro de téléphone */}
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              mb: { xs: 1, md: 2 },
            }}
          >
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ height: { xs: '40px', md: '50px' }, mr: 1 }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  letterSpacing: '0.5px',
                  ...gradientText,
                }}
              >
                Cleservice.com
              </Typography>
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                mt: 0.5,
                color: '#fff',
                fontWeight: '700',
                fontSize: { xs: '1rem', md: '1.2rem' },
              }}
            >
              Appelez le&nbsp;
              <Box
                component="a"
                href="tel:0142674861"
                sx={{
                  color: '#ff5252',
                  position: 'relative',
                  display: 'inline-block',
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
                  },
                }}
              >
                01 42 67 48 61
              </Box>
            </Typography>
          </Box>

          {/* Intégration directe du composant PhoneNumber dans le header */}
          <PhoneNumber />

          {/* Liens de navigation (affichés en horizontal sur md et plus) */}
          <Box
            sx={{
              width: '100%',
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            {navItems.map((item, index) => (
              <Button
                key={index}
                component={Link}
                to={item.to}
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  padding: '8px 16px',
                  textTransform: 'none',
                  transition: 'transform 0.7s ease-in-out',
                  '&:hover': { transform: 'scale(1.05)' },
                  ...gradientText,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Bouton menu pour mobile */}
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => toggleDrawer(true)}
            sx={{
              display: { xs: 'block', md: 'none' },
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: '1.8rem', md: '2rem' } }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer pour mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: primaryColor,
            color: '#fff',
            width: 250,
          },
        }}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
          onClick={() => toggleDrawer(false)}
          onKeyDown={() => toggleDrawer(false)}
        >
          <List>
            {navItems.map((item, index) => (
              <ListItem
                button
                component={Link}
                to={item.to}
                key={index}
                sx={{
                  py: 1,
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#5D4037',
                    borderRadius: '8px',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <ListItemText
                  primary={<Typography variant="body1" sx={{ color: '#fff' }}>{item.label}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Animation CSS pour l'effet laser sur le numéro */}
      <style>
        {`
          @keyframes laser {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
        `}
      </style>
    </>
  );
};

export default Header;
