import React, { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './logo.png';

const socket = io('https://cl-back.onrender.com');

const Commande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openCancel, setOpenCancel] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [zoom, setZoom] = useState(1);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = img =>
    img ? (img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`) : '';

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setCommandes(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => socket.off('commandeUpdate');
  }, []);

  const openCancelDialog = cmd => {
    setToCancel(cmd);
    setCancelReason('');
    setOpenCancel(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) return;
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${toCancel.numeroCommande}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error();
      fetchCommandes();
    } catch {
      alert('Erreur lors de l\'annulation.');
    }
    setOpenCancel(false);
  };

  const handleImageClick = url => {
    setSelectedImage(url);
    setZoom(1);
    setOpenImage(true);
  };

  const handleWheel = e => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  const generateInvoice = cmd => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const m = 15;
    doc.setFillColor(27, 94, 32);
    doc.rect(0, m, 210, 40, 'F');
    doc.addImage(logo, 'PNG', m, m, 32, 32);
    doc.setFontSize(8).setTextColor(255);
    doc.text(
      [
        'MAISON BOUVET',
        '20 rue de Lévis',
        '75017 Paris',
        'Tél : 01 42 67 47 28',
        'Email : contact@cleservice.com',
      ],
      m + 37,
      m + 12,
      { lineHeightFactor: 1.5 }
    );
    const rightX = 210 - m;
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0);
    doc.text('Facturé à :', rightX, m + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal').setFontSize(8);
    [
      cmd.nom,
      cmd.adressePostale,
      cmd.telephone ? `Tél : ${cmd.telephone}` : '',
      cmd.adresseMail ? `Email : ${cmd.adresseMail}` : '',
    ]
      .filter(Boolean)
      .forEach((line, i) =>
        doc.text(line, rightX, m + 17 + i * 5, { align: 'right' })
      );
    let y = m + 45;
    const prod = Array.isArray(cmd.cle) ? cmd.cle.join(', ') : cmd.cle || 'N/A';
    const qte = cmd.quantity || 1;
    const prix = parseFloat(cmd.prix) || 0;
    const unit = (prix / qte).toFixed(2) + ' €';
    const frais = cmd.fraisLivraison
      ? `${parseFloat(cmd.fraisLivraison).toFixed(2)} €`
      : '0.00 €';
    const total = (prix + (parseFloat(cmd.fraisLivraison) || 0)).toFixed(2) + ' €';
    doc.autoTable({
      startY: y,
      head: [['Produit', 'Quantité', 'Prix unitaire', 'Frais port', 'Total TTC']],
      body: [[prod, qte.toString(), unit, frais, total]],
      margin: { left: m, right: m },
      headStyles: { fillColor: [27, 94, 32], textColor: 255 },
      styles: { fontSize: 9 },
    });
    return doc;
  };

  const showInvoice = cmd =>
    window.open(generateInvoice(cmd).output('dataurlnewwindow'), '_blank');
  const downloadInvoice = cmd =>
    generateInvoice(cmd).save(`facture_${cmd.numeroCommande}.pdf`);
  const printInvoice = cmd => {
    const d = generateInvoice(cmd);
    d.autoPrint();
    window.open(d.output('bloburl'), '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, fontFamily: 'Poppins,sans-serif', backgroundColor: 'rgba(240,255,245,0.5)' }}>
      <Typography variant="h4" align="center" sx={{ color: 'green.700', fontWeight: 600 }}>
        Commandes Payées
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="success" />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !commandes.length && !error && (
        <Typography align="center">Aucune commande payée trouvée.</Typography>
      )}
      <Grid container spacing={3}>
        {commandes.map(cmd => (
          <Grid item xs={12} key={cmd.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, border: '1px solid', borderColor: 'green.100' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>
                  Nom du produit :
                </Typography>
                <Typography>{Array.isArray(cmd.cle) ? cmd.cle.join(', ') : cmd.cle}</Typography>
                {/* ... autres champs client, images, etc. */}
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', backgroundColor: 'green.50', p: 2 }}>
                <Button onClick={() => showInvoice(cmd)}>Afficher Facture</Button>
                <Button onClick={() => downloadInvoice(cmd)}>Télécharger PDF</Button>
                <Button onClick={() => printInvoice(cmd)}>Imprimer</Button>
                <Button
                  startIcon={<CancelIcon />}
                  color="error"
                  onClick={() => openCancelDialog(cmd)}
                >
                  Annuler
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog Annulation */}
      <Dialog open={openCancel} onClose={() => setOpenCancel(false)} fullScreen={fullScreen}>
        <DialogTitle>Annuler la commande</DialogTitle>
        <DialogContent>
          <TextField
            label="Raison de l'annulation"
            fullWidth
            multiline
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancel(false)}>Annuler</Button>
          <Button color="error" onClick={confirmCancel} disabled={!cancelReason.trim()}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Zoom Image */}
      <Dialog
        open={openImage}
        onClose={() => setOpenImage(false)}
        fullScreen={fullScreen}
        onWheel={handleWheel}
      >
        <DialogActions>
          <IconButton onClick={() => setOpenImage(false)}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
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
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;

