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
  TextField,
  IconButton,
  useMediaQuery,
  Divider
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
  const [commandeToCancel, setCommandeToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
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
      const text = await res.text();
      if (!res.ok) {
        let msg = `Status ${res.status}`;
        try {
          const json = JSON.parse(text);
          msg = json.detail || json.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const { data } = JSON.parse(text);
      if (!Array.isArray(data)) {
        console.error('Réponse inattendue:', data);
        setCommandes([]);
      } else {
        setCommandes(data);
      }
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

  const openCancel = cmd => {
    setCommandeToCancel(cmd);
    setCancelReason('');
    setOpenCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      return alert('Veuillez saisir une raison.');
    }
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
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
      await fetchCommandes();
    } catch (e) {
      console.error(e);
      alert(`Erreur réseau : ${e.message}`);
    } finally {
      setOpenCancelDialog(false);
    }
  };

  const openImage = img => {
    setSelectedImage(decodeImage(img));
    setZoom(1);
    setOpenImageDialog(true);
  };

  const handleWheel = e => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  const generatePdf = cmd => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const m = 15;
    // header
    doc.setFillColor(27, 94, 32).rect(0, m, 210, 40, 'F');
    doc.setTextColor(255).setFontSize(8)
       .text(['MAISON BOUVET', '20 rue de Lévis, 75017 Paris', 'Tél : 01 42 67 47 28', 'contact@cleservice.com'], m+37, m+12, { lineHeightFactor: 1.5 });
    // client info
    doc.setTextColor(0).setFontSize(8);
    const rightX = 210 - m;
    [cmd.nom, cmd.adressePostale, `Tél : ${cmd.telephone}`, `Email : ${cmd.adresseMail}`]
      .filter(Boolean)
      .forEach((t,i)=> doc.text(t, rightX, m+17+i*5, { align: 'right' }));
    // table
    const prix = parseFloat(cmd.prix)||0;
    const port = cmd.shippingMethod==='expedition'?8:0;
    doc.autoTable({
      startY: m+45,
      head: [['Produit','Qté','PU','Port','TTC']],
      body: [[
        Array.isArray(cmd.cle)?cmd.cle.join(', '):cmd.cle||'—',
        cmd.quantity||1,
        `${(prix/(cmd.quantity||1)).toFixed(2)} €`,
        `${port.toFixed(2)} €`,
        `${prix.toFixed(2)} €`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [27,94,32], textColor: 255 },
      margin: { left: m, right: m }
    });
    return doc;
  };

  return (
    <Container sx={{ py:4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Commandes Payées
      </Typography>

      {loading && (
        <Box sx={{ display:'flex', justifyContent:'center', my:4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && commandes.length===0 && (
        <Typography align="center">Aucune commande trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {commandes.map(cmd=>(
          <Grid item xs={12} md={6} key={cmd.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {Array.isArray(cmd.cle)?cmd.cle.join(', '):cmd.cle||'—'}
                </Typography>
                <Typography>Client : {cmd.nom}</Typography>
                <Typography>Prix : {parseFloat(cmd.prix).toFixed(2)} €</Typography>
              </CardContent>
              <Divider />
              <CardActions>
                {cmd.urlPhotoRecto && (
                  <Button onClick={()=>openImage(cmd.urlPhotoRecto)}>Voir Photo</Button>
                )}
                <Button
                  startIcon={<CancelIcon/>}
                  color="error"
                  onClick={()=>openCancel(cmd)}
                >
                  Annuler
                </Button>
                <Button onClick={()=>window.open(generatePdf(cmd).output('dataurlnewwindow'))}>
                  Voir Facture
                </Button>
                <Button onClick={()=>generatePdf(cmd).save(`facture_${cmd.numeroCommande}.pdf`)}>
                  Télécharger
                </Button>
                <Button onClick={()=>{
                  const d=generatePdf(cmd);
                  d.autoPrint();
                  window.open(d.output('bloburl'));
                }}>
                  Imprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Annulation dialog */}
      <Dialog fullScreen={fullScreen} open={openCancelDialog} onClose={()=>setOpenCancelDialog(false)}>
        <DialogTitle>Annuler la commande</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Raison de l'annulation"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={e=>setCancelReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenCancelDialog(false)}>Fermer</Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel} disabled={!cancelReason.trim()}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image zoom dialog */}
      <Dialog fullScreen={fullScreen} open={openImageDialog} onClose={()=>setOpenImageDialog(false)} onWheel={handleWheel}>
        <DialogActions>
          <IconButton onClick={()=>setOpenImageDialog(false)}><CloseIcon/></IconButton>
        </DialogActions>
        <DialogContent sx={{ textAlign:'center' }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              sx={{ maxWidth:'100%', maxHeight:'80vh', transform:`scale(${zoom})`, transition:'transform 0.2s' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
