/// src/AppAdmin/CommandePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const socket = io('https://cl-back.onrender.com');

export default function CommandePage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  /** transforme Base64 en data-URI si besoin */
  const decodeImage = img =>
    img?.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;

  /** Fetch commandes payées */
  const fetchCommandes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid');
      const text = await res.text();

      if (!res.ok) {
        // essaye d’extraire un message d’erreur JSON
        let msg = `Status ${res.status}`;
        try {
          const json = JSON.parse(text);
          msg = json.detail || json.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const { data } = JSON.parse(text);
      // si data n’est pas un tableau, on le vide pour éviter le crash
      setCommandes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('RAW BACKEND ERROR:', e);
      setError(`Erreur lors du chargement des commandes : ${e.message}`);
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

  /** Ouvre le dialog d’annulation */
  const openCancel = cmd => {
    setToCancel(cmd);
    setCancelReason('');
    setOpenCancelDialog(true);
  };

  /** Envoie la requête d’annulation */
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Veuillez saisir une raison.');
      return;
    }
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${toCancel.numeroCommande}`,
        { method: 'DELETE' }
      );
      const text = await res.text();
      const json = JSON.parse(text);
      alert(json.success ? 'Commande annulée.' : 'Échec de l’annulation.');
      fetchCommandes();
    } catch (e) {
      console.error(e);
      alert(`Erreur réseau : ${e.message}`);
    } finally {
      setOpenCancelDialog(false);
    }
  };

  /** Génère un PDF simple via jsPDF */
  const generatePdf = cmd => {
    const doc = new jsPDF();
    doc.setFontSize(14).text('Facture de commande', 20, 20);
    doc.setFontSize(10).text(`Numéro : ${cmd.numeroCommande}`, 20, 30);
    doc.text(`Client : ${cmd.nom}`, 20, 35);
    doc.text(`Adresse : ${cmd.adressePostale}`, 20, 40);
    doc.autoTable({
      startY: 50,
      head: [['Produit', 'Qté', 'Prix TTC']],
      body: [
        [
          Array.isArray(cmd.cle) ? cmd.cle.join(', ') : cmd.cle || '—',
          cmd.quantity || 1,
          `${parseFloat(cmd.prix).toFixed(2)} €`
        ]
      ]
    });
    return doc;
  };

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

      {!loading && !error && commandes.length === 0 && (
        <Typography align="center">Aucune commande trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {commandes.map(cmd => (
          <Grid item xs={12} md={6} key={cmd.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {Array.isArray(cmd.cle) ? cmd.cle.join(', ') : cmd.cle}
                </Typography>
                <Typography>Client : {cmd.nom}</Typography>
                <Typography>
                  Prix TTC : {parseFloat(cmd.prix).toFixed(2)} €
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  onClick={() =>
                    window.open(generatePdf(cmd).output('dataurlnewwindow'))
                  }
                >
                  Voir Facture
                </Button>
                <Button onClick={() => generatePdf(cmd).save(`facture_${cmd.numeroCommande}.pdf`)}>
                  Télécharger
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

      {/* Dialog d’annulation */}
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
            variant="outlined"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Fermer</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={!cancelReason.trim()}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
