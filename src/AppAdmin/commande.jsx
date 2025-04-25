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

// Socket.IO : transports et CORS explicites
const socket = io('https://cl-back.onrender.com', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  path: '/socket.io',
});

const Commande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [commandeToCancel, setCommandeToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [zoom, setZoom] = useState(1);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = (img) =>
    img
      ? img.startsWith('data:')
        ? img
        : `data:image/jpeg;base64,${img}`
      : '';

  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid', {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      const text = await res.text();

      if (!res.ok) {
        let msg = `Erreur serveur (status ${res.status})`;
        try {
          const errJson = JSON.parse(text);
          msg = errJson.message || errJson.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const json = JSON.parse(text);
      if (!Array.isArray(json.data)) {
        throw new Error('Format de réponse inattendu');
      }
      setCommandes(json.data);
    } catch (err) {
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

  const openCancelDialog = (commande) => {
    setCommandeToCancel(commande);
    setCancellationReason('');
    setOpenDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!commandeToCancel || !cancellationReason.trim()) {
      alert("Veuillez saisir une raison d'annulation.");
      return;
    }
    try {
      const resp = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        }
      );
      const data = await resp.json();
      alert(data.success ? 'Commande annulée avec succès.' : 'Erreur lors de l\'annulation.');
      fetchCommandes();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'annulation.');
    } finally {
      setOpenDialog(false);
      setCommandeToCancel(null);
      setCancellationReason('');
    }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setZoom(1);
    setOpenImageDialog(true);
  };
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  const generateInvoiceDoc = (c) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const m = 15;
    doc.setFillColor(27, 94, 32);
    doc.rect(0, m, 210, 40, 'F');
    doc.addImage(logo, 'PNG', m, m, 32, 32);

    doc.setFontSize(8).setTextColor(255, 255, 255);
    doc.text(
      [
        'REPRODUCTION EN LIGNE',
        'www.votresite-reproduction.com',
        'Service en ligne de reproductions',
        'Tél : 01 42 67 47 28',
        'Email : contact@reproduction.com',
      ],
      m + 32 + 5,
      m + 12,
      { lineHeightFactor: 1.5 }
    );

    const rightX = 210 - m;
    doc.setFont('helvetica', 'bold').setFontSize(10);
    doc.text('Facturé à :', rightX, m + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal').setFontSize(8);
    [
      c.nom || '',
      c.adressePostale || '',
      `Tél : ${c.telephone || ''}`,
      `Email : ${c.adresseMail || ''}`,
    ].forEach((t, i) =>
      doc.text(t, rightX, m + 17 + i * 5, { align: 'right' })
    );

    const dateCmd = c.createdAt
      ? new Date(c.createdAt).toLocaleDateString('fr-FR')
      : 'Non renseignée';
    doc.setFontSize(9).setTextColor(27, 94, 32);
    doc.text(`Date de commande : ${dateCmd}`, m, m + 45);

    let y = m + 55;
    doc.autoTable({
      startY: y,
      head: [['Article', 'Quantité', 'Prix unitaire', 'Sous-total']],
      body: (c.cle || []).map((item) => [
        item,
        c.quantity || 1,
        `${c.prix.toFixed(2)} €`,
        `${(c.prix * (c.quantity || 1)).toFixed(2)} €`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [27, 94, 32], textColor: 255 },
      styles: { fontSize: 10, halign: 'left' },
      margin: { left: m, right: m },
    });
    y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12).setTextColor(27, 94, 32);
    doc.text('Total TTC', rightX - 80, y);
    doc.text(`${((c.prix * (c.quantity || 1)) * 1.2).toFixed(2)} €`, rightX, y, {
      align: 'right',
    });

    return doc;
  };

  const showInvoice = (c) =>
    window.open(generateInvoiceDoc(c).output('dataurlnewwindow'), '_blank');
  const downloadInvoice = (c) =>
    generateInvoiceDoc(c).save(`facture_${c.numeroCommande}.pdf`);
  const printInvoice = (c) => {
    const d = generateInvoiceDoc(c);
    d.autoPrint();
    window.open(d.output('bloburl'), '_blank');
  };

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
                  {Array.isArray(c.cle) ? c.cle.join(', ') : c.cle || 'Non renseigné'}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}
                >
                  Informations Client :
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'green.800' }}>
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
                  <Typography>{c.adressePostale.split(',')[0].trim()}</Typography>
                </Box>
              </CardContent>

              <CardActions
                sx={{ justifyContent: 'space-between', backgroundColor: 'green.50', p: 2 }}
              >
                <Button variant="contained" onClick={() => showInvoice(c)}>
                  Afficher Facture
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => downloadInvoice(c)}
                >
                  Télécharger Facture
                </Button>
                <Button variant="contained" color="info" onClick={() => printInvoice(c)}>
                  Imprimer Facture
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CancelIcon />}
                  sx={{
                    borderRadius: 20,
                    backgroundColor: 'red.400',
                    '&:hover': { backgroundColor: 'red.600' },
                  }}
                  onClick={() => openCancelDialog(c)}
                >
                  Annuler la commande
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={fullScreen}
        PaperProps={{ sx: { borderRadius: 3, p: 2, backgroundColor: 'green.50' } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'green.800' }}>
          Confirmer l'annulation
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Raison de l'annulation"
            fullWidth
            variant="outlined"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="success">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={!cancellationReason.trim()}
          >
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        fullScreen={fullScreen}
        maxWidth="lg"
        onWheel={handleWheel}
        PaperProps={{
          sx: {
            p: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          },
        }}
      >
        <DialogActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setOpenImageDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={decodeImage(selectedImage)}
              alt="Zoom"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s',
                transformOrigin: 'center',
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;
