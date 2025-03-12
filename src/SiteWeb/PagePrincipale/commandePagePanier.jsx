import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  IconButton,
  InputAdornment,
  Stack,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  PhotoCamera,
  Person,
  Email,
  Phone,
  Home,
  LocationCity,
  Info,
  VpnKey,
  CheckCircle,
  Error as ErrorIcon,
  CloudUpload,
} from '@mui/icons-material';
import { CartContext } from '../context/CartContext';

// Fonction utilitaire pour obtenir le nom de l'article.
const getArticleName = (item) => {
  if (item.nom_article) return decodeURIComponent(item.nom_article);
  if (item.nom) return decodeURIComponent(item.nom);
  return 'Article Sans Nom';
};

const CommandePagePanier = () => {
  const { cartItems } = useContext(CartContext);

  // Détails récupérés depuis le backend pour chaque clé.
  const [articlesDetails, setArticlesDetails] = useState({});

  // Informations client.
  const [userInfo, setUserInfo] = useState({
    clientType: 'particulier',
    name: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    additionalInfo: '',
  });

  // Pour chaque clé, on stocke le mode choisi ("numero" ou "postal").
  const [itemModes, setItemModes] = useState({});

  // Stocke les informations spécifiques pour chaque clé (numéro, photos, type de livraison).
  const [keyDetails, setKeyDetails] = useState({});

  // Snackbar pour afficher les messages.
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Récupération des détails depuis le backend.
  useEffect(() => {
    cartItems.forEach((item) => {
      const articleName = getArticleName(item);
      if (articleName && !articlesDetails[articleName]) {
        fetch(`https://cl-back.onrender.com/produit/cles/by-name?nom=${encodeURIComponent(articleName)}`)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Erreur lors de la récupération des détails pour ${articleName}`);
            }
            return res.json();
          })
          .then((data) => {
            console.log(`Données récupérées pour ${articleName} :`, data);
            setArticlesDetails((prev) => ({
              ...prev,
              [articleName]: data,
            }));
          })
          .catch((err) => {
            console.error(`Erreur pour ${articleName} :`, err);
          });
      }
    });
  }, [cartItems, articlesDetails]);

  // Si l'article ne propose qu'un tarif (aucun tarif postal), on définit le mode "numero" par défaut.
  useEffect(() => {
    cartItems.forEach((item, index) => {
      const articleName = getArticleName(item);
      const details = articlesDetails[articleName] || {};
      const priceSansCarte = details.prixSansCartePropriete ? Number(details.prixSansCartePropriete) : 0;
      if (priceSansCarte === 0 && !itemModes[index]) {
        setItemModes((prev) => ({ ...prev, [index]: 'numero' }));
      }
    });
  }, [articlesDetails, cartItems, itemModes]);

  // Mise à jour des champs du formulaire client.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion du changement de mode pour une clé.
  const handleItemModeChange = (index, value) => {
    setItemModes((prev) => ({ ...prev, [index]: value }));
  };

  // Mise à jour d'un champ spécifique pour une clé (numéro, photos, type de livraison).
  const handleKeyDetailChange = (index, field, value) => {
    setKeyDetails((prev) => ({
      ...prev,
      [index]: { ...(prev[index] || {}), [field]: value },
    }));
  };

  // Gestion de l'upload de photos.
  const handlePhotoUpload = (index, field, files) => {
    if (files && files[0]) {
      setKeyDetails((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), [field]: files[0] },
      }));
    }
  };

  // Retourne le prix de la clé en fonction du mode choisi.
  const getItemPrice = (item, index) => {
    const articleName = getArticleName(item);
    const details = articlesDetails[articleName] || {};
    if (item.cle_avec_carte_propriete || details.cleAvecCartePropriete) {
      const mode = itemModes[index] || 'numero';
      return mode === 'postal'
        ? Number(details.prixSansCartePropriete) || 0
        : Number(details.prix) || 0;
    }
    return Number(details.prix) || 0;
  };

  // Configuration des frais de livraison.
  const shippingFees = {
    lettre: 3,
    chronopost: 5,
    recommande: 10,
  };

  // Retourne le frais de livraison pour une clé si le mode "postal" est sélectionné.
  const getShippingFee = (item, index) => {
    const mode = itemModes[index] || 'numero';
    if (mode === 'postal') {
      const shippingMethod = keyDetails[index]?.shippingMethod;
      return shippingFees[shippingMethod] || 0;
    }
    return 0;
  };

  // Calcule le sous-total (prix des clés sans les frais de livraison).
  const getSubtotal = () => {
    return cartItems.reduce((total, item, i) => total + getItemPrice(item, i), 0);
  };

  // Calcule le total des frais de livraison.
  const getTotalShippingFee = () => {
    return cartItems.reduce((total, item, i) => total + getShippingFee(item, i), 0);
  };

  // Calcule le total général (sous-total + frais de livraison).
  const getOverallTotal = () => {
    return getSubtotal() + getTotalShippingFee();
  };

  // Vérification du formulaire avant soumission.
  const validateForm = () => {
    const requiredUserFields = [
      userInfo.name,
      userInfo.email,
      userInfo.phone,
      userInfo.address,
      userInfo.postalCode,
      // Le champ supplémentaire n'est plus obligatoire.
    ];
    if (requiredUserFields.some((field) => !field.trim())) return false;

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (item.cle_avec_carte_propriete || articlesDetails[getArticleName(item)]?.cleAvecCartePropriete) {
        const mode = itemModes[i] || 'numero';
        const details = keyDetails[i] || {};
        if (mode === 'numero' && (!details.keyNumber || !details.frontPhoto || !details.backPhoto))
          return false;
        if (mode === 'postal' && (!details.frontPhoto || !details.backPhoto || !details.shippingMethod))
          return false;
      }
    }
    return true;
  };

  // Soumission de la commande.
  const handleOrder = () => {
    if (!validateForm()) {
      setSnackbarMessage('Veuillez remplir tous les champs obligatoires.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      userInfo,
      articles: cartItems.map((item, i) => {
        const articleName = getArticleName(item);
        if (item.cle_avec_carte_propriete || articlesDetails[articleName]?.cleAvecCartePropriete) {
          const mode = itemModes[i] || 'numero';
          const details = keyDetails[i] || {};
          return {
            nom: articleName,
            mode, // "numero" ou "postal"
            prix:
              mode === 'numero'
                ? Number((articlesDetails[articleName] || {}).prix) || 0
                : Number((articlesDetails[articleName] || {}).prixSansCartePropriete) || 0,
            keyNumber: mode === 'numero' ? details.keyNumber || '' : '',
            shippingMethod: mode === 'postal' ? details.shippingMethod || '' : '',
            frontPhoto: details.frontPhoto || null,
            backPhoto: details.backPhoto || null,
          };
        } else {
          return {
            nom: articleName,
            prix: Number((articlesDetails[articleName] || {}).prix) || 0,
          };
        }
      }),
      subtotal: getSubtotal(),
      shippingFees: getTotalShippingFee(),
      totalPrice: getOverallTotal(),
    };

    console.log('Payload de la commande :', payload);
    setSnackbarMessage(`Commande validée pour ${getOverallTotal()} € !`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    // Vous pouvez ici envoyer le payload vers votre backend.
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ backgroundColor: '#F2F2F2', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 12 }, px: { xs: 2, md: 0 } }}>
        <Grid container spacing={4}>
          {/* Colonne gauche : Formulaire de commande */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                backgroundColor: '#fff',
                p: { xs: 2, md: 3 },
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Typography variant="h5" gutterBottom>
                Informations de Commande
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cartItems.map((item, i) => {
                const articleName = getArticleName(item);
                const details = articlesDetails[articleName] || {};
                const priceAvecCarte = details.prix ? Number(details.prix) : 0;
                const priceSansCarte = details.prixSansCartePropriete ? Number(details.prixSansCartePropriete) : 0;
                return (
                  <Card key={i} sx={{ mb: 4 }}>
                    {item.image && (
                      <CardMedia
                        component="img"
                        image={item.image}
                        alt={articleName}
                        sx={{
                          objectFit: 'cover',
                          height: { xs: 150, md: 200 },
                        }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {articleName}
                      </Typography>
                      {item.cle_avec_carte_propriete || details.cleAvecCartePropriete ? (
                        <>
                          <Typography variant="body1" color="textSecondary">
                            Prix avec carte : {priceAvecCarte} €
                          </Typography>
                          {priceSansCarte > 0 && (
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                              Prix sans carte (envoi postal) : {priceSansCarte} €
                            </Typography>
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#025920' }}>
                            <VpnKey sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Informations pour la clé *
                          </Typography>
                          {priceSansCarte > 0 ? (
                            <FormControl component="fieldset" sx={{ mb: 2 }}>
                              <RadioGroup
                                row
                                value={itemModes[i] || 'numero'}
                                onChange={(e) => handleItemModeChange(i, e.target.value)}
                              >
                                <FormControlLabel
                                  value="numero"
                                  control={<Radio />}
                                  label={`Par numéro (${priceAvecCarte} €)`}
                                />
                                <FormControlLabel
                                  value="postal"
                                  control={<Radio />}
                                  label={`Par envoi postal (${priceSansCarte} €)`}
                                />
                              </RadioGroup>
                            </FormControl>
                          ) : null}
                          {(itemModes[i] === 'numero' || priceSansCarte === 0) && (
                            <TextField
                              placeholder="* Numéro inscrit sur la clé"
                              variant="outlined"
                              fullWidth
                              value={keyDetails[i]?.keyNumber || ''}
                              onChange={(e) => handleKeyDetailChange(i, 'keyNumber', e.target.value)}
                              sx={{ mb: 2, borderRadius: 2 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <VpnKey color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              required
                            />
                          )}
                          {itemModes[i] === 'postal' && (
                            <>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Type de Livraison
                              </Typography>
                              <FormControl fullWidth sx={{ mb: 2 }}>
                                <Select
                                  value={keyDetails[i]?.shippingMethod || ''}
                                  onChange={(e) =>
                                    handleKeyDetailChange(i, 'shippingMethod', e.target.value)
                                  }
                                  displayEmpty
                                  inputProps={{ 'aria-label': 'Type de Livraison' }}
                                  required
                                >
                                  <MenuItem value="" disabled>
                                    Sélectionnez un type de livraison
                                  </MenuItem>
                                  <MenuItem value="lettre">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CloudUpload sx={{ mr: 1 }} />
                                      Lettre (3€ - 3 jours)
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value="chronopost">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CloudUpload sx={{ mr: 1 }} />
                                      Chronopost Sécurisé (5€ - 1 jour)
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value="recommande">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CloudUpload sx={{ mr: 1 }} />
                                      Recommandé Sécurisé (10€ - 2 jours)
                                    </Box>
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </>
                          )}
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ minWidth: '130px' }}>
                              Photo (recto) * :
                            </Typography>
                            <IconButton
                              color="primary"
                              aria-label="Télécharger la photo recto"
                              component="label"
                              sx={{ backgroundColor: '#E3F2FD', borderRadius: '8px', p: 1 }}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handlePhotoUpload(i, 'frontPhoto', e.target.files)}
                              />
                              <PhotoCamera />
                            </IconButton>
                            {keyDetails[i]?.frontPhoto && (
                              <Typography variant="caption" color="success.main">
                                {keyDetails[i].frontPhoto.name}
                              </Typography>
                            )}
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ minWidth: '130px' }}>
                              Photo (verso) * :
                            </Typography>
                            <IconButton
                              color="primary"
                              aria-label="Télécharger la photo verso"
                              component="label"
                              sx={{ backgroundColor: '#E3F2FD', borderRadius: '8px', p: 1 }}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handlePhotoUpload(i, 'backPhoto', e.target.files)}
                              />
                              <PhotoCamera />
                            </IconButton>
                            {keyDetails[i]?.backPhoto && (
                              <Typography variant="caption" color="success.main">
                                {keyDetails[i].backPhoto.name}
                              </Typography>
                            )}
                          </Stack>
                        </>
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          Prix : {Number(details.prix) || 0} €
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {/* Informations Client */}
              <Typography variant="h5" sx={{ mt: 2, mb: 2, color: '#025920' }}>
                <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                Informations Client *
              </Typography>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <RadioGroup row name="clientType" value={userInfo.clientType} onChange={handleInputChange}>
                  <FormControlLabel value="particulier" control={<Radio />} label="Particulier" />
                  <FormControlLabel value="entreprise" control={<Radio />} label="Entreprise" />
                </RadioGroup>
              </FormControl>
              <TextField
                placeholder={userInfo.clientType === 'entreprise' ? "* Nom de l'entreprise" : '* Nom et prénom'}
                variant="outlined"
                fullWidth
                name="name"
                value={userInfo.name}
                onChange={handleInputChange}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
              <TextField
                placeholder="* Adresse email"
                variant="outlined"
                fullWidth
                name="email"
                type="email"
                value={userInfo.email}
                onChange={handleInputChange}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
              <TextField
                placeholder="* Téléphone"
                variant="outlined"
                fullWidth
                name="phone"
                type="tel"
                value={userInfo.phone}
                onChange={handleInputChange}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
              <TextField
                placeholder="* Adresse de livraison"
                variant="outlined"
                fullWidth
                name="address"
                value={userInfo.address}
                onChange={handleInputChange}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
              <TextField
                placeholder="* Code postal"
                variant="outlined"
                fullWidth
                name="postalCode"
                value={userInfo.postalCode}
                onChange={handleInputChange}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCity color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
              <TextField
                // Le champ "Informations complémentaires de livraison" n'est plus obligatoire.
                placeholder="Informations complémentaires de livraison (optionnel)"
                variant="outlined"
                fullWidth
                name="additionalInfo"
                value={userInfo.additionalInfo}
                onChange={handleInputChange}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Info color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
          {/* Colonne droite : Récapitulatif de la commande */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Résumé de la commande
              </Typography>
              {cartItems.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', mb: 2 }}>
                  {item.image && (
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={getArticleName(item)}
                      sx={{
                        width: 80,
                        height: { xs: 60, md: 80 },
                        objectFit: 'cover',
                        mr: 2,
                        borderRadius: 1,
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1">{getArticleName(item)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getItemPrice(item, i)} €
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Sous-total
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {getSubtotal()} €
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Frais de livraison
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {getTotalShippingFee()} €
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Total
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {getOverallTotal()} €
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleOrder}
                sx={{
                  mt: 2,
                  backgroundColor: '#1B5E20',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#16641C' },
                }}
              >
                Commander
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
          iconMapping={{
            success: <CheckCircle fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommandePagePanier;
