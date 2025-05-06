import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

const primaryGreen = '#2E7D32';
const hoverGreen = '#1B5E20';
const BASE_URL = 'https://cl-back.onrender.com';

const Commande = () => {
  const [form, setForm] = useState({
    nom: '',
    fraisDePort: '',
    quantite: '',
    prix: '',
    montantTVA: '',
    // Conditions de vente prédéfinies pour une vente en ligne
    conditionsDeVente: 'Conditions de vente pour une vente en ligne : paiement par CB uniquement.',
    // Mode de règlement fixé en "cb"
    modeDeReglement: 'cb',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commande, setCommande] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.nom || !form.fraisDePort || !form.quantite || !form.prix || !form.montantTVA) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const dataToSend = {
      nom: form.nom,
      fraisDePort: Number(form.fraisDePort),
      quantite: Number(form.quantite),
      prix: Number(form.prix),
      montantTVA: Number(form.montantTVA),
      conditionsDeVente: form.conditionsDeVente,
      modeDeReglement: form.modeDeReglement, // toujours "cb"
    };

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/commande/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = 
          errorData.message ||
          errorData.error ||
          `Erreur ${response.status} : Une erreur est survenue lors de la commande.`;
        setError(errorMessage);
        return;
      }
      const responseData = await response.json();
      setCommande(responseData);
      setForm({
        nom: '',
        fraisDePort: '',
        quantite: '',
        prix: '',
        montantTVA: '',
        conditionsDeVente: 'Conditions de vente pour une vente en ligne : paiement par CB uniquement.',
        modeDeReglement: 'cb',
      });
    } catch (err) {
      setError(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: primaryGreen }}>
        Commande
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          p: 3,
          border: `1px solid ${primaryGreen}`,
          borderRadius: 2,
        }}
      >
        <TextField
          label="Nom"
          name="nom"
          value={form.nom}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Frais de port (€)"
          name="fraisDePort"
          type="number"
          value={form.fraisDePort}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Quantité"
          name="quantite"
          type="number"
          value={form.quantite}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Prix (€)"
          name="prix"
          type="number"
          value={form.prix}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Montant de la TVA (€)"
          name="montantTVA"
          type="number"
          value={form.montantTVA}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Conditions de vente"
          name="conditionsDeVente"
          value={form.conditionsDeVente}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        {/* Le mode de règlement est fixé en "cb", donc pas d'input */}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, bgcolor: primaryGreen, '&:hover': { bgcolor: hoverGreen } }}
          disabled={loading}
        >
          {loading ? "Commande en cours..." : "Commander"}
        </Button>
      </Box>
      {commande && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ color: primaryGreen }}>
            Commande passée avec succès :
          </Typography>
          <pre>{JSON.stringify(commande, null, 2)}</pre>
        </Box>
      )}
    </Container>
  );
};

export default Commande;
