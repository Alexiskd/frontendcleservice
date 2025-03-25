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

// Dégradé pour le texte (adapté à un style moderne)
const gradientText = {
  background: 'linear-gradient(90deg, #00796b, #004d40)',
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
      {/* AppBar au style moderne */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #e0f7fa, #80deea)',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          px: { xs: 2, md: 4 },
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
          {/* Logo et titre */}
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
              sx={{ height: { xs: '40px', md: '60px' } }}
            />
            <Typography
              variant="h6"
              sx={{
                ml: 1,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.8rem' },
                ...gradientText,
              }}
            >
              Cleservice.com
            </Typography>
          </Box>

          {/* Navigation desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: '25px',
            }}
          >
            {navItems.map((item, index) => (
              <Button
                key={index}
                component={Link}
                to={item.to}
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1rem', md: '1.1rem' },
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
            <MenuIcon sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer pour mobile avec style bento moderne */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            boxShadow: '-2px 0px 10px rgba(0,0,0,0.1)',
            width: 280,
          },
        }}
      >
        <Box
          sx={{ width: 280, p: 3 }}
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
                  my: 1,
                  borderRadius: '12px',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(98, 0, 234, 0.1)',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Bandeau d'information */}
      <Box
        sx={{
          mt: { xs: '64px', md: '80px' },
          background: 'linear-gradient(90deg, #80deea, #e0f7fa)',
          py: { xs: 2, md: 3 },
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
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { xs: '0.95rem', md: '1.1rem' },
            color: '#424242',
          }}
        >
          Spécialisé dans la reproduction de clés depuis 50 ans, pour toute question, appelez le&nbsp;
          <Box
            component="a"
            href="tel:0142674861"
            sx={{
              color: '#6200ea',
              fontFamily: 'Lato, sans-serif',
              textDecoration: 'none',
              fontWeight: 700,
              ml: 1,
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
