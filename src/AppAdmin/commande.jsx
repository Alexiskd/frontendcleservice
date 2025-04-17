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
    img ? (img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`) : '';

  // Récupère les commandes payées
  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://cl-back.onrender.com/commande/paid', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Erreur (status ${response.status})`);
      const json = await response.json();
      setCommandes(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (err) {
      console.error(err);
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

  // Ouvre le dialog d'annulation
  const openCancelDialog = (commande) => {
    setCommandeToCancel(commande);
    setCancellationReason('');
    setOpenDialog(true);
  };

  // Confirme l'annulation
  const handleConfirmCancel = async () => {
    if (!commandeToCancel || !cancellationReason.trim()) {
      alert("Veuillez saisir une raison d'annulation.");
      return;
    }
    try {
      const resp = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
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

  // Affiche l'image en grand et permet le zoom
  const handleImageClick = (url) => {
    setSelectedImage(url);
    setZoom(1);
    setOpenImageDialog(true);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  // Ouvre un PDF dans un nouvel onglet
  const handlePdfDisplay = (path) =>
    window.open(`https://cl-back.onrender.com/${path.replace(/\\/g, '/')}`, '_blank');

  // Génère la facture PDF
  const generateInvoiceDoc = (commande) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const m = 15;

    // En-tête
    doc.setFillColor(27, 94, 32);
    doc.rect(0, m, 210, 40, 'F');
    doc.addImage(logo, 'PNG', m, m, 32, 32);

    // Texte gauche
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

    // Texte droite
    const rightX = 210 - m;
    doc
      .setFont('helvetica', 'bold')
      .setFontSize(10)
      .text('Facturé à :', rightX, m + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal').setFontSize(8);
    [
      'CROHIN AMELIE',
      '2 bis rue Folyette, 80170 BEAUFORT EN SANTERRE',
      'Tél : 0613404007',
      'Email : ameliecrohin@gmail.com',
    ].forEach((t, i) =>
      doc.text(t, rightX, m + 17 + i * 5, { align: 'right' })
    );

    // Date d'enregistrement
    const dateEnregistrement = commande.createdAt
      ? new Date(commande.createdAt).toLocaleDateString()
      : 'Non renseignée';
    doc.setFontSize(9).setTextColor(27, 94, 32);
    doc.text(`Date de commande : ${dateEnregistrement}`, m, m + 45);

    // Détails de la commande
    let y = m + 55;
    doc.autoTable({
      startY: y,
      head: [['Article', 'Marque', 'Quantité', 'Sous-total']],
      body: [['Article', 'Reproduction En Ligne', '1', '156.67 €']],
      theme: 'grid',
      headStyles: { fillColor: [27, 94, 32], textColor: 255 },
      styles: { fontSize: 12, halign: 'left' },
      margin: { left: m, right: m },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Totaux
    doc.setFontSize(12).setTextColor(27, 94, 32);
    doc.text('Sous-total', rightX - 80, y);
    doc.text('156.67 €', rightX, y, { align: 'right' });
    doc.text('Frais de livraison', rightX - 80, (y += 7));
    doc.text('0.00 €', rightX, y, { align: 'right' });
    doc
      .setFont('helvetica', 'bold')
      .text('Total TTC', rightX - 80, (y += 7));
    doc.text('188.00 €', rightX, y, { align: 'right' });
    doc
      .setFont('helvetica', 'normal')
      .text('TVA', rightX - 80, (y += 7));
    doc.text('31.33 €', rightX, y, { align: 'right' });

    // Conditions générales
    y += 15;
    const cond =
      "CONDITIONS GÉNÉRALES DE VENTE: Merci d'avoir commandé sur notre site de reproduction en ligne. Vos documents seront reproduits avec soin. En cas de retard de paiement, des pénalités pourront être appliquées.";
    doc.setFontSize(10).setTextColor(27, 94, 32);
    doc.text(doc.splitTextToSize(cond, 180), 105, y, { align: 'center' });
    doc.text(
      'Bonne journée.',
      105,
      y + doc.splitTextToSize(cond, 180).length * 5,
      { align: 'center' }
    );

    return doc;
  };

  // Actions facture
  const showInvoice = (c) =>
    window.open(generateInvoiceDoc(c).output('dataurlnewwindow'), '_blank');
  const downloadInvoice = (c) =>
    generateInvoiceDoc(c).save(`facture_${c.numeroCommande}.pdf`);
  const printInvoice = (c) => {
    const d = generateInvoiceDoc(c);
    d.autoPrint();
    window.open(d.output('bloburl'), '_blank');
  };

  // Tri décroissant
  const sorted = [...commandes].sort((a, b) => b.id.localeCompare(a.id));

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

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && sorted.length === 0 && !error && (  
        <Typography align="center">
          Aucune commande payée trouvée.
        </Typography>
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
              <CardContent sx={{ backgroundColor: 'white' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}
                >
                  Produit Commandé :
                </Typography>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <Typography>
                    {Array.isArray(c.cle) ? c.cle.join(', ') : c.cle || 'Non renseigné'}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}
                >
                  Informations Client :
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: 'green.800' }}
                  >
                    {c.nom}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}
                  >
                    Numéro de commande : {c.numeroCommande || 'Non renseigné'}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}
                  >
                    Date de commande :{' '}
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : 'Non renseignée'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <LocationOnIcon sx={{ color: 'green.500', mr: 1 }} />
                    <Typography>
                      {c.adressePostale.split(',')[0].trim()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <CardActions
                sx={{ justifyContent: 'space-between', backgroundColor: 'green.50', p: 2 }}
              >
                <Button variant="contained" color="primary" onClick={() => showInvoice(c)}>
                  Afficher Facture
                </Button>
                <Button variant="contained" color="secondary" onClick={() => downloadInvoice(c)}>
                  Télécharger Facture
                </Button>
                <Button variant="contained" color="info" onClick={() => printInvoice(c)}>
                  Imprimer Facture
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: 20, backgroundColor: 'red.400', '&:hover': { backgroundColor: 'red.600' } }}
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
        onClose={() => {
          setOpenImageDialog(false);
          setZoom(1);
        }}
        fullScreen={fullScreen}
        maxWidth="lg"
        fullWidth
        onWheel={handleWheel}
        sx={{
          p: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        <DialogActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => {
            setOpenImageDialog(false);
            setZoom(1);
          }}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Enlargi"
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


