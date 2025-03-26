import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
} from '@mui/material';

// Fonction de préchargement des marques avec décodage du logo
function preloadBrandsData() {
  return fetch('https://cl-back.onrender.com/brands')
    .then((res) => {
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des marques');
      }
      return res.json();
    })
    .then((data) => {
      const decodedData = data.map((brand) => {
        // On s'assure que le logo possède le bon préfixe pour l'affichage
        if (brand.logo && !brand.logo.startsWith('data:image/')) {
          brand.logo = `data:image/jpeg;base64,${brand.logo}`;
        }
        return brand;
      });
      return decodedData;
    });
}

const MarqueAdmin = () => {
  const [form, setForm] = useState({ nom: '', logoFile: null });
  const [brands, setBrands] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editBrandId, setEditBrandId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBrands = () => {
    setLoading(true);
    preloadBrandsData()
      .then((data) => {
        console.log('Marques récupérées :', data);
        setBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Fichier sélectionné :', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contient la chaîne base64 de l'image
        setForm((prev) => ({ ...prev, logoFile: reader.result }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Seul le nom est requis désormais (le logo est facultatif)
    if (!form.nom) {
      setError('Veuillez renseigner le nom.');
      return;
    }

    const formData = new FormData();
    formData.append('nom', form.nom);
    // On envoie toujours le champ "logo" :
    // s'il n'est pas fourni, la valeur sera une chaîne vide, que vous pouvez interpréter comme null côté serveur
    formData.append('logo', form.logoFile || '');

    console.log('Contenu du FormData envoyé :');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      setLoading(true);
      let res;
      if (editMode) {
        res = await fetch(`https://cl-back.onrender.com/brands/${editBrandId}`, {
          method: 'PATCH',
          body: formData,
        });
      } else {
        res = await fetch(`https://cl-back.onrender.com/brands`, {
          method: 'POST',
          body: formData,
        });
      }
      const responseData = await res.json();
      console.log('Réponse du serveur:', responseData);
      if (!res.ok) {
        throw new Error(
          responseData.message || 'Erreur lors de la soumission du formulaire'
        );
      }
      // Réinitialisation du formulaire et de l'état d'édition
      setForm({ nom: '', logoFile: null });
      setPreview(null);
      setEditMode(false);
      setEditBrandId(null);
      loadBrands();
    } catch (err) {
      console.error('handleSubmit error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette marque ?')) {
      try {
        setLoading(true);
        const res = await fetch(`https://cl-back.onrender.com/brands/${id}`, {
          method: 'DELETE',
        });
        const responseData = await res.json();
        console.log('Réponse de la suppression:', responseData);
        if (!res.ok) {
          throw new Error(
            responseData.message || 'Erreur lors de la suppression'
          );
        }
        loadBrands();
      } catch (err) {
        console.error('handleDelete error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Lorsqu'on clique sur "Modifier", on remplit le formulaire avec les données existantes
  const handleEdit = (brand) => {
    setEditMode(true);
    setEditBrandId(brand.id);
    setForm({ nom: brand.nom, logoFile: null });
    if (brand.logo) {
      const previewUrl = brand.logo.startsWith('data:image/')
        ? brand.logo
        : `data:image/jpeg;base64,${brand.logo}`;
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditBrandId(null);
    setForm({ nom: '', logoFile: null });
    setPreview(null);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.nom &&
    brand.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: '#2E7D32', fontSize: { xs: '1.5rem', md: '2.5rem' } }}
      >
        {editMode ? 'Modifier la Marque' : 'Ajouter une Marque'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mb: 4,
          p: { xs: 2, md: 3 },
          border: '1px solid #A5D6A7',
          borderRadius: 2,
          backgroundColor: '#f1f8e9',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={handleInputChange}
              required
              fullWidth
              sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                bgcolor: '#2E7D32',
                '&:hover': { bgcolor: '#1B5E20' },
                fontSize: { xs: '0.8rem', md: '1rem' },
              }}
            >
              {editMode ? 'Changer le Logo (facultatif)' : 'Ajouter un Logo (facultatif)'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Grid>
          {preview && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Aperçu du Logo :
                </Typography>
                <Box
                  component="img"
                  src={preview}
                  alt="Aperçu du logo"
                  sx={{
                    maxHeight: { xs: 150, md: 200 },
                    maxWidth: '100%',
                    borderRadius: 1,
                    boxShadow: 2,
                  }}
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#2E7D32',
                '&:hover': { bgcolor: '#1B5E20' },
                fontSize: { xs: '0.9rem', md: '1rem' },
              }}
            >
              {loading
                ? editMode
                  ? 'Modification en cours...'
                  : 'Ajout en cours...'
                : editMode
                ? 'Enregistrer les modifications'
                : 'Ajouter la Marque'}
            </Button>
          </Grid>
          {editMode && (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                fullWidth
                onClick={cancelEdit}
                sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
              >
                Annuler la modification
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: '#2E7D32', fontSize: { xs: '1.2rem', md: '1.5rem' } }}
      >
        Liste des Marques
      </Typography>

      <Box sx={{ mb: 3, mt: 2 }}>
        <TextField
          label="Rechercher une marque"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
        />
      </Box>
      {loading && <CircularProgress />}
      <Grid container spacing={2}>
        {filteredBrands.map((brand) => (
          <Grid item xs={12} sm={6} md={4} key={brand.id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              {brand.logo && (
                <CardMedia
                  component="img"
                  image={brand.logo}
                  alt={brand.nom}
                  sx={{
                    height: { xs: 150, md: 180 },
                    objectFit: 'contain',
                    backgroundColor: '#fff',
                  }}
                />
              )}
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: '#2E7D32', fontSize: { xs: '1rem', md: '1.2rem' } }}
                >
                  {brand.nom}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleEdit(brand)}
                  sx={{ color: '#2E7D32', fontSize: { xs: '0.8rem', md: '1rem' } }}
                >
                  Modifier
                </Button>
                <Button
                  size="small"
                  onClick={() => handleDelete(brand.id)}
                  sx={{ color: '#d32f2f', fontSize: { xs: '0.8rem', md: '1rem' } }}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MarqueAdmin;
