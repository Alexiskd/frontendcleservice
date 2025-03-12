import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Menu,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link,
  Modal,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import Cart from './cart.jsx';
import { CartContext } from '../context/CartContext.jsx';

const AuthenticationBar = () => {
  const { isLoggedIn, setIsLoggedIn, cartItems, anchorEl, open, handleCartClose, handleRemoveFromCart } = useContext(CartContext);
  const [userName, setUserName] = useState('');
  const [userInfo, setUserInfo] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState('login');
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cl-back.onrender.com/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur.');
      }

      const data = await response.json();
      setUserInfo(data);
      setUserName(data.firstName || data.email || 'Utilisateur');
    } catch (err) {
      console.error('fetchUserInfo Error:', err);
      setError('Impossible de récupérer les informations utilisateur. Veuillez réessayer.');
      setSnackbarMessage('Erreur: Impossible de récupérer les informations utilisateur.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAccountMenuOpen = (event) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    window.location.reload();
  };

  const handleOpenLogin = () => {
    setModalContent('login');
    setOpenModal(true);
    setError('');
  };

  const handleOpenSignup = () => {
    setModalContent('signup');
    setOpenModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setError('');
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#F2F2F2',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {isLoggedIn ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">Bonjour, {userName}</Typography>
          <Button
            onClick={handleAccountMenuOpen}
            sx={{
              textTransform: 'none',
              color: '#333',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
              },
            }}
            aria-controls="account-menu"
            aria-haspopup="true"
          >
            Mon Compte
          </Button>

          <Menu
            id="account-menu"
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
            PaperProps={{
              sx: { width: '300px', mt: 1 },
            }}
          >
            <Box sx={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar alt={userName} src={userInfo.avatarUrl || ''} />
              <Typography variant="h6">Informations du Compte</Typography>
            </Box>
            <Divider />
            <List>
              <ListItem>
                <ListItemText primary="Prénom" secondary={userInfo?.firstName || 'Non disponible'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Nom" secondary={userInfo?.lastName || 'Non disponible'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={userInfo?.email || 'Non disponible'} />
              </ListItem>
            </List>
            <Divider />
            <Box sx={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <Link href="/profile" underline="none">
                <Button variant="text" color="primary">
                  Profil
                </Button>
              </Link>
              <Button variant="contained" color="secondary" onClick={handleLogout}>
                Se Déconnecter
              </Button>
            </Box>
          </Menu>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={handleOpenLogin}
            sx={{
              textTransform: 'none',
              color: '#333',
              backgroundColor: 'transparent',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '6px 12px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
              },
            }}
          >
            Se connecter
          </Button>
          <Button
            onClick={handleOpenSignup}
            sx={{
              textTransform: 'none',
              color: '#fff',
              backgroundColor: '#333',
              borderRadius: '4px',
              padding: '6px 12px',
              '&:hover': {
                backgroundColor: '#555',
              },
            }}
          >
            S'inscrire
          </Button>
        </Box>
      )}

      <Cart 
        cartItems={cartItems}
        anchorEl={anchorEl}
        open={open}
        handleCartClose={handleCartClose}
        handleRemoveFromCart={handleRemoveFromCart}
      />

      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom align="center">
            {modalContent === 'login' ? 'Connexion' : 'Inscription'}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError('')}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          {modalContent === 'login' ? (
            <LoginForm
              setError={setError}
              setUserName={setUserName}
              setIsLoggedIn={setIsLoggedIn}
              setOpenModal={setOpenModal}
            />
          ) : (
            <SignupForm
              setError={setError}
              setUserName={setUserName}
              setOpenModal={setOpenModal}
            />
          )}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuthenticationBar;
