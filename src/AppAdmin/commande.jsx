import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
  Container, Card, CardContent, CardActions, Typography, Button,
  CircularProgress, Alert, Grid, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, TextField, FormControlLabel, Checkbox, Divider,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: '', nom: '', ville: '', isCleAPasse: false, hasCartePropriete: true, attestationPropriete: false });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = (img) => img ? (img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`) : '';

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://cl-back.onrender.com/commande/paid');
      const json = await response.json();
      setCommandes(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (err) {
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

  const handleConfirmCancel = async () => {
    if (!commandeToCancel || !cancellationReason.trim()) return;
    try {
      await fetch(`https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`, { method: 'DELETE' });
      fetchCommandes();
    } catch {}
    setOpenDialog(false);
  };

  const handleEditFormSubmit = async () => {
    try {
      await fetch(`https://cl-back.onrender.com/commande/update/${editFormData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editFormData),
      });
      setOpenEditDialog(false);
      fetchCommandes();
    } catch {}
  };

  const loadLogoAsBase64 = async () => {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const generateInvoiceDoc = async (commande) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const logoBase64 = await loadLogoAsBase64();

    doc.setFillColor(27, 94, 32);
    doc.rect(0, margin, 210, 40, 'F');

    const logoWidth = 32, logoHeight = 32;
    doc.addImage(logoBase64, 'PNG', margin, margin, logoWidth, logoHeight);
    const leftTextX = margin + logoWidth + 5;
    doc.setFontSize(8).setTextColor(255, 255, 255);
    doc.text([
      'MAISON BOUVET', '20 rue de Lévis', '75017 Paris',
      'Tél : 01 42 67 47 28', 'Email : contact@cleservice.com'
    ], leftTextX, margin + 12);

    const rightX = 210 - margin;
    doc.setFontSize(10).text('Facturé à :', rightX, margin + 12, { align: 'right' });
    doc.setFontSize(8);
    const rightTexts = [commande.nom, commande.adressePostale, `Tél : ${commande.telephone}`, `Email : ${commande.adresseMail}`].filter(Boolean);
    rightTexts.forEach((txt, i) => {
      doc.text(txt, rightX, margin + 17 + i * 5, { align: 'right' });
    });

    let currentY = margin + 45;
    const articleText = Array.isArray(commande.cle) ? commande.cle.join(', ') : commande.cle || 'Article';
    const reference = Array.isArray(commande.numeroCle) ? commande.numeroCle.join(', ') : commande.numeroCle || 'N/A';
    const quantite = commande.quantity ? commande.quantity.toString() : '1';
    const prixTTC = parseFloat(commande.prix);
    const tauxTVA = 0.2;
    const prixHT = prixTTC / (1 + tauxTVA);

    doc.autoTable({
      startY: currentY,
      head: [['Article', 'Référence', 'Quantité', 'Sous-total']],
      body: [[articleText, reference, quantite, prixHT.toFixed(2) + ' €']],
      theme: 'grid',
      headStyles: { fillColor: [27, 94, 32], textColor: 255 },
      styles: { fontSize: 12 },
      margin: { left: margin, right: margin }
    });
    currentY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12).setTextColor(27, 94, 32);
    doc.text('Sous-total', 130, currentY);
    doc.text(prixHT.toFixed(2) + ' €', 195, currentY, { align: 'right' });
    currentY += 7;
    doc.text('Frais de livraison', 130, currentY);
    doc.text('0.00 €', 195, currentY, { align: 'right' });
    currentY += 7;
    doc.setFont('helvetica', 'bold').text('Total TTC', 130, currentY);
    doc.text(prixTTC.toFixed(2) + ' €', 195, currentY, { align: 'right' });
    currentY += 7;
    doc.setFont('helvetica', 'normal').text('TVA', 130, currentY);
    doc.text((prixTTC - prixHT).toFixed(2) + ' €', 195, currentY, { align: 'right' });
    currentY += 15;

    doc.setFontSize(10);
    const conditions = 'CONDITIONS GÉNÉRALES DE VENTE...';
    const conditionsLines = doc.splitTextToSize(conditions, 180);
    doc.text(conditionsLines, 105, currentY, { align: 'center' });
    return doc;
  };

  const showInvoice = async (commande) => {
    const doc = await generateInvoiceDoc(commande);
    window.open(doc.output('dataurlnewwindow'), '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center">Commandes</Typography>
      {loading && <CircularProgress />} 
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2}>
        {commandes.map((cmd) => (
          <Grid item xs={12} md={6} key={cmd.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cmd.nom}</Typography>
                <Typography variant="body2">{cmd.adressePostale}</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => showInvoice(cmd)}>Afficher Facture</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Commande;
