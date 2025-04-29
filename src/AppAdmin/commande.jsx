// src/AppAdmin/Commande.jsx

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
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Placez logo.png dans /public pour qu'il soit servi à la racine
const logoUrl = '/logo.png';

// Configurez le socket vers votre backend
const socket = io('https://cl-back.onrender.com');

export default function Commande() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [zoom, setZoom] = useState(1);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Helper pour décoder Base64 ou data URI
  const decodeImage = (img) =>
    img?.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;

  // Récupération des commandes payées
  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid');
      const text = await res.text();
      if (!res.ok) {
        let msg = `Status ${res.status}`;
        try {
          const json = JSON.parse(text);
          msg = json.detail || json.message || msg;
        } catch {
          // on garde le status simple
        }
        throw new Error(msg);
      }
      const { data } = JSON.parse(text);
      // Ajout de "produitCommande" et "createdAt" pour le front
      const mapped = data.map((cmd) => ({
        ...cmd,
        produitCommande: Array.isArray(cmd.cle)
          ? cmd.cle.join(', ')
          : cmd.cle || '',
        createdAt: cmd.createdAt,
      }));
      setCommandes(mapped);
    } catch (e) {
      console.error('RAW BACKEND ERROR:', e);
      setError(`Erreur lors du chargement des commandes : ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Effet de chargement + WebSocket
  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => {
      socket.off('commandeUpdate', fetchCommandes);
    };
  }, []);

  // Ouvre le dialog d'annulation
  const openCancel = (cmd) => {
    setToCancel(cmd);
    setCancelReason('');
    setOpenCancelDialog(true);
  };

  // Gère l'annulation
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
      let success = false;
      try {
        success = JSON.parse(text).success;
      } catch {
        throw new Error(text);
      }
      alert(success ? 'Commande annulée.' : 'Échec de l’annulation.');
      fetchCommandes();
    } catch (e) {
      console.error(e);
      alert(`Erreur réseau : ${e.message}`);
    } finally {
      setOpenCancelDialog(false);
    }
  };

  // Ouvre le dialog image + zoom
  const openImage = (img) => {
    setSelectedImage(decodeImage(img));
    setZoom(1);
    setOpenImageDialog(true);
  };
  const onWheel = (e) => {
    e.preventDefault();
    setZoom((z) =>
      Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3)
    );
  };

  // Génère un PDF de facture via jsPDF
  const generatePdf = (cmd) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const m = 15;
    doc.setFillColor(27, 94, 32).rect(0, m, 210, 40, 'F');
    doc.addImage(logoUrl, 'PNG', m, m, 32, 32);

    // En-tête texte blanc
    doc.setTextColor(255, 255, 255).setFontSize(8);
    doc.text(
      [
        'MAISON BOUVET',
        '20 rue de Lévis, 75017 Paris',
        'Tél : 01 42 67 47 28',
        'contact@cleservice.com',
      ],
      m + 37,
      m + 12,
      { lineHeightFactor: 1.5 }
    );

    // Coordonnées client
    doc.setTextColor(0).setFontSize(8);
    const rightX = 210 - m;
    [
      cmd.nom,
      cmd.adressePostale,
      `Tél : ${cmd.telephone}`,
      `Email : ${cmd.adresseMail}`,
    ]
      .filter(Boolean)
      .forEach((t, i) =>
        doc.text(t, rightX, m + 17 + i * 5, { align: 'right' })
      );

    // Tableau produits
    const yStart = m + 45;
    const prix = parseFloat(cmd.prix);
    const port = cmd.shippingMethod === 'expedition' ? 8 : 0;
    doc.autoTable({
      startY: yStart,
      head: [['Produit', 'Qté', 'PU', 'Port', 'TTC']],
      body: [
        [
          cmd.produitCommande,
          cmd.quantity,
          `${(prix / cmd.quantity).toFixed(2)} €`,
          `${port.toFixed(2)} €`,
          `${prix.toFixed(2)} €`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [27, 94, 32], textColor: 255 },
      margin: { left: m, right: m },
    });

    return doc;
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Commandes Payées
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && commandes.length === 0 && (
        <Typography align="center">Aucune commande trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {commandes.map((cmd) => (
          <Grid item xs={12} md={6} key={cmd.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cmd.produitCommande}</Typography>
                <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
                  {cmd.urlPhotoRecto && (
                    <Box
                      component="img"
                      src={decodeImage(cmd.urlPhotoRecto)}
                      sx={{ width: 80, height: 80, cursor: 'pointer' }}
                      onClick={() => openImage(cmd.urlPhotoRecto)}
                    />
                  )}
                  {cmd.urlPhotoVerso && (
                    <Box
                      component="img"
                      src={decodeImage(cmd.urlPhotoVerso)}
                      sx={{ width: 80, height: 80, cursor: 'pointer' }}
                      onClick={() => openImage(cmd.urlPhotoVerso)}
                    />
                  )}
                </Box>
                <Typography>
                  Prix : {parseFloat(cmd.prix).toFixed(2)} €
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={() =>
                    window.open(generatePdf(cmd).output('dataurlnewwindow'))
                  }
                >
                  Voir Facture
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    generatePdf(cmd).save(
                      `facture_${cmd.numeroCommande}.pdf`
                    )
                  }
                >
                  Télécharger
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    (function (d) {
                      d.autoPrint();
                      window.open(d.output('bloburl'));
                    })(generatePdf(cmd))
                  }
                >
                  Imprimer
                </Button>
                <Button
                  color="error"
                  startIcon={<CancelIcon />}
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
            margin="dense"
            label="Raison de l'annulation"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Annuler</Button>
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

      {/* Dialog zoom image */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        fullScreen={fullScreen}
        onWheel={onWheel}
      >
        <DialogActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setOpenImageDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={selectedImage}
            sx={{
              maxWidth: '100%',
              maxHeight: '80vh',
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s',
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}


