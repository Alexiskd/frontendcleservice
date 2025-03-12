import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Container,
  Grid,
  InputAdornment
} from '@mui/material';

// Import d'icônes Material-UI
import PersonOutline from '@mui/icons-material/PersonOutline';
import Business from '@mui/icons-material/Business';
import Work from '@mui/icons-material/Work';
import Home from '@mui/icons-material/Home';
import LocationOn from '@mui/icons-material/LocationOn';
import LocationCity from '@mui/icons-material/LocationCity';
import Public from '@mui/icons-material/Public';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import Print from '@mui/icons-material/Print';
import Chat from '@mui/icons-material/Chat';

const DemandeDevis = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    societe: '',
    fonction: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: '',
    email: '',
    telephone: '',
    fax: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    // Ajoutez ici la logique d’envoi (API, backend, etc.)
  };

  return (
    <Box
      sx={{
        backgroundColor: '#F2F2F2',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start', // ou 'center' si vous voulez centrer verticalement
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
        padding: 2,
      }}
    >
      <Container
        sx={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: 3,
          p: 3,
          maxWidth: '500px', // Formulaire plus étroit
          margin: '20px auto',
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: '600', mb: 2, color: '#025920' }}
        >
          Demande de devis
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={1}>
            {/* Nom */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Nom"
                name="nom"
                variant="outlined"
                value={formData.nom}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Prénom */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Prénom"
                name="prenom"
                variant="outlined"
                value={formData.prenom}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Société */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Société"
                name="societe"
                variant="outlined"
                value={formData.societe}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Fonction */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Fonction"
                name="fonction"
                variant="outlined"
                value={formData.fonction}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Adresse */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Adresse"
                name="adresse"
                variant="outlined"
                value={formData.adresse}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Code postal */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Code postal"
                name="codePostal"
                variant="outlined"
                value={formData.codePostal}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Ville */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Ville"
                name="ville"
                variant="outlined"
                value={formData.ville}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCity sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Pays */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Pays"
                name="pays"
                variant="outlined"
                value={formData.pays}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Public sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* E-mail */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="E-mail"
                name="email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Téléphone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Téléphone"
                name="telephone"
                variant="outlined"
                value={formData.telephone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Fax */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Fax"
                name="fax"
                variant="outlined"
                value={formData.fax}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Print sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Message */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Votre message"
                name="message"
                multiline
                rows={3} // Réduisez à 3 pour limiter la hauteur
                variant="outlined"
                value={formData.message}
                onChange={handleChange}
                
              />
            </Grid>

            {/* Bouton Envoyer */}
            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#37A65E',
                  textTransform: 'none',
                  ':hover': {
                    backgroundColor: '#2d8d4c',
                  },
                }}
              >
                Envoyer la demande de devis
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
};

export default DemandeDevis;
