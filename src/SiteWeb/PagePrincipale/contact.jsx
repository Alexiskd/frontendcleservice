// src/components/Contact.jsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';

const Contact = () => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    message: false,
  });
  const [success, setSuccess] = useState(false);

  // Assurez-vous d'avoir défini VITE_API_URL dans le fichier .env
  const API_URL = import.meta.env.VITE_API_URL || 'https://cl-back.onrender.com';

  const handleChange = useCallback((e) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleCancel = useCallback(() => {
    setFormValues({ name: '', email: '', message: '' });
    setErrors({ name: false, email: false, message: false });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      let valid = true;
      const newErrors = { name: false, email: false, message: false };

      if (formValues.name.trim() === '') {
        newErrors.name = true;
        valid = false;
      }
      if (
        formValues.email.trim() === '' ||
        !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formValues.email)
      ) {
        newErrors.email = true;
        valid = false;
      }
      if (formValues.message.trim() === '') {
        newErrors.message = true;
        valid = false;
      }

      setErrors(newErrors);
      if (!valid) return;

      try {
        const response = await fetch(`${API_URL}/contact-messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        });

        if (response.ok) {
          setSuccess(true);
          setFormValues({ name: '', email: '', message: '' });
        } else {
          const errorData = await response.json();
          console.error("Erreur lors de l'envoi du message. Statut:", response.status, errorData);
        }
      } catch (error) {
        console.error('Erreur lors de la soumission du formulaire', error);
      }
    },
    [formValues, API_URL]
  );

  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSuccess(false);
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: '#EDEDED',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
    
      {/* Bandeau en haut - Hauteur réduite */}
      <Box
        sx={{
          height: { xs: '60px', md: '120px' },
          backgroundColor: '#01591f',
        }}
      />

      {/* Header avec image de fond - Espacement vertical réduit */}
      <Box
        sx={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#FFFFFF',
          py: { xs: 3, md: 5 },
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '700',
              color: 'black',
            }}
          >
            Contactez-nous
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              maxWidth: '600px',
              mx: 'auto',
              color: 'black',
            }}
          >
            Nous sommes là pour répondre à toutes vos questions. Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
          </Typography>
        </Container>
      </Box>

      {/* Section du formulaire - Espacement entre le header et le formulaire réduit */}
      <Container
        sx={{
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: '#FFFFFF',
            p: 5,
            borderRadius: 2,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: '600',
              mb: 0.5, // Espace sous le titre du formulaire réduit
            }}
          >
            Formulaire de Contact
          </Typography>

          <TextField
            label="Nom"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="filled"
            error={errors.name}
            helperText={errors.name && "Veuillez entrer votre nom."}
            sx={{
              '& .MuiFilledInput-root': { backgroundColor: '#f5f5f5' },
              borderRadius: 1,
            }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="filled"
            error={errors.email}
            helperText={errors.email && "Veuillez entrer un email valide."}
            sx={{
              '& .MuiFilledInput-root': { backgroundColor: '#f5f5f5' },
              borderRadius: 1,
            }}
          />

          <TextField
            label="Message"
            name="message"
            value={formValues.message}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="filled"
            multiline
            rows={4}
            error={errors.message}
            helperText={errors.message && "Veuillez entrer votre message."}
            sx={{
              '& .MuiFilledInput-root': { backgroundColor: '#f5f5f5' },
              borderRadius: 1,
            }}
          />

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              sx={{
                bgcolor: '#025920',
                '&:hover': { bgcolor: '#024514' },
                px: 3,
              }}
            >
              Envoyer
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              sx={{
                color: '#025920',
                borderColor: '#025920',
                '&:hover': { borderColor: '#024514', color: '#024514' },
                px: 3,
              }}
            >
              Annuler
            </Button>
          </Stack>
        </Box>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Votre message a été envoyé avec succès !
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
