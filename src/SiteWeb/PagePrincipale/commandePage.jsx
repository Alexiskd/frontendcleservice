// src/AppAdmin/CommandePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './logo.png';

const socket = io('https://cl-back.onrender.com');

export default function CommandePage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [commandeToCancel, setCommandeToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [zoom, setZoom] = useState(1);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = img =>
    img?.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;

  const fetchCommandes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid');
      if (!res.ok) {
        throw new Error(
          res.status === 500
            ? 'Erreur interne du serveur, réessayez plus tard.'
            : `Erreur ${res.status}`
        );
      }
      const json = await res.json();
      if (!Array.isArray(json.data)) {
        console.error('Réponse inattendue:', json);
        setCommandes([]);
      } else {
        setCommandes(json.data);
      }
    } catch (e) {
      setError(e.message);
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => {
      socket.off('commandeUpdate', fetchCommandes);
    };
  }, [fetchCommandes]);

  const openCancel = cmd => {
    setCommandeToCancel(cmd);
    setCancellationReason('');
    setOpenCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellationReason.trim()) {
      return alert('Veuillez saisir une raison.');
    }
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      alert(json.success ? 'Commande annulée.' : 'Échec de l’annulation.');
      await fetchCommandes();
    } catch {
      alert('Erreur réseau.');
    } finally {
      setOpenCancelDialog(false);
      setCommandeToCancel(null);
    }
  };

  const handleImageClick = url => {
    setSelectedImage(decodeImage(url));
    setZoom(1);
    setOpenImageDialog(true);
  };

  const handleWheel = e => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  // Tri décroissant par id (ou crééAt)
  const sortedCommandes = Array.isArray(commandes)
    ? [...commandes].sort((a, b) => b.id.localeCompare(a.id))
    : [];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Commandes Payées
      </Typography>

      {loading && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && sortedCommandes.length === 0 && (
        <Typography align="center">Aucune commande payée trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {sortedCommandes.map(cmd => (
          <Grid item xs={12} md={6} key={cmd.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {Array.isArray(cmd.cle) ? cmd.cle.join(', ') : cmd.cle || '—'}
                </Typography>
                <Typography>Client : {cmd.nom}</Typography>
                <Typography>Prix TTC : {parseFloat(cmd.prix).toFixed(2)} €</Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button onClick={() => handleImageClick(cmd.urlPhotoRecto)}>
                  Voir Photo
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  color="error"
                  onClick={() => openCancel(cmd)}
                >
                  Annuler
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog d'annulation */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        fullScreen={fullScreen}
      >
        <DialogTitle>Annuler la commande</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Raison de l'annulation"
            fullWidth
            value={cancellationReason}
            onChange={e => setCancellationReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Fermer</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={!cancellationReason.trim()}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog zoom image */}
      <Dialog
        open={openImageDialog}
        onClose={() => {
          setOpenImageDialog(false);
          setZoom(1);
        }}
        fullScreen={fullScreen}
        onWheel={handleWheel}
      >
        <DialogActions>
          <IconButton
            onClick={() => {
              setOpenImageDialog(false);
              setZoom(1);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Zoom"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
