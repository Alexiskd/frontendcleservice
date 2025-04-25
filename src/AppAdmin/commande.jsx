import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './logo.png';

const socket = io('https://cl-back.onrender.com');

const Commande = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [commandeToCancel, setCommandeToCancel] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [zoom, setZoom] = useState(1);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = (img: string | undefined) =>
    img
      ? img.startsWith('data:')
        ? img
        : `data:image/jpeg;base64,${img}`
      : '';

  // Nouvelle version de fetchCommandes
  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid', {
        headers: { Accept: 'application/json' },
      });

      // On lit toujours le texte du body
      const text = await res.text();

      if (!res.ok) {
        // Si le serveur a renvoyé un message, on l'affiche, sinon on affiche le code
        const msg = text.trim() || `Erreur serveur (status ${res.status})`;
        throw new Error(msg);
      }

      // Parse JSON
      const json = JSON.parse(text);
      if (!Array.isArray(json.data)) {
        throw new Error('Format de réponse inattendu');
      }

      setCommandes(json.data);
    } catch (err: any) {
      console.error('fetchCommandes:', err);
      setCommandes([]);
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => {
      socket.off('commandeUpdate', fetchCommandes);
    };
  }, []);

  // (Le reste de vos handlers pour annulation, zoom, PDF reste inchangé…)

  // On trie par createdAt décroissant
  const sorted = [...commandes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        fontFamily: '"Poppins", sans-serif',
        backgroundColor: 'rgba(240,255,245,0.5)',
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: 'green.700', fontWeight: 600 }}
      >
        Détails des Commandes Payées
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="success" />
        </Box>
      )}

      {error && (
        <Box sx={{ my: 2 }}>
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={fetchCommandes}>
            Réessayer
          </Button>
        </Box>
      )}

      {!loading && !error && sorted.length === 0 && (
        <Typography align="center">Aucune commande payée trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {sorted.map((c) => (
          <Grid item xs={12} key={c.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'green.100',
                overflow: 'hidden',
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}
                >
                  Produit Commandé :
                </Typography>
                <Typography mb={2}>
                  {Array.isArray(c.cle)
                    ? c.cle.join(', ')
                    : c.cle || 'Non renseigné'}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}
                >
                  Informations Client :
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: 'green.800' }}
                >
                  {c.nom}
                </Typography>
                <Typography sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}>
                  Numéro de commande : {c.numeroCommande || 'Non renseigné'}
                </Typography>
                <Typography sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}>
                  Date de commande :{' '}
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('fr-FR')
                    : 'Non renseignée'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LocationOnIcon sx={{ color: 'green.500', mr: 1 }} />
                  <Typography>
                    {c.adressePostale.split(',')[0].trim()}
                  </Typography>
                </Box>
              </CardContent>

              {/* ... vos CardActions pour PDF et Annulation ... */}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogs Annulation & Zoom Image inchangés */}
    </Container>
  );
};

export default Commande;
