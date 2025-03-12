import React, { useState, useEffect } from 'react';
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
import Cart from './UserPA/cart.jsx';

const primaryColor = '#4E342E';

const gradientText = {
  background: 'linear-gradient(90deg, #15720a, #000)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (openState) => {
    setDrawerOpen(openState);
  };

  const navItems = [
    { label: 'Accueil', to: '/' },
    { label: 'Qui sommes-nous ?', to: '/qui.php' },
    { label: 'Catalogue', to: '/trouvez.php' },
    { label: 'Coffre Fort', to: '/catalogue-cles-coffre.php' },
    { label: 'Badges', to: '/badges.php' },
    { label: 'Contact', to: '/contact.php' },
  ];

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(100deg, #f4f4cc, #1B5E20)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1, // S'assurer que le header est au-dessus
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            py: { xs: 1, md: 2 },
          }}
        >
          {/* Logo et titre */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: { xs: '35px', md: '45px' }, mr: 1 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.2rem', md: '1.75rem' },
                letterSpacing: '0.5px',
                ...gradientText,
              }}
            >
              Cleservice.com
            </Typography>
          </Box>

          {/* Bouton menu pour mobile */}
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => toggleDrawer(true)}
            sx={{ display: { xs: 'block', md: 'none' }, color: '#000' }}
          >
            <MenuIcon sx={{ fontSize: { xs: '1.5rem', md: '1.8rem' } }} />
          </IconButton>

          {/* Liens de navigation et composant panier (affichés en horizontal pour md et plus) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
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
          sx={{
            width: 250,
            p: 2,
          }}
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
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default Header;
