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
import logo from './logo.png';

const socket = io('https://cl-back.onrender.com');

const Commande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [commandeToCancel, setCommandeToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [zoom, setZoom] = useState(1);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Convertit un buffer en URL d'image
  const decodeImage = (img) =>
    img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;

  // Récupère la liste des commandes payées
  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid');
      if (!res.ok) throw new Error(`status ${res.status}`);
      const { data } = await res.json();
      setCommandes(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  };

  // Écoute des mises à jour via WebSocket
  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => socket.off('commandeUpdate', fetchCommandes);
  }, []);

  // Ouvre la boîte de dialogue pour annuler
  const openCancel = (cmd) => {
    setCommandeToCancel(cmd);
    setCancelReason('');
    setOpenCancelDialog(true);
  };

  // Confirme et envoie l'annulation
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Veuillez saisir une raison.');
      return;
    }
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE' }
      );
      const { success } = await res.json();
      alert(success ? 'Commande annulée.' : 'Échec de l’annulation.');
      fetchCommandes();
    } catch (e) {
      console.error(e);
      alert('Erreur réseau');
    } finally {
      setOpenCancelDialog(false);
    }
  };

  // Ouvre la boîte de dialogue pour afficher l'image
  const openImage = (img) => {
    setSelectedImage(decodeImage(img));
    setZoom(1);
    setOpenImageDialog(true);
  };

  // Gère le zoom avec la molette
  const onWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  // Génère le PDF de la facture
  const generatePdf = (cmd) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const m = 15;
    // En-tête
    doc.setFillColor(27, 94, 32);
    doc.rect(0, m, 210, 40, 'F');
    doc.addImage(logo, 'PNG', m, m, 32, 32);
    doc.setTextColor(255, 255, 255).setFontSize(8);
    doc.text(
      ['MAISON BOUVET', '20 rue de Lévis', '75017 Paris', 'Tél : 01 42 67 47 28', 'contact@cleservice.com'],
      m + 37,
      m + 12,
      { lineHeightFactor: 1.5 }
    );
    // Coordonnées client
    doc.setTextColor(0).setFontSize(8);
    const rightX = 210 - m;
    [cmd.nom, cmd.adressePostale, `Tél : ${cmd.telephone}`, `Email : ${cmd.adresseMail}`]
      .filter(Boolean)
      .forEach((t, i) => doc.text(t, rightX, m + 17 + i * 5, { align: 'right' }));
    // Tableau récapitulatif
    const yStart = m + 45;
    const prix = parseFloat(cmd.prix);
    const port = cmd.shippingMethod === 'expedition' ? 8 : 0;
    doc.autoTable({
      startY: yStart,
      head: [['Produit', 'Qté', 'PU', 'Port', 'TTC']],
      body: [
        [
          cmd.produitCommande || cmd.cle.join(', '),
          cmd.quantity,
          `${(prix / cmd.quantity).toFixed(2)} €`,
          `${port.toFixed(2)} €`,
          `${(prix - port).toFixed(2)} €`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [27, 94, 32], textColor: 255 },
      margin: { left: m, right: m },
    });
    return doc;
  };

  const viewPdf = (cmd) => window.open(generatePdf(cmd).output('dataurlnewwindow'));
  const downloadPdf = (cmd) => generatePdf(cmd).save(`facture_${cmd.numeroCommande}.pdf`);
  const printPdf = (cmd) => {
    const doc = generatePdf(cmd);
    doc.autoPrint();
    window.open(doc.output('bloburl'));
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Commandes Payées
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && commandes.length === 0 && (
        <Typography>Aucune commande trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {commandes.map((cmd) => (
          <Grid item xs={12} key={cmd.id}>
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
                <Typography>Prix : {parseFloat(cmd.prix).toFixed(2)} €</Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={() => viewPdf(cmd)}>
                  Voir Facture
                </Button>
                <Button variant="outlined" onClick={() => downloadPdf(cmd)}>
                  Télécharger
                </Button>
                <Button variant="outlined" onClick={() => printPdf(cmd)}>
                  Imprimer
                </Button>
                <Button color="error" startIcon={<CancelIcon />} onClick={() => openCancel(cmd)}>
                  Annuler
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogue d'annulation */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)} fullScreen={fullScreen}>
        <DialogTitle>Annuler la commande</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Raison"
            fullWidth
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'image zoomable */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} fullScreen={fullScreen} onWheel={onWheel}>
        <DialogActions>
          <IconButton onClick={() => setOpenImageDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={selectedImage}
            sx={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;

