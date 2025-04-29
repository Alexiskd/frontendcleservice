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
        throw new Error(res.status === 500
          ? 'Erreur interne du serveur, réessayez plus tard.'
          : `Erreur ${res.status}`);
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
    if (!commandeToCancel || !cancellationReason.trim()) {
      return alert('Veuillez saisir une raison.');
    }
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      alert(json.success ? 'Annulée.' : 'Échec.');
      await fetchCommandes();
    } catch {
      alert('Erreur réseau.');
    } finally {
      setOpenCancelDialog(false);
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

  const generateInvoice = cmd => {
    const doc = new jsPDF('p','mm','a4');
    const m = 15;
    doc.setFillColor(27,94,32).rect(0,m,210,40,'F');
    doc.addImage(logo,'PNG',m,m,32,32);
    doc.setFontSize(8).setTextColor(255)
      .text(['REPRO LIGNE','www.repro-ligne.com','Tél:01 42 67 47 28','contact@repro.com'],m+37,m+12,{lineHeightFactor:1.5});

    doc.setTextColor(0).setFontSize(10).text(`Facturé à : ${cmd.nom}`,210-m,m+12,{align:'right'});
    doc.setFontSize(8);
    [cmd.adressePostale, cmd.telephone && `Tél: ${cmd.telephone}`, cmd.adresseMail && `Email: ${cmd.adresseMail}`]
      .filter(Boolean)
      .forEach((t,i)=>doc.text(t,210-m,m+17+i*5,{align:'right'}));

    const date = cmd.createdAt ? new Date(cmd.createdAt).toLocaleDateString() : '';
    doc.setTextColor(27,94,32).setFontSize(9).text(`Date: ${date}`,m,m+45);

    const qt = cmd.quantity||1;
    const ttc = parseFloat(cmd.prix)||0;
    const ht = (ttc/1.2).toFixed(2);
    let y = m+55;
    const desc = Array.isArray(cmd.cle)?cmd.cle.join(', '):cmd.cle||'—';
    doc.autoTable({
      startY:y,
      head:[['Desc','Qté','HT']],
      body:[[desc,qt,`${ht} €`]],
      theme:'grid',
      headStyles:{fillColor:[27,94,32],textColor:255},
      margin:{left:m,right:m}
    });
    y = doc.lastAutoTable.finalY+10;
    const tva=(ttc-ht).toFixed(2);
    doc.setFontSize(12).text('Sous-total HT',210-m-60,y).text(`${ht} €`,210-m,y,{align:'right'});
    doc.text('TVA',210-m-60,y+7).text(`${tva} €`,210-m,y+7,{align:'right'});
    doc.setFont('helvetica','bold').text('Total TTC',210-m-60,y+14).text(`${ttc.toFixed(2)} €`,210-m,y+14,{align:'right'});

    return doc;
  };

  const showInv = c=>window.open(generateInvoice(c).output('dataurlnewwindow'));
  const dlInv   = c=>generateInvoice(c).save(`facture_${c.numeroCommande}.pdf`);
  const prInv   = c=>{const d=generateInvoice(c);d.autoPrint();window.open(d.output('bloburl'));};

  return (
    <Container sx={{py:4}}>
      <Typography variant="h4" align="center" gutterBottom>
        Commandes Payées
      </Typography>

      {loading && <Box sx={{textAlign:'center',my:4}}><CircularProgress/></Box>}
      {error   && <Alert severity="error">{error}</Alert>}
      {!loading && !error && commandes.length===0 && (
        <Typography align="center">Aucune commande.</Typography>
      )}

      <Grid container spacing={3}>
        {commandes.map(cmd=>(
          <Grid item xs={12} md={6} key={cmd.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{Array.isArray(cmd.cle)?cmd.cle.join(', '):cmd.cle||'—'}</Typography>
                <Typography>Client: {cmd.nom}</Typography>
                <Typography>Prix: {parseFloat(cmd.prix).toFixed(2)} €</Typography>
              </CardContent>
              <Divider/>
              <CardActions>
                <Button onClick={()=>showInv(cmd)}>Voir</Button>
                <Button onClick={()=>dlInv(cmd)}>Télécharger</Button>
                <Button onClick={()=>prInv(cmd)}>Imprimer</Button>
                <Button
                  startIcon={<CancelIcon/>}
                  color="error"
                  onClick={()=>openCancel(cmd)}
                >Annuler</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Annulation */}
      <Dialog
        open={openCancelDialog}
        onClose={()=>setOpenCancelDialog(false)}
        fullScreen={fullScreen}
      >
        <DialogTitle>Annuler la commande</DialogTitle>
        <DialogContent>
          <TextField
            label="Raison"
            fullWidth
            value={cancellationReason}
            onChange={e=>setCancellationReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenCancelDialog(false)}>Fermer</Button>
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

      {/* Zoom image */}
      <Dialog
        open={openImageDialog}
        onClose={()=>{setOpenImageDialog(false);setZoom(1);}}
        fullScreen={fullScreen}
        onWheel={handleWheel}
      >
        <DialogActions>
          <IconButton onClick={()=>{setOpenImageDialog(false);setZoom(1);}}>
            <CloseIcon/>
          </IconButton>
        </DialogActions>
        <DialogContent sx={{textAlign:'center'}}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt=""
              sx={{
                maxWidth:'100%',
                maxHeight:'80vh',
                transform:`scale(${zoom})`,
                transition:'transform 0.2s'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

