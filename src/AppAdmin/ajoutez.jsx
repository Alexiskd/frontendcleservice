import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';

const primaryGreen = '#2E7D32';
const hoverGreen = '#1B5E20';
const lightGreen = '#A5D6A7';

const BASE_URL = 'https://cl-back.onrender.com';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const image = new Image();
      image.src = e.target.result;
      image.onload = () => {
        let { width, height } = image;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            const compressedReader = new FileReader();
            compressedReader.readAsDataURL(blob);
            compressedReader.onloadend = () => {
              resolve(compressedReader.result);
            };
          },
          file.type,
          quality,
        );
      };
      image.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const Ajoutez = () => {
  const [form, setForm] = useState({
    cleAvecCartePropriete: false,
    prix: '',
    prixSansCartePropriete: '',
    nom: '',
    marque: '',
    imageDataUrl: '',
    referenceEbauche: '',
    typeReproduction: 'copie',
    // Cinq champs séparés pour le SEO
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    metaRobots: '',
    metaCanonical: '',
    descriptionNumero: '',
    estCleAPasse: false,
    prixCleAPasse: '',
    besoinPhoto: false,
    besoinNumeroCle: false,
    besoinNumeroCarte: false,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [totalKeys, setTotalKeys] = useState(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let dataUrl;
      if (file.size > 1024 * 1024) {
        dataUrl = await compressImage(file);
      } else {
        dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Erreur de lecture de fichier"));
          reader.readAsDataURL(file);
        });
      }
      setForm((prev) => ({ ...prev, imageDataUrl: dataUrl }));
    } catch (err) {
      console.error("Erreur lors de la compression de l'image:", err);
      setError("Erreur lors de la compression de l'image");
    }
  }, []);

  const handleEdit = (prod) => {
    let metaData = {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      metaRobots: '',
      metaCanonical: '',
    };
    try {
      metaData = JSON.parse(prod.descriptionProduit);
    } catch (err) {
      // Si la description n'est pas un JSON, on garde des valeurs vides
    }
    setEditingProduct(prod);
    setForm({
      cleAvecCartePropriete: prod.cleAvecCartePropriete,
      prix: prod.prix.toString(),
      prixSansCartePropriete: prod.prixSansCartePropriete ? prod.prixSansCartePropriete.toString() : '',
      nom: prod.nom,
      marque: prod.marque,
      imageDataUrl: prod.imageUrl,
      referenceEbauche: prod.referenceEbauche || '',
      typeReproduction: prod.typeReproduction,
      metaTitle: metaData.metaTitle || '',
      metaDescription: metaData.metaDescription || '',
      metaKeywords: metaData.metaKeywords || '',
      metaRobots: metaData.metaRobots || '',
      metaCanonical: metaData.metaCanonical || '',
      descriptionNumero: prod.descriptionNumero || '',
      estCleAPasse: prod.estCleAPasse,
      prixCleAPasse: prod.prixCleAPasse ? prod.prixCleAPasse.toString() : '',
      besoinPhoto: prod.besoinPhoto || false,
      besoinNumeroCle: prod.besoinNumeroCle || false,
      besoinNumeroCarte: prod.besoinNumeroCarte || false,
    });
  };

  const resetForm = () => {
    setForm({
      cleAvecCartePropriete: false,
      prix: '',
      prixSansCartePropriete: '',
      nom: '',
      marque: '',
      imageDataUrl: '',
      referenceEbauche: '',
      typeReproduction: 'copie',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      metaRobots: '',
      metaCanonical: '',
      descriptionNumero: '',
      estCleAPasse: false,
      prixCleAPasse: '',
      besoinPhoto: false,
      besoinNumeroCle: false,
      besoinNumeroCarte: false,
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.nom || !form.marque || form.prix === '' || !form.imageDataUrl) {
      setError('Veuillez remplir tous les champs obligatoires et sélectionner une image.');
      return;
    }
    // Regroupement des 5 métas dans un objet JSON
    const meta = {
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      metaKeywords: form.metaKeywords,
      metaRobots: form.metaRobots,
      metaCanonical: form.metaCanonical,
    };

    const dataToSend = {
      nom: form.nom,
      marque: form.marque,
      prix: Number(form.prix),
      cleAvecCartePropriete: form.cleAvecCartePropriete,
      ...(form.prixSansCartePropriete !== '' && { prixSansCartePropriete: Number(form.prixSansCartePropriete) }),
      imageUrl: form.imageDataUrl,
      referenceEbauche: form.referenceEbauche.trim() !== '' ? form.referenceEbauche : null,
      typeReproduction: form.typeReproduction,
      // Stockage du JSON des meta dans descriptionProduit
      descriptionProduit: JSON.stringify(meta),
      descriptionNumero: form.descriptionNumero,
      estCleAPasse: form.estCleAPasse,
      ...(form.estCleAPasse && form.prixCleAPasse !== '' && { prixCleAPasse: Number(form.prixCleAPasse) }),
      besoinPhoto: form.besoinPhoto,
      besoinNumeroCle: form.besoinNumeroCle,
      besoinNumeroCarte: form.besoinNumeroCarte,
    };

    try {
      setLoading(true);
      let response;
      if (editingProduct) {
        response = await fetch(`${BASE_URL}/produit/cles/update?nom=${encodeURIComponent(editingProduct.nom)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `Erreur ${response.status}: Une erreur est survenue lors de la modification.`;
          setError(errorMessage);
          return;
        }
        const updatedProduct = await response.json();
        setProducts((prev) =>
          prev.map((prod) => (prod.nom === editingProduct.nom ? updatedProduct : prod))
        );
      } else {
        response = await fetch(`${BASE_URL}/produit/cles/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `Erreur ${response.status}: Une erreur est survenue lors de l'ajout.`;
          setError(errorMessage);
          return;
        }
        const responseData = await response.json();
        setProducts((prev) => {
          if (!prev.some(prod => prod.id === responseData.id)) {
            const newProducts = [...prev, responseData];
            newProducts.sort((a, b) => b.id - a.id);
            return newProducts;
          }
          return prev;
        });
        setTotalKeys((prev) => (prev !== null ? prev + 1 : prev));
      }
      resetForm();
    } catch (err) {
      setError(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/produit/cles/count`);
        if (response.ok) {
          const data = await response.json();
          setTotalKeys(data.count);
        } else {
          console.error("Erreur lors de la récupération du nombre de clés :", response.status);
        }
      } catch (err) {
        console.error("Erreur dans fetchCount :", err);
      }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    if (totalKeys !== null) {
      for (let i = 0; i < totalKeys; i++) {
        fetch(`${BASE_URL}/produit/cles/index/${i}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((key) => {
            if (key) {
              setProducts((prev) => {
                if (!prev.some(prod => prod.id === key.id)) {
                  const newProducts = [...prev, key];
                  newProducts.sort((a, b) => b.id - a.id);
                  return newProducts;
                }
                return prev;
              });
            }
          })
          .catch((err) =>
            console.error(`Erreur dans fetchKeyByIndex pour index ${i} :`, err)
          );
      }
    }
  }, [totalKeys]);

  const filteredProducts = products.filter((prod) =>
    prod.nom.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );
  const displayedProducts = filteredProducts.slice(0, displayCount);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}
    >
      <Typography variant="h4" align="center" gutterBottom sx={{ color: primaryGreen }}>
        {editingProduct ? "Modifier l'article" : "Ajouter un article"}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mb: 4,
          p: { xs: 2, sm: 3 },
          border: `1px solid ${lightGreen}`,
          borderRadius: 2,
          backgroundColor: '#f1f8e9',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Marque"
              name="marque"
              value={form.marque}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Référence Ébauche"
              name="referenceEbauche"
              value={form.referenceEbauche}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          {/* Section Meta SEO */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: primaryGreen, mb: 1 }}>
              Meta SEO pour la page produit :
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Meta Title"
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Meta Description"
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Meta Keywords"
              name="metaKeywords"
              value={form.metaKeywords}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Meta Robots"
              name="metaRobots"
              value={form.metaRobots}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Meta Canonical"
              name="metaCanonical"
              value={form.metaCanonical}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            />
          </Grid>
          {form.typeReproduction === 'numero' && (
            <Grid item xs={12}>
              <TextField
                label="Description du numéro"
                name="descriptionNumero"
                value={form.descriptionNumero}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="cleAvecCartePropriete"
                  checked={form.cleAvecCartePropriete}
                  onChange={handleInputChange}
                  sx={{ color: primaryGreen, '&.Mui-checked': { color: primaryGreen } }}
                />
              }
              label="Clé avec carte de propriété"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Type de reproduction"
              name="typeReproduction"
              value={form.typeReproduction}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              SelectProps={{ native: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
            >
              <option value="copie">Copie</option>
              <option value="numero">Numéro</option>
              <option value="ia">IA</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="estCleAPasse"
                  checked={form.estCleAPasse}
                  onChange={handleInputChange}
                  sx={{ color: primaryGreen, '&.Mui-checked': { color: primaryGreen } }}
                />
              }
              label="Clé à passe"
            />
          </Grid>
          {form.estCleAPasse && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prix clé à passe (€)"
                name="prixCleAPasse"
                type="number"
                value={form.prixCleAPasse}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0 }}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: primaryGreen, mb: 1 }}>
              Exigences du produit :
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="besoinPhoto"
                  checked={form.besoinPhoto}
                  onChange={handleInputChange}
                  sx={{ color: primaryGreen, '&.Mui-checked': { color: primaryGreen } }}
                />
              }
              label="Exiger des photos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="besoinNumeroCle"
                  checked={form.besoinNumeroCle}
                  onChange={handleInputChange}
                  sx={{ color: primaryGreen, '&.Mui-checked': { color: primaryGreen } }}
                />
              }
              label="Exiger un numéro de clé"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="besoinNumeroCarte"
                  checked={form.besoinNumeroCarte}
                  onChange={handleInputChange}
                  sx={{ color: primaryGreen, '&.Mui-checked': { color: primaryGreen } }}
                />
              }
              label="Exiger un numéro de carte"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              sx={{ bgcolor: primaryGreen, '&:hover': { bgcolor: hoverGreen } }}
            >
              Télécharger une image
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </Button>
            {form.imageDataUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: primaryGreen }}>
                  Aperçu de l'image :
                </Typography>
                <Box
                  component="img"
                  src={form.imageDataUrl}
                  alt="Aperçu"
                  sx={{
                    width: { xs: '100%', sm: 120 },
                    height: 'auto',
                    mt: 1,
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                />
              </Box>
            )}
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ borderColor: primaryGreen, color: primaryGreen }}>
                {error}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ bgcolor: primaryGreen, '&:hover': { bgcolor: hoverGreen } }}
            >
              {loading
                ? editingProduct
                  ? "Modification en cours..."
                  : "Ajout en cours..."
                : editingProduct
                ? "Modifier"
                : "Ajouter"}
            </Button>
          </Grid>
          {editingProduct && (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                fullWidth
                onClick={resetForm}
                sx={{
                  borderColor: primaryGreen,
                  color: primaryGreen,
                  '&:hover': { borderColor: hoverGreen, color: hoverGreen },
                  mt: 1,
                }}
              >
                Annuler
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ color: primaryGreen }}>
        Liste des Produits
      </Typography>
      <Box sx={{ mb: 3, mt: 2 }}>
        <TextField
          label="Rechercher une clé"
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { borderColor: primaryGreen } }}
        />
      </Box>
      <Grid container spacing={2}>
        {displayedProducts.map((prod) => (
          <Grid item xs={12} sm={6} md={4} key={prod.id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              {prod.imageUrl && (
                <CardMedia
                  component="img"
                  image={prod.imageUrl}
                  alt={prod.nom}
                  sx={{ height: 180, objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: primaryGreen }}>
                  {prod.nom} (ID: {prod.id})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Marque : {prod.marque}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prix : {prod.prix} €
                </Typography>
                {prod.prixSansCartePropriete > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Prix sans carte propriété : {prod.prixSansCartePropriete} €
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Clé avec carte propriété : {prod.cleAvecCartePropriete ? "Oui" : "Non"}
                </Typography>
                {prod.referenceEbauche && (
                  <Typography variant="body2" color="text.secondary">
                    Référence ébauche : {prod.referenceEbauche}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Type de reproduction : {prod.typeReproduction}
                </Typography>
                {prod.typeReproduction === 'numero' && prod.descriptionNumero && (
                  <Typography variant="body2" color="text.secondary">
                    Description numéro : {prod.descriptionNumero}
                  </Typography>
                )}
                {/* Affichage de chaque élément meta séparément */}
                {prod.descriptionProduit && (() => {
                  try {
                    const meta = JSON.parse(prod.descriptionProduit);
                    return (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Meta Title : {meta.metaTitle || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Meta Description : {meta.metaDescription || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Meta Keywords : {meta.metaKeywords || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Meta Robots : {meta.metaRobots || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Meta Canonical : {meta.metaCanonical || '-'}
                        </Typography>
                      </>
                    );
                  } catch (err) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        Description produit : {prod.descriptionProduit}
                      </Typography>
                    );
                  }
                })()}
                <Typography variant="body2" color="text.secondary">
                  Clé à passe : {prod.estCleAPasse ? "Oui" : "Non"}
                </Typography>
                {prod.estCleAPasse && prod.prixCleAPasse && (
                  <Typography variant="body2" color="text.secondary">
                    Prix clé à passe : {prod.prixCleAPasse} €
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  onClick={() => handleEdit(prod)}
                  variant="outlined"
                  sx={{
                    borderColor: primaryGreen,
                    color: primaryGreen,
                    '&:hover': { borderColor: hoverGreen, color: hoverGreen },
                  }}
                >
                  Modifier
                </Button>
                <Button
                  onClick={() => {
                    if (window.confirm(`Voulez-vous vraiment supprimer la clé "${prod.nom}" ?`)) {
                      fetch(`${BASE_URL}/produit/cles/delete?nom=${encodeURIComponent(prod.nom)}`, { method: 'DELETE' })
                        .then((res) => {
                          if (res.ok) {
                            setProducts((prev) => prev.filter((p) => p.nom !== prod.nom));
                          } else {
                            console.error('Erreur lors de la suppression, status:', res.status);
                          }
                        })
                        .catch((err) => console.error("Erreur lors de la suppression :", err));
                    }
                  }}
                  variant="outlined"
                  sx={{
                    borderColor: primaryGreen,
                    color: primaryGreen,
                    '&:hover': { borderColor: hoverGreen, color: hoverGreen },
                  }}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {displayCount < filteredProducts.length && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setDisplayCount(displayCount + 10)}
            sx={{ bgcolor: primaryGreen, '&:hover': { bgcolor: hoverGreen } }}
          >
            Afficher 10 produits suivants
          </Button>
        </Box>
      )}
      {loading && <CircularProgress sx={{ mt: 2 }} />}
    </Container>
  );
};

export default Ajoutez;
