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

// Style pour le texte en dégradé
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
      {/* Header moderne */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #f4f4cc, #1B5E20)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          px: { xs: 1, md: 4 },
          py: { xs: 1, md: 2 },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo et titre à gauche */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: { xs: '40px', md: '50px' } }}
            />
            <Typography
              variant="h6"
              sx={{
                ml: 1,
                fontWeight: 600,
                fontSize: { xs: '1.2rem', md: '1.8rem' },
                ...gradientText,
              }}
            >
              Cleservice.com
            </Typography>
          </Box>

          {/* Boutons de navigation à droite */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
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
                  textTransform: 'none',
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
            sx={{ display: { xs: 'block', md: 'none' } }}
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
            backgroundColor: '#4E342E',
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
                  primary={
                    <Typography variant="body1" sx={{ ...gradientText }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Bandeau juste en dessous du header */}
      <Box
        sx={{
          mt: { xs: '64px', md: '80px' },
          background: 'linear-gradient(90deg, #1B5E20, #f4f4cc)',
          py: { xs: 3, md: 4 },
          textAlign: 'center',
        }}
      >
        <Typography
          component="h2"
          gutterBottom
          sx={{
            fontFamily: 'Lato, sans-serif',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Réduction de la taille du texte dans le bandeau
            fontSize: { xs: '1rem', md: '1.2rem' },
            color: "#e0e0e0",
            py: 0,
          }}
        >
          Si vous avez des questions ou besoin d'assistance pour passer commande, appelez le&nbsp;
          <Box
            component="a"
            href="tel:0142674861"
            sx={{
              color: 'red',
              fontFamily: 'Lato, sans-serif',
              position: 'relative',
              display: 'inline-block',
              overflow: 'hidden',
              textDecoration: 'none',
              px: 1,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent)',
                animation: 'laser 2s linear infinite',
                borderRadius: '2px',
              },
            }}
          >
            01 42 67 48 61
          </Box>
        </Typography>
      </Box>
    </>
  );
};

export default Header;
