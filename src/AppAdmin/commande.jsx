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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  // Décodage Base64 / data URI
  const decodeImage = img => {
    if (!img) return '';
    if (img.startsWith('data:')) return img;
    return `data:image/png;base64,${img}`;
  };

  const fetchCommandes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        if (res.status === 500) {
          throw new Error('Erreur interne du serveur. Réessayez plus tard.');
        }
        throw new Error(`Erreur (status ${res.status})`);
      }
      const { data } = await res.json();
      setCommandes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => socket.off('commandeUpdate');
  }, [fetchCommandes]);

  const openCancelDialog = commande => {
    setCommandeToCancel(commande);
    setCancellationReason('');
    setOpenDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!commandeToCancel || !cancellationReason.trim()) {
      return alert("Veuillez saisir une raison d'annulation.");
    }
    try {
      const resp = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
      );
      const { success } = await resp.json();
      alert(success ? 'Commande annulée.' : 'Erreur lors de l\'annulation.');
      fetchCommandes();
    } catch {
      alert('Erreur lors de l\'annulation.');
    } finally {
      setOpenDialog(false);
    }
  };

  const handleImageClick = url => {
    setSelectedImage(url);
    setZoom(1);
    setOpenImageDialog(true);
  };

  const handleWheel = e => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  const generateInvoiceDoc = commande => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const m = 15;
    // En-tête
    doc.setFillColor(27,94,32).rect(0,m,210,40,'F');
    // Infos site
    doc.setFontSize(8).setTextColor(255,255,255);
    doc.text(
      [
        'REPRODUCTION EN LIGNE',
        'www.votresite-reproduction.com',
        'Service en ligne de reproductions',
        'Tél : 01 42 67 47 28',
        'Email : contact@reproduction.com',
      ],
      m + 37,
      m + 12,
      { lineHeightFactor: 1.5 }
    );
    // Infos client
    const rightX = 210 - m;
    doc.setFont('helvetica','bold').setFontSize(10)
       .text('Facturé à :', rightX, m + 12, { align:'right' });
    doc.setFont('helvetica','normal').setFontSize(8);
    [
      commande.nom,
      commande.adressePostale,
      commande.telephone && `Tél : ${commande.telephone}`,
      commande.adresseMail && `Email : ${commande.adresseMail}`,
    ].filter(Boolean).forEach((t,i) =>
      doc.text(t, rightX, m + 17 + i*5, { align:'right' })
    );
    // Date de commande
    const date = commande.createdAt
      ? new Date(commande.createdAt).toLocaleDateString('fr-FR')
      : 'Non renseignée';
    doc.setFontSize(9).setTextColor(27,94,32)
       .text(`Date de commande : ${date}`, m, m + 45);
    // Détails
    let y = m + 55;
    const article = Array.isArray(commande.cle) ? commande.cle.join(', ') : (commande.cle || 'Article');
    const marque = commande.marque || 'Reproduction En Ligne';
    const qt = commande.quantity || 1;
    const ttc = parseFloat(commande.prix) || 0;
    const ht = (ttc / 1.2).toFixed(2);
    doc.autoTable({
      startY: y,
      head: [['Article','Marque','Quantité','Sous-total']],
      body: [[article, marque, qt, `${ht} €`]],
      theme: 'grid',
      headStyles: { fillColor:[27,94,32], textColor:255 },
      styles: { fontSize:12, halign:'left' },
      margin: { left:m, right:m }
    });
    y = doc.lastAutoTable.finalY + 10;
    // Totaux
    const frais = 0.00;
    const tva = (ttc - ht).toFixed(2);
    doc.setFontSize(12).setTextColor(27,94,32)
       .text('Sous-total', rightX-80, y).text(`${ht} €`, rightX, y, { align:'right' });
    y += 7;
    doc.text('Frais de livraison', rightX-80, y).text(`${frais.toFixed(2)} €`, rightX, y, { align:'right' });
    y += 7;
    doc.setFont('helvetica','bold').text('Total TTC', rightX-80, y).text(`${ttc.toFixed(2)} €`, rightX, y, { align:'right' });
    y += 7;
    doc.setFont('helvetica','normal').text('TVA', rightX-80, y).text(`${tva} €`, rightX, y, { align:'right' });
    // Conditions générales
    y += 15;
    const cond = "CONDITIONS GÉNÉRALES DE VENTE: Merci d'avoir commandé sur notre site de reproduction en ligne. Vos documents seront reproduits avec soin.";
    const lines = doc.splitTextToSize(cond, 180);
    doc.setFontSize(10).setTextColor(27,94,32).text(lines, 105, y, { align:'center' });
    doc.text('Bonne journée.', 105, y + lines.length*5, { align:'center' });
    return doc;
  };

  const showInvoice = c => window.open(generateInvoiceDoc(c).output('dataurlnewwindow'), '_blank');
  const downloadInvoice = c => generateInvoiceDoc(c).save(`facture_${c.numeroCommande}.pdf`);
  const printInvoice = c => { const d = generateInvoiceDoc(c); d.autoPrint(); window.open(d.output('bloburl'),'_blank'); };

  // Tri décroissant par date d'enregistrement
  const sorted = [...commandes].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Container maxWidth="lg" sx={{ py:4, fontFamily:'Poppins', backgroundColor:'rgba(240,255,245,0.5)' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color:'green.700', fontWeight:600 }}>
        Détails des Commandes Payées
      </Typography>

      {loading && (
        <Box sx={{ display:'flex', justifyContent:'center', my:4 }}>
          <CircularProgress color="success" />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && sorted.length === 0 && (
        <Typography align="center">Aucune commande payée trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {sorted.map(c => (
          <Grid item xs={12} key={c.id}>
            <Card sx={{ borderRadius:3, boxShadow:3, border:'1px solid', borderColor:'green.100' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight:500, color:'green.700', mb:1 }}>
                  Produit Commandé :
                </Typography>
                <Typography mb={2}>
                  {Array.isArray(c.cle) ? c.cle.join(', ') : c.cle || 'Non renseigné'}
                </Typography>
                <Divider sx={{ mb:2 }} />
                <Typography variant="h5" sx={{ fontWeight:600, color:'green.800' }}>
                  {c.nom}
                </Typography>
                <Typography sx={{ fontWeight:500, color:'green.700', mt:1 }}>
                  Numéro de commande : {c.numeroCommande || 'Non renseigné'}
                </Typography>
                <Typography sx={{ fontWeight:500, color:'green.700', mt:1 }}>
                  Date de commande : {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : 'Non renseignée'}
                </Typography>
                <Box sx={{ display:'flex', alignItems:'center', mt:1 }}>
                  <LocationOnIcon sx={{ color:'green.500', mr:1 }} />
                  <Typography>{c.adressePostale.split(',')[0].trim()}</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent:'space-between', backgroundColor:'green.50', p:2 }}>
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
                  sx={{ borderRadius:20, backgroundColor:'red.400', '&:hover':{ backgroundColor:'red.600' } }}
                  onClick={() => openCancelDialog(c)}
                >
                  Annuler la commande
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog d'annulation */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullScreen={fullScreen}>
        <DialogTitle sx={{ fontWeight:600, color:'green.800' }}>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Raison de l'annulation"
            fullWidth
            variant="outlined"
            value={cancellationReason}
            onChange={e => setCancellationReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="success">Annuler</Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={!cancellationReason.trim()}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de zoom image */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        fullScreen={fullScreen}
        maxWidth="lg"
        onWheel={handleWheel}
      >
        <DialogActions sx={{ justifyContent:'flex-end', p:1 }}>
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
                maxWidth:'100%',
                maxHeight:'80vh',
                transform:`scale(${zoom})`,
                transition:'transform 0.2s',
                transformOrigin:'center',
                borderRadius:2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;
