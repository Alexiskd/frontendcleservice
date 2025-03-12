// SignupForm.jsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  LinearProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const SignupForm = ({ setError, setIsLoggedIn, setUserName, setOpenModal }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    newsletter: false,
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Fonction de validation de l'email
  const validateEmail = (email) => {
    // Expression régulière pour valider le format de l'email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Fonction d'évaluation de la force du mot de passe
  const evaluatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Mettre à jour la force du mot de passe chaque fois qu'il change
  useEffect(() => {
    const strength = evaluatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Réinitialiser les erreurs lorsque l'utilisateur modifie les champs
    if (name === 'email') {
      if (validateEmail(value)) {
        setEmailError('');
      } else {
        setEmailError('Format d\'email invalide.');
      }
    }
  };

  const handleSignup = async () => {
    // Validation de base
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Format d\'email invalide.');
      setError('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    // Optionnel : Vous pouvez ajouter des validations supplémentaires ici

    setLoading(true);
    try {
      const response = await fetch('https://cl-back.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const data = await response.json();
      setIsLoggedIn(true);
      setUserName(formData.firstName);
      setOpenModal(false);
    } catch (error) {
      setError(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Définir la couleur en fonction de la force du mot de passe
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'error';
      case 2:
      case 3:
        return 'warning';
      case 4:
      case 5:
        return 'success';
      default:
        return 'error';
    }
  };

  // Définir la légende en fonction de la force du mot de passe
  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Très faible';
      case 2:
        return 'Faible';
      case 3:
        return 'Moyen';
      case 4:
        return 'Fort';
      case 5:
        return 'Très fort';
      default:
        return '';
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      <Typography variant="h5" component="h2" align="center" gutterBottom>
        Créez Votre Compte
      </Typography>

      <TextField
        label="Prénom"
        name="firstName"
        variant="outlined"
        fullWidth
        required
        value={formData.firstName}
        onChange={handleChange}
        autoFocus
      />
      <TextField
        label="Nom"
        name="lastName"
        variant="outlined"
        fullWidth
        required
        value={formData.lastName}
        onChange={handleChange}
      />
      <TextField
        label="Adresse Email"
        name="email"
        type="email"
        variant="outlined"
        fullWidth
        required
        value={formData.email}
        onChange={handleChange}
        error={!!emailError}
        helperText={emailError}
      />
      <TextField
        label="Mot de Passe"
        name="password"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        fullWidth
        required
        value={formData.password}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Indicateur de force du mot de passe */}
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={(passwordStrength / 5) * 100}
          color={getPasswordStrengthColor()}
          sx={{ height: '8px', borderRadius: '4px' }}
        />
        <Typography variant="caption" color={getPasswordStrengthColor()}>
          {getPasswordStrengthLabel()}
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
            color="primary"
          />
        }
        label="Je souhaite recevoir les newsletters."
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSignup}
        disabled={loading}
        sx={{
          mt: 2,
          padding: '12px',
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 'bold',
          backgroundColor: '#333',
          '&:hover': {
            backgroundColor: '#555',
          },
        }}
      >
        {loading ? 'Inscription en cours...' : "S'inscrire"}
      </Button>
    </Box>
  );
};

export default SignupForm;
